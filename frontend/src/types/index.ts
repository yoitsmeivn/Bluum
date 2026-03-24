export type Mode = 'research' | 'intelligence'

export type SectionName = 'overview' | 'ma_activity' | 'targets' | 'risks' | 'buyers'

export type SectionStatus = 'idle' | 'loading' | 'done' | 'error'

export interface Section {
  id: string
  research_id: string
  section_name: SectionName
  content: Record<string, unknown>
  created_at: string
  status: SectionStatus
}

export interface Research {
  id: string
  user_id: string
  query: string
  enriched_query?: string
  status: 'pending' | 'running' | 'done' | 'error'
  created_at: string
  sections: Section[]
}

export interface Tearsheet {
  id: string
  research_id: string
  user_id: string
  title: string
  saved_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  organisation?: string
  role?: string
  created_at: string
}

export interface IntelligenceResult {
  answer: string
  sources: Source[]
  confidence: 'high' | 'medium' | 'low'
  query_type: 'semantic' | 'numerical' | 'synthesis'
}

export interface Source {
  type: 'filing' | 'tearsheet' | 'upload'
  title: string
  excerpt: string
  relevance_score: number
}
