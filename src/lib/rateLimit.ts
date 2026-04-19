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
