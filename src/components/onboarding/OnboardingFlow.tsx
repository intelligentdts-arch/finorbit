'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import BankConnect from './BankConnect'

interface OnboardingFlowProps {
  onComplete: () => void
}

const STEPS = ['welcome', 'bank', 'risk', 'ready'] as const
type Step = typeof STEPS[number]

const risks = [
  { id: 'conservative', icon: '🛡️', label: 'Conservative', desc: 'Stability first, slow growth'   },
  { id: 'balanced',     icon: '⚖️', label: 'Balanced',     desc: 'Growth with protection'          },
  { id: 'aggressive',   icon: '🚀', label: 'Aggressive',   desc: 'Max growth, higher risk'         },
]

const goals = [
  { id: 'grow_investments', label: 'Grow my investments'  },
  { id: 'emergency_fund',   label: 'Build emergency fund' },
  { id: 'pay_off_debt',     label: 'Pay off debt'         },
  { id: 'save_for_home',    label: 'Save for a home'      },
  { id: 'retire_early',     label: 'Retire early'         },
]

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, refreshUser } = useAuthStore()
  const [step,        setStep]        = useState<Step>('welcome')
  const [riskProfile, setRiskProfile] = useState('balanced')
  const [primaryGoal, setPrimaryGoal] = useState('grow_investments')
  const [saving,      setSaving]      = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const saveProfile = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase
      .from('profiles')
      .update({ risk_profile: riskProfile, primary_goal: primaryGoal, onboarding_complete: true })
      .eq('id', session.user.id)

    await refreshUser()
    setSaving(false)
    onComplete()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#040c1a', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,211,238,0.10) 0%, transparent 65%)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: 32, background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ height: 4, width: 64, borderRadius: 2, background: i < stepIndex ? '#2dd4bf' : i === stepIndex ? '#22d3ee' : 'rgba(56,189,248,0.15)', transition: 'all .3s' }}/>
          ))}
        </div>

        {/* Card */}
        <div style={{ borderRadius: 20, padding: 40, background: '#112240', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

          {/* WELCOME */}
          {step === 'welcome' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Welcome to FinOrbit{user?.first_name ? `, ${user.first_name}` : ''} 👋
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a8c8', lineHeight: 1.7, marginBottom: 28 }}>
                Your Autonomous Financial OS is almost ready. Let&apos;s take 2 minutes to set it up so it can start working for you immediately.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  { icon: '🔗', text: 'Connect your bank accounts securely'  },
                  { icon: '⚖️', text: 'Set your risk profile and goals'      },
                  { icon: '🚀', text: 'Launch your personal AI CFO'           },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.88rem', color: '#94a8c8' }}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>{item.text}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep('bank')}
                style={{ width: '100%', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
                Let&apos;s Go →
              </button>
            </div>
          )}

          {/* BANK */}
          {step === 'bank' && (
            <BankConnect onSuccess={() => setStep('risk')} onSkip={() => setStep('risk')} />
          )}

          {/* RISK */}
          {step === 'risk' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Set your risk profile</h2>
              <p style={{ fontSize: '0.88rem', color: '#94a8c8', lineHeight: 1.7, marginBottom: 24 }}>
                This determines how aggressively FinOrbit allocates your capital. You can change this any time.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
                {risks.map(r => (
                  <div key={r.id} onClick={() => setRiskProfile(r.id)}
                    style={{ padding: '16px 10px', borderRadius: 12, textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                      border:      riskProfile === r.id ? '1px solid #22d3ee' : '1px solid rgba(56,189,248,0.1)',
                      background:  riskProfile === r.id ? 'rgba(34,211,238,0.06)' : '#081528',
                    }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 3, color: riskProfile === r.id ? '#22d3ee' : '#eef2fc' }}>{r.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#526480' }}>{r.desc}</div>
                  </div>
                ))}
              </div>

              <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a8c8', marginBottom: 8 }}>
                Primary Goal
              </label>
              <select value={primaryGoal} onChange={e => setPrimaryGoal(e.target.value)}
                style={{ width: '100%', borderRadius: 8, padding: '12px 14px', fontSize: '0.88rem', marginBottom: 22, outline: 'none', background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc', cursor: 'pointer', fontFamily: 'inherit' }}>
                {goals.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>

              <button onClick={() => setStep('ready')}
                style={{ width: '100%', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', fontFamily: 'inherit' }}>
                Continue →
              </button>
            </div>
          )}

          {/* READY */}
          {step === 'ready' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>You&apos;re ready to orbit</h2>
              <p style={{ fontSize: '0.88rem', color: '#94a8c8', lineHeight: 1.7, marginBottom: 24 }}>
                Your AI CFO is initializing. It has already identified opportunities to improve your financial position.
              </p>

              <div style={{ borderRadius: 12, padding: 18, marginBottom: 22, textAlign: 'left', background: '#081528', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#526480', marginBottom: 14 }}>AI Initial Scan</div>
                {[
                  { label: 'Profile',   value: `${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} · ${goals.find(g => g.id === primaryGoal)?.label}`, color: '#22d3ee' },
                  { label: 'Autopilot', value: 'Enabled ✓',      color: '#34d399' },
                  { label: 'AI Modules',value: '8 active',        color: '#2dd4bf' },
                  { label: 'Status',    value: 'Ready to launch', color: '#34d399' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '5px 0' }}>
                    <span style={{ color: '#94a8c8' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={saveProfile} disabled={saving}
                style={{ width: '100%', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', fontFamily: 'inherit', opacity: saving ? .6 : 1, boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
                {saving ? 'Launching...' : 'Launch My Financial OS →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
