'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFinancialStore } from '@/store/financialStore'
import { useAuthStore } from '@/store/authStore'
import {
  calculateAllocationBuckets,
  calculateAutopilotScore,
  calculateSavingsRate,
} from '@/lib/financialCalculations'

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const S = {
  black: '#040c1a', deep: '#081528', panel: '#112240', panel2: '#162a4a',
  cyan: '#38bdf8', teal: '#2dd4bf', brand: '#22d3ee',
  text: '#eef2fc', muted: '#94a8c8', dim: '#526480',
  green: '#34d399', red: '#f87171', amber: '#fbbf24',
  b1: 'rgba(56,189,248,0.15)', b2: 'rgba(56,189,248,0.10)', b3: 'rgba(56,189,248,0.06)',
  grad: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
  gradText: {
    background: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  },
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage,  setActivePage]  = useState('dashboard')
  const { data, loading, fetchFinancialData } = useFinancialStore()
  const { user, signOut } = useAuthStore()
  const router = useRouter()

  useEffect(() => { fetchFinancialData() }, [])

  const riskProfile = (user?.risk_profile as 'conservative' | 'balanced' | 'aggressive') ?? 'balanced'
  const savingsRate = data?.connected ? calculateSavingsRate(data.monthly_income, data.monthly_surplus) : 0

  const autoScores = calculateAutopilotScore({
    hasEmergencyFund:  savingsRate > 15,
    savingsRate,
    creditUtilization: 12,
    hasInvestments:    (data?.net_worth ?? 0) > 0,
    debtToIncomeRatio: data?.connected ? data.monthly_expenses / Math.max(data.monthly_income, 1) : 0.5,
  })

  const flowBuckets = data?.connected ? (() => {
    const b = calculateAllocationBuckets(data.monthly_income, data.monthly_expenses, riskProfile)
    return [
      { label: 'Survival',   ...b.survival,    color: 'linear-gradient(90deg,#c53030,#f87171)' },
      { label: 'Stability',  ...b.stability,   color: 'linear-gradient(90deg,#1d4ed8,#60a5fa)' },
      { label: 'Growth',     ...b.growth,      color: 'linear-gradient(90deg,#2dd4bf,#5eead4)'  },
      { label: 'Leverage',   ...b.leverage,    color: 'linear-gradient(90deg,#38bdf8,#67e8f9)'  },
      { label: 'Opportunity',...b.opportunity, color: 'linear-gradient(90deg,#9333ea,#c084fc)'  },
    ]
  })() : []

  const scores = [
    { label: 'Stability', value: autoScores.stability, color: '#38bdf8', offset: 213.6 * (1 - autoScores.stability / 100) },
    { label: 'Growth',    value: autoScores.growth,    color: '#2dd4bf', offset: 213.6 * (1 - autoScores.growth    / 100) },
    { label: 'Risk',      value: autoScores.risk,      color: '#7dd3fc', offset: 213.6 * (1 - autoScores.risk      / 100) },
    { label: 'Autopilot', value: autoScores.overall,   color: '#34d399', offset: 213.6 * (1 - autoScores.overall   / 100) },
  ]

  const navItems = [
    { icon: 'DB', label: 'Dashboard',    id: 'dashboard'                                              },
    { icon: 'CR', label: 'Control Room', id: 'control',       path: '/dashboard/control'              },
    { icon: 'OP', label: 'Opportunities',id: 'opportunities', path: '/dashboard/opportunities', badge: '3' },
    { icon: 'IN', label: 'Investments',  id: 'investments'                                            },
    { icon: 'BR', label: 'Borrowing',    id: 'borrowing'                                              },
    { icon: 'RS', label: 'Risk Shield',  id: 'risk'                                                   },
  ]

  const settingsItems = [
    { icon: 'AP', label: 'Autopilot Rules',    id: 'autopilot'                              },
    { icon: 'NT', label: 'Notifications',      id: 'notifications'                          },
    { icon: 'ST', label: 'Settings & Billing', id: 'settings', path: '/dashboard/settings' },
  ]

  const handleNav = (item: { id: string; path?: string }) => {
    if (item.path) router.push(item.path)
    else setActivePage(item.id)
    setSidebarOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: S.black, display: 'flex' }}>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}/>
      )}

      {/* Sidebar */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 50, background: '#081528', borderRight: `1px solid ${S.b3}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '22px 22px 18px', fontSize: '1.2rem', fontWeight: 800, borderBottom: `1px solid ${S.b3}`, ...S.gradText }}>FinOrbit</div>

        <div style={{ margin: '8px', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.2)', borderRadius: 8, fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#5eead4' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', flexShrink: 0 }}/>
          Autopilot Active
        </div>

        <div style={{ padding: '16px 12px 6px', fontSize: '0.58rem', fontFamily: 'DM Mono,monospace', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Main</div>
        {navItems.map(item => (
          <button key={item.id} onClick={() => handleNav(item)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', margin: '2px 8px', borderRadius: 8, width: 'calc(100% - 16px)', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: activePage === item.id ? 'rgba(34,211,238,.08)' : 'transparent', color: activePage === item.id ? S.brand : S.muted, border: activePage === item.id ? '1px solid rgba(34,211,238,.12)' : '1px solid transparent' }}>
            <span style={{ width: 20, textAlign: 'center', fontSize: '0.65rem', fontFamily: 'DM Mono,monospace' }}>{item.icon}</span>
            {item.label}
            {item.badge && <span style={{ marginLeft: 'auto', background: S.brand, color: '#020d1a', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 100 }}>{item.badge}</span>}
          </button>
        ))}

        <div style={{ padding: '16px 12px 6px', fontSize: '0.58rem', fontFamily: 'DM Mono,monospace', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Settings</div>
        {settingsItems.map(item => (
          <button key={item.id} onClick={() => handleNav(item)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', margin: '2px 8px', borderRadius: 8, width: 'calc(100% - 16px)', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: 'transparent', color: S.muted, border: '1px solid transparent' }}>
            <span style={{ width: 20, textAlign: 'center', fontSize: '0.65rem', fontFamily: 'DM Mono,monospace' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: `1px solid ${S.b3}` }}>
          <button onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#020d1a', flexShrink: 0 }}>
              {user?.first_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: S.text }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono,monospace', color: '#2dd4bf' }}>{user?.plan === 'pro' ? 'Autopilot Pro' : 'Launch'} · Sign out</div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: `1px solid ${S.b3}`, background: 'rgba(4,12,26,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '0.8rem', color: S.muted }}>Welcome back, {user?.first_name}</div>
            <button onClick={() => router.push('/dashboard/opportunities')}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, background: S.grad, color: '#020d1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              3 Opportunities
            </button>
            <button onClick={handleSignOut}
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: S.panel, color: S.muted, border: `1px solid ${S.b2}`, cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 32px', flex: 1 }}>

          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{ height: 120, background: S.panel, borderRadius: 14, opacity: 0.6 }}/>
              ))
            ) : (
              [
                { label: 'Net Worth',        value: data?.connected ? fmt(data.net_worth)        : '--', color: S.gradText,          accent: S.cyan  },
                { label: 'Monthly Income',   value: data?.connected ? fmt(data.monthly_income)   : '--', color: { color: '#5eead4' }, accent: S.teal  },
                { label: 'Monthly Expenses', value: data?.connected ? fmt(data.monthly_expenses) : '--', color: { color: S.amber },   accent: S.amber },
                { label: 'Monthly Surplus',  value: data?.connected ? fmt(data.monthly_surplus)  : '--', color: { color: S.green },   accent: S.green },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${kpi.accent},transparent)`, opacity: 0.6 }}/>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{kpi.label}</div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 5, ...kpi.color }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.green }}>Live data</div>
                </div>
              ))
            )}
          </div>

          {/* Not connected banner */}
          {!loading && !data?.connected && (
            <div style={{ background: S.panel, border: `1px solid ${S.b1}`, borderRadius: 14, padding: 32, textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>bank</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Connect your bank to see real data</h3>
              <p style={{ fontSize: '0.88rem', color: S.muted, marginBottom: 20 }}>Your dashboard will show live net worth, income, and spending once connected.</p>
              <button onClick={() => router.push('/')}
                style={{ padding: '12px 28px', borderRadius: 8, fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: S.grad, color: '#020d1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Connect Bank
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Capital Flow Map */}
              <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Capital Flow Map - This Month</div>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...Array(4)].map((_, i) => <div key={i} style={{ height: 20, background: S.panel2, borderRadius: 4 }}/>)}
                  </div>
                ) : flowBuckets.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {flowBuckets.map(b => (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, width: 140, flexShrink: 0 }}>{b.label}</div>
                        <div style={{ flex: 1, height: 8, background: S.b3, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 4, background: b.color }}/>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'DM Mono,monospace', width: 90, textAlign: 'right', color: S.muted }}>{fmt(b.amount)} {b.pct}%</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.84rem', color: S.muted }}>Connect your bank to see capital allocation.</p>
                )}
              </div>

              {/* Autopilot Scores */}
              <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Autopilot Scores</div>
                <div style={{ display: 'flex', gap: 14 }}>
                  {scores.map(sc => (
                    <div key={sc.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: 70, height: 70, position: 'relative', margin: '0 auto 8px' }}>
                        <svg viewBox="0 0 80 80" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="7"/>
                          <circle cx="40" cy="40" r="34" fill="none" stroke={sc.color} strokeWidth="7" strokeDasharray="213.6" strokeDashoffset={sc.offset} strokeLinecap="round"/>
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: sc.color }}>{sc.value}</div>
                      </div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>{sc.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Obligations */}
              <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Upcoming Obligations</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { name: 'Mortgage',      date: 'Due Apr 1 - $2,140', ok: true  },
                    { name: 'Utilities',     date: 'Due Apr 5 - $186',   ok: true  },
                    { name: 'Subscriptions', date: 'Due Apr 8 - $94',    ok: false },
                    { name: 'Student Loan',  date: 'Due Apr 15 - $340',  ok: true  },
                  ].map(item => (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#081528', border: `1px solid ${S.b3}`, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '0.66rem', color: S.muted, fontFamily: 'DM Mono,monospace' }}>{item.date}</div>
                      </div>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', padding: '3px 9px', borderRadius: 100, background: item.ok ? 'rgba(52,211,153,.1)' : 'rgba(251,191,36,.1)', color: item.ok ? S.green : S.amber, border: `1px solid ${item.ok ? 'rgba(52,211,153,.2)' : 'rgba(251,191,36,.2)'}` }}>
                        {item.ok ? 'Allocated' : 'Review'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real spending categories */}
              {data?.connected && data.top_categories.length > 0 && (
                <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Top Spending - Last 30 Days</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.top_categories.map((cat, i) => {
                      const colors = [S.cyan, '#2dd4bf', S.amber, '#818cf8', S.red, S.green]
                      const maxAmt = data.top_categories[0].amount
                      return (
                        <div key={cat.name}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
                            <span>{cat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                            <span style={{ fontWeight: 700 }}>{fmt(cat.amount)}</span>
                          </div>
                          <div style={{ height: 6, background: S.b3, borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.round((cat.amount / maxAmt) * 100)}%`, height: '100%', background: colors[i % colors.length], borderRadius: 3 }}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Connected accounts */}
              {data?.connected && data.accounts.length > 0 && (
                <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Connected Accounts</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.accounts.slice(0, 5).map(acc => (
                      <div key={acc.account_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#081528', border: `1px solid ${S.b3}`, borderRadius: 8 }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{acc.name}</div>
                          <div style={{ fontSize: '0.66rem', fontFamily: 'DM Mono,monospace', marginTop: 2, color: S.dim }}>{acc.institution_name}</div>
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: ['credit', 'loan'].includes(acc.type) ? S.red : S.green }}>
                          {fmt(acc.balances.current ?? 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              {data?.connected && data.transactions.length > 0 && (
                <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18 }}>Recent Transactions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {data.transactions.slice(0, 8).map(tx => (
                      <div key={tx.transaction_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.name}</div>
                          <div style={{ fontSize: '0.66rem', fontFamily: 'DM Mono,monospace', color: S.dim, marginTop: 2 }}>{tx.date}</div>
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: tx.amount < 0 ? S.green : S.text, flexShrink: 0 }}>
                          {tx.amount < 0 ? '+' : '-'}{fmt(Math.abs(tx.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Actions Feed */}
              <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI Actions Feed</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.green }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.green }}/>
                    Live
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { icon: 'up', bg: 'rgba(45,212,191,.12)', action: 'Surplus allocated to Growth bucket',      meta: 'Just now',    impact: `+${fmt((data?.monthly_surplus || 0) * 0.5)} deployed`, up: true  },
                    { icon: 'al', bg: 'rgba(34,211,238,.12)', action: 'Upcoming bills detected and reserved',    meta: '2 hours ago', impact: 'Zero late fees guaranteed',                           up: false },
                    { icon: 'op', bg: 'rgba(52,211,153,.12)', action: 'Opportunity identified in your accounts', meta: 'Yesterday',   impact: 'View in Opportunities',                               up: true  },
                    { icon: 'an', bg: 'rgba(251,191,36,.1)',  action: 'Spending pattern analyzed',               meta: '2 days ago',  impact: 'Budget adjusted automatically',                       up: false },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 8px', borderBottom: `1px solid ${S.b3}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontFamily: 'DM Mono,monospace', color: S.muted, flexShrink: 0, background: f.bg }}>{f.icon}</div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2, lineHeight: 1.4 }}>{f.action}</div>
                        <div style={{ fontSize: '0.68rem', color: S.dim, fontFamily: 'DM Mono,monospace' }}>{f.meta}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: 3, color: f.up ? S.green : S.muted }}>{f.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
