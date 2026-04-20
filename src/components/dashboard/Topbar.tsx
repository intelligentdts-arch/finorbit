'use client'

interface TopbarProps {
  title:       string
  onMenuClick: () => void
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
      style={{
        background:     'rgba(4,12,26,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom:   '1px solid rgba(56,189,248,0.06)',
      }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-lg"
          style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
          ☰
        </button>
        <h1 className="text-lg font-extrabold" style={{ letterSpacing: '-0.01em' }}>{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#22d3ee', border: '2px solid #040c1a' }}/>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/opportunities'}
          className="hidden sm:flex px-4 py-2 rounded-lg text-sm font-extrabold"
          style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', color: '#020d1a' }}>
          3 Opportunities →
        </button>
      </div>
    </div>
  )
}
