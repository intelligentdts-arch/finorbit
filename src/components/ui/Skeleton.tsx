export function Skeleton({
  h = 'h-4',
  w = 'w-full',
  rounded = 'rounded',
}: {
  h?: string
  w?: string
  rounded?: string
}) {
  return (
    <div
      className={`animate-pulse ${h} ${w} ${rounded}`}
      style={{ background: 'rgba(56,189,248,0.08)' }}
    />
  )
}

export function KpiSkeleton() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}
    >
      <Skeleton h="h-3" w="w-24" rounded="rounded" />
      <div className="mt-4 mb-2">
        <Skeleton h="h-8" w="w-32" rounded="rounded" />
      </div>
      <Skeleton h="h-3" w="w-20" rounded="rounded" />
    </div>
  )
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: '#112240', border: '1px solid rgba(56,189,248,0.1)' }}
    >
      <Skeleton h="h-3" w="w-32" rounded="rounded mb-5" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton h="h-4" w="w-32" rounded="rounded" />
            <Skeleton h="h-4" w="w-16" rounded="rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}