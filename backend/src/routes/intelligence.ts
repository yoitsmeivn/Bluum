import { Router, Request, Response } from 'express'
import { runIntelligenceQuery } from '../../../agents/intelligenceAgent'

export const intelligenceRouter = Router()

intelligenceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { query } = req.body
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required' })
      return
    }

    const result = await runIntelligenceQuery(query, req.user.id)
    res.json(result)
  } catch (error: unknown) {
    console.error('Intelligence query failed:', error)
    const message = error instanceof Error ? error.message : 'Intelligence query failed'
    res.status(500).json({ error: message })
  }
})
