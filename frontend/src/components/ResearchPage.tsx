import { useRef, useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { startResearch, getResearch, saveTearsheet } from '../lib/api'
import type { ResearchSection } from '../lib/api'

// Strip any remaining citation artifacts from rendered strings
const clean = (s: any): string =>
  typeof s === 'string'
    ? s.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').replace(/~<cite[^>]*>[^<]*<\/cite>/g, '').replace(/\[\d+\]/g, '').trim()
    : String(s ?? '')

const SECTION_NAMES = ['overview', 'ma_activity', 'targets', 'risks', 'buyers'] as const
type SectionName = typeof SECTION_NAMES[number]

const agents: Array<{ id: string; sectionName: SectionName; label: string; num: string }> = [
  { id: 'overview', sectionName: 'overview', label: 'Overview', num: '01' },
  { id: 'ma', sectionName: 'ma_activity', label: 'M&A Activity', num: '02' },
  { id: 'targets', sectionName: 'targets', label: 'Target Scanner', num: '03' },
  { id: 'risks', sectionName: 'risks', label: 'Risk & Tailwinds', num: '04' },
  { id: 'buyers', sectionName: 'buyers', label: 'Buyer Landscape', num: '05' },
]

const exampleChips = [
  'B2B SaaS HR software UK acquisitions',
  'Nordic fintech PE targets',
  'Healthcare IT mid-market Europe',
]

// ── Shared style helpers ──
const btnGhost: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border-med)', borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }
const btnAccent: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '5px 14px', cursor: 'pointer' }
const sectionHeaderStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }
const sectionDivider: React.CSSProperties = { marginBottom: 36, paddingBottom: 36, borderBottom: '1px solid var(--border)' }

function SectionTag({ num }: { num: string }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '3px 8px', borderRadius: 3 }}>Agent {num}</span>
}
function SectionTitle({ text }: { text: string }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, color: 'var(--text-bright)', letterSpacing: '0.04em' }}>{text}</span>
}

// ── Skeleton ──
function Skeleton() {
  return (
    <div style={{ ...sectionDivider, animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 70, height: 20, background: 'var(--surface2)', borderRadius: 3 }} />
        <div style={{ width: 140, height: 20, background: 'var(--surface2)', borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ width: '100%', height: 16, background: 'var(--surface2)', borderRadius: 3 }} />
        <div style={{ width: '85%', height: 16, background: 'var(--surface2)', borderRadius: 3 }} />
        <div style={{ width: '70%', height: 16, background: 'var(--surface2)', borderRadius: 3 }} />
        <div style={{ width: '90%', height: 16, background: 'var(--surface2)', borderRadius: 3 }} />
      </div>
    </div>
  )
}

// ── Error state ──
function SectionError({ name, onRetry }: { name: string; onRetry?: () => void }) {
  return (
    <div style={{ ...sectionDivider, padding: '24px 0' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red-text)', marginBottom: 8 }}>Failed to load {name}</div>
      {onRetry && <button onClick={onRetry} style={btnGhost}>Retry</button>}
    </div>
  )
}

// ── Tag pills ──
function Tags({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
      {items.map(t => <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 3, padding: '3px 8px' }}>{t}</span>)}
    </div>
  )
}

// ── SECTION RENDERERS ──

function OverviewContent({ d }: { d: Record<string, any> }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Sector', value: `${clean(d.sector)}${d.sub_sector ? ' / ' + clean(d.sub_sector) : ''}`, sub: clean(d.one_liner) },
          { label: 'Geography', value: clean(d.geography) || 'N/A', sub: '' },
          { label: 'Size Estimate', value: clean(d.size_estimate) || 'N/A', sub: d.employee_count ? `~${clean(d.employee_count)} employees` : '' },
          { label: 'Ownership', value: clean(d.ownership) || 'Unknown', sub: '' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 500, color: 'var(--text-bright)', lineHeight: 1.2, marginBottom: 3 }}>{s.value}</div>
            {s.sub && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)' }}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--body)', fontSize: 13.5, lineHeight: 1.75, color: 'var(--text)', maxWidth: 680 }}>
        {d.business_model && <p style={{ marginBottom: 12 }}>{clean(d.business_model)}</p>}
        {d.competitive_position && <p style={{ marginBottom: 12 }}>{clean(d.competitive_position)}</p>}
      </div>
      {d.recent_news?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Recent developments</div>
          {d.recent_news.map((n: string, i: number) => (
            <div key={i} style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 4 }}>• {clean(n)}</div>
          ))}
        </div>
      )}
      {d.tags?.length > 0 && <Tags items={d.tags.map((t: string) => clean(t))} />}
    </>
  )
}

function MaContent({ d }: { d: Record<string, any> }) {
  return (
    <>
      {d.summary && <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, maxWidth: 680 }}>{clean(d.summary)}</div>}
      {d.recent_deals?.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead><tr>
            {['Target', 'Acquirer', 'Date', 'Value', 'Multiple'].map(h => (
              <th key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 12px 10px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {d.recent_deals.map((deal: any, i: number) => (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{clean(deal.target)}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{clean(deal.acquirer)}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{clean(deal.date)}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{clean(deal.deal_size ?? deal.value ?? '—')}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', padding: '10px 12px 10px 0', borderBottom: '1px solid var(--border)' }}>{clean(deal.multiple ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {d.deal_drivers?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>Deal drivers</div>
          {d.deal_drivers.map((dr: string, i: number) => <div key={i} style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>• {clean(dr)}</div>)}
        </div>
      )}
      {d.outlook && <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', maxWidth: 680 }}>{clean(d.outlook)}</div>}
    </>
  )
}

function TargetsContent({ d }: { d: Record<string, any> }) {
  const targets = [...(d.targets ?? [])].sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))
  return (
    <>
      {d.summary && <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, maxWidth: 680 }}>{clean(d.summary)}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {targets.map((t: any, i: number) => {
          const score = t.score ?? 0
          const scoreNum = typeof score === 'number' ? score : parseFloat(score) || 0
          const pct = Math.min(scoreNum * 10, 100)
          return (
            <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1, minWidth: 24, paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--text-bright)', marginBottom: 3 }}>{clean(t.name)}{t.headquarters ? ` (${clean(t.headquarters)})` : ''}</div>
                <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.4 }}>{clean(t.description ?? t.why_attractive ?? '')}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[t.ownership, t.size_estimate].filter(Boolean).map((tag: string) => (
                    <span key={tag} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 2 }}>{clean(tag)}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {scoreNum.toFixed(1)}
                <div style={{ width: 40, height: 3, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function RisksContent({ d }: { d: Record<string, any> }) {
  const levelColor = (level: string): React.CSSProperties => {
    const l = level?.toLowerCase() ?? ''
    if (l.includes('high')) return { background: 'rgba(192,57,43,0.08)', color: 'var(--red-text)' }
    if (l.includes('med')) return { background: 'var(--accent-dim)', color: 'var(--text-dim)' }
    return { background: 'rgba(26,122,66,0.08)', color: 'var(--green-text)' }
  }
  const sentimentColor = (s: string) => {
    const l = s?.toLowerCase() ?? ''
    if (l.includes('bullish') && !l.includes('bear')) return { background: 'rgba(26,122,66,0.08)', color: 'var(--green-text)', border: '1px solid rgba(26,122,66,0.2)' }
    if (l.includes('bear')) return { background: 'rgba(192,57,43,0.08)', color: 'var(--red-text)', border: '1px solid rgba(192,57,43,0.15)' }
    return { background: 'var(--accent-dim)', color: 'var(--text-dim)', border: '1px solid var(--border-med)' }
  }
  return (
    <>
      {d.overall_sentiment && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3, ...sentimentColor(d.overall_sentiment) }}>{clean(d.overall_sentiment)}</span>
        </div>
      )}
      {d.summary && <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, maxWidth: 680 }}>{clean(d.summary)}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {(d.risks ?? []).map((r: any, i: number) => (
          <div key={`r-${i}`} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>⚠</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{clean(r.title)}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto', ...levelColor(r.severity) }}>{clean(r.severity)}</span>
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{clean(r.description)}</div>
          </div>
        ))}
        {(d.tailwinds ?? []).map((t: any, i: number) => (
          <div key={`t-${i}`} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>↑</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{clean(t.title)}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 8, padding: '2px 6px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto', ...levelColor(t.strength) }}>{clean(t.strength)}</span>
            </div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{clean(t.description)}</div>
          </div>
        ))}
      </div>
      {d.sentiment_rationale && <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic', marginTop: 16 }}>{clean(d.sentiment_rationale)}</div>}
    </>
  )
}

function BuyersContent({ d }: { d: Record<string, any> }) {
  const likelihoodColor = (l: string) => {
    const v = l?.toLowerCase() ?? ''
    if (v.includes('high')) return 'var(--green-text)'
    if (v.includes('med')) return 'var(--text-dim)'
    return 'var(--text-muted)'
  }
  return (
    <>
      {d.summary && <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20, maxWidth: 680 }}>{clean(d.summary)}</div>}
      {d.strategic_buyers?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Strategic buyers</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {d.strategic_buyers.map((b: any, i: number) => (
              <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '12px 14px', minWidth: 160, flex: 1, cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-bright)', marginBottom: 3 }}>{clean(b.name)}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{clean(b.type)}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: likelihoodColor(b.likelihood) }}>{clean(b.likelihood)} likelihood</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.financial_buyers?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Financial buyers</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {d.financial_buyers.map((b: any, i: number) => (
              <div key={i} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '12px 14px', minWidth: 160, flex: 1, cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-bright)', marginBottom: 3 }}>{clean(b.name)}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{clean(b.type)}</div>
                {b.aum && <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 4 }}>AUM: {clean(b.aum)}</div>}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: likelihoodColor(b.likelihood) }}>{clean(b.likelihood)} likelihood</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.valuation_implication && <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>{clean(d.valuation_implication)}</div>}
    </>
  )
}

// ── Main component ──
export function ResearchPage() {
  const { activeSection, setActiveSection, currentResearch, setCurrentResearch, researchLoading, setResearchLoading, addSavedTearsheet } = useAppStore()
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [inputQuery, setInputQuery] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [toast, setToast] = useState<string | null>(null)

  // Cleanup polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const getSectionData = (name: SectionName): ResearchSection | undefined =>
    currentResearch?.sections.find(s => s.section_name === name)

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim()) return
    setInputQuery('')
    setResearchLoading(true)
    setCurrentResearch(null)
    if (pollRef.current) clearInterval(pollRef.current)

    try {
      const { research_id } = await startResearch(query)
      // Create a placeholder research while polling
      setCurrentResearch({ id: research_id, user_id: '', query, status: 'running', created_at: new Date().toISOString(), sections: [] })

      pollRef.current = setInterval(async () => {
        try {
          const data = await getResearch(research_id)
          setCurrentResearch(data)
          if (data.status === 'done' || data.status === 'error') {
            if (pollRef.current) clearInterval(pollRef.current)
            setResearchLoading(false)
            if (data.status === 'error') {
              setToast('Research failed — check your API key')
              setTimeout(() => setToast(null), 5000)
            }
          }
        } catch {
          // continue polling
        }
      }, 2000)
    } catch {
      setResearchLoading(false)
      setToast('Research failed — check your API key')
      setTimeout(() => setToast(null), 5000)
    }
  }, [setCurrentResearch, setResearchLoading])

  const handleNewResearch = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    setCurrentResearch(null)
    setResearchLoading(false)
    setSaveState('idle')
  }

  const handleSave = async () => {
    if (!currentResearch || saveState !== 'idle') return
    setSaveState('saving')
    try {
      const saved = await saveTearsheet(currentResearch.id, currentResearch.query)
      addSavedTearsheet(saved)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('idle')
      setToast('Failed to save tearsheet')
      setTimeout(() => setToast(null), 5000)
    }
  }

  const renderSection = (agent: typeof agents[0]) => {
    const section = getSectionData(agent.sectionName)
    if (!section || section.status === 'loading' || section.status === 'idle') return <Skeleton />
    if (section.status === 'error') return <SectionError name={agent.label} />
    const d = section.content
    switch (agent.sectionName) {
      case 'overview': return <OverviewContent d={d} />
      case 'ma_activity': return <MaContent d={d} />
      case 'targets': return <TargetsContent d={d} />
      case 'risks': return <RisksContent d={d} />
      case 'buyers': return <BuyersContent d={d} />
    }
  }

  const hasResearch = currentResearch !== null

  // ── EMPTY STATE ──
  if (!hasResearch && !researchLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', flex: 1 }}>Research</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 300, color: 'var(--text-bright)', display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--text-bright)', marginRight: 2, borderRadius: 1 }} />bluum
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 20 }}>Research any private company or sector</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%', maxWidth: 700 }}>
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(inputQuery) }}
              placeholder="e.g. B2B SaaS HR software UK acquisitions"
              style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border-med)', borderRadius: 5, padding: '12px 16px', fontFamily: 'var(--body)', fontSize: 14, color: 'var(--text)', outline: 'none' }}
            />
            <button onClick={() => handleSubmit(inputQuery)} style={btnAccent}>Research →</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {exampleChips.map(c => (
              <button key={c} onClick={() => handleSubmit(c)} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── TEARSHEET VIEW ──
  const doneSections = new Set(currentResearch?.sections.filter(s => s.status === 'done').map(s => s.section_name) ?? [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 24, zIndex: 1000, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red-text)', background: '#fff', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 4, padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{toast}</div>
      )}

      {/* Top bar */}
      <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', flex: 1 }}>
          Research / <span style={{ color: 'var(--text)' }}>{currentResearch?.query ?? ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleNewResearch} style={btnGhost}>+ New Research</button>
          <button style={btnGhost}>Export PDF</button>
          <button onClick={handleSave} style={btnAccent}>
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Save Tearsheet'}
          </button>
        </div>
      </div>

      {/* New research bar */}
      <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="text" value={inputQuery} onChange={e => setInputQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSubmit(inputQuery) }} placeholder="Research any private company or sector…" style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border-med)', borderRadius: 5, padding: '8px 14px', fontFamily: 'var(--body)', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        <button onClick={() => handleSubmit(inputQuery)} style={btnAccent}>Research →</button>
      </div>

      {/* Query bar */}
      <div style={{ padding: '18px 28px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 6 }}>Query</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', color: 'var(--text-bright)', flex: 1 }}>
            "{currentResearch?.query ?? ''}"
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            {currentResearch?.status === 'running' ? (
              <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)', display: 'inline-block', marginRight: 5, animation: 'pulse 1.5s ease-in-out infinite' }} />Agents working…</span>
            ) : currentResearch?.status === 'done' ? (
              <span><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-text)', display: 'inline-block', marginRight: 5 }} />All agents complete</span>
            ) : currentResearch?.status === 'error' ? (
              <span style={{ color: 'var(--red-text)' }}>Error</span>
            ) : null}
            <span>{doneSections.size}/5 agents</span>
          </div>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Agent nav */}
        <div style={{ width: 180, minWidth: 180, borderRight: '1px solid var(--border)', padding: '16px 10px', overflowY: 'auto', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0 8px', marginBottom: 10 }}>Agents</div>
          {agents.map((agent) => {
            const active = activeSection === agent.id
            const done = doneSections.has(agent.sectionName)
            return (
              <div key={agent.id} onClick={() => scrollTo(agent.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 4,
                cursor: 'pointer', marginBottom: 2, borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                background: active ? 'var(--accent-dim)' : 'transparent',
              }}>
                {done ? (
                  <span style={{ fontSize: 10, flexShrink: 0, color: 'var(--green-text)' }}>✓</span>
                ) : (
                  <span style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid var(--text-muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                )}
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: active || done ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.3 }}>{agent.label}</div>
              </div>
            )
          })}
        </div>

        {/* Tearsheet content */}
        <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
          {agents.map((agent, idx) => (
            <div key={agent.id} ref={el => { sectionRefs.current[agent.id] = el }} style={idx < agents.length - 1 ? sectionDivider : { marginBottom: 36, paddingBottom: 36 }}>
              <div style={sectionHeaderStyle}>
                <SectionTag num={agent.num} />
                <SectionTitle text={agent.label === 'M&A Activity' ? 'M&A Activity' : agent.label === 'Target Scanner' ? 'Acquisition Targets — Ranked' : agent.label} />
              </div>
              {renderSection(agent)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
