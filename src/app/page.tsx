'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import AuthModal from '@/components/auth/AuthModal'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

const S = {
  black:  '#040c1a',
  deep:   '#081528',
  navy:   '#0c1e38',
  panel:  '#112240',
  panel2: '#162a4a',
  cyan:   '#38bdf8',
  teal:   '#2dd4bf',
  brand:  '#22d3ee',
  text:   '#eef2fc',
  muted:  '#94a8c8',
  dim:    '#526480',
  green:  '#34d399',
  red:    '#f87171',
  amber:  '#fbbf24',
  grad: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
  gradText: {
    background: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  },
  b1: 'rgba(56,189,248,0.15)',
  b2: 'rgba(56,189,248,0.10)',
  b3: 'rgba(56,189,248,0.06)',
}

export default function Home() {
  const [authOpen,   setAuthOpen]   = useState(false)
  const [authTab,    setAuthTab]    = useState<'signin'|'signup'>('signup')
  const [scrolled,   setScrolled]   = useState(false)
  const [activeTab,  setActiveTab]  = useState<'personal'|'business'|'gov'>('personal')
  const { user, loading, refreshUser, signOut } = useAuthStore()
  const router = useRouter()

  // ── FIXED: check session once on mount, no auto-redirect ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        refreshUser()
      } else {
        useAuthStore.getState().setLoading(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshUser()
      } else {
        useAuthStore.getState().setUser(null)
        useAuthStore.getState().setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── NO auto-redirect useEffect ── (removed)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openAuth = (tab: 'signin'|'signup') => { setAuthTab(tab); setAuthOpen(true) }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background: S.black }}>
      <div style={{ width:32, height:32, border:'2px solid rgba(34,211,238,0.2)', borderTopColor:'#22d3ee', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
    </div>
  )

  if (user && !user.onboarding_complete) return <OnboardingFlow onComplete={refreshUser} />

  // Signed-in users see a clean go-to-dashboard screen
  if (user) {
    const timedOut = typeof window !== 'undefined' && window.location.search.includes('reason=timeout')
    return (
      <div style={{ minHeight:'100vh', background:S.black, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'40px 24px' }}>
        {timedOut && (
          <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', padding:'10px 20px', borderRadius:8, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', fontSize:'0.82rem', color:'#fbbf24', fontFamily:'DM Mono,monospace', zIndex:100 }}>
            Session expired due to inactivity
          </div>
        )}
        <div style={{ fontSize:'1.4rem', fontWeight:800, marginBottom:32, ...S.gradText }}>FinOrbit</div>
        <div style={{ width:64, height:64, borderRadius:'50%', background:S.grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', fontWeight:800, color:'#020d1a', marginBottom:24 }}>
          {user.first_name?.charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:8, letterSpacing:'-0.02em' }}>
          Welcome back, {user.first_name}
        </h1>
        <p style={{ fontSize:'0.9rem', color:S.muted, marginBottom:32 }}>
          Your Autopilot is active and managing your finances.
        </p>
        <button onClick={() => router.push('/dashboard')}
          style={{ padding:'14px 36px', borderRadius:8, fontSize:'0.9rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:S.grad, color:'#020d1a', border:'none', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 28px rgba(34,211,238,.25)', marginBottom:16 }}>
          Go to Dashboard
        </button>
        <button onClick={async () => { await signOut(); window.location.href = '/' }}
          style={{ fontSize:'0.78rem', color:S.dim, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
          Sign out
        </button>
      </div>
    )
  }


  const btnPrimary: React.CSSProperties = {
    background: S.grad, color: '#020d1a', padding: '15px 36px',
    borderRadius: 6, fontSize: '0.88rem', fontWeight: 800,
    letterSpacing: '0.05em', textTransform: 'uppercase',
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 8px 30px rgba(34,211,238,0.25)',
  }
  const btnGhost: React.CSSProperties = {
    background: 'transparent', color: S.text, padding: '14px 32px',
    borderRadius: 6, fontSize: '0.88rem', fontWeight: 600,
    border: `1px solid rgba(56,189,248,0.2)`, cursor: 'pointer', fontFamily: 'inherit',
  }

  const segmentData = {
    personal: {
      headline: <>Your Personal CFO,<br/><span style={S.gradText}>on autopilot.</span></>,
      desc: "No budgeting. No spreadsheets. No missed payments. FinOrbit handles the complexity so you can focus on living — while your wealth compounds automatically.",
      features: [
        { icon:'💸', title:'Automatic Wealth Building', desc:'Every spare dollar deployed toward your goals — without manual instructions.' },
        { icon:'🎯', title:'Life Goal Engine',          desc:'Buying a house, retiring early, starting a business — FinOrbit builds the path automatically.' },
        { icon:'🧬', title:'Behavioral Adaptation',    desc:"The system learns your habits and works with your psychology, not against it." },
      ],
      metrics: [
        { label:'Net Worth Growth',      val:'+$4,200',         col: S.green   },
        { label:'Investment Returns',    val:'+11.4% YTD',      col: S.cyan    },
        { label:'Bills Paid On Time',    val:'100%',            col: S.green   },
        { label:'Emergency Fund',        val:'6 months funded', col:'#5eead4'  },
        { label:'Manual Decisions Made', val:'0',               col: S.muted   },
        { label:'AI Actions This Month', val:'47 actions',      col: S.cyan    },
      ],
      visTitle: 'Personal Dashboard — Monthly Snapshot',
    },
    business: {
      headline: <>Replace your finance team<br/><span style={S.gradText}>with intelligent infrastructure.</span></>,
      desc: "FinOrbit acts as an AI CFO — managing cash flow, payroll, reinvestment, and strategic borrowing automatically.",
      features: [
        { icon:'📦', title:'Cash Flow Automation',    desc:'Payroll, vendor payments, and receivables managed without manual intervention.' },
        { icon:'📊', title:'Revenue Reinvestment',    desc:'AI allocates profits across growth, reserves, and opportunistic bets based on real-time business health.' },
        { icon:'🏦', title:'Strategic Credit Access', desc:'Draws on credit lines when ROI exceeds cost of capital — turns debt into leverage.' },
      ],
      metrics: [
        { label:'Revenue Processed',    val:'$1.2M',            col: S.cyan   },
        { label:'Cash Flow Efficiency', val:'+23% YoY',         col: S.green  },
        { label:'Payroll Errors',       val:'Zero',             col: S.green  },
        { label:'Capital Deployed',     val:'$340K reinvested', col:'#5eead4' },
        { label:'Finance Team Cost',    val:'Replaced by AI',   col: S.muted  },
        { label:'Credit ROI',           val:'3.8x',             col: S.cyan   },
      ],
      visTitle: 'Business Intelligence — Q3',
    },
    gov: {
      headline: <>The future of<br/><span style={S.gradText}>public financial infrastructure.</span></>,
      desc: "FinOrbit's architecture scales to national-level management — tax allocation, infrastructure investment, and corruption reduction.",
      features: [
        { icon:'🌐', title:'Tax Allocation Automation',    desc:'Optimize capital deployment based on real need, not political cycles.' },
        { icon:'🏗️', title:'Infrastructure Investment AI', desc:'Data-driven project prioritization by economic multiplier and ROI.' },
        { icon:'🔍', title:'Transparency by Design',       desc:'Every dollar tracked and audited — making corruption structurally impossible.' },
      ],
      metrics: [
        { label:'Budget Waste Reduction', val:'Up to 34%',      col: S.cyan   },
        { label:'Infrastructure ROI',     val:'+2.7x avg',      col: S.green  },
        { label:'Real-Time Auditability', val:'100%',           col: S.green  },
        { label:'Debt Cost Optimization', val:'-18% interest',  col:'#5eead4' },
        { label:'Scale',                  val:'Trillion-dollar', col: S.cyan  },
      ],
      visTitle: 'Government Finance Intelligence',
    },
  }

  const seg = segmentData[activeTab]

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />

      {/* ── NAV ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:200,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 60px',
        background: scrolled ? 'rgba(3,7,18,0.97)' : 'linear-gradient(180deg,rgba(3,7,18,.97) 0%,transparent 100%)',
        backdropFilter:'blur(16px)',
        borderBottom: scrolled ? `1px solid ${S.b3}` : '1px solid transparent',
        transition:'all .3s',
      }}>
        <div style={{ fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em', ...S.gradText }}>FinOrbit</div>
        <ul style={{ display:'flex', gap:34, alignItems:'center', listStyle:'none' }}>
          {[['How It Works','#how'],['Features','#features'],['For You','#segments'],['Pricing','#pricing']].map(([label,href]) => (
            <li key={label}><a href={href} style={{ color:S.muted, textDecoration:'none', fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</a></li>
          ))}
        </ul>

        {/* ── FIXED: show Dashboard button when signed in, auth buttons when signed out ── */}
        <div style={{ display:'flex', gap:10 }}>
          {user ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ background: S.grad, color:'#020d1a', padding:'9px 22px', borderRadius:5, fontSize:'0.82rem', fontWeight:800, border:'none', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(34,211,238,0.2)' }}>
                My Dashboard →
              </button>
              <button
                onClick={() => useAuthStore.getState().signOut()}
                style={{ background:'transparent', color:S.muted, padding:'9px 18px', borderRadius:5, fontSize:'0.82rem', fontWeight:600, border:`1px solid ${S.b2}`, cursor:'pointer', fontFamily:'inherit' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth('signin')}
                style={{ background:'transparent', color:S.text, padding:'9px 20px', borderRadius:5, fontSize:'0.82rem', fontWeight:700, border:`1px solid ${S.b1}`, cursor:'pointer', fontFamily:'inherit' }}>
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                style={{ background:S.grad, color:'#020d1a', padding:'9px 22px', borderRadius:5, fontSize:'0.82rem', fontWeight:800, border:'none', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 0 20px rgba(34,211,238,0.2)' }}>
                Get Started →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'140px 40px 80px', position:'relative', overflow:'hidden', background:S.black }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 55% at 50% -5%,rgba(34,211,238,.12) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 80% 85%,rgba(45,212,191,.06) 0%,transparent 55%)', pointerEvents:'none' }}/>

        {[
          { s:380, d:28, c:'rgba(34,211,238,0.08)', rev:false },
          { s:600, d:48, c:'rgba(56,189,248,0.05)', rev:true  },
          { s:860, d:68, c:'rgba(56,189,248,0.04)', rev:false },
          { s:1120,d:88, c:'rgba(45,212,191,0.04)', rev:true  },
        ].map((r,i) => (
          <div key={i} style={{ position:'absolute', width:r.s, height:r.s, borderRadius:'50%', border:`1px solid ${r.c}`, animation:`ring-spin ${r.d}s linear infinite ${r.rev?'reverse':''}`, pointerEvents:'none' }}>
            {i < 2 && <div style={{ position:'absolute', width:6, height:6, borderRadius:'50%', background: i===0 ? S.brand : S.teal, top:-3, left:'50%', transform:'translateX(-50%)', boxShadow:`0 0 12px ${i===0?S.brand:S.teal}` }}/>}
          </div>
        ))}

        <div style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:800, letterSpacing:'-0.04em', marginBottom:28, position:'relative', ...S.gradText }}>FinOrbit</div>

        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(34,211,238,.08)', border:'1px solid rgba(34,211,238,.22)', borderRadius:100, padding:'6px 18px', fontSize:'0.7rem', fontFamily:'DM Mono,monospace', color:S.brand, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:32, position:'relative' }}>
          <span style={{ width:6, height:6, background:S.brand, borderRadius:'50%', animation:'pulse-brand 2s ease infinite' }}/>
          Autonomous Financial OS · Now in Private Beta
        </div>

        <h1 style={{ fontSize:'clamp(3rem,7vw,6.5rem)', fontWeight:800, lineHeight:1, letterSpacing:'-0.04em', maxWidth:900, margin:'0 auto 12px', position:'relative' }}>
          Your money,<br/>
          <span style={{ fontFamily:'Instrument Serif,serif', fontStyle:'italic', fontWeight:400, ...S.gradText }}>on autopilot.</span>
        </h1>

        <p style={{ fontSize:'clamp(1rem,2vw,1.2rem)', color:S.muted, maxWidth:560, lineHeight:1.75, margin:'20px auto 44px', fontWeight:400, position:'relative' }}>
          FinOrbit is the world&apos;s first Autonomous Financial Operating System — an AI engine that receives, allocates, invests, and optimizes every dollar you earn. Continuously. Intelligently. Without lifting a finger.
        </p>

        {/* ── FIXED: hero CTAs also respond to auth state ── */}
        <div style={{ display:'flex', gap:16, alignItems:'center', justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={btnPrimary}>
              Go to My Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => openAuth('signup')} style={btnPrimary}>Start Free Today →</button>
              <a href="#how" style={{ ...btnGhost, textDecoration:'none', display:'inline-block' }}>See How It Works →</a>
            </>
          )}
        </div>

        <div style={{ display:'flex', gap:56, justifyContent:'center', flexWrap:'wrap', marginTop:76, paddingTop:44, borderTop:`1px solid ${S.b3}`, width:'100%', maxWidth:700, position:'relative' }}>
          {[{n:'98%',l:'Autopilot Accuracy'},{n:'3.4x',l:'Avg. Wealth Growth'},{n:'Zero',l:'Manual Budgeting'},{n:'8',l:'AI Modules Active'}].map(s => (
            <div key={s.l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:800, letterSpacing:'-0.03em', ...S.gradText }}>{s.n}</div>
              <div style={{ fontSize:'0.7rem', color:S.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4, fontFamily:'DM Mono,monospace' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <div style={{ padding:'20px 40px 120px', display:'flex', flexDirection:'column', alignItems:'center', background:S.black }}>
        <div style={{ width:'100%', maxWidth:1100, background:S.panel, border:`1px solid ${S.b1}`, borderRadius:18, overflow:'hidden', boxShadow:'0 40px 120px rgba(0,0,0,.7),0 0 80px rgba(34,211,238,.04)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 24px', background:'rgba(56,189,248,.03)', borderBottom:`1px solid ${S.b3}` }}>
            <div style={{ display:'flex', gap:6 }}>
              {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>)}
            </div>
            <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.7rem', color:S.muted }}>finorbit.app — Alex&apos;s Financial OS</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(45,212,191,.1)', border:'1px solid rgba(45,212,191,.25)', borderRadius:100, padding:'4px 13px', fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:'#5eead4' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#2dd4bf', animation:'pulse-brand 1.5s ease infinite' }}/>
              AUTOPILOT ON
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'230px 1fr 260px', minHeight:390 }}>
            <div style={{ borderRight:`1px solid ${S.b3}`, padding:'20px 0' }}>
              {[['⬡','Dashboard',true],['⟳','Cash Flow'],['◈','Investments'],['⟡','Borrowing'],['◎','Opportunities'],['⬦','Risk Shield']].map(([icon,label,active]) => (
                <div key={String(label)} style={{ padding:'10px 22px', fontSize:'0.76rem', color: active ? S.brand : S.muted, display:'flex', alignItems:'center', gap:10, fontWeight:600, background: active ? 'rgba(34,211,238,.06)' : 'transparent', borderLeft: active ? `2px solid ${S.brand}` : '2px solid transparent' }}>
                  <span style={{ width:18, textAlign:'center' }}>{icon}</span>{label}
                </div>
              ))}
              <div style={{ padding:'15px 22px', fontSize:'0.66rem', color:S.dim, fontFamily:'DM Mono,monospace', borderTop:`1px solid ${S.b3}`, marginTop:18 }}>
                <div style={{ marginBottom:4, color:'#2dd4bf' }}>● System Health</div>All engines running
              </div>
            </div>
            <div style={{ padding:'24px 28px' }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:S.dim, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:13 }}>NET WORTH OVERVIEW</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:13, marginBottom:22 }}>
                {[
                  { l:'Net Worth',        v:'$284,940', c:S.gradText,       ch:'↑ +12.4% this quarter' },
                  { l:'Monthly Cash Flow',v:'$6,200',   c:{color:'#5eead4'},ch:'↑ $480 from last month' },
                  { l:'Autopilot Score',  v:'94 / 100', c:{color:S.green},  ch:'↑ +3 pts this week'    },
                ].map(k => (
                  <div key={k.l} style={{ background:'rgba(56,189,248,.04)', border:`1px solid ${S.b3}`, borderRadius:10, padding:'14px 16px' }}>
                    <div style={{ fontSize:'0.66rem', color:S.muted, fontFamily:'DM Mono,monospace', letterSpacing:'0.07em', marginBottom:6, textTransform:'uppercase' }}>{k.l}</div>
                    <div style={{ fontSize:'1.35rem', fontWeight:800, letterSpacing:'-0.03em', ...k.c }}>{k.v}</div>
                    <div style={{ fontSize:'0.66rem', marginTop:3, fontFamily:'DM Mono,monospace', color:S.green }}>{k.ch}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:S.dim, textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:13 }}>CAPITAL ALLOCATION — THIS MONTH</div>
              {[
                { l:'Survival (Bills)',      v:'$1,860 · 30%', w:'30%', col:'linear-gradient(90deg,#c53030,#f87171)' },
                { l:'Stability (Savings)',   v:'$1,240 · 20%', w:'20%', col:'linear-gradient(90deg,#1d4ed8,#60a5fa)' },
                { l:'Growth (Investments)',  v:'$1,860 · 30%', w:'30%', col:'linear-gradient(90deg,#2dd4bf,#5eead4)' },
                { l:'Leverage + Opportunity',v:'$1,240 · 20%', w:'20%', col:`linear-gradient(90deg,${S.cyan},#67e8f9)` },
              ].map(b => (
                <div key={b.l}>
                  <div style={{ fontSize:'0.7rem', color:S.muted, marginBottom:7, display:'flex', justifyContent:'space-between', fontFamily:'DM Mono,monospace' }}>
                    <span>{b.l}</span><span style={{ color:S.text }}>{b.v}</span>
                  </div>
                  <div style={{ height:5, borderRadius:10, background:S.b3, marginBottom:10, overflow:'hidden' }}>
                    <div style={{ width:b.w, height:'100%', borderRadius:10, background:b.col }}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderLeft:`1px solid ${S.b3}`, padding:'22px 16px' }}>
              <div style={{ fontSize:'0.65rem', color:S.muted, fontFamily:'DM Mono,monospace', textTransform:'uppercase', letterSpacing:'0.11em', marginBottom:14 }}>AI Actions Today</div>
              {[
                { i:'📈', bg:'rgba(45,212,191,.1)', a:'Moved $340 to index fund',      s:'2 hrs ago · auto-invested'    },
                { i:'⚡', bg:'rgba(34,211,238,.1)', a:'Auto-paid mortgage & utilities', s:'9:00 AM · $2,140'             },
                { i:'🎯', bg:'rgba(52,211,153,.1)', a:'HYSA opportunity detected',      s:'Switching $4k → 5.1% APY'     },
                { i:'🛡️', bg:'rgba(251,191,36,.1)', a:'Emergency fund target hit',      s:'Reallocating surplus'         },
                { i:'💳', bg:'rgba(45,212,191,.1)', a:'Refinance opportunity found',    s:'Save $189/mo on auto loan'    },
              ].map(f => (
                <div key={f.a} style={{ display:'flex', gap:9, alignItems:'flex-start', padding:'10px 0', borderBottom:`1px solid ${S.b3}` }}>
                  <div style={{ width:26, height:26, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', flexShrink:0, background:f.bg }}>{f.i}</div>
                  <div>
                    <div style={{ fontSize:'0.71rem', color:S.text, lineHeight:1.5 }}>{f.a}</div>
                    <div style={{ fontSize:'0.63rem', color:S.muted, fontFamily:'DM Mono,monospace', marginTop:2 }}>{f.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding:'100px 40px', background:S.deep, borderTop:`1px solid ${S.b3}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>How It Works</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>
            Four steps to <span style={S.gradText}>full financial autonomy</span>
          </h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:64 }}>
            FinOrbit doesn&apos;t give suggestions. It takes action. Here&apos;s the complete loop running in the background, every single day.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:1, background:S.b3, border:`1px solid ${S.b1}`, borderRadius:14, overflow:'hidden' }}>
            {[
              { n:'STEP 01', i:'🔗', t:'Connect Everything',      d:'Link your banks, investments, and credit via secure APIs. FinOrbit builds a complete financial picture in minutes.' },
              { n:'STEP 02', i:'🧠', t:'AI Learns You',            d:'Reinforcement learning models analyze your income, spending, risk tolerance, and goals. Gets smarter daily.' },
              { n:'STEP 03', i:'⚙️', t:'Decide + Execute',         d:'Autonomous AI agents pay bills, allocate capital, invest, and manage debt — context-aware, not rule-based.' },
              { n:'STEP 04', i:'📡', t:'Optimize Continuously',    d:"Every action feeds back into the model. As markets shift and goals evolve, FinOrbit adapts in real time." },
            ].map(s => (
              <div key={s.n} style={{ background:S.panel, padding:'32px 24px' }}>
                <div style={{ fontSize:'0.6rem', fontFamily:'DM Mono,monospace', color:S.dim, letterSpacing:'0.14em', marginBottom:16 }}>{s.n}</div>
                <div style={{ fontSize:'1.6rem', marginBottom:13 }}>{s.i}</div>
                <div style={{ fontSize:'0.93rem', fontWeight:700, marginBottom:8 }}>{s.t}</div>
                <div style={{ fontSize:'0.84rem', color:S.muted, lineHeight:1.7 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:'100px 40px', background:S.deep, borderTop:`1px solid ${S.b3}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>The System</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Eight engines. <span style={S.gradText}>One orbit.</span></h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:64 }}>Every module works together as a unified financial intelligence — not separate tools, but a single living system.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { w:true,  n:'MODULE 01 — CORE BRAIN', bg:'rgba(34,211,238,.1)',  i:'💡', t:'Smart Allocation Engine',  d:'The heart of FinOrbit. Instead of static budgets, every dollar is dynamically allocated across Survival, Stability, Growth, Leverage, and Opportunity. AI adjusts ratios in real time based on income volatility, market conditions, and your current risk posture.', pills:['Dynamic rebalancing','Goal-aware allocation','Risk-adjusted splits','Real-time market sync'] },
              { w:false, n:'MODULE 02',               bg:'rgba(56,189,248,.1)',  i:'💰', t:'Income Engine',            d:'Detects, categorizes, and forecasts all income streams — salary, business revenue, rental, investment returns. Predicts your next payday and income volatility.',                                                                                                   pills:['Plaid + Stripe','AI forecasting'] },
              { w:false, n:'MODULE 03',               bg:'rgba(45,212,191,.1)',  i:'🤖', t:'Autonomous Execution',     d:'AI agents that actually do things — pay bills, move money, invest in portfolios, refinance loans. Context-aware decisions, not rule-based.',                                                                                                                  pills:['Agentic AI','Full autopilot mode'] },
              { w:false, n:'MODULE 04',               bg:'rgba(34,211,238,.1)',  i:'📊', t:'Predictive Intelligence',  d:'Forecasts cash flow gaps, default risk, investment windows, and macro impacts — weeks before they happen.',                                                                                                                                                  pills:['Cash flow forecasting','Risk alerts'] },
              { w:false, n:'MODULE 05',               bg:'rgba(248,113,113,.08)',i:'💳', t:'Smart Borrowing Engine',   d:'Turns debt into a strategic tool. AI decides when and how much to borrow to maximize ROI while minimizing interest cost.',                                                                                                                                  pills:['ROI vs interest calc','Auto refinance'] },
              { w:false, n:'MODULE 06',               bg:'rgba(56,189,248,.1)',  i:'📈', t:'Investment Autopilot',     d:'Allocates across stocks, real estate, crypto, and business. Auto-rebalances and tax-optimizes. Factors in major life decisions.',                                                                                                                          pills:['Multi-asset','Tax-loss harvesting'] },
              { w:false, n:'MODULE 07',               bg:'rgba(45,212,191,.1)',  i:'🧠', t:'Behavioral Layer',         d:'Learns your spending psychology and adapts. If you overspend, the system tightens discretionary flow automatically.',                                                                                                                                       pills:['Habit modeling','Behavioral nudges'] },
              { w:false, n:'MODULE 08',               bg:'rgba(248,113,113,.08)',i:'🛡️', t:'Risk + Protection Layer',  d:'Fraud detection via anomaly models, automated emergency fund building, insurance gap analysis, and economic stress-testing.',                                                                                                                              pills:['AI fraud detection','Stress testing'] },
            ].map((f) => (
              <div key={f.t} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:13, padding:'28px 24px', gridColumn: f.w ? 'span 2' : undefined, position:'relative', overflow:'hidden' }}>
                <div style={{ fontSize:'0.6rem', fontFamily:'DM Mono,monospace', color:S.dim, letterSpacing:'0.13em', marginBottom:20 }}>{f.n}</div>
                <div style={{ width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', marginBottom:16, background:f.bg }}>{f.i}</div>
                <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:8 }}>{f.t}</div>
                <div style={{ fontSize:'0.85rem', color:S.muted, lineHeight:1.75 }}>{f.d}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:16 }}>
                  {f.pills.map(p => <span key={p} style={{ background:'rgba(34,211,238,.06)', border:'1px solid rgba(34,211,238,.12)', borderRadius:100, padding:'3px 11px', fontSize:'0.66rem', color:S.muted, fontFamily:'DM Mono,monospace' }}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALLOCATION ── */}
      <section style={{ padding:'100px 40px', background:S.deep, borderTop:`1px solid ${S.b3}`, borderBottom:`1px solid ${S.b3}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Capital Intelligence</div>
            <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Every dollar has a <span style={S.gradText}>purpose.</span></h2>
            <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:34 }}>FinOrbit&apos;s allocation model gives each dollar a job based on your real situation — not a one-size-fits-all percentage. The AI continuously adjusts as your life changes.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
              {[
                { c:'#f87171', n:'Survival',             s:'Bills, rent, essentials',         p:'30%' },
                { c:'#60a5fa', n:'Stability',            s:'Emergency fund, savings',          p:'20%' },
                { c:'#2dd4bf', n:'Growth',               s:'Investments, assets',              p:'30%' },
                { c:S.cyan,    n:'Leverage + Opportunity',s:'Strategic debt, high-ROI moves',  p:'20%' },
              ].map(l => (
                <div key={l.n} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 17px', background:S.panel, border:`1px solid ${S.b2}`, borderRadius:9 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                    <div style={{ width:9, height:9, borderRadius:'50%', background:l.c, flexShrink:0 }}/>
                    <div>
                      <div style={{ fontSize:'0.82rem', fontWeight:600 }}>{l.n}</div>
                      <div style={{ fontSize:'0.66rem', color:S.muted, fontFamily:'DM Mono,monospace' }}>{l.s}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:'0.93rem', fontWeight:700, color:l.c }}>{l.p}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ width:280, height:280, position:'relative' }}>
              <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="15"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f87171" strokeWidth="15" strokeDasharray="75.4 175.9" strokeDashoffset="0" opacity=".9"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#60a5fa" strokeWidth="15" strokeDasharray="50.3 201" strokeDashoffset="-75.4" opacity=".9"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2dd4bf" strokeWidth="15" strokeDasharray="75.4 175.9" strokeDashoffset="-125.7" opacity=".9"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#38bdf8" strokeWidth="15" strokeDasharray="50.3 201" strokeDashoffset="-201.1" opacity=".9"/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontSize:'1.9rem', fontWeight:800, letterSpacing:'-0.04em', ...S.gradText }}>$6,200</div>
                <div style={{ fontSize:'0.6rem', color:S.muted, fontFamily:'DM Mono,monospace', letterSpacing:'0.11em', textTransform:'uppercase', marginTop:3 }}>Monthly Flow</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCORES ── */}
      <section style={{ padding:'100px 40px', background:S.black }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Financial Autopilot Score™</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Your financial health, <span style={S.gradText}>quantified.</span></h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:64 }}>Three dynamic scores give you a real-time pulse on performance — no spreadsheets required.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {[
              { v:83, c:'#38bdf8', n:'Stability Score', d:'Measures your buffer against financial shocks — emergency fund, debt coverage ratio, and income diversification.', off:42 },
              { v:90, c:'#2dd4bf', n:'Growth Score',    d:'Tracks the velocity and efficiency of your wealth-building — investment returns, asset allocation quality, compounding rate.', off:25 },
              { v:76, c:'#7dd3fc', n:'Risk Score',      d:'Evaluates exposure to market risk, over-leverage, insurance gaps, and behavioral patterns that could create vulnerability.', off:60 },
            ].map(sc => (
              <div key={sc.n} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:13, padding:30, textAlign:'center' }}>
                <div style={{ width:112, height:112, margin:'0 auto 20px', position:'relative' }}>
                  <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="8"/>
                    <circle cx="50" cy="50" r="44" fill="none" stroke={sc.c} strokeWidth="8" strokeDasharray="248.2" strokeDashoffset={sc.off} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ fontSize:'1.65rem', fontWeight:800, color:sc.c }}>{sc.v}</div>
                    <div style={{ fontSize:'0.56rem', fontFamily:'DM Mono,monospace', color:S.muted, textTransform:'uppercase', letterSpacing:'0.1em' }}>/ 100</div>
                  </div>
                </div>
                <div style={{ fontSize:'0.97rem', fontWeight:700, marginBottom:7 }}>{sc.n}</div>
                <div style={{ fontSize:'0.84rem', color:S.muted, lineHeight:1.7 }}>{sc.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEGMENTS ── */}
      <section id="segments" style={{ padding:'100px 40px', background:S.deep, borderTop:`1px solid ${S.b3}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Who It&apos;s For</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Built for <span style={S.gradText}>everyone who moves money.</span></h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85 }}>FinOrbit scales from personal CFO to enterprise financial intelligence — and eventually, government-grade infrastructure.</p>
          <div style={{ display:'flex', gap:4, background:'rgba(56,189,248,.04)', border:`1px solid ${S.b3}`, borderRadius:9, padding:4, width:'fit-content', margin:'44px 0 52px' }}>
            {(['personal','business','gov'] as const).map((tab,i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding:'10px 26px', borderRadius:6, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', border:'none', fontFamily:'inherit', background: activeTab===tab ? S.grad : 'transparent', color: activeTab===tab ? '#020d1a' : S.muted, transition:'all .2s' }}>
                {['Individuals','Businesses','Governments'][i]}
              </button>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:52, alignItems:'start' }}>
            <div>
              <h3 style={{ fontSize:'1.4rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:8, lineHeight:1.3 }}>{seg.headline}</h3>
              <p style={{ color:S.muted, fontSize:'0.83rem', lineHeight:1.75, marginBottom:8 }}>{seg.desc}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:26 }}>
                {seg.features.map(f => (
                  <div key={f.title} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 17px', background:S.panel, border:`1px solid ${S.b2}`, borderRadius:9 }}>
                    <span style={{ fontSize:'1rem', flexShrink:0, marginTop:1 }}>{f.icon}</span>
                    <div style={{ fontSize:'0.8rem', lineHeight:1.6 }}>
                      <strong style={{ display:'block', marginBottom:2, fontSize:'0.82rem' }}>{f.title}</strong>
                      <span style={{ color:S.muted }}>{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:13, padding:24 }}>
              <div style={{ fontSize:'0.65rem', fontFamily:'DM Mono,monospace', color:S.muted, textTransform:'uppercase', letterSpacing:'0.11em', marginBottom:16 }}>{seg.visTitle}</div>
              {seg.metrics.map(m => (
                <div key={m.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1px solid ${S.b3}` }}>
                  <div style={{ fontSize:'0.84rem', color:S.muted }}>{m.label}</div>
                  <div style={{ fontSize:'0.9rem', fontWeight:700, color:m.col }}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding:'100px 40px', background:S.black }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Pricing</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Start free. <span style={S.gradText}>Scale infinitely.</span></h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:64 }}>FinOrbit grows with you — from your first automated savings to managing a $10M portfolio.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {[
              { tier:'Entry',      name:'Launch',        price:'0',      featured:false, desc:'Start your financial autopilot with core automation. No credit card required.',   features:['Bank account connection (1)','Auto-categorization & tracking','Basic AI insights feed','Autopilot Score dashboard','Auto savings rule (1)'], dimmed:['Smart allocation engine','Investment autopilot','Borrowing engine'], cta:'Get Started Free' },
              { tier:'Growth',     name:'Autopilot Pro', price:'29',     featured:true,  desc:'Full financial autonomy. The complete FinOrbit experience.',                       features:['Unlimited bank connections','Full Smart Allocation Engine','Investment Autopilot (multi-asset)','Smart Borrowing Engine','Predictive cash flow forecasting','Behavioral adaptation layer','Risk + Fraud protection','Opportunity Engine access'], dimmed:[], cta:'Start Free Trial' },
              { tier:'Enterprise', name:'AI CFO',        price:'Custom', featured:false, desc:'For businesses, family offices, and institutions.',                                features:['Everything in Autopilot Pro','Business cash flow automation','Payroll + vendor management','Multi-entity support','Custom AI model training','API + integration access','Dedicated success manager','SLA + white-glove onboarding'], dimmed:[], cta:'Talk to Sales' },
            ].map(plan => (
              <div key={plan.name} style={{ background: plan.featured ? 'linear-gradient(145deg,rgba(34,211,238,.06),#112240)' : S.panel, border: plan.featured ? '1px solid rgba(34,211,238,.3)' : `1px solid ${S.b2}`, borderRadius:16, padding:'32px 28px', position:'relative' }}>
                {plan.featured && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:S.grad, color:'#020d1a', fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 14px', borderRadius:100 }}>Most Popular</div>}
                <div style={{ fontSize:'0.66rem', fontFamily:'DM Mono,monospace', color:S.muted, textTransform:'uppercase', letterSpacing:'0.11em', marginBottom:9 }}>{plan.tier}</div>
                <div style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:16 }}>{plan.name}</div>
                <div style={{ fontSize: plan.price==='Custom'?'2rem':'2.7rem', fontWeight:800, letterSpacing:'-0.05em', ...S.gradText, lineHeight:1 }}>
                  {plan.price==='Custom' ? 'Custom' : <>${plan.price}<span style={{ fontSize:'0.82rem', WebkitTextFillColor:S.muted, fontWeight:400 }}>/mo</span></>}
                </div>
                <p style={{ fontSize:'0.84rem', color:S.muted, margin:'13px 0 24px', lineHeight:1.7 }}>{plan.desc}</p>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8, marginBottom:26 }}>
                  {plan.features.map(f => <li key={f} style={{ display:'flex', gap:8, fontSize:'0.84rem', lineHeight:1.5 }}><span style={{ color:'#2dd4bf', flexShrink:0 }}>✓</span>{f}</li>)}
                  {plan.dimmed.map(f => <li key={f} style={{ display:'flex', gap:8, fontSize:'0.84rem', color:S.dim, lineHeight:1.5 }}><span>—</span>{f}</li>)}
                </ul>
                <button onClick={() => openAuth('signup')} style={{ display:'block', width:'100%', padding:12, borderRadius:6, fontSize:'0.8rem', fontWeight:800, letterSpacing:'0.05em', textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit', background: plan.featured ? S.grad : 'transparent', color: plan.featured ? '#020d1a' : S.text, border: plan.featured ? 'none' : `1px solid ${S.b1}` }}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" style={{ padding:'100px 40px', background:S.deep, borderTop:`1px solid ${S.b3}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:'0.67rem', fontFamily:'DM Mono,monospace', color:S.brand, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:14 }}>Roadmap</div>
          <h2 style={{ fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', marginBottom:18, maxWidth:600 }}>Building toward <span style={S.gradText}>full autonomy.</span></h2>
          <p style={{ color:S.muted, fontSize:'1rem', maxWidth:520, lineHeight:1.85, marginBottom:64 }}>Three phases to the complete vision. Start with a focused MVP, expand toward total financial autonomy.</p>
          <div style={{ display:'flex', position:'relative', marginTop:64 }}>
            <div style={{ position:'absolute', top:29, left:0, right:0, height:2, background:'linear-gradient(90deg,#22d3ee,#2dd4bf,transparent)', zIndex:0 }}/>
            {[
              { label:'Version 1 · Now',    name:'Foundation',   active:true,  future:false, items:['Bank connection & sync','AI auto-categorization','Smart auto-savings','Basic AI insights feed','Autopilot Score (v1)'] },
              { label:'Version 2 · Q3 2025',name:'Intelligence', active:false, future:false, items:['Auto bill payments','Smart allocation engine','Investment automation','Predictive forecasting','Behavioral layer'] },
              { label:'Version 3 · Q1 2026',name:'Full Autonomy',active:false, future:true,  items:['Smart borrowing engine','Opportunity engine','Business AI CFO','Government SDK'] },
              { label:'Version 4 · 2027+',  name:'Infrastructure',active:false,future:true,  items:['Government contracts','National debt management','Public capital optimization','Global AFOS platform'] },
            ].map(phase => (
              <div key={phase.name} style={{ flex:1, position:'relative', paddingTop:64 }}>
                <div style={{ position:'absolute', top:21, left:0, width:16, height:16, borderRadius:'50%', border:`2px solid ${phase.future ? S.dim : S.brand}`, background: phase.active ? S.brand : S.black, zIndex:1, boxShadow: phase.active ? '0 0 20px rgba(34,211,238,.5)' : 'none' }}/>
                <div style={{ fontSize:'0.6rem', fontFamily:'DM Mono,monospace', color: phase.future ? S.dim : S.brand, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:6 }}>{phase.label}</div>
                <div style={{ fontSize:'0.93rem', fontWeight:700, marginBottom:10, color: phase.future ? S.muted : S.text }}>{phase.name}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {phase.items.map(item => (
                    <div key={item} style={{ fontSize:'0.74rem', color:S.muted, display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ color:S.dim }}>→</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:'120px 40px', textAlign:'center', background:S.black, position:'relative', overflow:'hidden', borderTop:`1px solid ${S.b3}` }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 80% at 50% 50%,rgba(34,211,238,.05) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <h2 style={{ fontSize:'clamp(2.5rem,5vw,4.5rem)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.05, maxWidth:680, margin:'0 auto 22px', position:'relative' }}>
          Stop managing money.<br/>Let{' '}
          <em style={{ fontFamily:'Instrument Serif,serif', fontStyle:'italic', fontWeight:400, ...S.gradText }}>FinOrbit</em>
          {' '}orbit it.
        </h2>
        <p style={{ color:S.muted, fontSize:'0.98rem', maxWidth:420, margin:'0 auto 42px', lineHeight:1.75, position:'relative' }}>
          Join thousands of early adopters turning their finances into an autonomous system. Limited beta access available now.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', position:'relative' }}>
          {user ? (
            <button onClick={() => router.push('/dashboard')} style={btnPrimary}>Go to My Dashboard →</button>
          ) : (
            <>
              <button onClick={() => openAuth('signup')} style={btnPrimary}>Start Free Today →</button>
              <button onClick={() => openAuth('signin')} style={btnGhost}>Sign In</button>
            </>
          )}
        </div>
        <div style={{ display:'flex', gap:26, justifyContent:'center', alignItems:'center', marginTop:30, flexWrap:'wrap' }}>
          {['Bank-grade encryption','SOC 2 compliant','No credit card required','Cancel anytime'].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.76rem', color:S.muted, fontFamily:'DM Mono,monospace' }}>
              <span style={{ color:'#2dd4bf' }}>✓</span>{item}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:`1px solid ${S.b3}`, padding:'52px 60px 34px', background:S.black }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, marginBottom:40 }}>
          <div>
            <div style={{ fontSize:'1.4rem', fontWeight:800, letterSpacing:'-0.03em', ...S.gradText }}>FinOrbit</div>
            <p style={{ fontSize:'0.8rem', color:S.muted, lineHeight:1.75, marginTop:14, maxWidth:280 }}>The world&apos;s first Autonomous Financial Operating System. AI that receives, allocates, invests, and optimizes — so you don&apos;t have to.</p>
          </div>
          {[
            { title:'Product', links:['How It Works','Features','For Businesses','Pricing','Roadmap'] },
            { title:'Company', links:['About','Blog','Careers','Press','Contact'] },
            { title:'Legal',   links:['Privacy Policy','Terms of Service','Security','Compliance'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:S.text, marginBottom:16, fontFamily:'DM Mono,monospace' }}>{col.title}</div>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9 }}>
                {col.links.map(l => <li key={l}><a href="#" style={{ fontSize:'0.8rem', color:S.muted, textDecoration:'none' }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:24, borderTop:`1px solid ${S.b3}`, fontSize:'0.7rem', color:S.dim, fontFamily:'DM Mono,monospace' }}>
          <span>© 2025 FinOrbit. All rights reserved.</span>
          <span>Autonomous Financial Operating System™</span>
        </div>
      </footer>
    </>
  )
}
