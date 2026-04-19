'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="flex items-center justify-center p-12 rounded-2xl"
            style={{ background: '#112240', border: '1px solid rgba(248,113,113,0.2)' }}
          >
            <div className="text-center max-w-xs">
              <div className="text-3xl mb-3">⚠️</div>
              <h3 className="font-bold mb-2">Something went wrong</h3>
              <p className="text-sm mb-4" style={{ color: '#94a8c8' }}>
                This section hit an error. Your data is safe.
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-5 py-2 rounded-lg text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)',
                  color: '#020d1a',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}