"use client"
import { useState } from "react"
import DashboardShell from "@/components/dashboard/DashboardShell"

const S = { panel:"#112240", deep:"#081528", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)", muted:"#94a8c8", dim:"#526480", brand:"#22d3ee", green:"#34d399", grad:"linear-gradient(135deg,#38bdf8,#2dd4bf)" }

const defaultRules = [
  { id:1, name:"Emergency Fund First",        desc:"Always maintain 6-month emergency fund before investing",   active:true,  category:"Stability" },
  { id:2, name:"Pay yourself first",          desc:"Auto-transfer 20% of income to savings on payday",          active:true,  category:"Savings"   },
  { id:3, name:"Round-up investments",        desc:"Round up every purchase and invest the difference",         active:false, category:"Growth"    },
  { id:4, name:"Auto-rebalance quarterly",    desc:"Rebalance portfolio to target allocation every 90 days",    active:true,  category:"Growth"    },
  { id:5, name:"Bill payment protection",     desc:"Reserve bill amounts 5 days before due date automatically", active:true,  category:"Stability" },
  { id:6, name:"Opportunity detection",       desc:"Alert when HYSA rates exceed current account by 0.5%+",    active:true,  category:"Growth"    },
  { id:7, name:"Subscription monitoring",     desc:"Flag recurring charges with zero usage for 30+ days",       active:true,  category:"Spending"  },
  { id:8, name:"Refinance alerts",            desc:"Alert when refinancing would save 0.5%+ on interest rate",  active:false, category:"Borrowing" },
]

const categoryColors: Record<string, string> = { Stability:"#38bdf8", Savings:"#34d399", Growth:"#2dd4bf", Spending:"#fbbf24", Borrowing:"#22d3ee" }

export default function AutopilotPage() {
  const [rules, setRules] = useState(defaultRules)

  const toggle = (id: number) => setRules(prev => prev.map(r => r.id===id ? {...r, active:!r.active} : r))

  return (
    <DashboardShell title="Autopilot Rules">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Active Rules",  value:rules.filter(r=>r.active).length.toString(),  color:"#34d399" },
          { label:"Paused Rules",  value:rules.filter(r=>!r.active).length.toString(), color:"#fbbf24" },
          { label:"AI Actions/mo", value:"47",                                          color:"#38bdf8" },
        ].map(k => (
          <div key={k.label} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:"20px 22px" }}>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:"2rem", fontWeight:800, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em" }}>Automation Rules</div>
          <button style={{ padding:"8px 16px", borderRadius:8, fontSize:"0.78rem", fontWeight:700, background:S.grad, color:"#020d1a", border:"none", cursor:"pointer", fontFamily:"inherit" }}>+ Add Rule</button>
        </div>
        {rules.map(rule => {
          const catColor = categoryColors[rule.category] || S.brand
          return (
            <div key={rule.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:S.deep, border:`1px solid ${S.b3}`, borderRadius:10, marginBottom:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <span style={{ fontSize:"0.85rem", fontWeight:600, color: rule.active ? "#eef2fc" : S.muted }}>{rule.name}</span>
                  <span style={{ fontSize:"0.62rem", fontFamily:"DM Mono,monospace", padding:"2px 8px", borderRadius:100, color:catColor, background:`${catColor}15`, border:`1px solid ${catColor}30` }}>{rule.category}</span>
                </div>
                <div style={{ fontSize:"0.78rem", color:S.muted }}>{rule.desc}</div>
              </div>
              <button
                onClick={() => toggle(rule.id)}
                style={{
                  width:44, height:24, borderRadius:12, border:"none", cursor:"pointer",
                  background: rule.active ? "linear-gradient(135deg,#38bdf8,#2dd4bf)" : "rgba(56,189,248,0.1)",
                  position:"relative", flexShrink:0, marginLeft:16, transition:"all .2s",
                }}>
                <div style={{
                  width:18, height:18, borderRadius:"50%", background:"white",
                  position:"absolute", top:3, transition:"left .2s",
                  left: rule.active ? 22 : 3,
                }}/>
              </button>
            </div>
          )
        })}
      </div>
    </DashboardShell>
  )
}