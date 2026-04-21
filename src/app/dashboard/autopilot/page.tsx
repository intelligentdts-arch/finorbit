'use client'

import { useState } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'

const S = {
  panel: '#112240', deep: '#081528', panel2: '#162a4a',
  b2: 'rgba(56,189,248,0.10)', b3: 'rgba(56,189,248,0.06)',
  muted: '#94a8c8', dim: '#526480', brand: '#22d3ee',
  green: '#34d399', amber: '#fbbf24',
  grad: 'linear-gradient(135deg,#38bdf8,#2dd4bf)',
}

const categoryColors: Record<string, string> = {
  Stability: '#38bdf8', Savings: '#34d399', Growth: '#2dd4bf',
  Spending: '#fbbf24', Borrowing: '#22d3ee', Retirement: '#818cf8',
}

const categories = ['Stability', 'Savings', 'Growth', 'Spending', 'Borrowing', 'Retirement']

const defaultRules = [
  { id: 1, name: 'Emergency Fund First',     desc: 'Always maintain 6-month emergency fund before investing',   active: true,  category: 'Stability'  },
  { id: 2, name: 'Pay yourself first',       desc: 'Auto-transfer 20% of income to savings on payday',          active: true,  category: 'Savings'    },
  { id: 3, name: 'Round-up investments',     desc: 'Round up every purchase and invest the difference',         active: false, category: 'Growth'     },
  { id: 4, name: 'Auto-rebalance quarterly', desc: 'Rebalance portfolio to target allocation every 90 days',    active: true,  category: 'Growth'     },
  { id: 5, name: 'Bill payment protection',  desc: 'Reserve bill amounts 5 days before due date automatically', active: true,  category: 'Stability'  },
  { id: 6, name: 'Opportunity detection',    desc: 'Alert when HYSA rates exceed current account by 0.5%+',    active: true,  category: 'Growth'     },
  { id: 7, name: 'Subscription monitoring',  desc: 'Flag recurring charges with zero usage for 30+ days',       active: true,  category: 'Spending'   },
  { id: 8, name: 'Refinance alerts',         desc: 'Alert when refinancing would save 0.5%+ on interest rate',  active: false, category: 'Borrowing'  },
]

export default function AutopilotPage() {
  const [rules,     setRules]     = useState(defaultRules)
  const [showModal, setShowModal] = useState(false)
  const [newName,   setNewName]   = useState('')
  const [newDesc,   setNewDesc]   = useState('')
  const [newCat,    setNewCat]    = useState('Growth')
  const [error,     setError]     = useState('')

  const toggle = (id: number) =>
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))

  const deleteRule = (id: number) =>
    setRules(prev => prev.filter(r => r.id !== id))

  const addRule = () => {
    if (!newName.trim()) { setError('Rule name is required'); return }
    if (!newDesc.trim()) { setError('Description is required'); return }
    setRules(prev => [...prev, {
      id:       Date.now(),
      name:     newName.trim(),
      desc:     newDesc.trim(),
      category: newCat,
      active:   true,
    }])
    setNewName('')
    setNewDesc('')
    setNewCat('Growth')
    setError('')
    setShowModal(false)
  }

  return (
    <DashboardShell title="Autopilot Rules">

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active Rules',  value: rules.filter(r => r.active).length.toString(),  color: S.green },
          { label: 'Paused Rules',  value: rules.filter(r => !r.active).length.toString(), color: S.amber },
          { label: 'AI Actions/mo', value: '47',                                            color: '#38bdf8' },
        ].map(k => (
          <div key={k.label} style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Rules list */}
      <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '0.7rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Automation Rules</div>
          <button onClick={() => setShowModal(true)}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, background: S.grad, color: '#020d1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            + Add Rule
          </button>
        </div>

        {rules.map(rule => {
          const catColor = categoryColors[rule.category] || S.brand
          return (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: S.deep, border: `1px solid ${S.b3}`, borderRadius: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: rule.active ? '#eef2fc' : S.muted }}>{rule.name}</span>
                  <span style={{ fontSize: '0.62rem', fontFamily: 'DM Mono,monospace', padding: '2px 8px', borderRadius: 100, color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30` }}>
                    {rule.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: S.muted }}>{rule.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Delete button */}
                <button onClick={() => deleteRule(rule.id)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${S.b3}`, background: 'transparent', color: S.dim, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                  x
                </button>
                {/* Toggle */}
                <button onClick={() => toggle(rule.id)}
                  style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'all .2s', background: rule.active ? S.grad : 'rgba(56,189,248,0.1)' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, transition: 'left .2s', left: rule.active ? 22 : 3 }}/>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Rule Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div style={{ background: S.panel, border: `1px solid ${S.b2}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 40px 100px rgba(0,0,0,.5)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Add Automation Rule</div>
              <button onClick={() => setShowModal(false)}
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(56,189,248,0.06)', border: `1px solid ${S.b3}`, color: S.muted, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                x
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', color: '#f87171', fontSize: '0.82rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Rule Name
              </label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Save 10% of every paycheck"
                style={{ width: '100%', background: S.deep, border: `1px solid ${S.b2}`, borderRadius: 8, padding: '12px 14px', fontSize: '0.88rem', color: '#eef2fc', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Describe what this rule does..."
                rows={3}
                style={{ width: '100%', background: S.deep, border: `1px solid ${S.b2}`, borderRadius: 8, padding: '12px 14px', fontSize: '0.88rem', color: '#eef2fc', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'DM Mono,monospace', color: S.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map(cat => {
                  const color = categoryColors[cat]
                  return (
                    <button key={cat} onClick={() => setNewCat(cat)}
                      style={{ padding: '6px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', color: newCat === cat ? '#020d1a' : color, background: newCat === cat ? color : `${color}15`, border: `1px solid ${color}40` }}>
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, background: 'transparent', border: `1px solid ${S.b2}`, color: S.muted, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={addRule}
                style={{ flex: 2, padding: '12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 800, background: S.grad, border: 'none', color: '#020d1a', cursor: 'pointer', fontFamily: 'inherit' }}>
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
