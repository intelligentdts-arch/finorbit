'use client'

import { useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { supabase } from '@/lib/supabase'
import { useFinancialStore } from '@/store/financialStore'

interface BankConnectProps {
  onSuccess: () => void
  onSkip: () => void
}

export default function BankConnect({ onSuccess, onSkip }: BankConnectProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [status, setStatus] = useState('')
  const [connected, setConnected] = useState(false)
  const { fetchFinancialData } = useFinancialStore()

  const getLinkToken = async () => {
    setConnecting(true)
    setStatus('Preparing secure connection…')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setLinkToken(data.link_token)
      setStatus('Ready to connect')
    } catch (error: any) {
      setStatus(`Error: ${error.message}`)
      setConnecting(false)
    }
  }

  const onPlaidSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setStatus('Connecting your accounts…')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_token: publicToken,
          institution_name: metadata.institution.name,
          institution_id: metadata.institution.institution_id
        })
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setStatus('Fetching your financial data…')
      await fetchFinancialData()
      setConnected(true)
      setStatus(`${metadata.institution.name} connected successfully!`)

      setTimeout(onSuccess, 1500)
    } catch (error: any) {
      setStatus(`Connection failed: ${error.message}`)
      setConnecting(false)
    }
  }, [onSuccess, fetchFinancialData])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {
      setConnecting(false)
      setStatus('')
    }
  })

  // Auto-open Plaid once we have the token
  if (linkToken && ready && connecting && !connected) {
    open()
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-2" style={{ letterSpacing: '-0.02em' }}>
        Connect your bank
      </h2>
      <p className="text-sm mb-6" style={{ color: '#94a8c8', lineHeight: 1.7 }}>
        FinOrbit uses bank-level 256-bit encryption via Plaid — the same technology trusted by Venmo, Robinhood, and Coinbase. We read data only — we never move money without your explicit approval.
      </p>

      {!connecting ? (
        <>
          {/* Bank logos */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { icon: '🏦', name: 'Chase' },
              { icon: '🏛️', name: 'Bank of America' },
              { icon: '🌐', name: 'Wells Fargo' },
              { icon: '💜', name: '12,000+ banks' }
            ].map(bank => (
              <div key={bank.name}
                className="rounded-xl p-4 text-center"
                style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.1)' }}>
                <div className="text-2xl mb-2">{bank.icon}</div>
                <div className="text-sm font-semibold" style={{ color: '#94a8c8' }}>{bank.name}</div>
              </div>
            ))}
          </div>

          <button onClick={getLinkToken}
            className="w-full py-4 rounded-lg font-extrabold text-sm uppercase tracking-wider mb-3 transition-all"
            style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a', boxShadow: '0 8px 28px rgba(34,211,238,0.25)' }}>
            Connect My Bank Securely →
          </button>

          <button onClick={onSkip}
            className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
            style={{ border: '1px solid rgba(56,189,248,0.1)', color: '#94a8c8' }}>
            Skip for now — I'll connect later
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          {connected ? (
            <div className="text-4xl mb-4">✅</div>
          ) : (
            <div className="w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: '#22d3ee' }}></div>
          )}
          <p className="text-sm font-mono" style={{ color: '#94a8c8' }}>{status}</p>
          {connected && (
            <p className="text-sm mt-2" style={{ color: '#34d399' }}>
              Redirecting to your dashboard…
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-5 p-3 rounded-lg"
        style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
        <span className="text-sm">🔒</span>
        <p className="text-xs font-mono" style={{ color: '#526480' }}>
          Your credentials are never stored on FinOrbit servers. Plaid handles all authentication directly with your bank.
        </p>
      </div>
    </div>
  )
}