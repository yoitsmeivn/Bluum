import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const signUp = useAuthStore((s) => s.signUp)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName, organisation)
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'var(--mono)', fontSize: 12, color: '#3A3A3A',
    background: '#F5F5F5', border: '1px solid rgba(0,0,0,0.13)', borderRadius: 4,
    padding: '10px 14px', outline: 'none', marginBottom: 12,
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: '#888888', display: 'block', marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 28px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontFamily: 'var(--mono)', fontWeight: 300, fontSize: 18, display: 'flex', alignItems: 'center', color: '#0A0A0A' }}>
            <span style={{ display: 'inline-block', width: 2, height: 18, background: '#0A0A0A', marginRight: 2, borderRadius: 1 }} />
            bluum
          </div>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400, background: '#FFFFFF', border: '1px solid #0A0A0A', borderRadius: 6, padding: '36px 32px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: '#0A0A0A', marginBottom: 4 }}>Create account</h2>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#888888', marginBottom: 28 }}>Start your private market research</p>

          {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#C0392B', background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 4, padding: '8px 12px', marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} />
            <label style={labelStyle}>Organisation</label>
            <input type="text" value={organisation} onChange={e => setOrganisation(e.target.value)} style={inputStyle} />
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
            <button type="submit" disabled={loading} style={{
              width: '100%', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#FFFFFF', background: '#0A0A0A', border: 'none',
              borderRadius: 4, padding: '10px 14px', cursor: 'pointer', marginTop: 8,
            }}>
              {loading ? 'Creating\u2026' : 'Create Account'}
            </button>
          </form>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#888888', textAlign: 'center', marginTop: 20 }}>
            Already have an account? <Link to="/login" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
