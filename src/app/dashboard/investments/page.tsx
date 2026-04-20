"use client"
import DashboardShell from "@/components/dashboard/DashboardShell"
import { useFinancialStore } from "@/store/financialStore"

const fmt = (n: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)
const S = { panel:"#112240", deep:"#081528", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)", muted:"#94a8c8", dim:"#526480", green:"#34d399", cyan:"#38bdf8", grad:"linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%)" }

const assets = [
  { icon:"up",  name:"US Equities",        value:48200, change:"+11.4% YTD", color:"#34d399" },
  { icon:"int", name:"Intl Equities",       value:12400, change:"+6.2% YTD",  color:"#34d399" },
  { icon:"re",  name:"Real Estate (REITs)", value:8900,  change:"+4.8% YTD",  color:"#34d399" },
  { icon:"bo",  name:"Bonds / Fixed",       value:18600, change:"+1.9% YTD",  color:"#5eead4" },
  { icon:"cr",  name:"Crypto",              value:3200,  change:"+34% YTD",   color:"#34d399" },
  { icon:"ca",  name:"Cash / HYSA",         value:14800, change:"5.1% APY",   color:"#5eead4" },
]
const total = assets.reduce((s,a) => s+a.value, 0)

export default function InvestmentsPage() {
  const { data } = useFinancialStore()
  const investAccounts = data?.accounts.filter(a => a.type === "investment") ?? []

  return (
    <DashboardShell title="Investments">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Portfolio",  value:fmt(total),   color:"#38bdf8", accent:"#38bdf8" },
          { label:"YTD Return",       value:"+9.8%",      color:"#34d399", accent:"#34d399" },
          { label:"vs S&P 500",       value:"+1.4%",      color:"#5eead4", accent:"#5eead4" },
        ].map(k => (
          <div key={k.label} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${k.accent},transparent)`, opacity:.7 }}/>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:"1.8rem", fontWeight:800, letterSpacing:"-0.03em", color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>Asset Allocation</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {assets.map(asset => (
              <div key={asset.name} style={{ background:S.deep, border:`1px solid ${S.b3}`, borderRadius:10, padding:"14px 16px" }}>
                <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.dim, marginBottom:6 }}>{asset.icon.toUpperCase()}</div>
                <div style={{ fontSize:"0.78rem", fontWeight:600, marginBottom:4, color:"#eef2fc" }}>{asset.name}</div>
                <div style={{ fontSize:"1rem", fontWeight:800, letterSpacing:"-0.02em", marginBottom:3 }}>{fmt(asset.value)}</div>
                <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:asset.color }}>{asset.change}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>Portfolio Summary</div>
            <div style={{ fontSize:"2.2rem", fontWeight:800, letterSpacing:"-0.04em", marginBottom:4, background:S.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{fmt(total)}</div>
            <div style={{ fontSize:"0.82rem", color:S.muted, marginBottom:18 }}>Across all asset classes</div>
            {[{l:"YTD Return",v:"+9.8%",c:"#34d399"},{l:"vs S&P 500",v:"+1.4%",c:"#34d399"},{l:"Next rebalance",v:"In 7 days",c:"#eef2fc"},{l:"Next DCA",v:"1st of month",c:"#eef2fc"}].map(m => (
              <div key={m.l} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", padding:"6px 0", borderBottom:`1px solid ${S.b3}` }}>
                <span style={{ color:S.muted }}>{m.l}</span>
                <span style={{ fontWeight:700, color:m.c }}>{m.v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
            <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:16 }}>AI Portfolio Actions</div>
            {[
              { title:"Rebalancing scheduled",                   desc:"Equities overweight by 3% - auto-rebalance in 7 days",   color:"#eef2fc" },
              { title:"Tax-loss harvesting opportunity detected", desc:"Could save $200-400 this tax year - executing next week", color:"#34d399" },
              { title:"DCA automation active",                    desc:"$340/month auto-investing into index funds",              color:"#eef2fc" },
            ].map((a,i) => (
              <div key={i} style={{ padding:"10px 12px", borderRadius:8, background:"rgba(56,189,248,0.04)", border:`1px solid ${S.b3}`, marginBottom:8 }}>
                <div style={{ fontSize:"0.82rem", fontWeight:600, color:a.color, marginBottom:2 }}>{a.title}</div>
                <div style={{ fontSize:"0.74rem", color:S.muted }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {investAccounts.length > 0 && (
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>Connected Investment Accounts</div>
          {investAccounts.map(acc => (
            <div key={acc.account_id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:S.deep, border:`1px solid ${S.b3}`, borderRadius:8, marginBottom:8 }}>
              <div>
                <div style={{ fontSize:"0.85rem", fontWeight:600 }}>{acc.name}</div>
                <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:2 }}>{acc.institution_name}</div>
              </div>
              <div style={{ fontSize:"1rem", fontWeight:800, color:"#5eead4" }}>{fmt(acc.balances.current ?? 0)}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}