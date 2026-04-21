import { NextRequest, NextResponse } from "next/server"
import { plaidClient } from "@/lib/plaid"
import { createClient } from "@supabase/supabase-js"
import { CountryCode, Products } from "plaid"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "FinOrbit",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    })

    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error) {
    console.error("Plaid link token error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}