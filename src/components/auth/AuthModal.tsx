'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { signUpSchema, signInSchema, formatZodError, sanitize } from '@/lib/validation'

interface AuthModalProps {
  isOpen:      boolean
  onClose:     () => void
  defaultTab?: 'signin' | 'signup'
}

const S = {
  panel:  '#112240',
  deep:   '#081528',
  b1:     'rgba(56,189,248,0.15)',
  b2:     'rgba(56,189,248,0.10)',
  b3:     'rgba(56,189,248,0.06)',
  brand:  '#22d3ee',
  teal:   '#2dd4bf',
  text:   '#eef2fc',
  muted:  '#94a8c8',
  dim:    '#526480',
  green:  '#34d399',
  red:    '#f87171',
  grad:   'linear-gradient(135deg,#38bdf8,#2dd4bf)',
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'signup' }: AuthModalProps) {
  const [tab,          setTab]          = useState<'signin' | 'signup'>(defaultTab)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [success,      setSuccess]      = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro')

  // Sign-in fields
  const [siEmail,    setSiEmail]    = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign-up fields
  const [suFirst,    setSuFirst]    = useState('')
  const [suLast,     setSuLast]     = useState('')
  const [suEmail,    setSuEmail]    = useState('')
  const [suPassword, setSuPassword] = useState('')

  const { refreshUser } = useAuthStore()

  if (!isOpen) return null

  const switchTab = (t: 'signin' | 'signup') => {
    setTab(t)
    setError('')
    setSuccess('')
  }

  const handleSignIn = async () => {
    setError('')
    const result = signInSchema.safeParse({ email: siEmail, password: siPassword })
    if (!result.success) { setError(formatZodError(result.error)); return }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    result.data.email,
      password: result.data.password,
    })

    if (authError) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    await refreshUser()
    setLoading(false)
    onClose()
  }

  const handleSignUp = async () => {
    setError('')
    const result = signUpSchema.safeParse({
      firstName: suFirst,
      lastName:  suLast,
      email:     suEmail,
      password:  suPassword,
      plan:      selectedPlan,
    })
    if (!result.success) { setError(formatZodError(result.error)); return }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email:    result.data.email,
      password: result.data.password,
      options: {
        data: {
          first_name: sanitize(result.data.firstName),
          last_name:  sanitize(result.data.lastName ?? ''),
          plan:       result.data.plan,
        },
      },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'An account with this email already exists. Try signing in instead.'
          : authError.message,
      )
      setLoading(false)
      return
    }

    setSuccess('Account created! Check your email to verify, then sign in.')
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    background:   S.deep,
    border:       `1px solid ${S.b1}`,
    borderRadius: 8,
    padding:      '13px 15px',
    color:        S.text,
    fontSize:     '0.88rem',
    outline:      'none',
    marginBottom: 14,
    fontFamily:   'inherit',
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          500,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         24,
        background:      'rgba(3,7,18,0.85)',
        backdropFilter:  'blur(16px)',
      }}
    >
      <div
        style={{
          position:   'relative',
          width:      '100%',
          maxWidth:   440,
          background: S.panel,
          border:     `1px solid ${S.b1}`,
          borderRadius: 20,
          boxShadow:  '0 40px 100px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position:       'absolute',
            top:            16,
            right:          16,
            width:          30,
            height:         30,
            borderRadius:   '50%',
            background:     S.b3,
            border:         'none',
            color:          S.muted,
            fontSize:       '1rem',
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'inherit',
          }}
        >✕</button>

        <div style={{ padding: '40px 36px 36px' }}>
          {/* Logo */}
          <div
            style={{
              textAlign:   'center',
              fontSize:    '1.5rem',
              fontWeight:  800,
              marginBottom: 24,
              background:  'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >FinOrbit</div>

          {/* Tabs */}
          <div
            style={{
              display:      'flex',
              background:   S.b3,
              borderRadius: 8,
              padding:      3,
              marginBottom: 28,
            }}
          >
            {(['signin', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex:         1,
                  padding:      '9px 0',
                  borderRadius: 6,
                  fontSize:     '0.82rem',
                  fontWeight:   700,
                  cursor:       'pointer',
                  border:       'none',
                  fontFamily:   'inherit',
                  background:   tab === t ? '#162a4a' : 'transparent',
                  color:        tab === t ? S.text    : S.muted,
                  transition:   'all .2s',
                }}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: S.red, marginBottom: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: '0.78rem', color: S.green, marginBottom: 14 }}>
              {success}
            </div>
          )}

          {/* ── SIGN IN ── */}
          {tab === 'signin' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Email</label>
              <input
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                style={inputStyle}
              />
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  value={siPassword}
                  onChange={e => setSiPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: 46 }}
                />
                <button
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: '0.85rem' }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: S.muted, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: S.brand }} /> Remember me
                </label>
                <button style={{ fontSize: '0.78rem', color: S.brand, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Forgot password?
                </button>
              </div>
              <button
                data-testid="signin-submit" onClick={handleSignIn}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.dim }}>
                <div style={{ flex: 1, height: 1, background: S.b2 }}/> or continue with <div style={{ flex: 1, height: 1, background: S.b2 }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['🌐 Google', '🍎 Apple'].map(p => (
                  <button key={p} style={{ padding: '11px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: S.deep, border: `1px solid ${S.b2}`, color: S.text, cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: S.muted, marginTop: 20 }}>
                Don&apos;t have an account?{' '}
                <span onClick={() => switchTab('signup')} style={{ color: S.brand, cursor: 'pointer', fontWeight: 700 }}>Create one →</span>
              </p>
            </div>
          )}

          {/* ── SIGN UP ── */}
          {tab === 'signup' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>First Name</label>
                  <input value={suFirst} onChange={e => setSuFirst(e.target.value)} placeholder="Alex" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Last Name</label>
                  <input value={suLast} onChange={e => setSuLast(e.target.value)} placeholder="Morgan" style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Email</label>
              <input value={suEmail} onChange={e => setSuEmail(e.target.value)} type="email" placeholder="you@example.com" style={inputStyle} />
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  value={suPassword}
                  onChange={e => setSuPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  style={{ ...inputStyle, marginBottom: 0, paddingRight: 46 }}
                />
                <button onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: S.dim, fontSize: '0.85rem' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Choose Your Plan</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {([['free','Launch','Free forever'],['pro','Autopilot Pro ✦','$29/mo · 14-day trial']] as const).map(([id,name,price]) => (
                  <div
                    key={id}
                    onClick={() => setSelectedPlan(id)}
                    style={{ padding: '11px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${selectedPlan===id ? S.brand : S.b2}`, background: selectedPlan===id ? 'rgba(34,211,238,0.06)' : S.deep }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: selectedPlan===id ? S.brand : S.text }}>{name}</div>
                    <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, marginTop: 2 }}>{price}</div>
                  </div>
                ))}
              </div>
              <button
                data-testid="signup-submit" onClick={handleSignUp}
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? 'Creating account…' : 'Create My Account →'}
              </button>
              <p style={{ fontSize: '0.72rem', color: S.dim, textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                By creating an account you agree to our Terms and Privacy Policy.
              </p>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: S.muted, marginTop: 14 }}>
                Already have an account?{' '}
                <span onClick={() => switchTab('signin')} style={{ color: S.brand, cursor: 'pointer', fontWeight: 700 }}>Sign in →</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}