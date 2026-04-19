'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import BankConnect from './BankConnect'

interface OnboardingFlowProps {
  onComplete: () => void
}

type Step = 'welcome' | 'bank' | 'risk' | 'ready'
const STEPS: Step[] = ['welcome', 'bank', 'risk', 'ready']

const S = {
  grad:   'linear-gradient(135deg,#38bdf8,#2dd4bf)',
  panel:  '#112240',
  deep:   '#081528',
  b1:     'rgba(56,189,248,0.15)',
  b2:     'rgba(56,189,248,0.10)',
  brand:  '#22d3ee',
  teal:   '#2dd4bf',
  text:   '#eef2fc',
  muted:  '#94a8c8',
  dim:    '#526480',
  green:  '#34d399',
  amber:  '#fbbf24',
  cyan:   '#38bdf8',
  gradText: {
    background:             'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
    WebkitBackgroundClip:   'text' as const,
    WebkitTextFillColor:    'transparent' as const,
    backgroundClip:         'text' as const,
  },
}

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
    if (!session) { setSaving(false); return }

    await supabase
      .from('profiles')
      .update({
        risk_profile:        riskProfile,
        primary_goal:        primaryGoal,
        onboarding_complete: true,
      })
      .eq('id', session.user.id)

    await refreshUser()
    setSaving(false)
    onComplete()
  }

  const risks = [
    { id: 'conservative', icon: '🛡️', label: 'Conservative', desc: 'Stability first' },
    { id: 'balanced',     icon: '⚖️', label: 'Balanced',     desc: 'Growth + protection' },
    { id: 'aggressive',   icon: '🚀', label: 'Aggressive',   desc: 'Max growth' },
  ]

  const goals = [
    { id: 'grow_investments', label: 'Grow my investments'  },
    { id: 'emergency_fund',   label: 'Build emergency fund' },
    { id: 'pay_off_debt',     label: 'Pay off debt'         },
    { id: 'save_for_home',    label: 'Save for a home'      },
    { id: 'retire_early',     label: 'Retire early'         },
  ]

  return (
    <div
      style={{
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         24,
        position:        'relative',
        overflow:        'hidden',
        background:      '#040c1a',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 0%,rgba(34,211,238,.1) 0%,transparent 65%)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: 32, ...S.gradText }}>FinOrbit</div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                height: 4, width: 64, borderRadius: 2,
                background: i < stepIndex ? S.teal : i === stepIndex ? S.brand : 'rgba(56,189,248,0.15)',
                transition: 'background .3s',
              }}
            />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: S.panel, border: `1px solid ${S.b1}`, borderRadius: 20, padding: '48px 40px', boxShadow: '0 40px 100px rgba(0,0,0,.5)' }}>

          {/* WELCOME */}
          {step === 'welcome' && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
                Welcome to FinOrbit{user?.first_name ? `, ${user.first_name}` : ''} 👋
              </h2>
              <p style={{ fontSize: '0.87rem', color: S.muted, lineHeight: 1.7, marginBottom: 32 }}>
                Your Autonomous Financial OS is almost ready. Let&apos;s take 2 minutes to set it up properly.
              </p>
              {[['🔗','Connect your bank accounts securely'],['⚖️','Set your risk profile and goals'],['🚀','Launch your personal AI CFO']].map(([icon,text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, fontSize: '0.84rem', color: S.muted }}>
                  <span>{icon}</span>{text}
                </div>
              ))}
              <button
                onClick={() => setStep('bank')}
                style={{ width: '100%', padding: '15px', marginTop: 24, borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(34,211,238,.25)' }}
              >
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
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>Set your risk profile</h2>
              <p style={{ fontSize: '0.87rem', color: S.muted, lineHeight: 1.7, marginBottom: 24 }}>
                This determines how aggressively FinOrbit allocates your capital. You can change this any time.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
                {risks.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setRiskProfile(r.id)}
                    style={{ padding: '16px 10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: `1px solid ${riskProfile===r.id ? S.brand : S.b2}`, background: riskProfile===r.id ? 'rgba(34,211,238,0.06)' : S.deep }}
                  >
                    <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 3, color: riskProfile===r.id ? S.brand : S.text }}>{r.label}</div>
                    <div style={{ fontSize: '0.65rem', color: S.dim }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Primary Goal</label>
              <select
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value)}
                style={{ width: '100%', background: S.deep, border: `1px solid ${S.b1}`, borderRadius: 8, padding: '13px 15px', color: S.text, fontSize: '0.88rem', outline: 'none', marginBottom: 24, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {goals.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              <button
                onClick={() => setStep('ready')}
                style={{ width: '100%', padding: '15px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit' }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* READY */}
          {step === 'ready' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>You&apos;re ready to orbit</h2>
              <p style={{ fontSize: '0.87rem', color: S.muted, lineHeight: 1.7, marginBottom: 24 }}>
                Your AI CFO is initializing. It has already identified opportunities to improve your financial position.
              </p>
              <div style={{ background: S.deep, border: `1px solid ${S.b2}`, borderRadius: 10, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>AI Initial Scan</div>
                {[
                  ['Profile',   `${riskProfile.charAt(0).toUpperCase()}${riskProfile.slice(1)}`, S.brand],
                  ['Autopilot', 'Enabled ✓',       S.green],
                  ['AI Modules','8 active',         S.teal ],
                  ['Status',    'Ready to launch',  S.green],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', marginBottom: 8 }}>
                    <span style={{ color: S.muted }}>{label}</span>
                    <span style={{ fontWeight: 700, color }}>{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                style={{ width: '100%', padding: '15px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(34,211,238,.25)', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Launching…' : 'Launch My Financial OS →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}