import type { Metadata } from 'next'
import { Syne, DM_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500']
})

export const metadata: Metadata = {
  title: 'FinOrbit — Autonomous Financial Operating System',
  description: 'Your money on autopilot. AI that receives, allocates, invests, and optimizes every dollar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmMono.variable}`} style={{ fontFamily: 'var(--font-syne), sans-serif', background: '#040c1a', color: '#eef2fc', overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}