'use client'

import { useState, useRef, useEffect } from 'react'
import { useFinancialStore } from '@/store/financialStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

interface Message { role: 'user' | 'assistant'; content: string; time: string }

const opportunities = [
  { priority: 'high', title: 'Refinance auto loan — save on monthly payments', roi: 'High impact', roiStyle: { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }, desc: 'Current auto loan rates have dropped. Based on your credit profile, you may qualify for a significantly lower rate — reducing your monthly payment and total interest paid.', tags: ['Borrowing', 'Zero Risk', 'High Priority'] },
  { priority: 'high', title: 'Move idle cash to high-yield savings', roi: 'Instant ROI', roiStyle: { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }, desc: 'You have cash sitting in a checking account earning near 0%. High-yield savings accounts are currently offering 4.5–5.1% APY. This is a zero-risk move.', tags: ['Savings', 'Instant ROI'] },
  { priority: 'med', title: 'Review and cancel unused subscriptions', roi: '+$40–80/mo', roiStyle: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }, desc: 'AI detected recurring charges that appear to have low or no usage in the past 60 days. Canceling these frees up meaningful monthly cash flow.', tags: ['Spending', 'Quick Win'] },
  { priority: 'low', title: 'Increase retirement contribution to capture full employer match', roi: 'Tax optimized', roiStyle: { background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }, desc: 'If you\'re not contributing enough to capture your full employer match, you\'re leaving free money on the table. The net take-home impact is often smaller than people expect after tax savings.', tags: ['Retirement', 'Tax Saving'] },
]

export default function OpportunitiesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey! I\'ve analyzed your connected accounts and found several opportunities to improve your financial position. What would you like to explore first?', time: 'Just now' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data } = useFinancialStore()
  const { user } = useAuthStore()

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || sending) return

    setInput('')
    setSending(true)

    const userMsg: Message = { role: 'user', content: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])

    const newHistory = [...chatHistory, { role: 'user', content: messageText }]
    setChatHistory(newHistory)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: newHistory })
      })

      const result = await response.json()
      if (result.error) throw new Error(result.error)

      const assistantMsg: Message = {
        role: 'assistant',
        content: result.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, assistantMsg])
      setChatHistory(prev => [...prev, { role: 'assistant', content: result.reply }])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    }

    setSending(false)
  }

  const quickPrompts = [
    'What should I prioritize this month?',
    `How is my ${fmt(data?.net_worth || 0)} net worth tracking?`,
    'Am I on track for my financial goals?',
    'What\'s my biggest financial risk right now?'
  ]

  const borderColors: Record<string, string> = { high: '#34d399', med: '#fbbf24', low: '#22d3ee' }

  return (
    <div className="min-h-screen" style={{ background: '#040c1a' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-60">
        <Topbar title="Opportunities & AI CFO" onMenuClick={() => setSidebarOpen(true)} />

        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* Opportunities list */}
            <div className="xl:col-span-3 space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: '#526480' }}>
                AI-Identified Opportunities · {data?.connected ? 'Based on your real accounts' : 'Connect bank for personalized opportunities'}
              </div>
              {opportunities.map((opp, i) => (
                <div key={i}
                  className="rounded-2xl p-6 cursor-pointer transition-all hover:translate-x-1"
                  style={{
                    background: '#112240',
                    border: '1px solid rgba(56,189,248,0.1)',
                    borderLeft: `3px solid ${borderColors[opp.priority]}`
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold leading-snug pr-4">{opp.title}</h3>
                    <span className="text-xs font-mono px-3 py-1 rounded-full flex-shrink-0" style={opp.roiStyle}>
                      {opp.roi}
                    </span>
                  </div>
                  <p className="text-sm mb-4" style={{ color: '#94a8c8', lineHeight: 1.65 }}>{opp.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {opp.tags.map(tag => (
                        <span key={tag} className="text-xs font-mono px-2 py-1 rounded-full"
                          style={{ background: 'rgba(56,189,248,0.06)', color: '#526480' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => sendMessage(`Tell me more about this opportunity: ${opp.title}`)}
                      className="text-sm font-bold transition-opacity hover:opacity-70 flex-shrink-0 ml-4"
                      style={{ color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Ask AI →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Chat */}
            <div className="xl:col-span-2 flex flex-col rounded-2xl overflow-hidden"
              style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)', height: '680px' }}>

              {/* Chat header */}
              <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid rgba(56,189,248,0.06)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)' }}>
                  🤖
                </div>
                <div>
                  <div className="text-sm font-bold">FinOrbit AI</div>
                  <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: '#2dd4bf' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"/>
                    {data?.connected ? `Analyzing your ${fmt(data.net_worth)} portfolio` : 'Online · Connect bank for real insights'}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(56,189,248,0.1) transparent' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs">
                      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                        style={msg.role === 'user'
                          ? { background: 'linear-gradient(135deg,rgba(34,211,238,0.18),rgba(45,212,191,0.15))', border: '1px solid rgba(34,211,238,0.2)', borderBottomRightRadius: 4 }
                          : { background: '#162a4a', border: '1px solid rgba(56,189,248,0.1)', borderBottomLeftRadius: 4 }
                        }>
                        {msg.content}
                      </div>
                      <div className="text-xs font-mono mt-1 px-1"
                        style={{ color: '#526480', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl" style={{ background: '#162a4a', border: '1px solid rgba(56,189,248,0.1)', borderBottomLeftRadius: 4 }}>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                            style={{ background: '#94a8c8', animationDelay: `${i * 0.2}s` }}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Quick prompts */}
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickPrompts.map(prompt => (
                  <button key={prompt} onClick={() => sendMessage(prompt)}
                    className="text-xs font-mono px-3 py-1.5 rounded-full transition-all hover:border-cyan-400/50"
                    style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.1)', color: '#94a8c8', cursor: 'pointer' }}>
                    {prompt.length > 28 ? prompt.slice(0, 28) + '…' : prompt}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 flex gap-3" style={{ borderTop: '1px solid rgba(56,189,248,0.06)' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Ask your AI CFO anything…"
                  rows={1}
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: '#081528', border: '1px solid rgba(56,189,248,0.1)', color: '#eef2fc' }}/>
                <button onClick={() => sendMessage()} disabled={sending || !input.trim()}
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', border: 'none', cursor: 'pointer' }}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}