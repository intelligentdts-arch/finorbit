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

  useEffect(() => {
    if (user?.onboarding_complete) router.push('/dashboard')
  }, [user])

  const openAuth = (tab: 'signin' | 'signup') => {
    setAuthTab(tab)
    setAuthOpen(true)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040c1a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FinOrbit
          </div>
          <div style={{ width: 32, height: 32, border: '2px solid rgba(34,211,238,0.2)', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}/>
        </div>
      </div>
    )
  }

  if (user && !user.onboarding_complete) {
    return <OnboardingFlow onComplete={refreshUser} />
  }

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 60px', background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(56,189,248,0.08)' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => openAuth('signin')}
            style={{ background: 'transparent', color: '#94a8c8', padding: '9px 20px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 700, border: '1px solid rgba(56,189,248,0.15)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign In
          </button>
          <button onClick={() => openAuth('signup')}
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', padding: '9px 22px', borderRadius: 6, fontSize: '0.82rem', fontWeight: 800, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(34,211,238,0.2)' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '140px 40px 80px', position: 'relative', overflow: 'hidden', background: '#040c1a' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(34,211,238,0.12) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 85%, rgba(45,212,191,0.06) 0%, transparent 55%)', pointerEvents: 'none' }}/>

        {/* Logo wordmark */}
        <div style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 28, position: 'relative', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.22)', borderRadius: 100, padding: '6px 18px', fontSize: '0.7rem', fontFamily: 'DM Mono, monospace', color: '#22d3ee', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
          <span style={{ width: 6, height: 6, background: '#22d3ee', borderRadius: '50%', display: 'inline-block' }}/>
          Autonomous Financial OS · Now in Private Beta
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(3rem,7vw,6.5rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', maxWidth: 900, margin: '0 auto 12px' }}>
          Your money,<br/>
          <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            on autopilot.
          </span>
        </h1>

        {/* Subheading */}
        <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: '#94a8c8', maxWidth: 560, lineHeight: 1.75, margin: '20px auto 44px', fontWeight: 400 }}>
          FinOrbit is the world's first Autonomous Financial Operating System — an AI engine that receives, allocates, invests, and optimizes every dollar you earn. Continuously. Intelligently. Without lifting a finger.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
          <button onClick={() => openAuth('signup')}
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', padding: '15px 36px', borderRadius: 6, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 30px rgba(34,211,238,0.25)' }}>
            Start Free Today →
          </button>
          <button onClick={() => openAuth('signin')}
            style={{ background: 'transparent', color: '#eef2fc', padding: '14px 32px', borderRadius: 6, fontSize: '0.88rem', fontWeight: 600, border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign In
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 56, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 44, borderTop: '1px solid rgba(56,189,248,0.08)', width: '100%', maxWidth: 700 }}>
          {[
            { num: '98%', label: 'Autopilot Accuracy' },
            { num: '3.4x', label: 'Avg. Wealth Growth' },
            { num: 'Zero', label: 'Manual Budgeting' },
            { num: '8',    label: 'AI Modules Active' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.num}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 40px', background: '#081528', borderTop: '1px solid rgba(56,189,248,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.67rem', fontFamily: 'DM Mono, monospace', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>How It Works</div>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18, maxWidth: 600 }}>
            Four steps to{' '}
            <span style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              full financial autonomy
            </span>
          </h2>
          <p style={{ color: '#94a8c8', fontSize: '1rem', maxWidth: 520, lineHeight: 1.85, marginBottom: 64 }}>
            FinOrbit doesn't give suggestions. It takes action. Here's the complete loop running in the background, every single day.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.1)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { num: 'STEP 01', icon: '🔗', title: 'Connect Everything', desc: 'Link your banks, investments, and credit via secure APIs. FinOrbit builds a complete financial picture in minutes.' },
              { num: 'STEP 02', icon: '🧠', title: 'AI Learns You', desc: 'Reinforcement learning models analyze your income, spending, risk tolerance, and goals. Gets smarter daily.' },
              { num: 'STEP 03', icon: '⚙️', title: 'Decide + Execute', desc: 'Autonomous AI agents pay bills, allocate capital, invest in assets, and manage debt — context-aware, not rule-based.' },
              { num: 'STEP 04', icon: '📡', title: 'Optimize Continuously', desc: 'Every action feeds back into the model. As markets shift and goals evolve, FinOrbit adapts in real time.' },
            ].map(step => (
              <div key={step.num} style={{ background: '#112240', padding: '32px 24px' }}>
                <div style={{ fontSize: '0.6rem', fontFamily: 'DM Mono, monospace', color: '#526480', letterSpacing: '0.14em', marginBottom: 16 }}>{step.num}</div>
                <div style={{ fontSize: '1.6rem', marginBottom: 13 }}>{step.icon}</div>
                <div style={{ fontSize: '0.93rem', fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: '0.84rem', color: '#94a8c8', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '100px 40px', background: '#040c1a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.67rem', fontFamily: 'DM Mono, monospace', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 14 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18, maxWidth: 600 }}>
            Start free.{' '}
            <span style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Scale infinitely.
            </span>
          </h2>
          <p style={{ color: '#94a8c8', fontSize: '1rem', maxWidth: 520, lineHeight: 1.85, marginBottom: 64 }}>
            FinOrbit grows with you — from your first automated savings to managing a $10M portfolio.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                tier: 'Entry', name: 'Launch', price: '0', featured: false,
                desc: 'Start your financial autopilot with core automation. No credit card required.',
                features: ['Bank account connection (1)', 'Auto-categorization & tracking', 'Basic AI insights feed', 'Autopilot Score dashboard', 'Auto savings rule (1)'],
                dimmed: ['Smart allocation engine', 'Investment autopilot', 'Borrowing engine'],
                cta: 'Get Started Free',
              },
              {
                tier: 'Growth', name: 'Autopilot Pro', price: '29', featured: true,
                desc: 'Full financial autonomy. The complete FinOrbit experience.',
                features: ['Unlimited bank connections', 'Full Smart Allocation Engine', 'Investment Autopilot (multi-asset)', 'Smart Borrowing Engine', 'Predictive cash flow forecasting', 'Behavioral adaptation layer', 'Risk + Fraud protection', 'Opportunity Engine access'],
                dimmed: [],
                cta: 'Start Free Trial',
              },
              {
                tier: 'Enterprise', name: 'AI CFO', price: 'Custom', featured: false,
                desc: 'For businesses, family offices, and institutions.',
                features: ['Everything in Autopilot Pro', 'Business cash flow automation', 'Payroll + vendor management', 'Multi-entity support', 'Custom AI model training', 'Dedicated success manager'],
                dimmed: [],
                cta: 'Talk to Sales',
              },
            ].map(plan => (
              <div key={plan.name} style={{ background: plan.featured ? 'linear-gradient(145deg,rgba(34,211,238,0.06),#112240)' : '#112240', border: plan.featured ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(56,189,248,0.1)', borderRadius: 16, padding: '32px 28px', position: 'relative' }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100 }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: '0.66rem', fontFamily: 'DM Mono, monospace', color: '#94a8c8', textTransform: 'uppercase', letterSpacing: '0.11em', marginBottom: 9 }}>{plan.tier}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16 }}>{plan.name}</div>
                <div style={{ fontSize: plan.price === 'Custom' ? '2rem' : '2.7rem', fontWeight: 800, letterSpacing: '-0.05em', background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 4 }}>
                  {plan.price === 'Custom' ? 'Custom' : <><sup style={{ fontSize: '1rem', verticalAlign: 'top', marginTop: 6, display: 'inline-block' }}>$</sup>{plan.price}<sub style={{ fontSize: '0.82rem', WebkitTextFillColor: '#94a8c8', fontWeight: 400 }}>/mo</sub></>}
                </div>
                <p style={{ fontSize: '0.84rem', color: '#94a8c8', margin: '13px 0 24px', lineHeight: 1.7 }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.84rem', lineHeight: 1.5 }}>
                      <span style={{ color: '#2dd4bf', flexShrink: 0, marginTop: 1 }}>✓</span> {f}
                    </li>
                  ))}
                  {plan.dimmed.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.84rem', color: '#526480', lineHeight: 1.5 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>—</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => openAuth('signup')}
                  style={{ display: 'block', width: '100%', padding: 12, borderRadius: 6, textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: plan.featured ? 'linear-gradient(135deg,#38bdf8,#2dd4bf)' : 'transparent', color: plan.featured ? '#020d1a' : '#eef2fc', outline: plan.featured ? 'none' : '1px solid rgba(56,189,248,0.2)' }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '120px 40px', textAlign: 'center', background: '#081528', borderTop: '1px solid rgba(56,189,248,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(34,211,238,0.05) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        <h2 style={{ fontSize: 'clamp(2.5rem,5vw,4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, maxWidth: 680, margin: '0 auto 22px', position: 'relative' }}>
          Stop managing money.<br/>
          Let{' '}
          <span style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontWeight: 400, background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FinOrbit
          </span>
          {' '}orbit it.
        </h2>
        <p style={{ color: '#94a8c8', fontSize: '0.98rem', maxWidth: 420, margin: '0 auto 42px', lineHeight: 1.75, position: 'relative' }}>
          Join thousands of early adopters turning their finances into an autonomous system. Limited beta access available now.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <button onClick={() => openAuth('signup')}
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', padding: '15px 36px', borderRadius: 6, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 30px rgba(34,211,238,0.25)' }}>
            Start Free Today →
          </button>
          <button onClick={() => openAuth('signin')}
            style={{ background: 'transparent', color: '#eef2fc', padding: '14px 32px', borderRadius: 6, fontSize: '0.88rem', fontWeight: 600, border: '1px solid rgba(56,189,248,0.2)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sign In
          </button>
        </div>
        <div style={{ display: 'flex', gap: 26, justifyContent: 'center', alignItems: 'center', marginTop: 30, flexWrap: 'wrap' }}>
          {['Bank-grade encryption', 'SOC 2 compliant', 'No credit card required', 'Cancel anytime'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.76rem', color: '#94a8c8', fontFamily: 'DM Mono, monospace' }}>
              <span style={{ color: '#2dd4bf' }}>✓</span> {item}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(56,189,248,0.06)', padding: '40px 60px', background: '#040c1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>
        <div style={{ fontSize: '0.7rem', color: '#526480', fontFamily: 'DM Mono, monospace' }}>
          © 2025 FinOrbit. Autonomous Financial Operating System™
        </div>
      </footer>
    </>
  )
}