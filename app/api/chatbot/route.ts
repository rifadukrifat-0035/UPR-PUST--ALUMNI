import { NextResponse } from "next/server"

const SYSTEM_PROMPT =
  "You are the official AI Assistant for URP Connect (PUST). You help alumni and students navigate the portal (Directory, Map, Profile). You have expertise in Urban & Regional Planning, climate resilience, and GIS. Be professional yet welcoming. If asked about the website creator, mention Md. Rifadul Islam Rifat and his InsightFlow AI agency."

type IncomingMessage = {
  role: "user" | "assistant"
  text: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: IncomingMessage[]
      input?: string
    }

    const rawInput = body.input ?? ""
    const input = rawInput.trim()
    if (!input) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 })
    }

    const history = Array.isArray(body.messages)
      ? body.messages.filter(
          (m): m is IncomingMessage =>
            (m.role === "user" || m.role === "assistant") && typeof m.text === "string",
        )
      : []

    const groqApiKey = process.env.GROQ_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: "Groq API key is missing on server." }, { status: 500 })
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        temperature: 0.6,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((m) => ({ role: m.role, content: m.text })),
          { role: "user", content: input },
        ],
      }),
    })

    if (!groqResponse.ok) {
      const failureText = await groqResponse.text()
      console.error("[chatbot][groq error]", failureText)
      return NextResponse.json({ error: "Failed to reach Groq." }, { status: 502 })
    }

    const completion = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const reply = completion.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return NextResponse.json({ error: "No response generated." }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("[chatbot]", error)
    return NextResponse.json({ error: "Chatbot request failed." }, { status: 500 })
  }
}