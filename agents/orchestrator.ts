import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { runAgent } from './runAgent'
import { overviewPrompt } from './prompts/overview'
import { maActivityPrompt } from './prompts/ma_activity'
import { targetsPrompt } from './prompts/targets'
import { risksPrompt } from './prompts/risks'
import { buyersPrompt } from './prompts/buyers'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')

const supabase = createClient(supabaseUrl, supabaseKey)

type SectionName = 'overview' | 'ma_activity' | 'targets' | 'risks' | 'buyers'

const ORCHESTRATOR_TIMEOUT = 120000 // 2 minutes

const agentConfig: Array<{ name: SectionName; prompt: string }> = [
  { name: 'overview', prompt: overviewPrompt },
  { name: 'ma_activity', prompt: maActivityPrompt },
  { name: 'targets', prompt: targetsPrompt },
  { name: 'risks', prompt: risksPrompt },
  { name: 'buyers', prompt: buyersPrompt },
]

async function writeSection(
  researchId: string,
  sectionName: SectionName,
  content: Record<string, unknown>,
  status: 'done' | 'error' = 'done'
): Promise<void> {
  console.log(`[orchestrator] Writing section ${sectionName} with status ${status}`)
  const { error } = await supabase.from('sections').insert({
    id: uuidv4(),
    research_id: researchId,
    section_name: sectionName,
    content,
    status,
  })
  if (error) {
    console.error(`[orchestrator] Failed to write section ${sectionName}:`, error)
  } else {
    console.log(`[orchestrator] Section ${sectionName} written successfully`)
  }
}

export async function orchestrate(researchId: string, query: string): Promise<void> {
  console.log('=== ORCHESTRATOR STARTED ===')
  console.log('research_id:', researchId)
  console.log('query:', query)
  console.log('ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY)

  try {
    const enrichedQuery = `Research query: ${query.trim()}\n\nPlease provide comprehensive analysis based on the most recent available data.`
    await supabase
      .from('researches')
      .update({ enriched_query: enrichedQuery })
      .eq('id', researchId)

    // Fire all 5 agents in parallel with an overall timeout
    const agentPromises = agentConfig.map(async ({ name, prompt }) => {
      try {
        console.log(`[orchestrator] Starting agent ${name}`)
        const content = await runAgent(name, enrichedQuery, prompt)
        await writeSection(researchId, name, content, 'done')
        console.log(`[orchestrator] Agent ${name} completed`)
        return 'done' as const
      } catch (error: any) {
        console.error(`[orchestrator] Agent ${name} failed:`, error?.message ?? error)
        await writeSection(researchId, name, { error: String(error?.message ?? error) }, 'error')
        return 'error' as const
      }
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Orchestrator timeout after 120s')), ORCHESTRATOR_TIMEOUT)
    )

    let results: PromiseSettledResult<'done' | 'error'>[]
    try {
      results = await Promise.race([
        Promise.allSettled(agentPromises),
        timeoutPromise,
      ]) as PromiseSettledResult<'done' | 'error'>[]
    } catch (timeoutErr: any) {
      console.error(`[orchestrator] TIMEOUT:`, timeoutErr.message)
      await supabase.from('researches').update({ status: 'error' }).eq('id', researchId)
      return
    }

    const allFailed = results.every(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === 'error')
    )

    const finalStatus = allFailed ? 'error' : 'done'
    console.log(`[orchestrator] All agents settled. Final status: ${finalStatus}`)
    await supabase.from('researches').update({ status: finalStatus }).eq('id', researchId)

  } catch (error: any) {
    console.error(`[orchestrator] Fatal error for ${researchId}:`, error?.message ?? error)
    await supabase.from('researches').update({ status: 'error' }).eq('id', researchId)
  }
}
