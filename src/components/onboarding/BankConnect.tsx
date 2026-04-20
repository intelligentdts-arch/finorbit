'use client'

import { useState, useCallback } from 'react'
import { usePlaidLink, type PlaidLinkOnSuccessMetadata } from 'react-plaid-link'
import { supabase } from '@/lib/supabase'
import { useFinancialStore } from '@/store/financialStore'

interface BankConnectProps {
  onSuccess: () => void
  onSkip:    () => void
}

const S = {
  grad:  'linear-gradient(135deg,#38bdf8,#2dd4bf)',
  deep:  '#081528',
  panel: '#112240',
  b2:    'rgba(56,189,248,0.10)',
  brand: '#22d3ee',
  muted: '#94a8c8',
  dim:   '#526480',
  green: '#34d399',
}

export default function BankConnect({ onSuccess, onSkip }: BankConnectProps) {
  const [linkToken,  setLinkToken]  = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [status,     setStatus]     = useState('')
  const [connected,  setConnected]  = useState(false)

  const { fetchFinancialData } = useFinancialStore()

  const getLinkToken = async () => {
    setConnecting(true)
    setStatus('Preparing secure connection...')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      const res  = await fetch('/api/plaid/create-link-token', {
        method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json() as { link_token?: string; error?: string }
      if (data.error) throw new Error(data.error)
      setLinkToken(data.link_token ?? null)
      setStatus('Ready to connect')
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setConnecting(false)
    }
  }

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setStatus('Connecting your accounts...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('Not authenticated')
        const institutionName = metadata.institution?.name ?? 'Your Bank'
        const res = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token: publicToken, institution_name: institutionName, institution_id: metadata.institution?.institution_id ?? '' }),
        })
        const data = await res.json() as { error?: string }
        if (data.error) throw new Error(data.error)
        setStatus('Fetching your financial data...')
        await fetchFinancialData()
        setConnected(true)
        setStatus(`${institutionName} connected successfully!`)
        setTimeout(onSuccess, 1500)
      } catch (err: unknown) {
        setStatus(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setConnecting(false)
      }
    },
    [onSuccess, fetchFinancialData],
  )

  const { open, ready } = usePlaidLink({
    token: linkToken, onSuccess: onPlaidSuccess,
    onExit: () => { setConnecting(false); setStatus('') },
  })

  if (linkToken && ready && connecting && !connected) open()

  return (
    <div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Connect your bank
      </h2>
      <p style={{ fontSize: '0.87rem', color: S.muted, lineHeight: 1.7, marginBottom: 24 }}>
        FinOrbit uses bank-level 256-bit encryption via Plaid. We read data only — we never move money without your explicit approval.
      </p>

      {!connecting ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[['🏦','Chase'],['🏛️','Bank of America'],['🌐','Wells Fargo'],['🔌','12,000+ banks']].map(([icon, name]) => (
              <div key={name} style={{ background: S.deep, border: `1px solid ${S.b2}`, borderRadius: 10, padding: '15px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: S.muted }}>{name}</div>
              </div>
            ))}
          </div>

          <button onClick={getLinkToken}
            style={{ width: '100%', padding: '15px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', background: S.grad, color: '#020d1a', fontFamily: 'inherit', marginBottom: 12, boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
            Connect My Bank Securely →
          </button>

          <button onClick={onSkip}
            style={{ width: '100%', padding: '12px', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, border: `1px solid ${S.b2}`, background: 'transparent', color: S.muted, cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip for now — I&apos;ll connect later
          </button>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          {connected
            ? <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
            : <div style={{ width: 48, height: 48, border: '3px solid rgba(34,211,238,0.2)', borderTopColor: S.brand, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}/>
          }
          <p style={{ fontSize: '0.88rem', fontFamily: 'DM Mono,monospace', color: S.muted }}>{status}</p>
          {connected && <p style={{ fontSize: '0.84rem', color: S.green, marginTop: 8 }}>Redirecting...</p>}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '12px', borderRadius: 8, background: 'rgba(34,211,238,0.05)', border: `1px solid ${S.b2}` }}>
        <span>🔒</span>
        <p style={{ fontSize: '0.72rem', fontFamily: 'DM Mono,monospace', color: S.dim }}>
          Your credentials are never stored on FinOrbit servers. Plaid handles all authentication directly with your bank.
        </p>
      </div>
    </div>
  )
}
