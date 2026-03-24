import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { intelligencePrompt } from './prompts/intelligence'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(supabaseUrl, supabaseKey)

type QueryType = 'semantic' | 'numerical' | 'synthesis'

interface IntelligenceResult {
  answer: string
  sources: Array<{
    type: 'filing' | 'tearsheet' | 'upload'
    title: string
    excerpt: string
    relevance_score: number
  }>
  confidence: 'high' | 'medium' | 'low'
  query_type: QueryType
}

// Step 1: Classify the query type
async function classifyQuery(query: string): Promise<QueryType> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    system: 'Classify the following question as exactly one of: semantic, numerical, synthesis. Return ONLY the single word, nothing else.',
    messages: [{ role: 'user', content: query }],
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()
    .toLowerCase()

  if (text === 'numerical' || text === 'synthesis') return text
  return 'semantic'
}

// Step 2: Retrieve relevant chunks from the corpus
async function retrieveContext(_query: string, userId: string): Promise<Array<{
  type: 'filing' | 'tearsheet' | 'upload'
  title: string
  content: string
  relevance_score: number
}>> {
  // Retrieve from tearsheet sections
  const { data: sections } = await supabase
    .from('sections')
    .select('section_name, content, research_id, researches!inner(query, user_id)')
    .eq('researches.user_id', userId)
    .eq('status', 'done')
    .limit(20)

  const chunks: Array<{
    type: 'filing' | 'tearsheet' | 'upload'
    title: string
    content: string
    relevance_score: number
  }> = []

  if (sections) {
    for (const section of sections) {
      chunks.push({
        type: 'tearsheet',
        title: `${(section as Record<string, unknown>).section_name} — ${((section as Record<string, unknown>).researches as Record<string, unknown>)?.query ?? 'Unknown'}`,
        content: JSON.stringify(section.content),
        relevance_score: 0.7, // In production, use vector similarity
      })
    }
  }

  // TODO: Add ChromaDB retrieval for filings and uploads

  return chunks
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, 10)
}

// Step 3: Ground the answer using retrieved context
async function groundAnswer(
  query: string,
  queryType: QueryType,
  context: Array<{ type: string; title: string; content: string; relevance_score: number }>
): Promise<Record<string, unknown>> {
  const contextString = context
    .map((c, i) => `--- Document ${i + 1}: ${c.title} (${c.type}) ---\n${c.content}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: intelligencePrompt,
    messages: [
      {
        role: 'user',
        content: `Query type: ${queryType}\n\nQuestion: ${query}\n\n--- CONTEXT DOCUMENTS ---\n${contextString || 'No documents available.'}`,
      },
    ],
  })

  const textBlocks = response.content.filter(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  )

  let rawText = textBlocks.map((b) => b.text).join('').trim()
  rawText = rawText.replace(/```json|```/g, '').trim()

  return JSON.parse(rawText) as Record<string, unknown>
}

// Main pipeline: classify -> retrieve -> ground
export async function runIntelligenceQuery(
  query: string,
  userId: string
): Promise<IntelligenceResult> {
  const queryType = await classifyQuery(query)
  const context = await retrieveContext(query, userId)
  const result = await groundAnswer(query, queryType, context)

  return {
    answer: String(result.answer ?? ''),
    confidence: (result.confidence as IntelligenceResult['confidence']) ?? 'low',
    query_type: queryType,
    sources: (result.sources_used as IntelligenceResult['sources']) ?? context.map((c) => ({
      type: c.type as 'filing' | 'tearsheet' | 'upload',
      title: c.title,
      excerpt: c.content.slice(0, 200),
      relevance_score: c.relevance_score,
    })),
  }
}
