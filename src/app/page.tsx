'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/auth/AuthModal'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signup')
  const { user, loading, refreshUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    refreshUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  // Route to dashboard once onboarding complete
  useEffect(() => {
    if (user?.onboarding_complete) router.push('/dashboard')
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#040c1a' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: '#22d3ee' }}/>
      </div>
    )
  }

  if (user && !user.onboarding_complete) {
    return <OnboardingFlow onComplete={refreshUser} />
  }

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: '#040c1a' }}>
        <div className="text-5xl font-extrabold mb-4"
          style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>
        <p className="text-lg mb-8 max-w-md" style={{ color: '#94a8c8' }}>
          Your Autonomous Financial Operating System. AI that manages every dollar — automatically.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={() => { setAuthTab('signup'); setAuthOpen(true) }}
            className="px-8 py-3 rounded-lg font-extrabold text-sm uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
            Get Started Free →
          </button>
          <button onClick={() => { setAuthTab('signin'); setAuthOpen(true) }}
            className="px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider"
            style={{ border: '1px solid rgba(56,189,248,0.2)', color: '#eef2fc' }}>
            Sign In
          </button>
        </div>
      </div>
    </>
  )
}