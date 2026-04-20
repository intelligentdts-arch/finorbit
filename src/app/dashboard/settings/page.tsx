"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { supabase } from "@/lib/supabase"
import DashboardShell from "@/components/dashboard/DashboardShell"

const S = {
  panel:"#112240", deep:"#081528",
  b1:"rgba(56,189,248,0.15)", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)",
  muted:"#94a8c8", dim:"#526480", green:"#34d399", red:"#f87171", brand:"#22d3ee",
  grad:"linear-gradient(135deg,#38bdf8,#2dd4bf)",
  gradText:{ background:"linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)", WebkitBackgroundClip:"text" as const, WebkitTextFillColor:"transparent" as const, backgroundClip:"text" as const },
}

export default function SettingsPage() {
  const [upgrading,      setUpgrading]      = useState(false)
  const [managingBilling,setManagingBilling] = useState(false)
  const { user } = useAuthStore()
  const isPro = user?.plan === "pro"

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/stripe/checkout", { method:"POST", headers:{ Authorization:`Bearer ${session.access_token}` } })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) { console.error(err) }
    setUpgrading(false)
  }

  const handleManageBilling = async () => {
    setManagingBilling(true)
    try {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/stripe/portal", { method:"POST", headers:{ Authorization:`Bearer ${session.access_token}` } })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) { console.error(err) }
    setManagingBilling(false)
  }

  return (
    <DashboardShell title="Settings & Billing">
      <div style={{ maxWidth:640, display:"flex", flexDirection:"column", gap:20 }}>

        {/* Profile */}
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:24 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:20 }}>Profile</div>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:S.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", fontWeight:800, color:"#020d1a", flexShrink:0 }}>
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:"1.1rem", fontWeight:700 }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize:"0.82rem", color:S.muted, marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Risk Profile", value: user?.risk_profile ? user.risk_profile.charAt(0).toUpperCase()+user.risk_profile.slice(1) : "Balanced" },
              { label:"Plan",         value: isPro ? "Autopilot Pro" : "Launch (Free)" },
              { label:"Autopilot",    value: "Active", highlight:true },
              { label:"Member since", value: new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"}) },
            ].map(item => (
              <div key={item.label} style={{ padding:"12px 14px", borderRadius:8, background:S.deep, border:`1px solid ${S.b3}` }}>
                <div style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", color:S.dim, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.1em" }}>{item.label}</div>
                <div style={{ fontSize:"0.88rem", fontWeight:600, color: item.highlight ? S.green : "#eef2fc" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing */}
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:24 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:20 }}>Billing & Plan</div>

          {isPro ? (
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <span style={{ padding:"4px 14px", borderRadius:100, fontSize:"0.78rem", fontWeight:700, background:S.grad, color:"#020d1a" }}>Autopilot Pro</span>
                <span style={{ fontSize:"0.82rem", color:S.green }}>Active</span>
              </div>
              <p style={{ fontSize:"0.84rem", color:S.muted, lineHeight:1.65, marginBottom:18 }}>
                You have full access to all FinOrbit features including unlimited bank connections, investment autopilot, smart borrowing engine, and AI CFO chat.
              </p>
              <button onClick={handleManageBilling} disabled={managingBilling}
                style={{ padding:"11px 22px", borderRadius:8, fontSize:"0.82rem", fontWeight:700, border:`1px solid ${S.b2}`, color:"#eef2fc", background:"transparent", cursor:"pointer", fontFamily:"inherit", opacity: managingBilling ? .6 : 1 }}>
                {managingBilling ? "Opening portal..." : "Manage Billing & Subscription"}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ padding:20, borderRadius:10, background:"rgba(34,211,238,.05)", border:"1px solid rgba(34,211,238,.15)", marginBottom:18 }}>
                <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:6 }}>Upgrade to Autopilot Pro</div>
                <div style={{ fontSize:"0.84rem", color:S.muted, marginBottom:16, lineHeight:1.65 }}>
                  Get full AI autonomy - smart allocation, investment autopilot, borrowing engine, and unlimited AI CFO chat.
                </div>
                <div style={{ fontSize:"2rem", fontWeight:800, ...S.gradText, marginBottom:4 }}>
                  $29<span style={{ fontSize:"0.9rem", fontWeight:400, WebkitTextFillColor:S.muted }}>/month</span>
                </div>
                <div style={{ fontSize:"0.72rem", fontFamily:"DM Mono,monospace", color:S.dim, marginBottom:18 }}>14-day free trial - Cancel anytime</div>
                <button onClick={handleUpgrade} disabled={upgrading}
                  style={{ width:"100%", padding:"13px", borderRadius:8, fontSize:"0.85rem", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.04em", border:"none", cursor:"pointer", background:S.grad, color:"#020d1a", fontFamily:"inherit", opacity: upgrading ? .6 : 1, boxShadow:"0 8px 28px rgba(34,211,238,.25)" }}>
                  {upgrading ? "Redirecting to checkout..." : "Start 14-Day Free Trial"}
                </button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {["Unlimited bank connections","Smart Allocation Engine","Investment Autopilot","AI CFO Chat","Smart Borrowing Engine","Opportunity Engine"].map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:"0.78rem", color:S.muted }}>
                    <span style={{ color:"#2dd4bf", flexShrink:0 }}>+</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div style={{ background:S.panel, border:"1px solid rgba(248,113,113,0.15)", borderRadius:14, padding:24 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.dim, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Account</div>
          <div style={{ fontSize:"0.84rem", color:S.muted, marginBottom:14 }}>Signing out will end your current session.</div>
          <button
            onClick={() => useAuthStore.getState().signOut().then(() => { window.location.href = "/" })}
            style={{ padding:"10px 20px", borderRadius:8, fontSize:"0.82rem", fontWeight:700, border:"1px solid rgba(248,113,113,.25)", color:S.red, background:"transparent", cursor:"pointer", fontFamily:"inherit" }}>
            Sign Out
          </button>
        </div>

      </div>
    </DashboardShell>
  )
}