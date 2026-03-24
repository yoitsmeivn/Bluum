import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const mockMode = import.meta.env.VITE_USE_MOCK === 'true'

export default function Landing() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  // ── Tulip canvas animation ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = Math.min(window.devicePixelRatio, 2)
    const DOT_R = 0.6
    const GRID = 3.2
    const DOT_COLOR = 'rgba(175, 170, 163, 0.6)'

    interface TulipDef { bx: number; stemH: number; lean: number; bRx: number; bRy: number; stemW: number }
    interface AnimDot { x0: number; y0: number; phase: number; swayAmp: number; progress: number }

    let tulipDefs: TulipDef[] = []
    let animDots: AnimDot[] = []

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    function resize() {
      canvas!.width = canvas!.offsetWidth * DPR
      canvas!.height = canvas!.offsetHeight * DPR
    }

    function buildTulipDefs() {
      tulipDefs = []
      const w = W(), h = H()
      const count = Math.floor(w / 26)
      for (let i = 0; i < count; i++) {
        const bx = (i / count) * w + (Math.random() - 0.5) * (w / count) * 0.75
        const stemH = h * (0.46 + Math.random() * 0.40)
        const lean = (Math.random() - 0.5) * 0.18
        const bRx = 10 + Math.random() * 11
        const bRy = bRx * (1.45 + Math.random() * 0.25)
        const stemW = 1.4 + Math.random() * 0.9
        tulipDefs.push({ bx, stemH, lean, bRx, bRy, stemW })
      }
    }

    function tulipDensity(t: TulipDef, px: number, py: number) {
      const h = H()
      const by = h
      let d = 0

      const tf = Math.max(0, Math.min(1, (by - py) / t.stemH))
      const scx = t.bx + t.lean * t.stemH * tf * tf
      const sdx = px - scx
      const sdy = py - (by - t.stemH * tf)
      const stemDist = Math.sqrt(sdx * sdx + sdy * sdy)
      if (stemDist < t.stemW + 0.8 && tf < 0.85) {
        d += Math.max(0, 1 - Math.max(0, stemDist - t.stemW) / 0.8) * 0.88
      }

      const bulbCx = t.bx + t.lean * t.stemH
      const bulbCy = by - t.stemH - t.bRy * 0.52
      const lx = px - bulbCx
      const ly = py - bulbCy
      const ang = Math.atan2(ly, lx)
      const normAng = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const inNeck = normAng > Math.PI * 0.72 && normAng < Math.PI * 1.28
      const neckBlend = inNeck
        ? 0.28 + 0.22 * (0.5 + 0.5 * Math.cos((normAng - Math.PI) / (Math.PI * 0.28) * Math.PI))
        : 1.0
      const er = Math.sqrt((lx / (t.bRx * neckBlend)) ** 2 + (ly / t.bRy) ** 2)
      if (er < 1.12) {
        const fill = er < 0.88 ? 1.0 : Math.max(0, 1 - (er - 0.88) / 0.24)
        d += fill * (0.45 + Math.min(er / 0.9, 1) * 0.55) * 0.95
      }

      return Math.min(1, d)
    }

    function init() {
      buildTulipDefs()
      animDots = []
      const w = W(), h = H()
      for (let row = 0; row < Math.ceil(h / GRID); row++) {
        for (let col = 0; col < Math.ceil(w / GRID); col++) {
          const px = col * GRID + GRID * 0.5 + (Math.random() - 0.5) * GRID * 0.3
          const py = row * GRID + GRID * 0.5 + (Math.random() - 0.5) * GRID * 0.3
          let d = 0
          for (const t of tulipDefs) d += tulipDensity(t, px, py)
          d = Math.min(1, d)
          if (Math.random() < d) {
            const hf = 1 - py / h
            animDots.push({ x0: px, y0: py, phase: Math.random() * Math.PI * 2, swayAmp: 0.8 + hf * 3.8, progress: hf })
          }
        }
      }
    }

    function animate(ts: number) {
      const time = ts * 0.00013
      const w = W(), h = H()
      ctx!.clearRect(0, 0, w * DPR, h * DPR)
      ctx!.fillStyle = DOT_COLOR
      for (const p of animDots) {
        const sway = Math.sin(time + p.phase) * p.swayAmp * p.progress
        ctx!.beginPath()
        ctx!.arc((p.x0 + sway) * DPR, p.y0 * DPR, DOT_R * DPR, 0, Math.PI * 2)
        ctx!.fill()
      }
      animRef.current = requestAnimationFrame(animate)
    }

    resize()
    init()
    animRef.current = requestAnimationFrame(animate)

    const handleResize = () => { resize(); init() }
    window.addEventListener('resize', handleResize)

    // Scroll reveal
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 120)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    revealEls.forEach(el => observer.observe(el))

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])

  // ── Sign in handler ──
  const handleSignIn = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      if (mockMode) {
        navigate('/app')
        return
      }
      const { supabase } = await import('../lib/supabase')
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); return }
      navigate('/app')
    } catch {
      setError('Sign in failed')
    } finally {
      setLoading(false)
    }
  }, [email, password, navigate])

  return (
    <div style={{ background: '#ffffff', color: '#1A1A18', fontFamily: '"Lora", serif', overflowX: 'hidden' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 48px', zIndex: 100,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        <button className="signin-btn" onClick={() => setShowModal(true)}>Sign in</button>
      </nav>

      {/* ── HERO ── */}
      <section className="section-hero">
        <img className="logo-img" src="/bluum-logo.jpg" alt="Bluum" />
        <div className="hero-rule" />
        <p className="hero-sub">
          <strong>Private market intelligence</strong> for independent advisors,<br />
          boutique M&amp;A firms, and family offices —<br />
          grounded in real SEC transaction data.
        </p>
        <div className="hero-rule2" />
        <div className="hero-access">Early access now open</div>
      </section>

      {/* ── TULIP CANVAS ── */}
      <div className="tulip-wrap">
        <canvas id="c" ref={canvasRef} />
      </div>

      {/* ── SECTION 2 ── */}
      <div className="section-below">
        <div className="features reveal">
          <div className="feature">
            <div className="feature-tag">Mode 01 · Research</div>
            <div className="feature-title">Any private company or sector in seconds</div>
            <div className="feature-body">Five parallel AI agents. Overview, M&A activity, targets, risks, and buyer landscape — all at once.</div>
          </div>
          <div className="feature">
            <div className="feature-tag">Mode 02 · Intelligence</div>
            <div className="feature-title">Query 3,000+ real transactions</div>
            <div className="feature-body">Every answer grounded in SEC EDGAR merger proxy filings.</div>
          </div>
          <div className="feature">
            <div className="feature-tag">Mode 03 · Corpus</div>
            <div className="feature-title">Your own private intelligence layer</div>
            <div className="feature-body">Upload CIMs, teasers, and deal memos. Search and compare them alongside the market data.</div>
          </div>
        </div>

        <footer className="landing-footer reveal">
          <div className="footer-logo"><span className="footer-bar" />bluum</div>
          <div className="footer-copy">&copy; 2026</div>
        </footer>
      </div>

      {/* ── SIGN IN MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button onClick={() => setShowModal(false)} style={{
              position: 'absolute', top: 16, right: 20,
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 18,
              background: 'none', border: 'none', color: '#888580', cursor: 'pointer',
            }}>&times;</button>

            {/* Logo */}
            <div style={{
              fontFamily: '"IBM Plex Mono", monospace', fontWeight: 300, fontSize: 18,
              display: 'flex', alignItems: 'center', color: '#0A0A0A', marginBottom: 20,
            }}>
              <span style={{ display: 'inline-block', width: 2, height: 18, background: '#0A0A0A', marginRight: 2, borderRadius: 1 }} />
              bluum
            </div>

            <div style={{ width: '100%', height: 1, background: '#F0EEEC', marginBottom: 24 }} />

            <h2 style={{ fontFamily: '"Lora", serif', fontSize: 18, color: '#1A1A18', marginBottom: 24 }}>Sign in</h2>

            <form onSubmit={(e) => { e.preventDefault(); handleSignIn() }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                style={{
                  width: '100%', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
                  color: '#1A1A18', background: '#F8F7F6', border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 2, padding: '11px 14px', outline: 'none', marginBottom: 10,
                }}
              />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required
                style={{
                  width: '100%', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
                  color: '#1A1A18', background: '#F8F7F6', border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 2, padding: '11px 14px', outline: 'none', marginBottom: 16,
                }}
              />
              <button type="submit" disabled={loading} style={{
                width: '100%', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
                fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                color: '#ffffff', background: '#1A1A18', border: 'none', borderRadius: 0,
                padding: '12px 14px', cursor: 'pointer',
              }}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {error && (
              <div style={{
                fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#C0392B',
                marginTop: 14, textAlign: 'center',
              }}>{error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
