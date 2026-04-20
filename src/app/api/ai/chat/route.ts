import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const body = await request.json().catch(() => null)
    if (!body?.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request - messages required" }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: "You are FinOrbit AI, an expert financial CFO assistant. Give specific, actionable financial advice. Be direct and concise.",
      messages: body.messages,
    })

    const reply = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ reply })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("AI chat error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}