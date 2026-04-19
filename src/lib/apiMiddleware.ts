import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit } from './rateLimit'

export interface AuthContext { userId: string; email: string; token: string }

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, auth: AuthContext) => Promise<NextResponse>,
  options: { maxRequests?: number; windowMs?: number } = {},
): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown'

  const limited = rateLimit(`${ip}:${request.nextUrl.pathname}`, options.maxRequests ?? 30, options.windowMs ?? 60_000)

  if (!limited.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.resetIn / 1000)) } })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const token    = authHeader.replace('Bearer ', '')
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired session. Please sign in again.' }, { status: 401 })
  }

  try {
    return await handler(request, { userId: user.id, email: user.email!, token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[API Error] ${request.nextUrl.pathname}:`, message)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
