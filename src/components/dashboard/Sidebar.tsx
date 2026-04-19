'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navItems = [
  { icon: '⬡', label: 'Dashboard', path: '/dashboard' },
  { icon: '⚙️', label: 'Control Room', path: '/dashboard/control' },
  { icon: '✦', label: 'Opportunities', path: '/dashboard/opportunities', badge: '3' },
  { icon: '📊', label: 'Investments', path: '/dashboard/investments' },
  { icon: '💳', label: 'Borrowing', path: '/dashboard/borrowing' },
  { icon: '🛡️', label: 'Risk Shield', path: '/dashboard/risk' },
]

const settingsItems = [
  { icon: '⚡', label: 'Autopilot Rules', path: '/dashboard/autopilot' },
  { icon: '🔔', label: 'Notifications', path: '/dashboard/notifications' },
  { icon: '⚙️', label: 'Settings & Billing', path: '/dashboard/settings' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`flex flex-col w-60 min-h-screen px-4 py-6 fixed lg:static z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ background: '#081528', borderRight: '1px solid rgba(56,189,248,0.08)' }}
      >
        <div className="text-xl font-extrabold mb-8 px-2"
          style={{ background: 'linear-gradient(135deg,#e0f2fe,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FinOrbit
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => {
            const active = pathname === item.path
            return (
              <Link key={item.path} href={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
                  color: active ? '#22d3ee' : '#94a8c8',
                  border: active ? '1px solid rgba(56,189,248,0.15)' : '1px solid transparent'
                }}>
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="my-3 mx-2" style={{ borderTop: '1px solid rgba(56,189,248,0.08)' }} />

          {settingsItems.map(item => {
            const active = pathname === item.path
            return (
              <Link key={item.path} href={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
                  color: active ? '#22d3ee' : '#94a8c8',
                  border: active ? '1px solid rgba(56,189,248,0.15)' : '1px solid transparent'
                }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}