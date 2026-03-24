import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import express from 'express'
import cors from 'cors'
import { researchRouter } from './routes/research'
import { intelligenceRouter } from './routes/intelligence'
import { historyRouter } from './routes/history'
import { uploadRouter } from './routes/upload'
import { userRouter } from './routes/user'
import { tearsheetsRouter } from './routes/tearsheets'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/error'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// Protected routes
app.use('/api/research', authMiddleware, researchRouter)
app.use('/api/intelligence', authMiddleware, intelligenceRouter)
app.use('/api/history', authMiddleware, historyRouter)
app.use('/api/upload', authMiddleware, uploadRouter)
app.use('/api/user', authMiddleware, userRouter)
app.use('/api/tearsheets', authMiddleware, tearsheetsRouter)

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Bluum backend running on port ${PORT}`)
})

export default app
