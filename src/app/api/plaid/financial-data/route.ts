import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get all bank connections for this user
    const { data: connections } = await supabase
      .from('bank_connections')
      .select('*')
      .eq('user_id', user.id)

    if (!connections || connections.length === 0) {
      return NextResponse.json({ connected: false })
    }

    let totalBalance = 0
    let allAccounts: any[] = []
    let allTransactions: any[] = []

    // Fetch data from each connected bank
    for (const connection of connections) {
      try {
        // Get account balances
        const balanceResponse = await plaidClient.accountsBalanceGet({
          access_token: connection.plaid_access_token
        })

        const accounts = balanceResponse.data.accounts
        allAccounts = [...allAccounts, ...accounts.map(acc => ({
          ...acc,
          institution_name: connection.institution_name
        }))]

        // Add up balances (depository accounts positive, credit negative)
        accounts.forEach(acc => {
          if (['depository', 'investment'].includes(acc.type)) {
            totalBalance += acc.balances.current || 0
          } else if (acc.type === 'credit' || acc.type === 'loan') {
            totalBalance -= acc.balances.current || 0
          }
        })

        // Get recent transactions (last 30 days)
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        const endDate = new Date()

        const transactionResponse = await plaidClient.transactionsGet({
          access_token: connection.plaid_access_token,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        })

        allTransactions = [...allTransactions, ...transactionResponse.data.transactions]
      } catch (connError) {
        console.error(`Error fetching data for connection ${connection.id}:`, connError)
      }
    }

    // Calculate monthly income and expenses from transactions
    const income = allTransactions
      .filter(t => t.amount < 0) // Plaid uses negative for money coming in
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const expenses = allTransactions
      .filter(t => t.amount > 0) // Positive = money going out
      .reduce((sum, t) => sum + t.amount, 0)

    // Group spending by category
    const categoryTotals: Record<string, number> = {}
    allTransactions
      .filter(t => t.amount > 0)
      .forEach(t => {
        const category = t.personal_finance_category?.primary || t.category?.[0] || 'Other'
        categoryTotals[category] = (categoryTotals[category] || 0) + t.amount
      })

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, amount]) => ({ name, amount: Math.round(amount) }))

    // Save snapshot to database
    await supabase.from('financial_snapshots').upsert({
      user_id: user.id,
      net_worth: Math.round(totalBalance),
      monthly_income: Math.round(income),
      monthly_expenses: Math.round(expenses),
      monthly_surplus: Math.round(income - expenses),
      snapshot_date: new Date().toISOString().split('T')[0]
    }, { onConflict: 'user_id,snapshot_date' })

    return NextResponse.json({
      connected: true,
      net_worth: Math.round(totalBalance),
      monthly_income: Math.round(income),
      monthly_expenses: Math.round(expenses),
      monthly_surplus: Math.round(income - expenses),
      accounts: allAccounts,
      transactions: allTransactions.slice(0, 50),
      top_categories: topCategories,
      institutions: connections.map(c => c.institution_name)
    })
  } catch (error: any) {
    console.error('Financial data error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}