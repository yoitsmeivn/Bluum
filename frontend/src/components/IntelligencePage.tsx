import { useState, useRef, useEffect } from 'react'

interface Message {
  type: 'system' | 'user' | 'agent'
  content: React.ReactNode
  sources?: { icon: string; label: string }[]
}

const initialMessages: Message[] = [
  { type: 'system', content: 'Intelligence Agent — grounded in 3,241 DEF14A filings + 2 tearsheets + 2 uploaded documents' },
  { type: 'user', content: 'What EBITDA multiples have been paid for B2B SaaS businesses with under $100m revenue in the payments infrastructure space since 2021?' },
  {
    type: 'agent',
    content: (
      <>
        <p style={{ marginBottom: 10 }}>Based on <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>47 qualifying transactions</strong> from the DEF14A corpus (B2B payments infrastructure, sub-$100m revenue, 2021–2026), the median EV/EBITDA multiple paid was <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>15.8×</strong>, with a range of 9.2× to 28.4×.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontFamily: 'var(--mono)', fontSize: 11 }}>
          <thead>
            <tr>
              {['Period', 'Median Multiple', '25th–75th Pctl', 'Deals (n)'].map(h => (
                <th key={h} style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '6px 10px 6px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['2021', '17.4×', '13.2–22.1×', '11'],
              ['2022', '14.9×', '11.8–19.6×', '14'],
              ['2023', '13.1×', '9.8–16.4×', '9'],
              ['2024', '15.2×', '12.0–18.8×', '8'],
              ['2025–26', '16.8×', '14.1–21.3×', '5'],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{row[0]}</td>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: 'var(--accent)', fontWeight: 500 }}>{row[1]}</td>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{row[2]}</td>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>The 2022–23 compression aligns with rate hike cycles; the recovery in 2024–26 tracks renewed PE activity and strategic acquirer demand. NRR above 110% commanded a consistent <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>+2.4× premium</strong> over sector median across all periods. PE buyers paid a 1.8× discount to strategic acquirers on average.</p>
      </>
    ),
    sources: [
      { icon: '⊞', label: 'DEF14A: 47 filings cited' },
      { icon: '◈', label: 'Nordic Payments SaaS tearsheet' },
    ],
  },
  { type: 'user', content: 'How does Finloop compare to the Meridian CIM I uploaded?' },
  {
    type: 'agent',
    content: (
      <>
        <p style={{ marginBottom: 10 }}>Comparing <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>Finloop Technologies</strong> (from your Nordic Payments tearsheet) against <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>Meridian Capital's platform asset</strong> (from the uploaded CIM) across the dimensions most relevant to acquirer pricing:</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '12px 0', fontFamily: 'var(--mono)', fontSize: 11 }}>
          <thead>
            <tr>
              {['Dimension', 'Finloop', 'Meridian CIM'].map(h => (
                <th key={h} style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', padding: '6px 10px 6px 0', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['ARR', '€8.2m', '$11.4m', true, true],
              ['NRR', '140%', '118%', true, true],
              ['Gross Margin', '~78% (est.)', '82%', false, true],
              ['Geography', 'Nordic / EU', 'US + Canada', false, false],
              ['Ownership', 'Bootstrapped', 'PE-backed (Abacus)', false, false],
              ['Product', 'A2A rails API', 'Recon + treasury', false, false],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>{row[0] as string}</td>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: row[3] ? 'var(--accent)' : 'var(--text)', fontWeight: row[3] ? 500 : 400 }}>{row[1] as string}</td>
                <td style={{ padding: '8px 10px 8px 0', borderBottom: '1px solid var(--border)', color: row[4] ? 'var(--accent)' : 'var(--text)', fontWeight: row[4] ? 500 : 400 }}>{row[2] as string}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Finloop's NRR is a meaningful differentiator. Based on comparable precedent transactions, it would likely command a <strong style={{ color: 'var(--text-bright)', fontWeight: 500 }}>+1.9–2.8× premium</strong> over Meridian on NRR alone, offset partially by smaller absolute ARR and geographic concentration risk.</p>
      </>
    ),
    sources: [
      { icon: '⊕', label: 'Meridian Capital CIM (uploaded)' },
      { icon: '◈', label: 'Nordic Payments tearsheet' },
      { icon: '⊞', label: 'DEF14A: 12 comparable filings' },
    ],
  },
]

const corpusData = {
  filings: [{ icon: '◎', name: 'SEC EDGAR — DEF14A', count: '3,241 transactions', active: true }],
  memory: [
    { icon: '◈', name: 'Nordic Payments SaaS', count: 'Mar 24, 2026', active: true },
    { icon: '◈', name: 'Healthcare IT UK', count: 'Mar 23, 2026', active: false },
    { icon: '◈', name: 'Nordic Fintech SaaS', count: 'Mar 22, 2026', active: false },
  ],
  uploads: [
    { icon: '⊕', name: 'Meridian Capital CIM', count: 'PDF · Indexed', active: true },
    { icon: '⊕', name: 'Finloop Management Pres.', count: 'PDF · Indexed', active: true },
  ],
}

const hints = [
  'Which PE firms are most active in healthcare IT?',
  'What deal rationale repeats in Nordic exits?',
  'Show me everything I\'ve researched this month',
]

export function IntelligencePage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const q = input.trim()
    setInput('')
    setMessages(prev => [...prev, { type: 'user', content: q }])
    // Mock response after delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        type: 'agent',
        content: <p>I found relevant data across your corpus for "{q}". Based on the available filings and tearsheets, the analysis suggests several key patterns worth investigating further.</p>,
        sources: [{ icon: '⊞', label: 'DEF14A corpus' }, { icon: '◈', label: 'Research memory' }],
      }])
    }, 1500)
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px'
    }
  }

  const corpusItem = (item: { icon: string; name: string; count: string; active: boolean }) => (
    <div key={item.name} style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, padding: 8, borderRadius: 4, marginBottom: 4, cursor: 'pointer',
      background: item.active ? 'var(--accent-dim)' : 'transparent',
      border: item.active ? '1px solid var(--accent-border)' : '1px solid transparent',
    }}>
      <span style={{ fontSize: 11, marginTop: 1, flexShrink: 0, color: item.active ? 'var(--accent)' : 'var(--text-dim)' }}>{item.icon}</span>
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: item.active ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.35 }}>{item.name}</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-muted)' }}>{item.count}</div>
      </div>
    </div>
  )

  const sectionLabel = (text: string) => (
    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '14px 0 8px' }}>{text}</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ height: 52, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'var(--text-dim)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', flex: 1 }}>
          Intelligence / <span style={{ color: 'var(--text)' }}>Query your corpus</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', background: 'none', border: '1px solid var(--border-med)', borderRadius: 4, padding: '5px 12px', cursor: 'pointer' }}>Manage Sources</button>
          <button style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#FFFFFF', background: 'var(--accent)', border: 'none', borderRadius: 4, padding: '5px 14px', cursor: 'pointer' }}>New Query</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Corpus panel */}
        <div style={{ width: 240, minWidth: 240, borderRight: '1px solid var(--border)', padding: '18px 14px', overflowY: 'auto', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 12 }}>Active Corpus</div>
          {sectionLabel('DEF14A Filings')}
          {corpusData.filings.map(item => corpusItem(item))}
          {sectionLabel('Research Memory')}
          {corpusData.memory.map(item => corpusItem(item))}
          {sectionLabel('Uploaded Documents')}
          {corpusData.uploads.map(item => corpusItem(item))}
        </div>

        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            {messages.map((msg, i) => {
              if (msg.type === 'system') {
                return <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>{msg.content}</div>
              }
              if (msg.type === 'user') {
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, maxWidth: 600, alignSelf: 'flex-end', flexDirection: 'row-reverse' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>JH</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 6, textAlign: 'right' }}>James Harper</div>
                      <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', background: 'var(--surface2)', border: '1px solid var(--border-med)', borderRadius: '6px 6px 2px 6px', padding: '10px 14px' }}>{msg.content}</div>
                    </div>
                  </div>
                )
              }
              // agent
              return (
                <div key={i} style={{ display: 'flex', gap: 14, maxWidth: 820 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border-med)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', flexShrink: 0, marginTop: 2 }}>B</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-dim)', marginBottom: 6 }}>Intelligence Agent</div>
                    <div style={{ fontFamily: 'var(--body)', fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>{msg.content}</div>
                    {msg.sources && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                        {msg.sources.map((s, j) => (
                          <span key={j} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ice)', background: 'var(--ice-dim)', border: '1px solid rgba(42,110,170,0.2)', borderRadius: 3, padding: '3px 8px' }}>
                            <span style={{ fontSize: 9 }}>{s.icon}</span>{s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'var(--surface2)', border: '1px solid var(--border-med)', borderRadius: 6, padding: '10px 14px' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                rows={1}
                placeholder="Ask anything about your corpus — multiples, patterns, companies, deals…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--body)', fontSize: 13, color: 'var(--text)', resize: 'none', minHeight: 20, maxHeight: 100, lineHeight: 1.5 }}
              />
              <button onClick={handleSend} style={{ background: 'var(--accent)', border: 'none', borderRadius: 4, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontSize: 12, color: '#FFFFFF' }}>↑</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {hints.map((h, i) => (
                <span key={i} onClick={() => { setInput(h) }} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text-dim)', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 3, padding: '3px 8px', cursor: 'pointer' }}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
