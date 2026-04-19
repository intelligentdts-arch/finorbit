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

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, refreshUser } = useAuthStore()
  const [step, setStep] = useState<Step>('welcome')
  const [riskProfile, setRiskProfile] = useState('balanced')
  const [primaryGoal, setPrimaryGoal] = useState('grow_investments')
  const [saving, setSaving] = useState(false)

  const stepIndex = STEPS.indexOf(step)

  const saveProfile = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase
      .from('profiles')
      .update({
        risk_profile: riskProfile,
        primary_goal: primaryGoal,
        onboarding_complete: true
      })
      .eq('id', session.user.id)

    await refreshUser()
    setSaving(false)
    onComplete()
  }

  const risks = [
    { id: 'conservative', icon: '🛡️', label: 'Conservative', desc: 'Stability first, slow growth' },
    { id: 'balanced', icon: '⚖️', label: 'Balanced', desc: 'Growth with protection' },
    { id: 'aggressive', icon: '🚀', label: 'Aggressive', desc: 'Max growth, higher risk' }
  ]

  const goals = [
    { id: 'grow_investments', label: 'Grow my investments' },
    { id: 'emergency_fund', label: 'Build emergency fund' },
    { id: 'pay_off_debt', label: 'Pay off debt' },
    { id: 'save_for_home', label: 'Save for a home' },
    { id: 'retire_early', label: 'Retire early' }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#040c1a' }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,211,238,0.1) 0%, transparent 65%)' }}/>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center text-2xl font-extrabold mb-8"
          style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="h-1 w-16 rounded-full transition-all"
              style={{
                background: i < stepIndex ? '#2dd4bf' : i === stepIndex ? '#22d3ee' : 'rgba(56,189,248,0.15)'
              }}/>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-10"
          style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

          {/* STEP: WELCOME */}
          {step === 'welcome' && (
            <div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Welcome to FinOrbit{user?.first_name ? `, ${user.first_name}` : ''} 👋
              </h2>
              <p className="text-sm mb-8" style={{ color: '#94a8c8', lineHeight: 1.7 }}>
                Your Autonomous Financial OS is almost ready. Let's take 2 minutes to set it up properly so it can start working for you immediately.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: '🔗', text: 'Connect your bank accounts securely' },
                  { icon: '⚖️', text: 'Set your risk profile and goals' },
                  { icon: '🚀', text: 'Launch your personal AI CFO' }
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 text-sm" style={{ color: '#94a8c8' }}>
                    <span className="text-base">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep('bank')}
                className="w-full py-4 rounded-lg font-extrabold text-sm uppercase tracking-wider transition-all"
                style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
                Let's Go →
              </button>
            </div>
          )}

          {/* STEP: BANK */}
          {step === 'bank' && (
            <BankConnect
              onSuccess={() => setStep('risk')}
              onSkip={() => setStep('risk')}
            />
          )}

          {/* STEP: RISK */}
          {step === 'risk' && (
            <div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ letterSpacing: '-0.02em' }}>
                Set your risk profile
              </h2>
              <p className="text-sm mb-6" style={{ color: '#94a8c8', lineHeight: 1.7 }}>
                This determines how aggressively FinOrbit allocates your capital. You can change this any time.
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {risks.map(r => (
                  <div key={r.id} onClick={() => setRiskProfile(r.id)}
                    className="p-4 rounded-xl text-center cursor-pointer transition-all"
                    style={{
                      border: riskProfile === r.id ? '1px solid #22d3ee' : '1px solid rgba(56,189,248,0.1)',
                      background: riskProfile === r.id ? 'rgba(34,211,238,0.06)' : '#081528'
                    }}>
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="text-sm font-bold mb-1"
                      style={{ color: riskProfile === r.id ? '#22d3ee' : '#eef2fc' }}>
                      {r.label}
                    </div>
                    <div className="text-xs" style={{ color: '#526480' }}>{r.desc}</div>
                  </div>
                ))}
              </div>

              <label className="block text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: '#94a8c8' }}>
                Primary Goal
              </label>
              <select
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value)}
                className="w-full rounded-lg px-4 py-3 text-sm mb-6 outline-none appearance-none"
                style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.15)', color: '#eef2fc', cursor: 'pointer' }}>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>

              <button onClick={() => setStep('ready')}
                className="w-full py-4 rounded-lg font-extrabold text-sm uppercase tracking-wider transition-all"
                style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
                Continue →
              </button>
            </div>
          )}

          {/* STEP: READY */}
          {step === 'ready' && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-extrabold mb-2" style={{ letterSpacing: '-0.02em' }}>
                You're ready to orbit
              </h2>
              <p className="text-sm mb-6" style={{ color: '#94a8c8', lineHeight: 1.7 }}>
                Your AI CFO is initializing. It has already identified opportunities to improve your financial position.
              </p>

              <div className="rounded-xl p-5 mb-6 text-left"
                style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-xs font-mono uppercase tracking-widest mb-4"
                  style={{ color: '#526480' }}>AI Initial Scan</div>
                <div className="space-y-3">
                  {[
                    { label: 'Profile', value: `${riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)} · ${goals.find(g => g.id === primaryGoal)?.label}`, color: '#22d3ee' },
                    { label: 'Autopilot', value: 'Enabled ✓', color: '#34d399' },
                    { label: 'AI Modules', value: '8 active', color: '#2dd4bf' },
                    { label: 'Status', value: 'Ready to launch', color: '#34d399' }
                  ].map(item => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span style={{ color: '#94a8c8' }}>{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={saveProfile} disabled={saving}
                className="w-full py-4 rounded-lg font-extrabold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
                {saving ? 'Launching…' : 'Launch My Financial OS →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}