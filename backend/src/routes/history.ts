import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export const historyRouter = Router()

historyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id

    const { data, error } = await supabase
      .from('tearsheets')
      .select('*, researches(query, status, created_at)')
      .eq('user_id', user_id)
      .order('saved_at', { ascending: false })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.json(data)
  } catch (error) {
    console.error('Failed to fetch history:', error)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})
