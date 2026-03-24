import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
})

api.interceptors.request.use(async (config) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ResearchSection {
  id: string
  research_id: string
  section_name: 'overview' | 'ma_activity' | 'targets' | 'risks' | 'buyers'
  content: Record<string, any>
  status: 'idle' | 'loading' | 'done' | 'error'
  created_at: string
}

export interface Research {
  id: string
  user_id: string
  query: string
  enriched_query?: string
  status: 'pending' | 'running' | 'done' | 'error'
  created_at: string
  sections: ResearchSection[]
}

export interface SavedTearsheet {
  id: string
  research_id: string
  user_id: string
  title: string
  saved_at: string
  researches?: { query: string; status: string; created_at: string }
}

export async function startResearch(query: string): Promise<{ research_id: string }> {
  const { data } = await api.post('/api/research', { query })
  return data
}

export async function getResearch(id: string): Promise<Research> {
  const { data } = await api.get(`/api/research/${id}`)
  return data
}

export async function getHistory(): Promise<SavedTearsheet[]> {
  const { data } = await api.get('/api/history')
  return data
}

export async function saveTearsheet(research_id: string, title: string): Promise<SavedTearsheet> {
  const { data } = await api.post('/api/tearsheets', { research_id, title })
  return data
}
