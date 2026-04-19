import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { public_token, institution_name, institution_id } = await request.json()

    // Exchange public token for permanent access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Store encrypted access token in database
    const { error: dbError } = await supabase
      .from('bank_connections')
      .insert({
        user_id: user.id,
        plaid_access_token: accessToken,
        plaid_item_id: itemId,
        institution_name,
        institution_id
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true, institution_name })
  } catch (error: any) {
    console.error('Plaid exchange-token error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}