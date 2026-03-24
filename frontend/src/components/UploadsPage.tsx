export function UploadsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', flex: 1 }}>
          Upload Documents / <span style={{ color: 'var(--text)' }}>Build your personal corpus</span>
        </div>
        <button style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border-med)', borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}>Manage Corpus</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', gap: 24 }}>
        {/* Main */}
        <div style={{ flex: 1 }}>
          {/* Drop zone */}
          <div style={{ border: '1.5px dashed var(--border-med)', borderRadius: 8, padding: 40, textAlign: 'center', cursor: 'pointer', marginBottom: 24, background: 'var(--surface)' }}>
            <div style={{ fontSize: 28, marginBottom: 14, opacity: 0.5 }}>⊕</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Drop documents here</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', lineHeight: 1.5 }}>CIMs, teasers, management presentations, deal memos,<br />lender decks, financial models</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 14 }}>
              {['PDF', 'DOCX', 'PPTX', 'XLSX', 'TXT'].map(f => (
                <span key={f} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 2, padding: '2px 7px' }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Uploaded files */}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Your Documents — 2 indexed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { icon: '📄', name: 'Meridian Capital — Confidential Information Memorandum.pdf', meta: ['4.2 MB', 'Uploaded Mar 21, 2026', '48 pages'], status: 'Indexed', statusType: 'indexed' },
              { icon: '📊', name: 'Finloop Technologies — Management Presentation Q4 2025.pdf', meta: ['2.8 MB', 'Uploaded Mar 22, 2026', '32 pages'], status: 'Indexed', statusType: 'indexed' },
              { icon: '📋', name: 'Project Ember — Process Letter and Teaser.pdf', meta: ['680 KB', 'Uploaded Mar 24, 2026', '6 pages'], status: 'Processing…', statusType: 'processing' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', display: 'flex', gap: 10 }}>
                    {f.meta.map((m, j) => <span key={j}>{m}</span>)}
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2,
                  ...(f.statusType === 'indexed' ? { background: 'rgba(26,122,66,0.08)', color: 'var(--green-text)' } : { background: 'var(--accent-dim)', color: 'var(--text-dim)' }),
                }}>{f.status}</span>
              </div>
            ))}
          </div>

          {/* SEC corpus */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>SEC EDGAR Corpus — Read only</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 5, opacity: 0.7, cursor: 'default' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⊞</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', marginBottom: 2 }}>DEF14A Merger Proxy Filings — Full corpus</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', display: 'flex', gap: 10 }}>
                  <span>3,241 transactions</span><span>2000–2026</span><span>bge-base-en embeddings</span>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 7px', borderRadius: 2, background: 'rgba(26,122,66,0.08)', color: 'var(--green-text)' }}>Indexed</span>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 260, minWidth: 260 }}>
          {/* Corpus Overview */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 18, marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>Corpus Overview</div>
            {[
              { label: 'DEF14A filings', value: '3,241' },
              { label: 'Your tearsheets', value: '6' },
              { label: 'Uploaded docs', value: '2 indexed' },
              { label: 'Total vectors', value: '184,220' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-bright)' }}>{s.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 6 }}>Storage used</div>
              <div style={{ background: 'var(--surface3)', borderRadius: 2, height: 4, marginBottom: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '23%', background: 'var(--accent)', borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)' }}>230 MB of 1 GB</div>
            </div>
          </div>

          {/* What to upload */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 18 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>What to upload</div>
            <div style={{ fontFamily: 'var(--body)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}>Intelligence mode searches everything you upload. The more context you add, the sharper the answers.</p>
              <p style={{ marginBottom: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text)' }}>Works well:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                {['CIMs and information memos', 'Management presentations', 'Lender and investor decks', 'Your own deal memos', 'Sector research reports'].map(item => (
                  <span key={item} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)' }}>— {item}</span>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)' }}>All documents are encrypted at rest and never used for model training.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
