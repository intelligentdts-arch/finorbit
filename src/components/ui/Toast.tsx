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
