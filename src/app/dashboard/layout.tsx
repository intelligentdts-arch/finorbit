'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useFinancialStore } from '@/store/financialStore'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuthStore()
  const { fetchFinancialData } = useFinancialStore()

  useEffect(() => {
    refreshUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return }
      if (!user.onboarding_complete) { router.push('/'); return }
      fetchFinancialData()
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#040c1a' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: '#22d3ee' }}/>
      </div>
    )
  }

  return <>{children}</>
}