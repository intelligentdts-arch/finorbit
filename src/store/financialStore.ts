import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface Account {
  account_id: string
  name: string
  type: string
  subtype: string
  balances: { current: number; available: number | null }
  institution_name: string
}

interface Transaction {
  transaction_id: string
  name: string
  amount: number
  date: string
  category: string[]
  personal_finance_category?: { primary: string; detailed: string }
}

interface FinancialData {
  connected: boolean
  net_worth: number
  monthly_income: number
  monthly_expenses: number
  monthly_surplus: number
  accounts: Account[]
  transactions: Transaction[]
  top_categories: { name: string; amount: number }[]
  institutions: string[]
}

interface FinancialState {
  data: FinancialData | null
  loading: boolean
  error: string | null
  fetchFinancialData: () => Promise<void>
  clearData: () => void
}

export const useFinancialStore = create<FinancialState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchFinancialData: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { set({ loading: false }); return }

      const response = await fetch('/api/plaid/financial-data', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch financial data')

      const data = await response.json()
      set({ data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  clearData: () => set({ data: null, loading: false, error: null })
}))