import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'

const filters = ['All', 'Fintech', 'Healthcare', 'Industrials', 'SaaS']

const cards = [
  { sector: 'Fintech · Nordic', title: 'B2B SaaS payments infrastructure — Nordic acquirers', date: 'Mar 24, 2026', dots: 5, summary: 'Nordic B2B payments infrastructure; 4 ranked targets including Finloop (€8.2m ARR, 140% NRR). 5 active PE buyers identified.', tags: ['€4.2B TAM', '16.2× median'] },
  { sector: 'Healthcare · UK', title: 'Healthcare IT — UK mid-market, clinical workflow SaaS', date: 'Mar 23, 2026', dots: 5, summary: 'Post-NHS GPIT framework analysis. 6 acquisition targets ranked; Halo Clinical and Carenote shortlisted. Vista Equity active in space.', tags: ['£1.8B TAM', '12.8× median'] },
  { sector: 'Fintech · Nordic', title: 'Nordic fintech SaaS — Series A/B buyout targets', date: 'Mar 22, 2026', dots: 5, summary: 'Broader Nordic fintech sweep; 8 targets across lending tech, regtech, and open banking. Verdane and EQT most active buyers in period.', tags: ['8 targets', '14.4× median'] },
  { sector: 'Industrials · DACH', title: 'German Mittelstand manufacturing software — PE roll-up', date: 'Mar 19, 2026', dots: 4, summary: 'ERP and MES software targeting Mittelstand manufacturers. Carlyle and Triton identified as likely platform buyers; 5 add-on targets ranked.', tags: ['DACH', '10.2× median'] },
  { sector: 'SaaS · US', title: 'US vertical SaaS — construction & field service management', date: 'Mar 14, 2026', dots: 5, summary: 'Highly fragmented market; Jonas Software and Constellation Software actively rolling up. 7 acquisition targets with ARR $2–18m identified.', tags: ['7 targets', '13.1× median'] },
  { sector: 'Fintech · Benelux', title: 'Benelux insurtech — embedded insurance distribution platforms', date: 'Mar 10, 2026', dots: 5, summary: 'ING and Allianz X as strategic acquirers. API-native distribution layer plays commanding premium; 3 shortlisted targets below €30m ARR.', tags: ['€870m TAM', '17.8× median'] },
]

export function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const setPage = useAppStore((s) => s.setPage)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', flex: 1 }}>Saved Tearsheets</div>
        <button onClick={() => setPage('research')} style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '5px 14px', cursor: 'pointer' }}>+ New Research</button>
      </div>

      {/* Research bar */}
      <div style={{ padding: '14px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input type="text" placeholder="Research any private company or sector — e.g. 'UK healthcare IT acquirers' or 'Nordic SaaS payments'" style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border-med)', borderRadius: 5, padding: '8px 14px', fontFamily: 'var(--body)', fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        <button style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '5px 14px', cursor: 'pointer' }}>Research →</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {filters.map(f => (
            <span key={f} onClick={() => setActiveFilter(f)} style={{
              fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer', padding: '5px 12px', borderRadius: 4,
              color: activeFilter === f ? 'var(--accent)' : 'var(--text-dim)',
              background: activeFilter === f ? 'var(--accent-dim)' : 'var(--surface2)',
              border: activeFilter === f ? '1px solid var(--accent-border)' : '1px solid var(--border)',
            }}>{f}</span>
          ))}
          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
          <select style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', outline: 'none' }}>
            <option>Sort: Recent</option>
            <option>Sort: Sector</option>
            <option>Sort: Saved</option>
          </select>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {cards.map((card, i) => (
            <div key={i} onClick={() => setPage('research')} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px 18px', cursor: 'pointer', position: 'relative' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--accent)', marginBottom: 6 }}>{card.sector}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', color: 'var(--text-bright)', lineHeight: 1.3, marginBottom: 10 }}>{card.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{card.date}</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: j < card.dots ? 'var(--green-text)' : 'var(--text-muted)' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.55, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{card.summary}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {card.tags.map(t => (
                  <span key={t} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 2, padding: '2px 6px' }}>{t}</span>
                ))}
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)' }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
