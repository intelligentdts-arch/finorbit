import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { plaidExchangeSchema, formatZodError } from '@/lib/validation'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const validation = plaidExchangeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: formatZodError(validation.error) },
        { status: 400 }
      )
    }

    const { public_token, institution_name, institution_id } = validation.data

    const { data: tokenData } = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    await supabase.from('plaid_items').insert({
      user_id: user.id,
      access_token: tokenData.access_token,
      item_id: tokenData.item_id,
      institution_name,
      institution_id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Plaid exchange error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}