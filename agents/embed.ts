import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

interface Chunk {
  text: string
  metadata: {
    source_id: string
    source_type: 'filing' | 'tearsheet' | 'upload'
    chunk_index: number
    total_chunks: number
  }
}

// Split text into overlapping chunks
export function chunkText(
  text: string,
  sourceId: string,
  sourceType: 'filing' | 'tearsheet' | 'upload'
): Chunk[] {
  const chunks: Chunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    let chunkEnd = end

    // Try to break at a sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const breakPoint = Math.max(lastPeriod, lastNewline)
      if (breakPoint > start + CHUNK_SIZE / 2) {
        chunkEnd = breakPoint + 1
      }
    }

    chunks.push({
      text: text.slice(start, chunkEnd).trim(),
      metadata: {
        source_id: sourceId,
        source_type: sourceType,
        chunk_index: index,
        total_chunks: 0, // Will be set after loop
      },
    })

    start = chunkEnd - CHUNK_OVERLAP
    if (start <= chunks[chunks.length - 1].metadata.chunk_index) {
      start = chunkEnd
    }
    index++
  }

  // Set total chunks
  for (const chunk of chunks) {
    chunk.metadata.total_chunks = chunks.length
  }

  return chunks
}

// Embed chunks and store in ChromaDB
export async function embedAndStore(
  text: string,
  sourceId: string,
  sourceType: 'filing' | 'tearsheet' | 'upload',
  collectionName: string
): Promise<{ chunks_stored: number }> {
  const chunks = chunkText(text, sourceId, sourceType)

  const chromaHost = process.env.CHROMA_HOST || 'localhost'
  const chromaPort = process.env.CHROMA_PORT || '8000'
  const baseUrl = `http://${chromaHost}:${chromaPort}`

  // Ensure collection exists
  await fetch(`${baseUrl}/api/v1/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: collectionName, get_or_create: true }),
  })

  // Add documents to collection
  const ids = chunks.map((_, i) => `${sourceId}_chunk_${i}`)
  const documents = chunks.map((c) => c.text)
  const metadatas = chunks.map((c) => c.metadata)

  await fetch(`${baseUrl}/api/v1/collections/${collectionName}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ids,
      documents,
      metadatas,
    }),
  })

  return { chunks_stored: chunks.length }
}
