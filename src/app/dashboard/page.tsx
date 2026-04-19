'use client'

import { useState, useEffect } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useAuthStore } from '@/store/authStore'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import KpiCard from '@/components/dashboard/KpiCard'

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data, loading, fetchFinancialData } = useFinancialStore()
  const { user } = useAuthStore()

  useEffect(() => { fetchFinancialData() }, [])

  const scores = [
    { label: 'Stability', value: 83, color: '#38bdf8', offset: 36 },
    { label: 'Growth', value: 90, color: '#2dd4bf', offset: 21 },
    { label: 'Risk', value: 76, color: '#7dd3fc', offset: 51 },
    { label: 'Autopilot', value: 97, color: '#34d399', offset: 6 },
  ]

  const flowBuckets = data ? [
    { label: '🔴 Survival', pct: 30, amt: Math.round(data.monthly_expenses * 0.65), color: 'linear-gradient(90deg,#c53030,#f87171)' },
    { label: '🔵 Stability', pct: 20, amt: Math.round(data.monthly_surplus * 0.3), color: 'linear-gradient(90deg,#1d4ed8,#60a5fa)' },
    { label: '🟢 Growth', pct: 30, amt: Math.round(data.monthly_surplus * 0.5), color: 'linear-gradient(90deg,#2dd4bf,#5eead4)' },
    { label: '✦ Opportunity', pct: 20, amt: Math.round(data.monthly_surplus * 0.2), color: 'linear-gradient(90deg,#38bdf8,#67e8f9)' },
  ] : []

  return (
    <div className="min-h-screen" style={{ background: '#040c1a' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60">
        <Topbar title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-6 space-y-6">

          {/* KPI Row */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse"
                  style={{ background: '#112240' }}/>
              ))}
            </div>
          ) : data?.connected ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Net Worth" value={fmt(data.net_worth)} change={`${fmt(data.monthly_surplus)} this month`} accent="cyan"/>
              <KpiCard label="Monthly Income" value={fmt(data.monthly_income)} change="from connected accounts" accent="teal"/>
              <KpiCard label="Monthly Expenses" value={fmt(data.monthly_expenses)} change="last 30 days" changeUp={false} accent="amber"/>
              <KpiCard label="Monthly Surplus" value={fmt(data.monthly_surplus)} change="available to deploy" accent="green"/>
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center"
              style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.15)' }}>
              <div className="text-3xl mb-3">🏦</div>
              <h3 className="text-lg font-bold mb-2">Connect your bank to see real data</h3>
              <p className="text-sm mb-4" style={{ color: '#94a8c8' }}>
                Your dashboard will show live net worth, income, and spending once connected.
              </p>
              <button onClick={() => window.location.href = '/'}
                className="px-6 py-3 rounded-lg font-extrabold text-sm uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
                Connect Bank →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Capital Flow Map */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                  Capital Flow Map — This Month
                </div>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-6 rounded animate-pulse" style={{ background: '#081528' }}/>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flowBuckets.map(bucket => (
                      <div key={bucket.label} className="flex items-center gap-4">
                        <div className="text-sm font-semibold w-36 flex-shrink-0">{bucket.label}</div>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(56,189,248,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${bucket.pct}%`, background: bucket.color }}/>
                        </div>
                        <div className="text-xs font-mono w-28 text-right" style={{ color: '#94a8c8' }}>
                          {fmt(bucket.amt)} · {bucket.pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Autopilot Scores */}
              <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                  Autopilot Scores
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {scores.map(score => (
                    <div key={score.label} className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-3">
                        <svg viewBox="0 0 80 80" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
                          <circle cx="40" cy="40" r="34" fill="none" stroke={score.color} strokeWidth="7"
                            strokeDasharray="213.6" strokeDashoffset={score.offset} strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-extrabold text-sm"
                          style={{ color: score.color }}>
                          {score.value}
                        </div>
                      </div>
                      <div className="text-xs font-bold">{score.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Spending Categories */}
              {data?.connected && data.top_categories.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                    Top Spending Categories — Last 30 Days
                  </div>
                  <div className="space-y-4">
                    {data.top_categories.map((cat, i) => {
                      const maxAmt = data.top_categories[0].amount
                      const pct = Math.round((cat.amount / maxAmt) * 100)
                      const colors = ['#38bdf8', '#2dd4bf', '#fbbf24', '#818cf8', '#f87171', '#34d399']
                      return (
                        <div key={cat.name}>
                          <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: '#eef2fc' }}>{cat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                            <span className="font-bold">{fmt(cat.amount)}</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(56,189,248,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i % colors.length] }}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right column — AI Feed + Accounts */}
            <div className="space-y-6">
              {/* Connected Accounts */}
              {data?.connected && data.accounts.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    Connected Accounts
                  </div>
                  <div className="space-y-3">
                    {data.accounts.slice(0, 5).map(acc => (
                      <div key={acc.account_id} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.06)' }}>
                        <div>
                          <div className="text-sm font-semibold">{acc.name}</div>
                          <div className="text-xs font-mono mt-0.5" style={{ color: '#526480' }}>
                            {acc.institution_name} · {acc.subtype}
                          </div>
                        </div>
                        <div className="text-sm font-extrabold"
                          style={{ color: acc.type === 'credit' || acc.type === 'loan' ? '#f87171' : '#34d399' }}>
                          {acc.type === 'credit' || acc.type === 'loan' ? '-' : ''}{fmt(acc.balances.current)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              {data?.connected && data.transactions.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    Recent Transactions
                  </div>
                  <div className="space-y-3">
                    {data.transactions.slice(0, 8).map(tx => (
                      <div key={tx.transaction_id} className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-4">
                          <div className="text-sm font-semibold truncate">{tx.name}</div>
                          <div className="text-xs font-mono mt-0.5" style={{ color: '#526480' }}>
                            {tx.date} · {tx.personal_finance_category?.primary?.replace(/_/g, ' ') || tx.category?.[0] || 'Other'}
                          </div>
                        </div>
                        <div className="text-sm font-bold flex-shrink-0"
                          style={{ color: tx.amount < 0 ? '#34d399' : '#eef2fc' }}>
                          {tx.amount < 0 ? '+' : '-'}{fmt(Math.abs(tx.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feed */}
              <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>
                    AI Actions Feed
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#34d399' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                    Live
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: '📈', bg: 'rgba(45,212,191,0.1)', action: 'Monthly surplus allocated to Growth bucket', meta: 'Just now', impact: `+${fmt((data?.monthly_surplus || 0) * 0.5)} deployed`, up: true },
                    { icon: '⚡', bg: 'rgba(34,211,238,0.1)', action: 'Upcoming bills detected and reserved', meta: '2 hours ago', impact: 'Zero late fees guaranteed', up: false },
                    { icon: '🎯', bg: 'rgba(52,211,153,0.1)', action: 'Opportunity identified in your accounts', meta: 'Yesterday', impact: 'View in Opportunities →', up: true },
                    { icon: '🛡️', bg: 'rgba(251,191,36,0.1)', action: 'Spending pattern analyzed', meta: '2 days ago', impact: 'Budget adjusted automatically', up: false },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: item.bg }}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-snug">{item.action}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: '#526480' }}>{item.meta}</div>
                        <div className="text-xs mt-1" style={{ color: item.up ? '#34d399' : '#94a8c8' }}>
                          {item.impact}
                        </div>
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