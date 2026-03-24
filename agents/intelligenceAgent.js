"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIntelligenceQuery = runIntelligenceQuery;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const supabase_js_1 = require("@supabase/supabase-js");
const intelligence_1 = require("./prompts/intelligence");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey)
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Step 1: Classify the query type
async function classifyQuery(query) {
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 50,
        system: 'Classify the following question as exactly one of: semantic, numerical, synthesis. Return ONLY the single word, nothing else.',
        messages: [{ role: 'user', content: query }],
    });
    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim()
        .toLowerCase();
    if (text === 'numerical' || text === 'synthesis')
        return text;
    return 'semantic';
}
// Step 2: Retrieve relevant chunks from the corpus
async function retrieveContext(_query, userId) {
    // Retrieve from tearsheet sections
    const { data: sections } = await supabase
        .from('sections')
        .select('section_name, content, research_id, researches!inner(query, user_id)')
        .eq('researches.user_id', userId)
        .eq('status', 'done')
        .limit(20);
    const chunks = [];
    if (sections) {
        for (const section of sections) {
            chunks.push({
                type: 'tearsheet',
                title: `${section.section_name} — ${section.researches?.query ?? 'Unknown'}`,
                content: JSON.stringify(section.content),
                relevance_score: 0.7, // In production, use vector similarity
            });
        }
    }
    // TODO: Add ChromaDB retrieval for filings and uploads
    return chunks
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, 10);
}
// Step 3: Ground the answer using retrieved context
async function groundAnswer(query, queryType, context) {
    const contextString = context
        .map((c, i) => `--- Document ${i + 1}: ${c.title} (${c.type}) ---\n${c.content}`)
        .join('\n\n');
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: intelligence_1.intelligencePrompt,
        messages: [
            {
                role: 'user',
                content: `Query type: ${queryType}\n\nQuestion: ${query}\n\n--- CONTEXT DOCUMENTS ---\n${contextString || 'No documents available.'}`,
            },
        ],
    });
    const textBlocks = response.content.filter((block) => block.type === 'text');
    let rawText = textBlocks.map((b) => b.text).join('').trim();
    rawText = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(rawText);
}
// Main pipeline: classify -> retrieve -> ground
async function runIntelligenceQuery(query, userId) {
    const queryType = await classifyQuery(query);
    const context = await retrieveContext(query, userId);
    const result = await groundAnswer(query, queryType, context);
    return {
        answer: String(result.answer ?? ''),
        confidence: result.confidence ?? 'low',
        query_type: queryType,
        sources: result.sources_used ?? context.map((c) => ({
            type: c.type,
            title: c.title,
            excerpt: c.content.slice(0, 200),
            relevance_score: c.relevance_score,
        })),
    };
}
