import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

const mockMode = import.meta.env.VITE_USE_MOCK === 'true'

interface AuthStore {
  user: User | null
  session: Session | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, organisation: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),

  initialize: async () => {
    if (mockMode) {
      set({ loading: false })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, session: session ?? null, loading: false })
    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      set({ user: session?.user ?? null, session: session ?? null })
    })
  },

  signIn: async (email, password) => {
    if (mockMode) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  signUp: async (email, password, fullName, organisation) => {
    if (mockMode) return
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, organisation } },
    })
    if (error) throw error
  },

  signOut: async () => {
    if (mockMode) {
      set({ user: null, session: null })
      return
    }
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
