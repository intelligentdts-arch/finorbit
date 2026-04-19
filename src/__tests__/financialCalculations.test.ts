import {
  roundMoney,
  calculateNetWorth,
  calculateMonthlySurplus,
  calculateSavingsRate,
  calculateAllocationBuckets,
  calculateDebtPayoff,
  projectNetWorth,
  calculateAutopilotScore,
} from '@/lib/financialCalculations'

// ── roundMoney ──────────────────────────────────────────────
describe('roundMoney', () => {
  it('rounds to 2 decimal places', () => {
    expect(roundMoney(1.005)).toBe(1.01)
    expect(roundMoney(1.004)).toBe(1.00)
    expect(roundMoney(10.999)).toBe(11.00)
  })
  it('handles negatives', () => expect(roundMoney(-5.555)).toBe(-5.56))
  it('handles zero',      () => expect(roundMoney(0)).toBe(0))
})

// ── calculateNetWorth ───────────────────────────────────────
describe('calculateNetWorth', () => {
  it('adds depository and investment accounts', () => {
    expect(calculateNetWorth([
      { type: 'depository', balances: { current: 5000 } },
      { type: 'investment', balances: { current: 10000 } },
    ])).toBe(15000)
  })

  it('subtracts credit and loan accounts', () => {
    expect(calculateNetWorth([
      { type: 'depository', balances: { current: 10000 } },
      { type: 'credit',     balances: { current: 2000  } },
      { type: 'loan',       balances: { current: 5000  } },
    ])).toBe(3000)
  })

  it('treats null balances as zero', () => {
    expect(calculateNetWorth([
      { type: 'depository', balances: { current: null } },
    ])).toBe(0)
  })

  it('returns 0 for empty array', () => expect(calculateNetWorth([])).toBe(0))
})

// ── calculateMonthlySurplus ─────────────────────────────────
describe('calculateMonthlySurplus', () => {
  it('returns income minus expenses',   () => expect(calculateMonthlySurplus(5000, 3000)).toBe(2000))
  it('returns negative when in deficit',() => expect(calculateMonthlySurplus(3000, 5000)).toBe(-2000))
  it('returns zero when equal',         () => expect(calculateMonthlySurplus(4000, 4000)).toBe(0))
})

// ── calculateSavingsRate ────────────────────────────────────
describe('calculateSavingsRate', () => {
  it('calculates percentage correctly',     () => expect(calculateSavingsRate(5000, 1000)).toBe(20))
  it('returns 0 when income is 0',          () => expect(calculateSavingsRate(0, 500)).toBe(0))
  it('caps at 100',                         () => expect(calculateSavingsRate(1000, 1500)).toBeLessThanOrEqual(100))
  it('returns 0 for zero surplus',          () => expect(calculateSavingsRate(5000, 0)).toBe(0))
})

// ── calculateAllocationBuckets ──────────────────────────────
describe('calculateAllocationBuckets', () => {
  it('percentages sum to 100 for balanced', () => {
    const b = calculateAllocationBuckets(6000, 3000, 'balanced')
    const total = Object.values(b).reduce((s, v) => s + v.pct, 0)
    expect(total).toBe(100)
  })

  it('conservative has higher stability than aggressive', () => {
    const c = calculateAllocationBuckets(6000, 3000, 'conservative')
    const a = calculateAllocationBuckets(6000, 3000, 'aggressive')
    expect(c.stability.pct).toBeGreaterThan(a.stability.pct)
  })

  it('aggressive has higher growth than conservative', () => {
    const c = calculateAllocationBuckets(6000, 3000, 'conservative')
    const a = calculateAllocationBuckets(6000, 3000, 'aggressive')
    expect(a.growth.pct).toBeGreaterThan(c.growth.pct)
  })

  it('all amounts are non-negative even with deficit', () => {
    const b = calculateAllocationBuckets(2000, 5000, 'balanced')
    Object.values(b).forEach(v => expect(v.amount).toBeGreaterThanOrEqual(0))
  })
})

// ── calculateDebtPayoff ─────────────────────────────────────
describe('calculateDebtPayoff', () => {
  it('returns positive months and interest for standard loan', () => {
    const r = calculateDebtPayoff(10000, 5, 200)
    expect(r.months).toBeGreaterThan(0)
    expect(r.totalInterest).toBeGreaterThan(0)
  })

  it('zero-rate loan: months = ceiling(balance/payment)', () => {
    const r = calculateDebtPayoff(1200, 0, 100)
    expect(r.months).toBe(12)
    expect(r.totalInterest).toBe(0)
  })

  it('returns zeroes for zero balance', () => {
    const r = calculateDebtPayoff(0, 5, 200)
    expect(r.months).toBe(0)
    expect(r.totalInterest).toBe(0)
  })

  it('higher payment = fewer months', () => {
    const slow = calculateDebtPayoff(10000, 5, 150)
    const fast = calculateDebtPayoff(10000, 5, 400)
    expect(fast.months).toBeLessThan(slow.months)
  })
})

// ── projectNetWorth ─────────────────────────────────────────
describe('projectNetWorth', () => {
  it('grows with positive surplus and positive return', () => {
    const projected = projectNetWorth(100_000, 1000, 0.07, 12)
    expect(projected).toBeGreaterThan(100_000)
  })

  it('grows with zero surplus (investment returns only)', () => {
    const projected = projectNetWorth(100_000, 0, 0.07, 12)
    expect(projected).toBeGreaterThan(100_000)
  })

  it('projects correctly for 0 months', () => {
    expect(projectNetWorth(100_000, 1000, 0.07, 0)).toBe(100_000)
  })
})

// ── calculateAutopilotScore ─────────────────────────────────
describe('calculateAutopilotScore', () => {
  const goodParams = {
    hasEmergencyFund: true, savingsRate: 25,
    creditUtilization: 5, hasInvestments: true, debtToIncomeRatio: 0.2,
  }
  const poorParams = {
    hasEmergencyFund: false, savingsRate: 2,
    creditUtilization: 80, hasInvestments: false, debtToIncomeRatio: 0.8,
  }

  it('returns scores between 0 and 100', () => {
    const s = calculateAutopilotScore(goodParams)
    expect(s.overall).toBeGreaterThanOrEqual(0)
    expect(s.overall).toBeLessThanOrEqual(100)
    expect(s.stability).toBeGreaterThanOrEqual(0)
    expect(s.growth).toBeGreaterThanOrEqual(0)
    expect(s.risk).toBeGreaterThanOrEqual(0)
  })

  it('good financial health scores higher overall', () => {
    const good = calculateAutopilotScore(goodParams)
    const poor = calculateAutopilotScore(poorParams)
    expect(good.overall).toBeGreaterThan(poor.overall)
  })

  it('emergency fund improves stability score', () => {
    const with_ef    = calculateAutopilotScore({ ...poorParams, hasEmergencyFund: true })
    const without_ef = calculateAutopilotScore({ ...poorParams, hasEmergencyFund: false })
    expect(with_ef.stability).toBeGreaterThan(without_ef.stability)
  })

  it('low credit utilization improves risk score', () => {
    const low  = calculateAutopilotScore({ ...poorParams, creditUtilization: 5 })
    const high = calculateAutopilotScore({ ...poorParams, creditUtilization: 80 })
    expect(low.risk).toBeGreaterThan(high.risk)
  })
})