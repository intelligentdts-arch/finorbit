import { ToastProvider } from '@/components/ui/Toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'var(--font-syne), sans-serif', background: '#040c1a', color: '#eef2fc' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}