import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  },
})

export const uploadRouter = Router()

uploadRouter.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    const docId = uuidv4()
    const text = file.buffer.toString('utf-8')

    // TODO: Chunk text and embed into ChromaDB via agents/embed.ts
    console.log(`Document ${docId} received: ${file.originalname} (${text.length} chars)`)

    res.json({ id: docId, filename: file.originalname, size: file.size })
  } catch (error) {
    console.error('Upload failed:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})
