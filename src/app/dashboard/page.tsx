'use client'

import { useAuthStore } from '@/store/authStore'
import { useFinancialStore } from '@/store/financialStore'
import {
  calculateAllocationBuckets,
  calculateAutopilotScore,
  calculateSavingsRate,
  formatCurrency,
  projectNetWorth,
} from '@/lib/financialCalculations'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data } = useFinancialStore()

  const riskProfile =
    (user?.risk_profile as 'conservative' | 'balanced' | 'aggressive') ?? 'balanced'

  const flowBuckets = data?.connected
    ? (() => {
        const b = calculateAllocationBuckets(
          data.monthly_income,
          data.monthly_expenses,
          riskProfile
        )
        return [
          { label: 'Survival',    ...b.survival,    color: 'linear-gradient(90deg,#c53030,#f87171)' },
          { label: 'Stability',   ...b.stability,   color: 'linear-gradient(90deg,#1d4ed8,#60a5fa)' },
          { label: 'Growth',      ...b.growth,      color: 'linear-gradient(90deg,#2dd4bf,#5eead4)' },
          { label: 'Leverage',    ...b.leverage,    color: 'linear-gradient(90deg,#38bdf8,#67e8f9)' },
          { label: 'Opportunity', ...b.opportunity, color: 'linear-gradient(90deg,#9333ea,#c084fc)' },
        ]
      })()
    : []

  const savingsRate = data?.connected
    ? calculateSavingsRate(data.monthly_income, data.monthly_surplus)
    : 0

  const autoScores = calculateAutopilotScore({
    hasEmergencyFund: savingsRate > 15,
    savingsRate,
    creditUtilization: 12,
    hasInvestments: (data?.net_worth ?? 0) > 0,
    debtToIncomeRatio: data?.connected
      ? data.monthly_expenses / Math.max(data.monthly_income, 1)
      : 0.5,
  })

  const scores = [
    { label: 'Stability', value: autoScores.stability, color: '#38bdf8', offset: 213.6 * (1 - autoScores.stability / 100) },
    { label: 'Growth',    value: autoScores.growth,    color: '#2dd4bf', offset: 213.6 * (1 - autoScores.growth    / 100) },
    { label: 'Risk',      value: autoScores.risk,      color: '#7dd3fc', offset: 213.6 * (1 - autoScores.risk      / 100) },
    { label: 'Autopilot', value: autoScores.overall,   color: '#34d399', offset: 213.6 * (1 - autoScores.overall   / 100) },
  ]

  const projections = data?.connected
    ? projectNetWorth(data.net_worth, data.monthly_surplus, savingsRate)
    : null

  return (
    <div className="p-6 space-y-6" style={{ color: '#eef2fc' }}>
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm" style={{ color: '#94a8c8' }}>
          Welcome back, {user?.first_name || 'there'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Net Worth',       value: formatCurrency(data?.net_worth ?? 0) },
          { label: 'Monthly Income',  value: formatCurrency(data?.monthly_income ?? 0) },
          { label: 'Monthly Surplus', value: formatCurrency(data?.monthly_surplus ?? 0) },
          { label: 'Savings Rate',    value: `${savingsRate.toFixed(1)}%` },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4"
            style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: '#94a8c8' }}>{stat.label}</div>
            <div className="text-xl font-extrabold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Autopilot Scores */}
      <div className="rounded-xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
        <h2 className="text-sm font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>Autopilot Score</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {scores.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: '#94a8c8' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Buckets */}
      {flowBuckets.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
          <h2 className="text-sm font-mono uppercase tracking-widest mb-4" style={{ color: '#94a8c8' }}>Money Flow</h2>
          <div className="space-y-3">
            {flowBuckets.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{b.label}</span>
                  <span style={{ color: '#94a8c8' }}>{formatCurrency(b.amount)} ({b.pct}%)</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not connected state */}
      {!data?.connected && (
        <div className="rounded-xl p-8 text-center" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
          <div className="text-lg font-bold mb-2">Connect your bank to get started</div>
          <p className="text-sm mb-4" style={{ color: '#94a8c8' }}>Link your accounts to see your full financial picture.</p>
          <button className="px-6 py-2 rounded-lg text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
            Connect Bank
          </button>
        </div>
      )}
    </div>
  )
}
