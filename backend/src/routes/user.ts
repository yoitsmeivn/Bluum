import { Router, Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export const userRouter = Router()

userRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

userRouter.patch('/', async (req: Request, res: Response) => {
  try {
    const { full_name, organisation, role } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({ full_name, organisation, role })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error('Failed to update user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})
