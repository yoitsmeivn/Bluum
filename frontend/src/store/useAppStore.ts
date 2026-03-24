import { create } from 'zustand'
import type { Research, SavedTearsheet } from '../lib/api'

type Page = 'research' | 'intelligence' | 'library' | 'uploads'

interface AppStore {
  currentPage: Page
  setPage: (page: Page) => void
  activeSection: string
  setActiveSection: (section: string) => void

  // Research state
  currentResearch: Research | null
  setCurrentResearch: (r: Research | null) => void
  researchLoading: boolean
  setResearchLoading: (v: boolean) => void

  // Saved tearsheets
  savedTearsheets: SavedTearsheet[]
  setSavedTearsheets: (items: SavedTearsheet[]) => void
  addSavedTearsheet: (item: SavedTearsheet) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentPage: 'research',
  setPage: (page) => set({ currentPage: page }),
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),

  currentResearch: null,
  setCurrentResearch: (r) => set({ currentResearch: r }),
  researchLoading: false,
  setResearchLoading: (v) => set({ researchLoading: v }),

  savedTearsheets: [],
  setSavedTearsheets: (items) => set({ savedTearsheets: items }),
  addSavedTearsheet: (item) => set((s) => ({ savedTearsheets: [item, ...s.savedTearsheets] })),
}))
