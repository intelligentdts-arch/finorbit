'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [managingBilling, setManagingBilling] = useState(false)
  const { user } = useAuthStore()

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Upgrade error:', error)
    }
    setUpgrading(false)
  }

  const handleManageBilling = async () => {
    setManagingBilling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      const data = await response.json()
      if (data.url) window.location.href = data.url
    } catch (error) {
      console.error('Portal error:', error)
    }
    setManagingBilling(false)
  }

  const isPro = user?.plan === 'pro'

  return (
    <div className="min-h-screen" style={{ background: '#040c1a' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-60">
        <Topbar title="Settings" onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-6 max-w-2xl space-y-6">

          {/* Profile */}
          <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
              Profile
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-extrabold"
                style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
                {user?.first_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-bold">{user?.first_name} {user?.last_name}</div>
                <div className="text-sm" style={{ color: '#94a8c8' }}>{user?.email}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Risk Profile', value: user?.risk_profile ? user.risk_profile.charAt(0).toUpperCase() + user.risk_profile.slice(1) : 'Balanced' },
                { label: 'Plan', value: isPro ? 'Autopilot Pro ✦' : 'Launch (Free)' },
                { label: 'Autopilot', value: 'Active' },
                { label: 'Member since', value: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg" style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.06)' }}>
                  <div className="text-xs font-mono mb-1" style={{ color: '#526480' }}>{item.label}</div>
                  <div className="font-semibold" style={{ color: item.label === 'Autopilot' ? '#34d399' : '#eef2fc' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing */}
          <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-5" style={{ color: '#94a8c8' }}>
              Billing & Plan
            </div>

            {isPro ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
                    Autopilot Pro ✦
                  </div>
                  <span className="text-sm" style={{ color: '#34d399' }}>Active</span>
                </div>
                <p className="text-sm mb-5" style={{ color: '#94a8c8' }}>
                  You have full access to all FinOrbit features including unlimited bank connections, investment autopilot, smart borrowing engine, and AI CFO chat.
                </p>
                <button onClick={handleManageBilling} disabled={managingBilling}
                  className="px-6 py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  style={{ border: '1px solid rgba(56,189,248,0.2)', color: '#eef2fc', background: 'transparent', cursor: 'pointer' }}>
                  {managingBilling ? 'Opening portal…' : 'Manage Billing & Subscription →'}
                </button>
              </div>
            ) : (
              <div>
                <div className="p-4 rounded-xl mb-5"
                  style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  <div className="text-base font-bold mb-1">Upgrade to Autopilot Pro</div>
                  <div className="text-sm mb-3" style={{ color: '#94a8c8' }}>
                    Get full AI autonomy — smart allocation, investment autopilot, borrowing engine, and unlimited AI CFO chat.
                  </div>
                  <div className="text-2xl font-extrabold mb-1"
                    style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    $29<span className="text-base font-normal" style={{ WebkitTextFillColor: '#94a8c8' }}>/month</span>
                  </div>
                  <div className="text-xs font-mono mb-4" style={{ color: '#526480' }}>14-day free trial · Cancel anytime</div>
                  <button onClick={handleUpgrade} disabled={upgrading}
                    className="w-full py-3 rounded-lg font-extrabold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
                    {upgrading ? 'Redirecting to checkout…' : 'Start 14-Day Free Trial →'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: '#94a8c8' }}>
                  {['Unlimited bank connections', 'Smart Allocation Engine', 'Investment Autopilot', 'AI CFO Chat', 'Smart Borrowing Engine', 'Opportunity Engine'].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span style={{ color: '#2dd4bf' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl p-6" style={{ background: '#112240', border: '1px solid rgba(248,113,113,0.1)' }}>
            <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: '#526480' }}>
              Account
            </div>
            <button onClick={() => useAuthStore.getState().signOut().then(() => window.location.href = '/')}
              className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{ border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', background: 'transparent', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}