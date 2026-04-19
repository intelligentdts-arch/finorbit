'use client'

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

const ToastContext = createContext<{
  toast: (message: string, type?: ToastType) => void
}>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

const styles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',  color: '#34d399', icon: '✅' },
  error:   { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171', icon: '❌' },
  warning: { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  color: '#fbbf24', icon: '⚠️' },
  info:    { bg: 'rgba(34,211,238,0.12)',  border: 'rgba(34,211,238,0.3)',  color: '#22d3ee', icon: 'ℹ️' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const s = styles[t.type]
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                backdropFilter: 'blur(12px)',
                animation: 'toastIn 0.3s ease',
              }}
            >
              <span className="flex-shrink-0">{s.icon}</span>
              <p className="text-sm font-medium flex-1" style={{ color: s.color }}>
                {t.message}
              </p>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.color }}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}