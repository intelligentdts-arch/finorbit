import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface Account {
  account_id: string
  name: string
  type: string
  institution_name: string
  balances: { current: number }
}

interface Category {
  name: string
  amount: number
}

interface FinancialData {
  connected: boolean
  net_worth: number
  monthly_income: number
  monthly_expenses: number
  monthly_surplus: number
  institutions: string[]
  accounts: Account[]
  top_categories: Category[]
}

interface FinancialState {
  data: FinancialData | null
  loading: boolean
  error: string | null
  fetchFinancialData: () => Promise<void>
  clearData: () => void
}

export const useFinancialStore = create(
  persist<FinancialState>(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,
      fetchFinancialData: async () => {
        if (get().data) set({ loading: false })
        else set({ loading: true })
        set({ error: null })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) { set({ loading: false }); return }
          const res = await fetch('/api/plaid/financial-data', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (res.status === 401) {
            set({ loading: false, error: 'Session expired. Please sign in again.' })
            return
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          set({ data, loading: false, error: null })
        } catch (err: unknown) {
          set({ loading: false, error: 'Could not refresh data. Showing last known values.' })
        }
      },
      clearData: () => set({ data: null, loading: false, error: null }),
    }),
    {
      name: 'finorbit-financial-data',
      partialize: (state) => ({
        data: state.data ? {
          connected: state.data.connected,
          net_worth: state.data.net_worth,
          monthly_income: state.data.monthly_income,
          monthly_expenses: state.data.monthly_expenses,
          monthly_surplus: state.data.monthly_surplus,
          institutions: state.data.institutions,
        } : null
      } as any),
    }
  )
)