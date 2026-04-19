interface KpiCardProps {
  label: string
  value: string
  change: string
  changeUp?: boolean
  accent: 'cyan' | 'teal' | 'green' | 'amber'
}

const accents = {
  cyan: '#38bdf8',
  teal: '#2dd4bf',
  green: '#34d399',
  amber: '#fbbf24'
}

export default function KpiCard({ label, value, change, changeUp = true, accent }: KpiCardProps) {
  const color = accents[accent]
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-1"
      style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5 opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}/>
      <div className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#94a8c8' }}>
        {label}
      </div>
      <div className="text-3xl font-extrabold mb-2" style={{ letterSpacing: '-0.03em', color }}>
        {value}
      </div>
      <div className="text-xs font-mono" style={{ color: changeUp ? '#34d399' : '#f87171' }}>
        {changeUp ? '↑' : '↓'} {change}
      </div>
    </div>
  )
}