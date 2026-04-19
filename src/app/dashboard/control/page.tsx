'use client'

import { useState } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

const fmt = (n: number) => new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0
}).format(n)

type Tab = 'cashflow' | 'investments' | 'borrowing'

export default function ControlRoomPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('cashflow')
  const { data } = useFinancialStore()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'investments', label: 'Investments' },
    { id: 'borrowing', label: 'Borrowing' },
  ]

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar ▶']
  const incomeHeights = [112, 108, 128, 116, 120, 140]
  const expenseHeights = [88, 92, 104, 86, 90, 94]

  const assets = [
    { icon: '📈', name: 'US Equities', value: 48200, change: '+11.4% YTD', up: true },
    { icon: '🌍', name: 'Intl Equities', value: 12400, change: '+6.2% YTD', up: true },
    { icon: '🏠', name: 'Real Estate (REITs)', value: 8900, change: '+4.8% YTD', up: true },
    { icon: '🔒', name: 'Bonds / Fixed', value: 18600, change: '+1.9% YTD', up: true },
    { icon: '⚡', name: 'Crypto', value: 3200, change: '+34% YTD', up: true },
    { icon: '💵', name: 'Cash / HYSA', value: 14800, change: '5.1% APY', up: true },
  ]

  const debts = [
    { name: 'Mortgage', rate: '6.2% APR', remaining: 312000, original: 400000, tag: 'Optimal', tagColor: '#34d399' },
    { name: 'Auto Loan', rate: '5.4% APR · refinance available', remaining: 18400, original: 24000, tag: 'Refinance →', tagColor: '#22d3ee' },
    { name: 'Student Loan', rate: '4.1% APR', remaining: 22100, original: 48000, tag: 'Optimal', tagColor: '#34d399' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#040c1a' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60">
        <Topbar title="Control Room" onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit"
            style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.06)' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={activeTab === tab.id
                  ? { background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }
                  : { color: '#94a8c8', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* CASH FLOW TAB */}
          {activeTab === 'cashflow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    6-Month Income vs Expenses
                  </div>
                  <div className="flex gap-4 mb-4">
                    {[{ color: '#2dd4bf', label: 'Income' }, { color: '#f87171', label: 'Expenses' }].map(l => (
                      <div key={l.label} className="flex items-center gap-2 text-xs" style={{ color: '#94a8c8' }}>
                        <div className="w-3 h-3 rounded-sm" style={{ background: l.color }}/>
                        {l.label}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {months.map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end">
                          <div className="flex-1 rounded-sm rounded-b-none transition-all"
                            style={{ height: incomeHeights[i], background: 'linear-gradient(180deg,#2dd4bf,rgba(45,212,191,0.4))' }}/>
                          <div className="flex-1 rounded-sm rounded-b-none"
                            style={{ height: expenseHeights[i], background: 'linear-gradient(180deg,rgba(248,113,113,0.8),rgba(248,113,113,0.3))' }}/>
                        </div>
                        <div className="text-xs font-mono" style={{ color: '#526480' }}>{month}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Forecast */}
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    AI Cash Flow Forecast
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'THIS MONTH', color: '#34d399', bg: 'rgba(52,211,153,0.07)', border: 'rgba(52,211,153,0.2)',
                        title: data?.connected ? `${fmt(data.monthly_surplus)} surplus predicted` : 'Connect bank for forecast',
                        desc: 'AI will deploy to Growth + Opportunity buckets' },
                      { label: 'WATCH', color: '#fbbf24', bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)',
                        title: 'Review upcoming large expenses',
                        desc: 'AI is building reserve automatically' },
                      { label: 'Q2 PROJECTION', color: '#22d3ee', bg: 'rgba(34,211,238,0.06)', border: 'rgba(56,189,248,0.1)',
                        title: data?.connected ? `Net worth → ${fmt((data.net_worth || 0) * 1.047)}` : 'Connect bank for projection',
                        desc: 'Based on current trajectory +4.7%' },
                    ].map(item => (
                      <div key={item.label} className="p-4 rounded-xl"
                        style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                        <div className="text-xs font-mono mb-1" style={{ color: item.color }}>{item.label}</div>
                        <div className="text-base font-bold mb-1">{item.title}</div>
                        <div className="text-xs" style={{ color: '#94a8c8' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real spending categories */}
              {data?.connected && data.top_categories.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                    <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                      Real Spending — From Your Accounts
                    </div>
                    <div className="space-y-4">
                      {data.top_categories.map((cat, i) => {
                        const max = data.top_categories[0].amount
                        const colors = ['#38bdf8', '#2dd4bf', '#fbbf24', '#818cf8', '#f87171', '#34d399']
                        return (
                          <div key={cat.name}>
                            <div className="flex justify-between text-sm mb-1.5">
                              <span>{cat.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                              <span className="font-bold">{fmt(cat.amount)}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(56,189,248,0.06)' }}>
                              <div className="h-full rounded-full"
                                style={{ width: `${Math.round((cat.amount / max) * 100)}%`, background: colors[i % colors.length] }}/>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                    <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                      Income Sources
                    </div>
                    <div className="space-y-3">
                      {data.accounts
                        .filter(acc => acc.type === 'depository')
                        .slice(0, 3)
                        .map(acc => (
                          <div key={acc.account_id} className="flex items-center justify-between p-3 rounded-lg"
                            style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.06)' }}>
                            <div>
                              <div className="text-sm font-semibold">{acc.name}</div>
                              <div className="text-xs font-mono mt-0.5" style={{ color: '#526480' }}>
                                {acc.institution_name}
                              </div>
                            </div>
                            <div className="font-extrabold" style={{ color: '#5eead4' }}>
                              {fmt(acc.balances.current)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVESTMENTS TAB */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                {assets.map(asset => (
                  <div key={asset.name} className="rounded-xl p-5"
                    style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                    <div className="text-2xl mb-3">{asset.icon}</div>
                    <div className="text-sm font-bold mb-1">{asset.name}</div>
                    <div className="text-xl font-extrabold mb-1" style={{ letterSpacing: '-0.02em' }}>
                      {fmt(asset.value)}
                    </div>
                    <div className="text-xs font-mono" style={{ color: asset.up ? '#34d399' : '#f87171' }}>
                      {asset.up ? '↑' : '↓'} {asset.change}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                    AI Portfolio Actions
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: '🔄', bg: 'rgba(56,189,248,0.06)', title: 'Rebalancing scheduled', desc: 'Equities overweight by 3% → auto-rebalance next week' },
                      { icon: '📉', bg: 'rgba(52,211,153,0.06)', title: 'Tax-loss harvesting opportunity detected', desc: 'Could save estimated $200–400 this tax year', titleColor: '#34d399' },
                      { icon: '💰', bg: 'rgba(34,211,238,0.05)', title: 'DCA automation active', desc: 'Monthly auto-investment into index funds running' },
                    ].map((action, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg"
                        style={{ background: action.bg, border: '1px solid rgba(56,189,248,0.06)' }}>
                        <span className="text-base flex-shrink-0">{action.icon}</span>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: action.titleColor || '#eef2fc' }}>
                            {action.title}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#94a8c8' }}>{action.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    Total Portfolio Value
                  </div>
                  <div className="text-4xl font-extrabold mb-2"
                    style={{ letterSpacing: '-0.04em', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {fmt(assets.reduce((s, a) => s + a.value, 0))}
                  </div>
                  <div className="text-sm mb-5" style={{ color: '#94a8c8' }}>Across all asset classes</div>
                  <div className="space-y-2">
                    {[
                      { label: 'YTD Return', value: '+9.8%', color: '#34d399' },
                      { label: 'vs S&P 500', value: '+1.4% outperforming', color: '#34d399' },
                      { label: 'Next rebalance', value: 'In 7 days', color: '#eef2fc' },
                      { label: 'Next DCA', value: '1st of month', color: '#eef2fc' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span style={{ color: '#94a8c8' }}>{row.label}</span>
                        <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BORROWING TAB */}
          {activeTab === 'borrowing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    AI Borrowing Recommendation
                  </div>
                  <div className="p-4 rounded-xl mb-4"
                    style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(56,189,248,0.1)' }}>
                    <div className="text-xs font-mono mb-2" style={{ color: '#22d3ee' }}>ACTIVE OPPORTUNITY</div>
                    <div className="text-base font-bold mb-2">Refinance auto loan — potential savings available</div>
                    <div className="text-sm mb-3" style={{ color: '#94a8c8' }}>
                      Based on current rates and your credit profile, refinancing your auto loan could meaningfully reduce your monthly payment and total interest paid.
                    </div>
                    <button className="px-4 py-2 rounded-lg text-sm font-extrabold uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', border: 'none', cursor: 'pointer' }}>
                      Explore Refinancing →
                    </button>
                  </div>
                  <div className="text-xs font-mono" style={{ color: '#526480' }}>
                    AI checks refinancing opportunities weekly based on rate movements.
                  </div>
                </div>

                <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                  <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>
                    Credit Utilization
                  </div>
                  <div className="text-4xl font-extrabold mb-1" style={{ color: '#34d399' }}>12%</div>
                  <div className="text-sm mb-4" style={{ color: '#94a8c8' }}>Well within optimal 30% threshold</div>
                  <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(56,189,248,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: '12%', background: 'linear-gradient(90deg,#34d399,#2dd4bf)' }}/>
                  </div>
                  {[
                    { label: 'Available credit', value: '$21,400' },
                    { label: 'Used credit', value: '$2,900' },
                    { label: 'Credit score range', value: '740–760' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm py-1">
                      <span style={{ color: '#94a8c8' }}>{row.label}</span>
                      <span className="font-bold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
                  Active Debt Stack
                </div>
                <div className="space-y-4">
                  {debts.map(debt => {
                    const pct = Math.round((debt.remaining / debt.original) * 100)
                    return (
                      <div key={debt.name} className="p-4 rounded-xl"
                        style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.06)' }}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-bold">{debt.name}</div>
                            <div className="text-xs font-mono mt-0.5" style={{ color: '#526480' }}>{debt.rate}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono px-2 py-1 rounded-full"
                              style={{ background: 'rgba(56,189,248,0.06)', color: debt.tagColor, border: `1px solid ${debt.tagColor}30` }}>
                              {debt.tag}
                            </span>
                            <span className="text-lg font-extrabold">{fmt(debt.remaining)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(56,189,248,0.06)' }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#38bdf8,#2dd4bf)' }}/>
                        </div>
                        <div className="flex justify-between text-xs font-mono" style={{ color: '#526480' }}>
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