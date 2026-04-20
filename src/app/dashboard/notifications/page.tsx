"use client"
import { useState } from "react"
import DashboardShell from "@/components/dashboard/DashboardShell"

const S = { panel:"#112240", deep:"#081528", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)", muted:"#94a8c8", dim:"#526480", brand:"#22d3ee", green:"#34d399", grad:"linear-gradient(135deg,#38bdf8,#2dd4bf)" }

const notifs = [
  { id:1, type:"action",  icon:"up",  title:"Surplus deployed to Growth bucket",      time:"2 mins ago",  read:false, amount:"+$362",  color:"#34d399" },
  { id:2, type:"alert",   icon:"al",  title:"Upcoming mortgage payment reserved",      time:"1 hr ago",    read:false, amount:"$2,140", color:"#fbbf24" },
  { id:3, type:"opp",     icon:"op",  title:"Refinance opportunity detected",          time:"3 hrs ago",   read:false, amount:"$189/mo",color:"#22d3ee" },
  { id:4, type:"action",  icon:"dca", title:"Monthly DCA executed - index funds",      time:"Yesterday",   read:true,  amount:"$340",   color:"#34d399" },
  { id:5, type:"alert",   icon:"em",  title:"Emergency fund target reached",           time:"2 days ago",  read:true,  amount:"100%",   color:"#5eead4" },
  { id:6, type:"opp",     icon:"hy",  title:"HYSA rate increased to 5.1% APY",        time:"3 days ago",  read:true,  amount:"+0.3%",  color:"#22d3ee" },
  { id:7, type:"action",  icon:"re",  title:"Portfolio rebalancing scheduled",         time:"1 week ago",  read:true,  amount:"Apr 5",  color:"#38bdf8" },
  { id:8, type:"alert",   icon:"su",  title:"Subscription flagged - no usage 30 days", time:"1 week ago", read:true,  amount:"$46/mo", color:"#fbbf24" },
]

const typeLabels: Record<string, string> = { action:"AI Action", alert:"Alert", opp:"Opportunity" }
const typeColors: Record<string, string> = { action:"rgba(52,211,153,.1)", alert:"rgba(251,191,36,.1)", opp:"rgba(34,211,238,.1)" }
const typeBorder: Record<string, string> = { action:"rgba(52,211,153,.2)", alert:"rgba(251,191,36,.2)", opp:"rgba(34,211,238,.2)" }
const typeDot: Record<string, string> = { action:"#34d399", alert:"#fbbf24", opp:"#22d3ee" }

export default function NotificationsPage() {
  const [items, setItems] = useState(notifs)
  const [filter, setFilter] = useState("all")

  const markAllRead = () => setItems(prev => prev.map(n => ({...n, read:true})))
  const markRead = (id: number) => setItems(prev => prev.map(n => n.id===id ? {...n, read:true} : n))

  const unread   = items.filter(n => !n.read).length
  const filtered = filter === "all" ? items : items.filter(n => n.type === filter)

  return (
    <DashboardShell title="Notifications">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Unread",       value:unread.toString(),               color:"#22d3ee" },
          { label:"AI Actions",   value:items.filter(n=>n.type==="action").length.toString(), color:"#34d399" },
          { label:"Opportunities",value:items.filter(n=>n.type==="opp").length.toString(),    color:"#5eead4" },
        ].map(k => (
          <div key={k.label} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:"20px 22px" }}>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{k.label}</div>
            <div style={{ fontSize:"2rem", fontWeight:800, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", gap:4, background:"rgba(56,189,248,.04)", border:`1px solid ${S.b3}`, borderRadius:8, padding:3 }}>
            {["all","action","alert","opp"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"6px 14px", borderRadius:6, fontSize:"0.75rem", fontWeight:700, cursor:"pointer", border:"none", fontFamily:"inherit", transition:"all .2s",
                  background: filter===f ? S.grad : "transparent",
                  color:      filter===f ? "#020d1a" : S.muted }}>
                {f === "all" ? "All" : typeLabels[f]}
              </button>
            ))}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ fontSize:"0.75rem", fontFamily:"DM Mono,monospace", color:S.brand, background:"none", border:"none", cursor:"pointer" }}>
              Mark all read
            </button>
          )}
        </div>

        {filtered.map(n => (
          <div key={n.id}
            onClick={() => markRead(n.id)}
            style={{
              display:"flex", alignItems:"flex-start", justifyContent:"space-between",
              padding:"14px 16px", background: n.read ? S.deep : "rgba(56,189,248,0.04)",
              border:`1px solid ${n.read ? S.b3 : "rgba(56,189,248,0.12)"}`,
              borderRadius:10, marginBottom:8, cursor:"pointer", transition:"all .2s",
            }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", flex:1 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:typeColors[n.type], border:`1px solid ${typeBorder[n.type]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.6rem", fontFamily:"DM Mono,monospace", color:typeDot[n.type], flexShrink:0 }}>
                {n.icon.slice(0,2).toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  {!n.read && <span style={{ width:6, height:6, borderRadius:"50%", background:S.brand, flexShrink:0 }}/>}
                  <span style={{ fontSize:"0.85rem", fontWeight: n.read ? 500 : 700, color: n.read ? S.muted : "#eef2fc" }}>{n.title}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.dim }}>{n.time}</span>
                  <span style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", padding:"2px 8px", borderRadius:100, color:typeDot[n.type], background:typeColors[n.type], border:`1px solid ${typeBorder[n.type]}` }}>{typeLabels[n.type]}</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize:"0.88rem", fontWeight:800, color:n.color, flexShrink:0, marginLeft:16 }}>{n.amount}</div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px 0", color:S.muted, fontSize:"0.88rem" }}>No notifications in this category</div>
        )}
      </div>
    </DashboardShell>
  )
}