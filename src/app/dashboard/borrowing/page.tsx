"use client"
import DashboardShell from "@/components/dashboard/DashboardShell"

const fmt = (n: number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n)
const S = { panel:"#112240", deep:"#081528", b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)", muted:"#94a8c8", dim:"#526480" }

const debts = [
  { name:"Mortgage",     rate:"6.2% APR", remaining:312000, original:400000, monthly:2140, tag:"Optimal",    tagColor:"#34d399" },
  { name:"Auto Loan",    rate:"5.4% APR", remaining:18400,  original:24000,  monthly:420,  tag:"Refinance",  tagColor:"#22d3ee" },
  { name:"Student Loan", rate:"4.1% APR", remaining:22100,  original:48000,  monthly:340,  tag:"Optimal",    tagColor:"#34d399" },
]
const totalDebt    = debts.reduce((s,d) => s+d.remaining, 0)
const totalMonthly = debts.reduce((s,d) => s+d.monthly,   0)

export default function BorrowingPage() {
  return (
    <DashboardShell title="Borrowing">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[{l:"Total Debt",v:fmt(totalDebt),c:"#f87171",a:"#f87171"},{l:"Monthly Payments",v:fmt(totalMonthly),c:"#fbbf24",a:"#fbbf24"},{l:"Credit Utilization",v:"12%",c:"#34d399",a:"#34d399"},{l:"Credit Score",v:"748",c:"#38bdf8",a:"#38bdf8"}].map(k => (
          <div key={k.l} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${k.a},transparent)`, opacity:.7 }}/>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{k.l}</div>
            <div style={{ fontSize:"1.65rem", fontWeight:800, letterSpacing:"-0.03em", color:k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>AI Borrowing Recommendation</div>
          <div style={{ background:"rgba(34,211,238,0.06)", border:"1px solid rgba(34,211,238,0.15)", borderRadius:10, padding:18, marginBottom:14 }}>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:"#22d3ee", marginBottom:8 }}>ACTIVE OPPORTUNITY</div>
            <div style={{ fontSize:"0.95rem", fontWeight:700, marginBottom:8 }}>Refinance auto loan - potential savings</div>
            <div style={{ fontSize:"0.82rem", color:S.muted, lineHeight:1.65, marginBottom:12 }}>Current rate 5.4% APR can likely be reduced to 3.9% based on your credit score of 748. Estimated savings of $189/month.</div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", padding:"3px 10px", borderRadius:100, background:"rgba(52,211,153,.1)", color:"#34d399", border:"1px solid rgba(52,211,153,.2)" }}>Save $189/mo</span>
              <span style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", padding:"3px 10px", borderRadius:100, background:"rgba(34,211,238,.1)", color:"#22d3ee", border:"1px solid rgba(34,211,238,.2)" }}>Pre-qualified</span>
            </div>
          </div>
          <div style={{ fontSize:"0.72rem", fontFamily:"DM Mono,monospace", color:S.dim }}>AI monitors rate changes weekly automatically.</div>
        </div>

        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:18 }}>Credit Utilization</div>
          <div style={{ fontSize:"2.8rem", fontWeight:800, color:"#34d399", marginBottom:4, letterSpacing:"-0.04em" }}>12%</div>
          <div style={{ fontSize:"0.82rem", color:S.muted, marginBottom:16 }}>Well within optimal 30% threshold</div>
          <div style={{ height:10, borderRadius:5, overflow:"hidden", background:S.b3, marginBottom:16 }}>
            <div style={{ width:"12%", height:"100%", background:"linear-gradient(90deg,#34d399,#2dd4bf)", borderRadius:5 }}/>
          </div>
          {[{l:"Available credit",v:"$21,400"},{l:"Used credit",v:"$2,900"},{l:"Total limit",v:"$24,300"},{l:"Credit score",v:"748"}].map(r => (
            <div key={r.l} style={{ display:"flex", justifyContent:"space-between", fontSize:"0.82rem", padding:"7px 0", borderBottom:`1px solid ${S.b3}` }}>
              <span style={{ color:S.muted }}>{r.l}</span><span style={{ fontWeight:700 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, padding:22 }}>
        <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.muted, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:20 }}>Active Debt Stack</div>
        {debts.map(debt => {
          const pct = Math.round((debt.remaining / debt.original) * 100)
          return (
            <div key={debt.name} style={{ background:S.deep, border:`1px solid ${S.b3}`, borderRadius:10, padding:"16px 18px", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.9rem" }}>{debt.name}</div>
                  <div style={{ fontSize:"0.72rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:2 }}>{debt.rate} - {fmt(debt.monthly)}/mo</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", padding:"3px 10px", borderRadius:100, color:debt.tagColor, background:"rgba(56,189,248,0.06)", border:`1px solid ${debt.tagColor}40` }}>{debt.tag}</span>
                  <span style={{ fontSize:"1.1rem", fontWeight:800 }}>{fmt(debt.remaining)}</span>
                </div>
              </div>
              <div style={{ height:6, borderRadius:3, overflow:"hidden", background:S.b3, marginBottom:8 }}>
                <div style={{ width:`${pct}%`, height:"100%", borderRadius:3, background:"linear-gradient(90deg,#38bdf8,#2dd4bf)" }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.dim }}>
                <span>{fmt(debt.remaining)} remaining ({pct}%)</span><span>{fmt(debt.original)} original</span>
              </div>
            </div>
          )
        })}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", background:"rgba(56,189,248,0.04)", border:`1px solid ${S.b3}`, borderRadius:8 }}>
          <div>
            <div style={{ fontSize:"0.82rem", fontWeight:600 }}>Total debt obligations</div>
            <div style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:2 }}>{fmt(totalMonthly)}/month combined</div>
          </div>
          <div style={{ fontSize:"1.3rem", fontWeight:800, color:"#f87171" }}>{fmt(totalDebt)}</div>
        </div>
      </div>
    </DashboardShell>
  )
}