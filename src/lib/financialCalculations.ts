export const roundMoney = (n: number): number => {
  return parseFloat(n.toFixed(2))
}

export const formatCurrency = (amount: number, opts: { decimals?: boolean; compact?: boolean } = {}): string => {
  if (opts.compact && Math.abs(amount) >= 1_000_000) return `$${(amount/1_000_000).toFixed(1)}M`
  if (opts.compact && Math.abs(amount) >= 1_000)     return `$${(amount/1_000).toFixed(1)}K`
  return new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD', minimumFractionDigits: opts.decimals?2:0, maximumFractionDigits: opts.decimals?2:0 }).format(amount)
}

export const calculateNetWorth = (accounts: Array<{ type: string; balances: { current: number | null } }>): number =>
  roundMoney(accounts.reduce((total, acc) => {
    const bal = acc.balances.current ?? 0
    if (['depository','investment'].includes(acc.type)) return total + bal
    if (['credit','loan'].includes(acc.type))           return total - bal
    return total
  }, 0))

export const calculateMonthlyIncome = (transactions: Array<{ amount: number; date: string }>): number => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
  return roundMoney(transactions.filter(t => t.amount < 0 && new Date(t.date) >= cutoff).reduce((sum,t) => sum + Math.abs(t.amount), 0))
}

export const calculateMonthlyExpenses = (transactions: Array<{ amount: number; date: string }>): number => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
  return roundMoney(transactions.filter(t => t.amount > 0 && new Date(t.date) >= cutoff).reduce((sum,t) => sum + t.amount, 0))
}

export const calculateMonthlySurplus = (income: number, expenses: number): number => roundMoney(income - expenses)

export const calculateSavingsRate = (income: number, surplus: number): number => {
  if (income <= 0) return 0
  return Math.min(100, Math.round((surplus / income) * 100))
}

export const calculateAllocationBuckets = (monthlyIncome: number, monthlyExpenses: number, risk: 'conservative' | 'balanced' | 'aggressive') => {
  const surplus  = Math.max(0, calculateMonthlySurplus(monthlyIncome, monthlyExpenses))
  const profiles = {
    conservative: { survival:.40, stability:.30, growth:.20, leverage:.05, opportunity:.05 },
    balanced:     { survival:.30, stability:.20, growth:.30, leverage:.12, opportunity:.08 },
    aggressive:   { survival:.25, stability:.10, growth:.40, leverage:.15, opportunity:.10 },
  }
  const p = profiles[risk]
  return {
    survival:    { amount: roundMoney(monthlyIncome * p.survival),    pct: Math.round(p.survival    * 100) },
    stability:   { amount: roundMoney(surplus       * p.stability),   pct: Math.round(p.stability   * 100) },
    growth:      { amount: roundMoney(surplus       * p.growth),      pct: Math.round(p.growth      * 100) },
    leverage:    { amount: roundMoney(surplus       * p.leverage),    pct: Math.round(p.leverage    * 100) },
    opportunity: { amount: roundMoney(surplus       * p.opportunity), pct: Math.round(p.opportunity * 100) },
  }
}

export const calculateDebtPayoff = (balance: number, annualRate: number, monthlyPayment: number): { months: number; totalInterest: number } => {
  if (balance <= 0 || monthlyPayment <= 0) return { months: 0, totalInterest: 0 }
  const r = annualRate / 100 / 12
  if (r === 0) return { months: Math.ceil(balance / monthlyPayment), totalInterest: 0 }
  const months        = Math.ceil(-Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r))
  const totalInterest = roundMoney(Math.max(0, months * monthlyPayment - balance))
  return { months, totalInterest }
}

export const projectNetWorth = (currentNetWorth: number, monthlySurplus: number, annualReturn = 0.07, months = 12): number => {
  const r = annualReturn / 12
  let projected = currentNetWorth
  for (let i = 0; i < months; i++) projected = projected * (1 + r) + monthlySurplus
  return roundMoney(projected)
}

export const calculateAutopilotScore = (params: { hasEmergencyFund: boolean; savingsRate: number; creditUtilization: number; hasInvestments: boolean; debtToIncomeRatio: number }): { overall: number; stability: number; growth: number; risk: number } => {
  const stability = Math.min(100, Math.round((params.hasEmergencyFund?40:0) + Math.min(30, params.savingsRate*1.5) + (params.creditUtilization<30?30:params.creditUtilization<50?15:0)))
  const growth    = Math.min(100, Math.round((params.hasInvestments?40:0) + Math.min(40, params.savingsRate*2) + (params.savingsRate>20?20:params.savingsRate>10?10:0)))
  const risk      = Math.min(100, Math.round((params.debtToIncomeRatio<0.36?50:params.debtToIncomeRatio<0.5?25:0) + (params.creditUtilization<10?30:params.creditUtilization<30?20:10) + (params.hasEmergencyFund?20:0)))
  const overall   = Math.round((stability + growth + risk) / 3)
  return { overall, stability, growth, risk }
}
