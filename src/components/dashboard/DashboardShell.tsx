'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

interface DashboardShellProps {
  title:    string
  children: ReactNode
}

const S = {
  black: '#040c1a', deep: '#081528', panel: '#112240',
  brand: '#22d3ee', teal: '#2dd4bf', cyan: '#38bdf8',
  text: '#eef2fc', muted: '#94a8c8', dim: '#526480', green: '#34d399',
  grad: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
  b2: 'rgba(56,189,248,0.10)', b3: 'rgba(56,189,248,0.06)',
}

const LOGO_STYLE = {
  background: 'linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)',
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
}

const NAV = [
  { icon: 'DB', label: 'Dashboard',     path: '/dashboard'                          },
  { icon: 'CR', label: 'Control Room',  path: '/dashboard/control'                  },
  { icon: 'OP', label: 'Opportunities', path: '/dashboard/opportunities', badge: '3' },
  { icon: 'IN', label: 'Investments',   path: '/dashboard/investments'              },
  { icon: 'BR', label: 'Borrowing',     path: '/dashboard/borrowing'                },
  { icon: 'RS', label: 'Risk Shield',   path: '/dashboard/risk'                     },
  { icon: 'BK', label: 'Accounts',      path: '/dashboard/accounts'                 },
  { icon: 'BK', label: 'Accounts',      path: '/dashboard/accounts'                 },
]

const SETTINGS = [
  { icon: 'AP', label: 'Autopilot Rules', path: '/dashboard/autopilot'     },
  { icon: 'NT', label: 'Notifications',   path: '/dashboard/notifications' },
  { icon: 'ST', label: 'Settings',        path: '/dashboard/settings'      },
]

const TIMEOUT_MS = 30 * 60 * 1000

export default function DashboardShell({ title, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const { user, signOut, refreshUser, loading } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    refreshUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => refreshUser())
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      await supabase.auth.signOut()
      window.location.href = '/?reason=timeout'
    }, TIMEOUT_MS)
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const onUnload = () => supabase.auth.signOut()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  const handleSignOut = async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    await signOut()
    window.location.href = '/'
  }

  const isActive = (p: string) => pathname === p

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: S.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(34,211,238,0.2)', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const navBtn = (item: { icon: string; label: string; path: string; badge?: string }) => (
    <button key={item.path} onClick={() => { router.push(item.path); setSidebarOpen(false) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
        margin: '2px 8px', borderRadius: 8, width: 'calc(100% - 16px)',
        fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left', transition: 'all .15s',
        background: isActive(item.path) ? 'rgba(34,211,238,.08)' : 'transparent',
        color:      isActive(item.path) ? S.brand : S.muted,
        border:     isActive(item.path) ? '1px solid rgba(34,211,238,.12)' : '1px solid transparent',
      }}>
      <span style={{ fontSize: '0.65rem', fontFamily: 'DM Mono,monospace', width: 20, textAlign: 'center', opacity: .7 }}>
        {item.icon}
      </span>
      {item.label}
      {item.badge && (
        <span style={{ marginLeft: 'auto', background: S.brand, color: '#020d1a', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 100 }}>
          {item.badge}
        </span>
      )}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: S.black, display: 'flex' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 49 }}/>
      )}

      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, zIndex: 50, background: S.deep, borderRight: `1px solid ${S.b3}`, display: 'flex', flexDirection: 'column' }}>

        {/* Logo */}
        <button onClick={() => router.push('/')}
          style={{ padding: '22px 22px 18px', fontSize: '1.2rem', fontWeight: 800, border: 'none', borderBottom: `1px solid ${S.b3}`, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', ...LOGO_STYLE }}>
          FinOrbit
        </button>

        {/* Autopilot badge */}
        <div style={{ margin: '8px', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.2)', borderRadius: 8, fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: '#5eead4' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', flexShrink: 0 }}/>
          Autopilot Active
        </div>

        <div style={{ padding: '12px 12px 4px', fontSize: '0.58rem', fontFamily: 'DM Mono,monospace', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Main</div>
        {NAV.map(navBtn)}

        <div style={{ padding: '12px 12px 4px', fontSize: '0.58rem', fontFamily: 'DM Mono,monospace', color: S.dim, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 8 }}>Settings</div>
        {SETTINGS.map(navBtn)}

        <div style={{ marginTop: 'auto', padding: '14px 12px', borderTop: `1px solid ${S.b3}` }}>
          <button onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, width: '100%', cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: S.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#020d1a', flexShrink: 0 }}>
              {user?.first_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div style={{ minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: S.text }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'DM Mono,monospace', color: '#2dd4bf' }}>
                {user?.plan === 'pro' ? 'Autopilot Pro' : 'Launch'} Â· Sign out
              </div>
            </div>
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: 240, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: `1px solid ${S.b3}`, background: 'rgba(4,12,26,.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: 36, height: 36, background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', fontFamily: 'inherit', color: S.muted }}>
              â˜°
            </button>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => router.push('/dashboard/opportunities')}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, background: S.grad, color: '#020d1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              3 Opportunities
            </button>
            <button onClick={handleSignOut}
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, background: S.panel, color: S.muted, border: `1px solid ${S.b2}`, cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign Out
            </button>
          </div>
        </div>

        <div style={{ padding: '28px 32px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
