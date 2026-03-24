import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  req.user = data.user
  next()
}
