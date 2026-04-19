'use client'

import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

type Tab = 'cashflow' | 'investments' | 'borrowing'

export default function ControlRoomPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab]     = useState<Tab>('cashflow')
  const { data } = useFinancialStore()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'cashflow',    label: 'Cash Flow'   },
    { id: 'investments', label: 'Investments' },
    { id: 'borrowing',   label: 'Borrowing'   },
  ]

  const months         = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar ▶']
  const incomeHeights  = [112, 108, 128, 116, 120, 140]
  const expenseHeights = [88,  92,  104, 86,  90,  94 ]

  const assets = [
    { icon: '📈', name: 'US Equities',        value: 48200, change: '+11.4% YTD', up: true  },
    { icon: '🌍', name: 'Intl Equities',       value: 12400, change: '+6.2% YTD',  up: true  },
    { icon: '🏠', name: 'Real Estate (REITs)', value: 8900,  change: '+4.8% YTD',  up: true  },
    { icon: '🔒', name: 'Bonds / Fixed',       value: 18600, change: '+1.9% YTD',  up: true  },
    { icon: '⚡', name: 'Crypto',              value: 3200,  change: '+34% YTD',   up: true  },
    { icon: '💵', name: 'Cash / HYSA',         value: 14800, change: '5.1% APY',   up: true  },
  ]

  const debts = [
    { name: 'Mortgage',     rate: '6.2% APR',                       remaining: 312000, original: 400000, tag: 'Optimal',     tagColor: '#34d399' },
    { name: 'Auto Loan',    rate: '5.4% APR · refinance available', remaining: 18400,  original: 24000,  tag: 'Refinance →', tagColor: '#22d3ee' },
    { name: 'Student Loan', rate: '4.1% APR',                       remaining: 22100,  original: 48000,  tag: 'Optimal',     tagColor: '#34d399' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#040c1a' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ marginLeft: 240 }}>
        <Topbar title="Control Room" onMenuClick={() => setSidebarOpen(true)} />

        <div style={{ padding: '28px 32px' }}>

          {/* ── TABS ── */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 9, marginBottom: 24, width: 'fit-content', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.06)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding:      '9px 22px',
                  borderRadius: 6,
                  fontSize:     '0.8rem',
                  fontWeight:   700,
                  cursor:       'pointer',
                  border:       'none',
                  fontFamily:   'inherit',
                  transition:   'all .2s',
                  background:   activeTab === tab.id ? 'linear-gradient(135deg,#38bdf8,#2dd4bf)' : 'transparent',
                  color:        activeTab === tab.id ? '#020d1a' : '#94a8c8',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ══ CASH FLOW ══ */}
          {activeTab === 'cashflow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Bar chart */}
                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    6-Month Income vs Expenses
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    {[{ color: '#2dd4bf', label: 'Income' }, { color: '#f87171', label: 'Expenses' }].map(l => (
                      <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#94a8c8' }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: l.color }} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                    {months.map((month, i) => (
                      <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                          <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: incomeHeights[i],  background: 'linear-gradient(180deg,#2dd4bf,rgba(45,212,191,0.4))' }} />
                          <div style={{ flex: 1, borderRadius: '3px 3px 0 0', height: expenseHeights[i], background: 'linear-gradient(180deg,rgba(248,113,113,0.8),rgba(248,113,113,0.3))' }} />
                        </div>
                        <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono,monospace', color: '#526480' }}>{month}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Forecast */}
                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    AI Cash Flow Forecast
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { label: 'THIS MONTH',   color: '#34d399', bg: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.2)',  title: data?.connected ? `${fmt(data.monthly_surplus)} surplus predicted`              : 'Connect bank for forecast',    desc: 'AI will deploy to Growth + Opportunity buckets' },
                      { label: 'WATCH',        color: '#fbbf24', bg: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.2)',  title: 'Review upcoming large expenses',                                               desc: 'AI is building reserve automatically' },
                      { label: 'Q2 PROJECTION',color: '#22d3ee', bg: 'rgba(34,211,238,0.06)',  border: 'rgba(56,189,248,0.1)', title: data?.connected ? `Net worth → ${fmt((data.net_worth || 0) * 1.047)}` : 'Connect bank for projection', desc: 'Based on current trajectory +4.7%' },
                    ].map(item => (
                      <div key={item.label} style={{ padding: 16, borderRadius: 10, background: item.bg, border: `1px solid ${item.border}` }}>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: item.color, marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a8c8' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real spending + income sources */}
              {data?.connected && data.top_categories.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                  <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                      Real Spending — From Your Accounts
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {data.top_categories.map((cat, i) => {
                        const maxAmt = data.top_categories[0].amount
                        const colors = ['#38bdf8', '#2dd4bf', '#fbbf24', '#818cf8', '#f87171', '#34d399']
                        return (
                          <div key={cat.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                              <span>{cat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                              <span style={{ fontWeight: 700 }}>{fmt(cat.amount)}</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: 'rgba(56,189,248,0.06)' }}>
                              <div style={{ width: `${Math.round((cat.amount / maxAmt) * 100)}%`, height: '100%', borderRadius: 3, background: colors[i % colors.length] }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                      Income Sources
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {data.accounts
                        .filter(acc => acc.type === 'depository')
                        .slice(0, 3)
                        .map(acc => (
                          <div key={acc.account_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#081528', border: '1px solid rgba(56,189,248,0.06)', borderRadius: 8 }}>
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{acc.name}</div>
                              <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', marginTop: 2, color: '#526480' }}>{acc.institution_name}</div>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#5eead4' }}>
                              {fmt(acc.balances.current ?? 0)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ══ INVESTMENTS ══ */}
          {activeTab === 'investments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {assets.map(asset => (
                  <div key={asset.name} style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{asset.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>{asset.name}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{fmt(asset.value)}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: asset.up ? '#34d399' : '#f87171' }}>
                      {asset.up ? '↑' : '↓'} {asset.change}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                    AI Portfolio Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { icon: '🔄', bg: 'rgba(56,189,248,0.06)',  title: 'Rebalancing scheduled',                    desc: 'Equities overweight by 3% → auto-rebalance next week',          color: '#eef2fc' },
                      { icon: '📉', bg: 'rgba(52,211,153,0.06)',  title: 'Tax-loss harvesting opportunity detected', desc: 'Could save estimated $200–400 this tax year',                     color: '#34d399' },
                      { icon: '💰', bg: 'rgba(34,211,238,0.05)',  title: 'DCA automation active',                    desc: 'Monthly auto-investment into index funds running',                color: '#eef2fc' },
                    ].map((action, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, background: action.bg, border: '1px solid rgba(56,189,248,0.06)' }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>{action.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: action.color }}>{action.title}</div>
                          <div style={{ fontSize: '0.74rem', marginTop: 3, color: '#94a8c8' }}>{action.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    Total Portfolio Value
                  </div>
                  <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6, background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {fmt(assets.reduce((s, a) => s + a.value, 0))}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a8c8', marginBottom: 20 }}>Across all asset classes</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: 'YTD Return',     value: '+9.8%',              color: '#34d399' },
                      { label: 'vs S&P 500',      value: '+1.4% outperforming', color: '#34d399' },
                      { label: 'Next rebalance',  value: 'In 7 days',          color: '#eef2fc' },
                      { label: 'Next DCA',        value: '1st of month',       color: '#eef2fc' },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#94a8c8' }}>{row.label}</span>
                        <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ BORROWING ══ */}
          {activeTab === 'borrowing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    AI Borrowing Recommendation
                  </div>
                  <div style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#22d3ee', marginBottom: 8 }}>ACTIVE OPPORTUNITY</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>Refinance auto loan — potential savings available</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a8c8', marginBottom: 14 }}>
                      Based on current rates and your credit profile, refinancing your auto loan could meaningfully reduce your monthly payment and total interest paid.
                    </div>
                    <button style={{ padding: '9px 18px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Explore Refinancing →
                    </button>
                  </div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: '#526480' }}>
                    AI checks refinancing opportunities weekly based on rate movements.
                  </div>
                </div>

                <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>
                    Credit Utilization
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', marginBottom: 4 }}>12%</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a8c8', marginBottom: 16 }}>Well within optimal 30% threshold</div>
                  <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(56,189,248,0.06)', marginBottom: 16 }}>
                    <div style={{ width: '12%', height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#34d399,#2dd4bf)' }} />
                  </div>
                  {[
                    { label: 'Available credit',   value: '$21,400'  },
                    { label: 'Used credit',         value: '$2,900'   },
                    { label: 'Credit score range',  value: '740–760'  },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '6px 0' }}>
                      <span style={{ color: '#94a8c8' }}>{row.label}</span>
                      <span style={{ fontWeight: 700 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
                  Active Debt Stack
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {debts.map(debt => {
                    const pct = Math.round((debt.remaining / debt.original) * 100)
                    return (
                      <div key={debt.name} style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.06)', borderRadius: 10, padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{debt.name}</div>
                            <div style={{ fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: '#526480', marginTop: 2 }}>{debt.rate}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono,monospace', padding: '3px 10px', borderRadius: 100, color: debt.tagColor, background: 'rgba(56,189,248,0.06)', border: `1px solid ${debt.tagColor}40` }}>
                              {debt.tag}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>{fmt(debt.remaining)}</span>
                          </div>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, overflow: 'hidden', background: 'rgba(56,189,248,0.06)', marginBottom: 8 }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#38bdf8,#2dd4bf)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#526480' }}>
                          <span>{fmt(debt.remaining)} remaining</span>
                          <span>{fmt(debt.original)} original</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
