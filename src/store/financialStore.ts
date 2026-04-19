import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface Account {
  account_id:       string
  name:             string
  type:             string
  subtype:          string
  balances:         { current: number | null; available: number | null }
  institution_name: string
}

export interface Transaction {
  transaction_id:             string
  name:                       string
  amount:                     number
  date:                       string
  category:                   string[]
  personal_finance_category?: { primary: string; detailed: string }
}

export interface FinancialData {
  connected:        boolean
  net_worth:        number
  monthly_income:   number
  monthly_expenses: number
  monthly_surplus:  number
  accounts:         Account[]
  transactions:     Transaction[]
  top_categories:   { name: string; amount: number }[]
  institutions:     string[]
  warnings?:        string[]
}

interface FinancialState {
  data:               FinancialData | null
  loading:            boolean
  error:              string | null
  fetchFinancialData: () => Promise<void>
  clearData:          () => void
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  data:    null,
  loading: false,
  error:   null,
  fetchFinancialData: async () => {
    if (!get().data) set({ loading: true })
    set({ error: null })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { set({ loading: false }); return }
      const res = await fetch('/api/plaid/financial-data', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.status === 401) { set({ loading: false, error: 'Session expired. Please sign in again.' }); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: FinancialData = await res.json()
      set({ data, loading: false, error: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: `Could not refresh data: ${message}` })
    }
  },
  clearData: () => set({ data: null, loading: false, error: null }),
}))
