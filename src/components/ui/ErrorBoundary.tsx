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
