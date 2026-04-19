import { NextRequest, NextResponse } from 'next/server'
import { plaidClient } from '@/lib/plaid'
import { createClient } from '@supabase/supabase-js'
import { CountryCode, Products } from 'plaid'

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Create Plaid link token
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: 'FinOrbit',
      products: [Products.Transactions, Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error('Plaid create-link-token error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}