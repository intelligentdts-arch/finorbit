"use client"
import DashboardShell from "@/components/dashboard/DashboardShell"

const S = { panel:"#112240", deep:"#081528", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)", muted:"#94a8c8", dim:"#526480" }

const risks = [
  { label:"Market Risk",        score:72, color:"#fbbf24", desc:"Moderate equity exposure. Portfolio beta 0.87 - less volatile than S&P 500." },
  { label:"Liquidity Risk",     score:88, color:"#34d399", desc:"Strong liquid reserves. 6-month emergency fund fully funded." },
  { label:"Credit Risk",        score:91, color:"#34d399", desc:"Credit score 748. 12% utilization. All payments current." },
  { label:"Concentration Risk", score:64, color:"#fbbf24", desc:"US equities at 45% of portfolio. Increase international exposure recommended." },
  { label:"Inflation Risk",     score:79, color:"#5eead4", desc:"TIPS and HYSA at 5.1% APY provide moderate inflation hedge." },
  { label:"Insurance Gaps",     score:55, color:"#f87171", desc:"Life insurance coverage may be below 10x income threshold. Review recommended." },
]
const overall = Math.round(risks.reduce((s,r) => s+r.score, 0) / risks.length)

const alerts = [
  { level:"warning", icon:"warn", title:"Insurance gap detected",           desc:"Life insurance coverage appears below recommended 10x income threshold." },
  { level:"info",    icon:"info", title:"Portfolio rebalancing due",         desc:"US equities drifted 3% above target. Auto-rebalance scheduled in 7 days." },
  { level:"success", icon:"ok",   title:"Emergency fund milestone reached",  desc:"6-month emergency fund target fully funded. Surplus flowing to Growth." },
  { level:"info",    icon:"info", title:"Stress test completed",             desc:"2008-scenario: portfolio would decline ~18% vs S&P -38%. Strong result." },
]
const alertStyle: Record<string, { bg: string; border: string; color: string }> = { warning:{bg:"rgba(251,191,36,0.08)",border:"rgba(251,191,36,0.2)",color:"#fbbf24"}, info:{bg:"rgba(34,211,238,0.06)",border:"rgba(34,211,238,0.15)",color:"#22d3ee"}, success:{bg:"rgba(52,211,153,0.08)",border:"rgba(52,211,153,0.2)",color:"#34d399"} }

export default function RiskPage() {
  return (
    <DashboardShell title="Risk Shield">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:20, marginBottom:20 }}>
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:28, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
          <div style={{ width:140, height:140, position:"relative", marginBottom:16 }}>
            <svg viewBox="0 0 120 120" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10"/>
              <circle cx="60" cy="60" r="52" fill="none" stroke="#34d399" strokeWidth="10" strokeDasharray="326.7" strokeDashoffset={326.7*(1-overall/100)} strokeLinecap="round"/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:"2.4rem", fontWeight:800, color:"#34d399" }}>{overall}</div>
              <div style={{ fontSize:"0.6rem", fontFamily:"DM Mono,monospace", color:S.muted }}>/ 100</div>
            </div>
          </div>
          <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:4 }}>Overall Risk Score</div>
          <div style={{ fontSize:"0.8rem", color:S.muted }}>Well protected - minor gaps detected</div>
        </div>

        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>Risk Categories</div>
          {risks.map(cat => (
            <div key={cat.label} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <div>
                  <span style={{ fontSize:"0.82rem", fontWeight:600 }}>{cat.label}</span>
                  <span style={{ fontSize:"0.7rem", color:S.muted, marginLeft:8 }}>{cat.desc}</span>
                </div>
                <span style={{ fontSize:"0.85rem", fontWeight:800, color:cat.color, flexShrink:0, marginLeft:12 }}>{cat.score}</span>
              </div>
              <div style={{ height:5, borderRadius:3, overflow:"hidden", background:S.b3 }}>
                <div style={{ width:`${cat.score}%`, height:"100%", borderRadius:3, background:cat.color, opacity:.8 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
        <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>Active Alerts</div>
        {alerts.map((alert,i) => {
          const st = alertStyle[alert.level]
          return (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", padding:"14px 16px", borderRadius:10, background:st.bg, border:`1px solid ${st.border}`, marginBottom:10 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:st.bg, border:`1px solid ${st.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", fontFamily:"DM Mono,monospace", color:st.color, flexShrink:0, marginRight:12 }}>{alert.icon.slice(0,2).toUpperCase()}</div>
              <div>
                <div style={{ fontSize:"0.85rem", fontWeight:600, color:st.color, marginBottom:3 }}>{alert.title}</div>
                <div style={{ fontSize:"0.78rem", color:S.muted, lineHeight:1.5 }}>{alert.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardShell>
  )
}