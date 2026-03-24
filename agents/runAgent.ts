import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type SectionName = 'overview' | 'ma_activity' | 'targets' | 'risks' | 'buyers'

const AGENT_TIMEOUT = 60000 // 60 seconds

// Strip citation tags from all string values recursively
function stripCitations(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<cite[^>]*>/g, '')
      .replace(/<\/cite>/g, '')
      .replace(/~<cite[^>]*>[^<]*<\/cite>/g, '')
      .replace(/\[\d+\]/g, '')
      .trim()
  }
  if (Array.isArray(obj)) return obj.map(stripCitations)
  if (typeof obj === 'object' && obj !== null) {
    const cleaned: any = {}
    for (const key of Object.keys(obj)) cleaned[key] = stripCitations(obj[key])
    return cleaned
  }
  return obj
}

export async function runAgent(
  sectionName: SectionName,
  query: string,
  systemPrompt: string
): Promise<Record<string, unknown>> {

  console.log(`[runAgent] API call sent for ${sectionName}`)

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Agent timeout after ${AGENT_TIMEOUT / 1000}s`)), AGENT_TIMEOUT)
  )

  const apiCall = client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: query }],
  })

  const response = await Promise.race([apiCall, timeoutPromise]) as Anthropic.Message

  console.log(`[runAgent] Response received for ${sectionName}`)
  console.log(`[runAgent] Stop reason: ${response.stop_reason}`)
  console.log(`[runAgent] Content blocks: ${response.content.length}`)

  const textContent = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')

  console.log(`[runAgent] Raw text length for ${sectionName}: ${textContent.length}`)

  // Strip markdown fences and citation tags
  const clean = textContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/<cite[^>]*>/g, '')
    .replace(/<\/cite>/g, '')
    .trim()

  try {
    // Try direct parse first
    const parsed = JSON.parse(clean)
    console.log(`[runAgent] Parsed successfully for ${sectionName}`)
    return stripCitations(parsed)
  } catch {
    // Try to extract JSON from surrounding prose
    const firstBrace = clean.indexOf('{')
    const lastBrace = clean.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const parsed = JSON.parse(clean.substring(firstBrace, lastBrace + 1))
        console.log(`[runAgent] Parsed (extracted) successfully for ${sectionName}`)
        return stripCitations(parsed)
      } catch {
        // fall through
      }
    }
    console.error(`[runAgent] JSON parse failed for ${sectionName}:`, clean.substring(0, 200))
    return { error: true, raw: clean.substring(0, 500) }
  }
}
