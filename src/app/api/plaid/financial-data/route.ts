import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createClient } from '@supabase/supabase-js'
import { withAuth } from '@/lib/apiMiddleware'
import {
  calculateNetWorth,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateMonthlySurplus,
  roundMoney
} from '@/lib/financialCalculations'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, auth) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: connections } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('user_id', auth.userId) // Always explicit user filter

    if (!connections?.length) {
      return NextResponse.json({ connected: false })
    }

    let allAccounts: any[] = []
    let allTransactions: any[] = []
    const warnings: string[] = []

    for (const connection of connections) {
      try {
        const balanceRes = await plaidClient.accountsBalanceGet({
          access_token: connection.plaid_access_token
        })
        allAccounts = [
          ...allAccounts,
          ...balanceRes.data.accounts.map(acc => ({
            ...acc,
            institution_name: connection.institution_name
          }))
        ]

        const start = new Date()
        start.setDate(start.getDate() - 30)

        const txRes = await plaidClient.transactionsGet({
          access_token: connection.plaid_access_token,
          start_date: start.toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0],
        })
        allTransactions = [...allTransactions, ...txRes.data.transactions]
      } catch (err: any) {
        // Never expose raw Plaid errors to client
        console.error(`Plaid error [${connection.institution_name}]:`, err.message)
        warnings.push(`Could not refresh data from ${connection.institution_name}`)
      }
    }

    // Use verified calculation functions — never raw arithmetic in routes
    const netWorth = calculateNetWorth(allAccounts)
    const monthlyIncome = calculateMonthlyIncome(allTransactions)
    const monthlyExpenses = calculateMonthlyExpenses(allTransactions)
    const monthlySurplus = calculateMonthlySurplus(monthlyIncome, monthlyExpenses)

    const categoryTotals: Record<string, number> = {}
    allTransactions
      .filter(t => t.amount > 0)
      .forEach(t => {
        const cat = t.personal_finance_category?.primary || t.category?.[0] || 'Other'
        categoryTotals[cat] = roundMoney((categoryTotals[cat] || 0) + t.amount)
      })

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, amount]) => ({ name, amount }))

    await supabase.from('financial_snapshots').upsert({
      user_id: auth.userId,
      net_worth: netWorth,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      monthly_surplus: monthlySurplus,
      snapshot_date: new Date().toISOString().split('T')[0]
    }, { onConflict: 'user_id,snapshot_date' })

    return NextResponse.json({
      connected: true,
      net_worth: netWorth,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      monthly_surplus: monthlySurplus,
      accounts: allAccounts,
      transactions: allTransactions.slice(0, 50),
      top_categories: topCategories,
      institutions: connections.map(c => c.institution_name),
      ...(warnings.length && { warnings })
    })
  }, { maxRequests: 10, windowMs: 60_000 })
}