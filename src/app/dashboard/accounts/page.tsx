"use client"

import { useState, useEffect } from "react"
import { useFinancialStore } from "@/store/financialStore"
import { supabase } from "@/lib/supabase"
import DashboardShell from "@/components/dashboard/DashboardShell"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(n)

const S = {
  panel:"#112240", deep:"#081528", panel2:"#162a4a",
  b1:"rgba(56,189,248,0.15)", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)",
  muted:"#94a8c8", dim:"#526480", green:"#34d399", red:"#f87171",
  cyan:"#38bdf8", teal:"#2dd4bf", brand:"#22d3ee", amber:"#fbbf24",
  grad:"linear-gradient(135deg,#38bdf8,#2dd4bf)",
  gradText:{ background:"linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)", WebkitBackgroundClip:"text" as const, WebkitTextFillColor:"transparent" as const, backgroundClip:"text" as const },
}

const typeIcon: Record<string, string> = {
  depository:"ðŸ¦", credit:"ðŸ’³", investment:"ðŸ“ˆ", loan:"ðŸ“‹", other:"ðŸ”—"
}

const typeLabel: Record<string, string> = {
  depository:"Bank Account", credit:"Credit Card", investment:"Investment", loan:"Loan", other:"Other"
}

interface PlaidHandlerType {
  open: () => void
  destroy: () => void
}

export default function AccountsPage() {
  const [linkToken,    setLinkToken]    = useState<string | null>(null)
  const [connecting,   setConnecting]   = useState(false)
  const [status,       setStatus]       = useState("")
  const [plaidHandler, setPlaidHandler] = useState<PlaidHandlerType | null>(null)
  const { data, fetchFinancialData } = useFinancialStore()

  useEffect(() => { fetchFinancialData() }, [])

  // Load Plaid script
  useEffect(() => {
    if (!document.querySelector('script[src*="plaid"]')) {
      const script = document.createElement("script")
      script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Open Plaid when token is ready
  useEffect(() => {
    if (!linkToken) return
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as any).Plaid) {
        clearInterval(interval)
        const handler = (window as any).Plaid.create({
          token: linkToken,
          onSuccess: async (publicToken: string) => {
            setStatus("Connecting your account...")
            try {
              const { data: { session } } = await supabase.auth.getSession()
              if (!session) return
              await fetch("/api/plaid/exchange-token", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ public_token: publicToken, institution_name: "New Account", institution_id: "" }),
              })
              setStatus("Account connected!")
              await fetchFinancialData()
              setTimeout(() => setStatus(""), 3000)
            } catch {
              setStatus("Connection failed. Please try again.")
            }
            setConnecting(false)
          },
          onExit: () => { setConnecting(false); setStatus("") },
        })
        setPlaidHandler(handler)
        handler.open()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [linkToken])

  const handleAddAccount = async () => {
    setConnecting(true)
    setStatus("Preparing secure connection...")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      const res  = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json() as { link_token?: string; error?: string }
      if (json.error) throw new Error(json.error)
      setLinkToken(json.link_token ?? null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      setStatus(`Error: ${msg}`)
      setConnecting(false)
    }
  }

  const accounts    = data?.accounts ?? []
  const totalAssets = accounts.filter(a => !["credit","loan"].includes(a.type)).reduce((s,a) => s+(a.balances.current??0), 0)
  const totalDebt   = accounts.filter(a =>  ["credit","loan"].includes(a.type)).reduce((s,a) => s+(a.balances.current??0), 0)
  const netWorth    = totalAssets - totalDebt

  // Group accounts by type
  const grouped: Record<string, typeof accounts> = {}
  accounts.forEach(acc => {
    if (!grouped[acc.type]) grouped[acc.type] = []
    grouped[acc.type].push(acc)
  })

  return (
    <DashboardShell title="Accounts">

      {/* Summary strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Accounts", value:accounts.length.toString(),    color:S.cyan,   accent:S.cyan   },
          { label:"Total Assets",   value:fmt(totalAssets),              color:"#5eead4", accent:"#5eead4" },
          { label:"Total Debt",     value:fmt(totalDebt),                color:S.red,    accent:S.red    },
          { label:"Net Worth",      value:fmt(netWorth),                 color:undefined, accent:S.cyan,  gradText:true },
        ].map(k => (
          <div key={k.label} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${k.accent},transparent)`, opacity:.7 }}/>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-0.03em", ...(k.gradText ? S.gradText : { color:k.color }) }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:20 }}>

        {/* Left â€” account list */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Add account button */}
          <div style={{ background:S.panel, border:`1px solid ${S.b1}`, borderRadius:14, padding:22, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:4 }}>Connect a new account</div>
              <div style={{ fontSize:"0.82rem", color:S.muted }}>Add any bank, credit card, investment, or loan account via Plaid</div>
            </div>
            <button onClick={handleAddAccount} disabled={connecting}
              style={{ padding:"11px 22px", borderRadius:8, fontSize:"0.82rem", fontWeight:800, background:S.grad, color:"#020d1a", border:"none", cursor:"pointer", fontFamily:"inherit", flexShrink:0, marginLeft:16, opacity: connecting ? .6 : 1, boxShadow:"0 4px 20px rgba(34,211,238,.2)" }}>
              {connecting ? "Connecting..." : "+ Add Account"}
            </button>
          </div>

          {status && (
            <div style={{ padding:"12px 16px", borderRadius:8, background:"rgba(34,211,238,.08)", border:"1px solid rgba(34,211,238,.2)", fontSize:"0.82rem", fontFamily:"DM Mono,monospace", color:S.brand }}>
              {status}
            </div>
          )}

          {/* Grouped accounts */}
          {accounts.length === 0 ? (
            <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:40, textAlign:"center" }}>
              <div style={{ fontSize:"2.5rem", marginBottom:14 }}>ðŸ¦</div>
              <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:8 }}>No accounts connected yet</div>
              <div style={{ fontSize:"0.84rem", color:S.muted, marginBottom:20 }}>Connect your bank, credit cards, and investment accounts to see everything in one place.</div>
              <button onClick={handleAddAccount} disabled={connecting}
                style={{ padding:"12px 28px", borderRadius:8, fontSize:"0.85rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.04em", background:S.grad, color:"#020d1a", border:"none", cursor:"pointer", fontFamily:"inherit" }}>
                Connect Your First Account
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([type, accs]) => (
              <div key={type} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <span style={{ fontSize:"1.2rem" }}>{typeIcon[type] ?? "ðŸ”—"}</span>
                  <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em" }}>
                    {typeLabel[type] ?? type} Â· {accs.length} account{accs.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {accs.map(acc => {
                    const isDebt    = ["credit","loan"].includes(acc.type)
                    const balance   = acc.balances.current ?? 0
                    const available = acc.balances.available
                    return (
                      <div key={acc.account_id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:S.deep, border:`1px solid ${S.b3}`, borderRadius:10 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"0.88rem", fontWeight:700, marginBottom:3 }}>{acc.name}</div>
                          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                            <span style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.dim }}>{acc.institution_name}</span>
                            <span style={{ fontSize:"0.62rem", fontFamily:"DM Mono,monospace", padding:"2px 8px", borderRadius:100, background:S.b3, color:S.muted }}>{acc.subtype}</span>
                          </div>
                          {available !== null && available !== undefined && !isDebt && (
                            <div style={{ fontSize:"0.72rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:4 }}>
                              {fmt(available)} available
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                          <div style={{ fontSize:"1.1rem", fontWeight:800, color: isDebt ? S.red : "#5eead4" }}>
                            {isDebt ? "-" : ""}{fmt(balance)}
                          </div>
                          <div style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:2 }}>
                            {isDebt ? "balance owed" : "current balance"}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right â€” supported institutions + tips */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Supported Account Types</div>
            {[
              { icon:"ðŸ¦", label:"Checking & Savings",    desc:"All major banks" },
              { icon:"ðŸ’³", label:"Credit Cards",           desc:"Visa, Mastercard, Amex" },
              { icon:"ðŸ“ˆ", label:"Investment Accounts",    desc:"Brokerage, 401k, IRA" },
              { icon:"ðŸ“‹", label:"Loans",                  desc:"Mortgage, auto, student" },
              { icon:"ðŸ›ï¸", label:"12,000+ institutions",  desc:"Powered by Plaid" },
            ].map(item => (
              <div key={item.label} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${S.b3}` }}>
                <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize:"0.82rem", fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:"0.72rem", color:S.muted, marginTop:2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:14 }}>Security</div>
            {[
              { icon:"ðŸ”’", text:"256-bit bank-level encryption" },
              { icon:"ðŸ‘ï¸", text:"Read-only access â€” we never move money" },
              { icon:"ðŸ›ï¸", text:"Powered by Plaid, trusted by millions" },
              { icon:"ðŸ”„", text:"Data syncs automatically every 24 hours" },
            ].map(item => (
              <div key={item.text} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ fontSize:"0.9rem", flexShrink:0 }}>{item.icon}</span>
                <span style={{ fontSize:"0.78rem", color:S.muted, lineHeight:1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {accounts.length > 0 && (
            <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
              <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:14 }}>Quick Stats</div>
              {Object.entries(grouped).map(([type, accs]) => (
                <div key={type} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", padding:"6px 0", borderBottom:`1px solid ${S.b3}` }}>
                  <span style={{ color:S.muted }}>{typeLabel[type] ?? type}</span>
                  <span style={{ fontWeight:700 }}>{accs.length} account{accs.length !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}