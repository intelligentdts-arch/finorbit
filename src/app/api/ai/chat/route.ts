import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"
import { chatMessageSchema, formatZodError } from "@/lib/validation"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 })

    const validation = chatMessageSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: formatZodError(validation.error) }, { status: 400 })

    const { messages } = validation.data

    // Get user profile for personalized responses
    let systemPrompt = "You are FinOrbit AI, an expert autonomous financial CFO assistant. Give specific, actionable financial advice. Be direct and concise (3-5 sentences). Use dollar figures when relevant."

    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const authHeader = request.headers.get("authorization")
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "")
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
          const { data: snapshot } = await supabase.from("financial_snapshots").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single()
          const { data: connections } = await supabase.from("bank_connections").select("institution_name").eq("user_id", user.id)

          systemPrompt = `You are FinOrbit AI, an expert autonomous financial CFO assistant speaking with ${profile?.first_name || "the user"}.

THEIR REAL FINANCIAL DATA:
${snapshot ? `- Net Worth: $${snapshot.net_worth?.toLocaleString()}
- Monthly Income: $${snapshot.monthly_income?.toLocaleString()}
- Monthly Expenses: $${snapshot.monthly_expenses?.toLocaleString()}
- Monthly Surplus: $${snapshot.monthly_surplus?.toLocaleString()}` : "- Bank not yet connected"}

CONNECTED BANKS: ${connections?.map((c: { institution_name: string }) => c.institution_name).join(", ") || "None yet"}
RISK PROFILE: ${profile?.risk_profile || "balanced"}
PLAN: ${profile?.plan || "free"}

Give specific, actionable advice using their REAL numbers. Be direct and concise (3-5 sentences). Reference their actual figures.`
        }
      }
    } catch {
      // Use default system prompt if profile fetch fails
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ reply })

  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "Internal server error." }, { status: 500 })
  }
}