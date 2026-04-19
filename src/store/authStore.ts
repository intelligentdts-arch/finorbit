import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  first_name: string
  last_name?: string
  plan: string
  onboarding_complete: boolean
  risk_profile: string
}

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  refreshUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ user: null, loading: false }); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      set({
        user: {
          id: user.id,
          email: user.email!,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          plan: profile.plan || 'free',
          onboarding_complete: profile.onboarding_complete || false,
          risk_profile: profile.risk_profile || 'balanced',
        },
        loading: false
      })
    } else {
      set({ loading: false })
    }
  }
}))