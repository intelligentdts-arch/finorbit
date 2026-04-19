import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get latest financial snapshot
    const { data: snapshot } = await supabase
      .from('financial_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get bank connections
    const { data: connections } = await supabase
      .from('bank_connections')
      .select('institution_name')
      .eq('user_id', user.id)

    const { messages } = await request.json()

    // Build dynamic system prompt with real user data
    const systemPrompt = `You are FinOrbit AI, an expert autonomous financial CFO assistant. You are speaking with ${profile?.first_name || 'the user'}.

THEIR REAL FINANCIAL DATA (from connected bank accounts):
${snapshot ? `
- Net Worth: $${snapshot.net_worth?.toLocaleString() || 'calculating...'}
- Monthly Income: $${snapshot.monthly_income?.toLocaleString() || 'calculating...'}
- Monthly Expenses: $${snapshot.monthly_expenses?.toLocaleString() || 'calculating...'}
- Monthly Surplus: $${snapshot.monthly_surplus?.toLocaleString() || 'calculating...'}
` : '- Financial data not yet synced — encourage them to check back after connecting their bank.'}

CONNECTED BANKS: ${connections?.map(c => c.institution_name).join(', ') || 'None yet'}
RISK PROFILE: ${profile?.risk_profile || 'balanced'}
PRIMARY GOAL: ${profile?.primary_goal?.replace(/_/g, ' ') || 'grow investments'}
PLAN: ${profile?.plan || 'free'}

YOUR ROLE:
- Give specific, actionable, financially accurate advice based on THEIR REAL numbers above
- Reference their actual figures — never use placeholder numbers
- Be direct, confident, and concise (3-5 sentences unless they ask for detail)
- If their bank isn't connected yet, encourage them to do so for personalized advice
- Suggest actions they can take immediately
- Use $ figures from their real data
- Occasionally use relevant emoji sparingly`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })

    const reply = response.content.map(b => b.type === 'text' ? b.text : '').join('')

    // Save to chat history
    await supabase.from('chat_messages').insert([
      { user_id: user.id, role: 'user', content: messages[messages.length - 1].content },
      { user_id: user.id, role: 'assistant', content: reply }
    ])

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}