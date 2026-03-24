import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { getHistory, getResearch } from '../lib/api'

const navItems = [
  { id: 'research' as const, icon: '◈', label: 'Research' },
  { id: 'intelligence' as const, icon: '◎', label: 'Intelligence' },
  { id: 'library' as const, icon: '▤', label: 'Saved Tearsheets' },
  { id: 'uploads' as const, icon: '⊕', label: 'Upload Documents' },
]

const fallbackRecent = [
  { id: 'mock-1', title: 'Nordic Fintech SaaS', time: '2h ago', research_id: '' },
  { id: 'mock-2', title: 'Healthcare IT UK', time: 'Yesterday', research_id: '' },
  { id: 'mock-3', title: 'Meridian Capital CIM', time: '3 days ago', research_id: '' },
]

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function Sidebar() {
  const { currentPage, setPage, savedTearsheets, setSavedTearsheets, setCurrentResearch, setResearchLoading } = useAppStore()
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    getHistory()
      .then((items) => setSavedTearsheets(items))
      .catch(() => {})
  }, [setSavedTearsheets])

  const recentItems = savedTearsheets.length > 0
    ? savedTearsheets.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.researches?.query ?? t.title,
        time: relativeTime(t.saved_at),
        research_id: t.research_id,
      }))
    : fallbackRecent

  const handleRecentClick = async (item: typeof recentItems[0]) => {
    if (!item.research_id) return
    setResearchLoading(true)
    setPage('research')
    try {
      const data = await getResearch(item.research_id)
      setCurrentResearch(data)
    } catch {
      // ignore
    } finally {
      setResearchLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'JH'
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? 'James Harper'
  const org = (user?.user_metadata?.organisation as string) ?? ''

  return (
    <aside style={{
      width: 220, minWidth: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 300, color: 'var(--text-bright)', letterSpacing: -0.3, display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--text-bright)', marginRight: 2, borderRadius: 1 }} />
          bluum
        </span>
      </div>

      {/* Nav */}
      <div style={{ padding: '20px 12px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)',
          border: '1px solid var(--border-med)', borderRadius: 6, padding: '7px 10px', marginBottom: 16, cursor: 'pointer',
        }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11, flexShrink: 0 }}>⌕</span>
          <input type="text" placeholder="Search anything..." style={{
            background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--mono)',
            fontSize: 11, color: 'var(--text)', width: '100%',
          }} />
        </div>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '0 8px', marginBottom: 6 }}>
          Workspace
        </div>

        {navItems.map((item) => {
          const active = currentPage === item.id
          return (
            <div key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 5,
              cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 400,
              letterSpacing: '0.02em', marginBottom: 1,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-dim)',
              border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
            }}>
              <span style={{ fontSize: 12, width: 14, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </div>
          )
        })}
      </div>

      {/* Recent */}
      <div style={{ padding: '8px 12px 8px', marginTop: 8, flex: 1, overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '0 8px', marginBottom: 6 }}>
          Recent
        </div>
        {recentItems.map((item) => (
          <div key={item.id} onClick={() => handleRecentClick(item)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
            padding: '8px 10px', borderRadius: 5, cursor: 'pointer', marginBottom: 1,
            border: '1px solid transparent',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{item.title}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)' }}>{item.time}</span>
          </div>
        ))}
      </div>

      {/* User pill */}
      <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)' }}>
        <div onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 5, cursor: 'pointer' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, color: 'var(--accent)', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)' }}>{displayName}</div>
            {org && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)' }}>{org}</div>}
          </div>
        </div>
      </div>
    </aside>
  )
}
