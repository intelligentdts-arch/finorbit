Write-Host "Creating FinOrbit files..." -ForegroundColor Cyan

# Create directories
New-Item -ItemType Directory -Force -Path "src/app/auth/callback" | Out-Null
New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
New-Item -ItemType Directory -Force -Path "src/store" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/ui" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/auth" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components/onboarding" | Out-Null

# ── FILE 1: globals.css ──────────────────────────────────────
Set-Content -Path "src/app/globals.css" -Value @'
@import "tailwindcss";

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html { scroll-behavior: smooth; }

body {
  background: #040c1a;
  color: #eef2fc;
  font-family: 'Syne', sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button, input, textarea, select { font-family: inherit; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.15); border-radius: 2px; }

.grad-text {
  background: linear-gradient(135deg,#e0f2fe 0%,#38bdf8 55%,#2dd4bf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes pulse-brand {
  0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,211,238,.5)}
  50%{opacity:.6;box-shadow:0 0 0 5px rgba(34,211,238,0)}
}
@keyframes ring-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer {
  0%{background-position:-200% 0}
  100%{background-position:200% 0}
}
@keyframes toastIn {
  from{opacity:0;transform:translateX(20px)}
  to{opacity:1;transform:translateX(0)}
}
@keyframes typing-bounce {
  0%,80%,100%{transform:translateY(0)}
  40%{transform:translateY(-6px)}
}

.skeleton {
  background: linear-gradient(90deg,rgba(56,189,248,.06) 25%,rgba(56,189,248,.12) 50%,rgba(56,189,248,.06) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
'@
Write-Host "  [OK] globals.css" -ForegroundColor Green

# ── FILE 2: layout.tsx ───────────────────────────────────────
Set-Content -Path "src/app/layout.tsx" -Value @'
import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'FinOrbit — Autonomous Financial Operating System',
  description: 'Your money on autopilot. AI that manages every dollar — automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
'@
Write-Host "  [OK] layout.tsx" -ForegroundColor Green

# ── FILE 3: supabase.ts ──────────────────────────────────────
Set-Content -Path "src/lib/supabase.ts" -Value @'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon)
'@
Write-Host "  [OK] supabase.ts" -ForegroundColor Green

# ── FILE 4: supabaseAdmin.ts ─────────────────────────────────
Set-Content -Path "src/lib/supabaseAdmin.ts" -Value @'
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
'@
Write-Host "  [OK] supabaseAdmin.ts" -ForegroundColor Green

# ── FILE 5: plaid.ts ─────────────────────────────────────────
Set-Content -Path "src/lib/plaid.ts" -Value @'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

const env = (process.env.PLAID_ENV ?? 'sandbox') as keyof typeof PlaidEnvironments

const configuration = new Configuration({
  basePath: PlaidEnvironments[env],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
      'PLAID-SECRET':    process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)
'@
Write-Host "  [OK] plaid.ts" -ForegroundColor Green

# ── FILE 6: stripe.ts ────────────────────────────────────────
Set-Content -Path "src/lib/stripe.ts" -Value @'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})
'@
Write-Host "  [OK] stripe.ts" -ForegroundColor Green

# ── FILE 7: rateLimit.ts ─────────────────────────────────────
Set-Content -Path "src/lib/rateLimit.ts" -Value @'
interface RateLimitRecord { count: number; resetTime: number }

const map = new Map<string, RateLimitRecord>()

export function rateLimit(
  identifier: string,
  maxRequests = 20,
  windowMs    = 60_000,
): { success: boolean; remaining: number; resetIn: number } {
  const now    = Date.now()
  const record = map.get(identifier)

  if (!record || now > record.resetTime) {
    map.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetIn: record.resetTime - now }
  }

  record.count++
  return { success: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, val] of map.entries()) {
    if (now > val.resetTime) map.delete(key)
  }
}, 5 * 60_000)
'@
Write-Host "  [OK] rateLimit.ts" -ForegroundColor Green

# ── FILE 8: apiMiddleware.ts ─────────────────────────────────
Set-Content -Path "src/lib/apiMiddleware.ts" -Value @'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from './rateLimit'

export interface AuthContext { userId: string; email: string; token: string }

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {},
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown'

  const limited = rateLimit(`${ip}:${request.nextUrl.pathname}`, options.maxRequests ?? 30, options.windowMs ?? 60_000)

  if (!limited.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.resetIn / 1000)) } })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const token    = authHeader.replace('Bearer ', '')
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired session. Please sign in again.' }, { status: 401 })
  }

  try {
    return await handler(request, { userId: user.id, email: user.email!, token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[API Error] ${request.nextUrl.pathname}:`, message)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
'@
Write-Host "  [OK] apiMiddleware.ts" -ForegroundColor Green

# ── FILE 9: validation.ts ────────────────────────────────────
Set-Content -Path "src/lib/validation.ts" -Value @'
import { z } from 'zod'

export const signUpSchema = z.object({
  firstName: z.string().min(1,'First name is required').max(50,'First name is too long').regex(/^[a-zA-Z\s'-]+$/,'First name contains invalid characters'),
  lastName:  z.string().max(50,'Last name is too long').regex(/^[a-zA-Z\s'-]*$/,'Last name contains invalid characters').optional(),
  email:     z.string().min(1,'Email is required').email('Please enter a valid email address').max(255,'Email is too long').toLowerCase(),
  password:  z.string().min(8,'Password must be at least 8 characters').max(128,'Password is too long').regex(/[A-Z]/,'Password must contain at least one uppercase letter').regex(/[0-9]/,'Password must contain at least one number'),
  plan:      z.enum(['free','pro']).default('free'),
})

export const signInSchema = z.object({
  email:    z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1,'Password is required'),
})

export const chatMessageSchema = z.object({
  messages: z.array(z.object({
    role:    z.enum(['user','assistant']),
    content: z.string().min(1,'Message cannot be empty').max(4000,'Message is too long'),
  })).min(1,'At least one message is required').max(50,'Conversation is too long'),
})

export const plaidExchangeSchema = z.object({
  public_token:     z.string().min(1),
  institution_name: z.string().min(1).max(100),
  institution_id:   z.string().min(1).max(100),
})

export function formatZodError(error: z.ZodError): string {
  return error.errors[0]?.message ?? 'Validation failed'
}

export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g,'').replace(/javascript:/gi,'').replace(/on\w+\s*=/gi,'').trim()
}
'@
Write-Host "  [OK] validation.ts" -ForegroundColor Green

# ── FILE 10: financialCalculations.ts ───────────────────────
Set-Content -Path "src/lib/financialCalculations.ts" -Value @'
export const roundMoney = (n: number): number => Math.round(n * 100) / 100

export const formatCurrency = (amount: number, opts: { decimals?: boolean; compact?: boolean } = {}): string => {
  if (opts.compact && Math.abs(amount) >= 1_000_000) return `$${(amount/1_000_000).toFixed(1)}M`
  if (opts.compact && Math.abs(amount) >= 1_000)     return `$${(amount/1_000).toFixed(1)}K`
  return new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD', minimumFractionDigits: opts.decimals?2:0, maximumFractionDigits: opts.decimals?2:0 }).format(amount)
}

export const calculateNetWorth = (accounts: Array<{ type: string; balances: { current: number | null } }>): number =>
  roundMoney(accounts.reduce((total, acc) => {
    const bal = acc.balances.current ?? 0
    if (['depository','investment'].includes(acc.type)) return total + bal
    if (['credit','loan'].includes(acc.type))           return total - bal
    return total
  }, 0))

export const calculateMonthlyIncome = (transactions: Array<{ amount: number; date: string }>): number => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
  return roundMoney(transactions.filter(t => t.amount < 0 && new Date(t.date) >= cutoff).reduce((sum,t) => sum + Math.abs(t.amount), 0))
}

export const calculateMonthlyExpenses = (transactions: Array<{ amount: number; date: string }>): number => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30)
  return roundMoney(transactions.filter(t => t.amount > 0 && new Date(t.date) >= cutoff).reduce((sum,t) => sum + t.amount, 0))
}

export const calculateMonthlySurplus = (income: number, expenses: number): number => roundMoney(income - expenses)

export const calculateSavingsRate = (income: number, surplus: number): number => {
  if (income <= 0) return 0
  return Math.min(100, Math.round((surplus / income) * 100))
}

export const calculateAllocationBuckets = (monthlyIncome: number, monthlyExpenses: number, risk: 'conservative' | 'balanced' | 'aggressive') => {
  const surplus  = Math.max(0, calculateMonthlySurplus(monthlyIncome, monthlyExpenses))
  const profiles = {
    conservative: { survival:.40, stability:.30, growth:.20, leverage:.05, opportunity:.05 },
    balanced:     { survival:.30, stability:.20, growth:.30, leverage:.12, opportunity:.08 },
    aggressive:   { survival:.25, stability:.10, growth:.40, leverage:.15, opportunity:.10 },
  }
  const p = profiles[risk]
  return {
    survival:    { amount: roundMoney(monthlyIncome * p.survival),   pct: Math.round(p.survival    * 100) },
    stability:   { amount: roundMoney(surplus       * p.stability),  pct: Math.round(p.stability   * 100) },
    growth:      { amount: roundMoney(surplus       * p.growth),     pct: Math.round(p.growth      * 100) },
    leverage:    { amount: roundMoney(surplus       * p.leverage),   pct: Math.round(p.leverage    * 100) },
    opportunity: { amount: roundMoney(surplus       * p.opportunity),pct: Math.round(p.opportunity * 100) },
  }
}

export const calculateDebtPayoff = (balance: number, annualRate: number, monthlyPayment: number): { months: number; totalInterest: number } => {
  if (balance <= 0 || monthlyPayment <= 0) return { months: 0, totalInterest: 0 }
  const r = annualRate / 100 / 12
  if (r === 0) return { months: Math.ceil(balance / monthlyPayment), totalInterest: 0 }
  const months        = Math.ceil(-Math.log(1 - (r * balance) / monthlyPayment) / Math.log(1 + r))
  const totalInterest = roundMoney(Math.max(0, months * monthlyPayment - balance))
  return { months, totalInterest }
}

export const projectNetWorth = (currentNetWorth: number, monthlySurplus: number, annualReturn = 0.07, months = 12): number => {
  const r = annualReturn / 12
  let projected = currentNetWorth
  for (let i = 0; i < months; i++) projected = projected * (1 + r) + monthlySurplus
  return roundMoney(projected)
}

export const calculateAutopilotScore = (params: { hasEmergencyFund: boolean; savingsRate: number; creditUtilization: number; hasInvestments: boolean; debtToIncomeRatio: number }): { overall: number; stability: number; growth: number; risk: number } => {
  const stability = Math.min(100, Math.round((params.hasEmergencyFund?40:0) + Math.min(30, params.savingsRate*1.5) + (params.creditUtilization<30?30:params.creditUtilization<50?15:0)))
  const growth    = Math.min(100, Math.round((params.hasInvestments?40:0) + Math.min(40, params.savingsRate*2) + (params.savingsRate>20?20:params.savingsRate>10?10:0)))
  const risk      = Math.min(100, Math.round((params.debtToIncomeRatio<0.36?50:params.debtToIncomeRatio<0.5?25:0) + (params.creditUtilization<10?30:params.creditUtilization<30?20:10) + (params.hasEmergencyFund?20:0)))
  const overall   = Math.round((stability + growth + risk) / 3)
  return { overall, stability, growth, risk }
}
'@
Write-Host "  [OK] financialCalculations.ts" -ForegroundColor Green

# ── FILE 11: authStore.ts ────────────────────────────────────
Set-Content -Path "src/store/authStore.ts" -Value @'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id:                  string
  email:               string
  first_name:          string
  last_name:           string
  plan:                string
  onboarding_complete: boolean
  risk_profile:        string
  primary_goal:        string
}

interface AuthState {
  user:        UserProfile | null
  loading:     boolean
  setUser:     (user: UserProfile | null) => void
  setLoading:  (loading: boolean) => void
  signOut:     () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  loading: true,
  setUser:    (user)    => set({ user }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => { await supabase.auth.signOut(); set({ user: null }) },
  refreshUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { set({ user: null, loading: false }); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        set({
          user: {
            id:                  user.id,
            email:               user.email ?? '',
            first_name:          profile.first_name          ?? '',
            last_name:           profile.last_name           ?? '',
            plan:                profile.plan                ?? 'free',
            onboarding_complete: profile.onboarding_complete ?? false,
            risk_profile:        profile.risk_profile        ?? 'balanced',
            primary_goal:        profile.primary_goal        ?? 'grow_investments',
          },
          loading: false,
        })
      } else { set({ loading: false }) }
    } catch { set({ loading: false }) }
  },
}))
'@
Write-Host "  [OK] authStore.ts" -ForegroundColor Green

# ── FILE 12: financialStore.ts ───────────────────────────────
Set-Content -Path "src/store/financialStore.ts" -Value @'
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export interface Account {
  account_id:       string
  name:             string
  type:             string
  subtype:          string
  balances:         { current: number | null; available: number | null }
  institution_name: string
}

export interface Transaction {
  transaction_id:             string
  name:                       string
  amount:                     number
  date:                       string
  category:                   string[]
  personal_finance_category?: { primary: string; detailed: string }
}

export interface FinancialData {
  connected:        boolean
  net_worth:        number
  monthly_income:   number
  monthly_expenses: number
  monthly_surplus:  number
  accounts:         Account[]
  transactions:     Transaction[]
  top_categories:   { name: string; amount: number }[]
  institutions:     string[]
  warnings?:        string[]
}

interface FinancialState {
  data:               FinancialData | null
  loading:            boolean
  error:              string | null
  fetchFinancialData: () => Promise<void>
  clearData:          () => void
}

export const useFinancialStore = create<FinancialState>((set, get) => ({
  data:    null,
  loading: false,
  error:   null,
  fetchFinancialData: async () => {
    if (!get().data) set({ loading: true })
    set({ error: null })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { set({ loading: false }); return }
      const res = await fetch('/api/plaid/financial-data', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.status === 401) { set({ loading: false, error: 'Session expired. Please sign in again.' }); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: FinancialData = await res.json()
      set({ data, loading: false, error: null })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      set({ loading: false, error: `Could not refresh data: ${message}` })
    }
  },
  clearData: () => set({ data: null, loading: false, error: null }),
}))
'@
Write-Host "  [OK] financialStore.ts" -ForegroundColor Green

# ── FILE 13: Toast.tsx ───────────────────────────────────────
Set-Content -Path "src/components/ui/Toast.tsx" -Value @'
'use client'

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'
interface ToastItem { id: string; message: string; type: ToastType }

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => undefined })
export const useToast = () => useContext(ToastContext)

const STYLES: Record<ToastType,{ bg:string; border:string; color:string; icon:string }> = {
  success: { bg:'rgba(52,211,153,0.12)',  border:'rgba(52,211,153,0.3)',  color:'#34d399', icon:'✅' },
  error:   { bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.3)', color:'#f87171', icon:'❌' },
  warning: { bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.3)',  color:'#fbbf24', icon:'⚠️' },
  info:    { bg:'rgba(34,211,238,0.12)',  border:'rgba(34,211,238,0.3)',  color:'#22d3ee', icon:'ℹ️' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8, maxWidth:360, width:'100%', pointerEvents:'none' }}>
        {toasts.map(t => {
          const s = STYLES[t.type]
          return (
            <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', borderRadius:12, background:s.bg, border:`1px solid ${s.border}`, backdropFilter:'blur(12px)', animation:'toastIn 0.3s ease', pointerEvents:'all' }}>
              <span style={{ flexShrink:0 }}>{s.icon}</span>
              <p style={{ fontSize:'0.84rem', fontWeight:500, flex:1, color:s.color }}>{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} style={{ background:'none', border:'none', cursor:'pointer', color:s.color, opacity:.6, flexShrink:0, fontSize:'0.85rem' }}>✕</button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
'@
Write-Host "  [OK] Toast.tsx" -ForegroundColor Green

# ── FILE 14: ErrorBoundary.tsx ───────────────────────────────
Set-Content -Path "src/components/ui/ErrorBoundary.tsx" -Value @'
'use client'

import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary:', error.message, info.componentStack)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:48, borderRadius:14, background:'#112240', border:'1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ textAlign:'center', maxWidth:320 }}>
            <div style={{ fontSize:'2rem', marginBottom:12 }}>⚠️</div>
            <h3 style={{ fontWeight:700, marginBottom:8 }}>Something went wrong</h3>
            <p style={{ fontSize:'0.87rem', color:'#94a8c8', marginBottom:20 }}>This section hit an error. Your data is safe.</p>
            <button onClick={() => this.setState({ hasError:false })} style={{ padding:'10px 22px', borderRadius:8, fontSize:'0.85rem', fontWeight:700, background:'linear-gradient(135deg,#38bdf8,#2dd4bf)', color:'#020d1a', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Try Again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
'@
Write-Host "  [OK] ErrorBoundary.tsx" -ForegroundColor Green

# ── FILE 15: auth/callback/route.ts ─────────────────────────
Set-Content -Path "src/app/auth/callback/route.ts" -Value @'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const url  = new URL(request.url)
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/', url.origin))
}
'@
Write-Host "  [OK] auth/callback/route.ts" -ForegroundColor Green

# ── FILE 16: middleware.ts ───────────────────────────────────
Set-Content -Path "src/middleware.ts" -Value @'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options',           'DENY')
  response.headers.set('X-Content-Type-Options',    'nosniff')
  response.headers.set('Referrer-Policy',            'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy',         'camera=(), microphone=(), geolocation=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
'@
Write-Host "  [OK] middleware.ts" -ForegroundColor Green

Write-Host ""
Write-Host "All files created." -ForegroundColor Cyan
Write-Host "Now run: npm run build" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTE: AuthModal, BankConnect, and OnboardingFlow are large files." -ForegroundColor Yellow
Write-Host "Copy them manually from finorbit-complete-files.md (files 15, 16, 17)" -ForegroundColor Yellow
