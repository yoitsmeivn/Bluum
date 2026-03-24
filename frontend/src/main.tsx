import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AppLayout from './pages/AppLayout'
import { supabase } from './lib/supabase'
import './index.css'

import type { Session } from '@supabase/supabase-js'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  // Still loading — show nothing, don't redirect yet
  if (session === undefined) return null

  // No session — redirect to landing
  if (session === null) return <Navigate to="/" replace />

  // Has session — render the app
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
