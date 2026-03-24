import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { orchestrate } from '../../../agents/orchestrator'

export const researchRouter = Router()

researchRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.body
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' })
      return
    }

    const user_id = req.user.id

    const { data, error: insertError } = await supabase
      .from('researches')
      .insert({ user_id, query, status: 'running' })
      .select()
      .single()

    if (insertError || !data) {
      res.status(500).json({ error: insertError?.message ?? 'Failed to create research' })
      return
    }

    // Fire orchestrator asynchronously (fire and forget)
    orchestrate(data.id, query).catch((err) => {
      console.error(`Orchestrator failed for ${data.id}:`, err)
    })

    res.json({ research_id: data.id })
  } catch (error) {
    console.error('Research creation failed:', error)
    res.status(500).json({ error: 'Failed to start research' })
  }
})

researchRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const { data: research, error: researchError } = await supabase
      .from('researches')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single()

    if (researchError || !research) {
      res.status(404).json({ error: 'Research not found' })
      return
    }

    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .eq('research_id', id)
      .order('created_at', { ascending: true })

    if (sectionsError) throw sectionsError

    res.json({ ...research, sections: sections ?? [] })
  } catch (error) {
    console.error('Failed to fetch research:', error)
    res.status(500).json({ error: 'Failed to fetch research' })
  }
})
