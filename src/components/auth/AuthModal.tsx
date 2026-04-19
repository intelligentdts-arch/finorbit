'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'signin' | 'signup'
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signup' }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Sign in fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign up fields
  const [suFirst, setSuFirst] = useState('')
  const [suLast, setSuLast] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const { refreshUser } = useAuthStore()

  if (!isOpen) return null

  const handleSignIn = async () => {
    setError('')
    if (!siEmail || !siEmail.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!siPassword) { setError('Please enter your password.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: siEmail,
      password: siPassword
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    await refreshUser()
    setLoading(false)
    onClose()
  }

  const handleSignUp = async () => {
    setError('')
    if (!suFirst.trim()) { setError('Please enter your first name.'); return }
    if (!suEmail || !suEmail.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!suPassword || suPassword.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        data: {
          first_name: suFirst,
          last_name: suLast,
          plan: selectedPlan
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! Check your email to verify your account, then sign in.')
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-10"
        style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
          style={{ background: 'rgba(56,189,248,0.06)', color: '#94a8c8' }}
        >✕</button>

        {/* Logo */}
        <div className="text-center text-2xl font-extrabold mb-6"
          style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg p-1 mb-7" style={{ background: 'rgba(56,189,248,0.06)' }}>
          {(['signin', 'signup'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); setSuccess('') }}
              className="flex-1 py-2 rounded-md text-sm font-bold transition-all"
              style={tab === t ? { background: '#162a4a', color: '#eef2fc' } : { color: '#94a8c8' }}>
              {t === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
            {success}
          </div>
        )}

        {/* SIGN IN */}
        {tab === 'signin' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Email</label>
              <input value={siEmail} onChange={e => setSiEmail(e.target.value)}
                type="email" placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
            </div>
            <div>
              <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Password</label>
              <div className="relative">
                <input value={siPassword} onChange={e => setSiPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  className="w-full rounded-lg px-4 py-3 pr-12 text-sm outline-none transition-all"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
                <button onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#526480' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#94a8c8' }}>
                <input type="checkbox" defaultChecked className="accent-cyan-400"/> Remember me
              </label>
              <button className="text-sm font-semibold" style={{ color: '#22d3ee' }}>Forgot password?</button>
            </div>
            <button onClick={handleSignIn} disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
            <div className="flex items-center gap-3 text-xs font-mono" style={{ color: '#526480' }}>
              <div className="flex-1 h-px" style={{ background: 'rgba(56,189,248,0.1)' }}></div>
              or continue with
              <div className="flex-1 h-px" style={{ background: 'rgba(56,189,248,0.1)' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['🌐 Google', '🍎 Apple'].map(p => (
                <button key={p} onClick={handleGoogleSignIn}
                  className="py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.1)', color: '#eef2fc' }}>
                  {p}
                </button>
              ))}
            </div>
            <p className="text-center text-sm" style={{ color: '#94a8c8' }}>
              Don't have an account?{' '}
              <span onClick={() => setTab('signup')} className="font-bold cursor-pointer" style={{ color: '#22d3ee' }}>
                Create one →
              </span>
            </p>
          </div>
        )}

        {/* SIGN UP */}
        {tab === 'signup' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>First Name</label>
                <input value={suFirst} onChange={e => setSuFirst(e.target.value)} placeholder="Alex"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
              </div>
              <div>
                <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Last Name</label>
                <input value={suLast} onChange={e => setSuLast(e.target.value)} placeholder="Morgan"
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Email</label>
              <input value={suEmail} onChange={e => setSuEmail(e.target.value)} type="email" placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
            </div>
            <div>
              <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Password</label>
              <div className="relative">
                <input value={suPassword} onChange={e => setSuPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters"
                  className="w-full rounded-lg px-4 py-3 pr-12 text-sm outline-none"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc' }}/>
                <button onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#526480' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-xs font-mono uppercase tracking-widest" style={{ color: '#94a8c8' }}>Choose Your Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'free', name: 'Launch', price: 'Free forever' },
                  { id: 'pro', name: 'Autopilot Pro ✦', price: '$29/mo · 14-day trial' }
                ].map(plan => (
                  <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                    className="p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      border: selectedPlan === plan.id ? '1px solid #22d3ee' : '1px solid rgba(56,189,248,0.1)',
                      background: selectedPlan === plan.id ? 'rgba(34,211,238,0.06)' : '#081528'
                    }}>
                    <div className="text-sm font-bold" style={{ color: selectedPlan === plan.id ? '#22d3ee' : '#eef2fc' }}>
                      {plan.name}
                    </div>
                    <div className="text-xs font-mono mt-1" style={{ color: '#94a8c8' }}>{plan.price}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSignUp} disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-extrabold uppercase tracking-wider transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
              {loading ? 'Creating account…' : 'Create My Account →'}
            </button>
            <div className="flex items-center gap-3 text-xs font-mono" style={{ color: '#526480' }}>
              <div className="flex-1 h-px" style={{ background: 'rgba(56,189,248,0.1)' }}></div>
              or continue with
              <div className="flex-1 h-px" style={{ background: 'rgba(56,189,248,0.1)' }}></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['🌐 Google', '🍎 Apple'].map(p => (
                <button key={p} onClick={handleGoogleSignIn}
                  className="py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.1)', color: '#eef2fc' }}>
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: '#526480' }}>
              By creating an account you agree to our{' '}
              <a href="#" className="underline" style={{ color: '#94a8c8' }}>Terms</a> and{' '}
              <a href="#" className="underline" style={{ color: '#94a8c8' }}>Privacy Policy</a>
            </p>
            <p className="text-center text-sm" style={{ color: '#94a8c8' }}>
              Already have an account?{' '}
              <span onClick={() => setTab('signin')} className="font-bold cursor-pointer" style={{ color: '#22d3ee' }}>
                Sign in →
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}