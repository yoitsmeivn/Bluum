import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export const tearsheetsRouter = Router()

tearsheetsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { research_id, title } = req.body
    const user_id = req.user.id

    if (!research_id || !title) {
      res.status(400).json({ error: 'research_id and title are required' })
      return
    }

    const { data, error } = await supabase
      .from('tearsheets')
      .insert({ research_id, user_id, title })
      .select()
      .single()

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.json(data)
  } catch (error) {
    console.error('Failed to save tearsheet:', error)
    res.status(500).json({ error: 'Failed to save tearsheet' })
  }
})
