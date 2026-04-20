"use client"

import { useState, useRef, useEffect } from "react"
import { useFinancialStore } from "@/store/financialStore"
import { supabase } from "@/lib/supabase"
import DashboardShell from "@/components/dashboard/DashboardShell"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(n)

const S = {
  panel:"#112240", deep:"#081528", panel2:"#162a4a",
  b2:"rgba(56,189,248,0.10)", b3:"rgba(56,189,248,0.06)",
  muted:"#94a8c8", dim:"#526480", green:"#34d399",
  cyan:"#38bdf8", teal:"#2dd4bf", brand:"#22d3ee",
  grad:"linear-gradient(135deg,#38bdf8,#2dd4bf)",
}

interface Message { role: "user" | "assistant"; content: string; time: string }

const opportunities = [
  { priority:"high", title:"Refinance auto loan - save on monthly payments",           roi:"High impact", roiColor:"#34d399", roiBg:"rgba(52,211,153,.12)",  desc:"Current auto loan rates have dropped. Based on your credit profile, you may qualify for a significantly lower rate.",                                      tags:["Borrowing","Zero Risk","High Priority"] },
  { priority:"high", title:"Move idle cash to high-yield savings",                     roi:"Instant ROI", roiColor:"#34d399", roiBg:"rgba(52,211,153,.12)",  desc:"Cash sitting in checking earning near 0%. High-yield savings accounts are currently offering 4.5-5.1% APY. Zero-risk move.",                             tags:["Savings","Instant ROI"] },
  { priority:"med",  title:"Review and cancel unused subscriptions",                   roi:"+$40-80/mo",  roiColor:"#fbbf24", roiBg:"rgba(251,191,36,.10)",  desc:"AI detected recurring charges with low or no usage in the past 60 days. Canceling frees up meaningful monthly cash flow.",                              tags:["Spending","Quick Win"] },
  { priority:"low",  title:"Increase retirement contribution for full employer match",  roi:"Tax optimized",roiColor:"#22d3ee",roiBg:"rgba(34,211,238,.10)", desc:"If not contributing enough to capture your full employer match, you are leaving free money on the table. Net impact is smaller than expected after tax.", tags:["Retirement","Tax Saving"] },
]

const borderColors: Record<string, string> = { high:"#34d399", med:"#fbbf24", low:"#22d3ee" }

export default function OpportunitiesPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role:"assistant", content:"Hey! I have analyzed your connected accounts and found several opportunities to improve your financial position. What would you like to explore first?", time:"Just now" }
  ])
  const [input,       setInput]       = useState("")
  const [sending,     setSending]     = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data } = useFinancialStore()

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }) }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || sending) return
    setInput("")
    setSending(true)

    const userMsg: Message = { role:"user", content:msg, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }
    setMessages(prev => [...prev, userMsg])
    const newHistory = [...chatHistory, { role:"user", content:msg }]
    setChatHistory(newHistory)

    try {
      const { data:{ session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")
      const res = await fetch("/api/ai/chat", {
        method:"POST",
        headers:{ Authorization:`Bearer ${session.access_token}`, "Content-Type":"application/json" },
        body:JSON.stringify({ messages:newHistory }),
      })
      const result = await res.json()
      if (result.error) throw new Error(result.error)
      const aiMsg: Message = { role:"assistant", content:result.reply, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }
      setMessages(prev => [...prev, aiMsg])
      setChatHistory(prev => [...prev, { role:"assistant", content:result.reply }])
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Sorry, I ran into an issue. Please try again.", time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }])
    }
    setSending(false)
  }

  const quickPrompts = [
    "What should I prioritize this month?",
    data?.connected ? `How is my ${fmt(data.net_worth)} net worth tracking?` : "How do I improve my net worth?",
    "Am I on track for my financial goals?",
    "What is my biggest financial risk?",
  ]

  return (
    <DashboardShell title="Opportunities & AI CFO">
      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:24, height:"calc(100vh - 140px)" }}>

        {/* Opportunities list */}
        <div style={{ overflowY:"auto", display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", color:S.dim, marginBottom:4 }}>
            AI-Identified Opportunities - {data?.connected ? "Based on your real accounts" : "Connect bank for personalized opportunities"}
          </div>
          {opportunities.map((opp,i) => (
            <div key={i} style={{ background:S.panel, border:`1px solid ${S.b2}`, borderLeft:`3px solid ${borderColors[opp.priority]}`, borderRadius:14, padding:22, cursor:"pointer", transition:"transform .15s" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                <h3 style={{ fontSize:"0.9rem", fontWeight:700, lineHeight:1.4, paddingRight:16 }}>{opp.title}</h3>
                <span style={{ fontSize:"0.7rem", fontFamily:"DM Mono,monospace", padding:"3px 10px", borderRadius:100, color:opp.roiColor, background:opp.roiBg, border:`1px solid ${opp.roiColor}30`, flexShrink:0 }}>
                  {opp.roi}
                </span>
              </div>
              <p style={{ fontSize:"0.82rem", color:S.muted, lineHeight:1.65, marginBottom:14 }}>{opp.desc}</p>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {opp.tags.map(tag => (
                    <span key={tag} style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", padding:"2px 9px", borderRadius:100, background:S.b3, color:S.dim }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button onClick={() => sendMessage(`Tell me more about: ${opp.title}`)}
                  style={{ fontSize:"0.78rem", fontWeight:700, color:S.brand, background:"none", border:"none", cursor:"pointer", flexShrink:0, marginLeft:16 }}>
                  Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Chat */}
        <div style={{ background:S.panel, border:`1px solid ${S.b2}`, borderRadius:14, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Chat header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 18px", borderBottom:`1px solid ${S.b3}`, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:S.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", fontWeight:800, color:"#020d1a", flexShrink:0 }}>AI</div>
            <div>
              <div style={{ fontSize:"0.85rem", fontWeight:700 }}>FinOrbit AI</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.68rem", fontFamily:"DM Mono,monospace", color:S.teal }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:S.teal }}/>
                {data?.connected ? `Analyzing your ${fmt(data.net_worth)} portfolio` : "Online - connect bank for real insights"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:14 }}>
            {messages.map((msg,i) => (
              <div key={i} style={{ display:"flex", justifyContent: msg.role==="user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth:"85%" }}>
                  <div style={{ padding:"10px 14px", borderRadius:12, fontSize:"0.84rem", lineHeight:1.55,
                    ...(msg.role==="user"
                      ? { background:"linear-gradient(135deg,rgba(34,211,238,.18),rgba(45,212,191,.15))", border:`1px solid rgba(34,211,238,.2)`, borderBottomRightRadius:3 }
                      : { background:S.panel2, border:`1px solid ${S.b3}`, borderBottomLeftRadius:3 })
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize:"0.65rem", fontFamily:"DM Mono,monospace", color:S.dim, marginTop:4, paddingLeft:4, textAlign: msg.role==="user" ? "right" : "left" }}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"10px 14px", borderRadius:12, background:S.panel2, border:`1px solid ${S.b3}`, display:"flex", gap:4 }}>
                  {[0,1,2].map(j => <div key={j} style={{ width:6, height:6, borderRadius:"50%", background:S.muted, animation:`bounce .8s ${j*.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          {/* Quick prompts */}
          <div style={{ padding:"10px 18px", display:"flex", flexWrap:"wrap", gap:6, borderTop:`1px solid ${S.b3}`, flexShrink:0 }}>
            {quickPrompts.map(p => (
              <button key={p} onClick={() => sendMessage(p)}
                style={{ fontSize:"0.68rem", fontFamily:"DM Mono,monospace", padding:"4px 10px", borderRadius:100, background:S.b3, border:`1px solid rgba(56,189,248,.1)`, color:S.muted, cursor:"pointer" }}>
                {p.length > 30 ? p.slice(0,30)+"..." : p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:"12px 18px", display:"flex", gap:10, borderTop:`1px solid ${S.b3}`, flexShrink:0 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask your AI CFO anything..."
              rows={1}
              style={{ flex:1, borderRadius:8, padding:"10px 14px", fontSize:"0.84rem", outline:"none", resize:"none", background:S.deep, border:`1px solid ${S.b2}`, color:"#eef2fc", fontFamily:"inherit" }}/>
            <button onClick={() => sendMessage()} disabled={sending || !input.trim()}
              style={{ width:40, height:40, borderRadius:8, background:S.grad, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0, opacity: sending||!input.trim() ? .4 : 1 }}>
              âž¤
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </DashboardShell>
  )
}