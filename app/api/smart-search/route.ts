import { NextResponse } from "next/server"

type AlumniInput = {
  id: string
  full_name: string | null
  batch_year: number | null
  location: string | null
  bio: string | null
}

function extractIds(content: string): string[] {
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) {
      return parsed.map((id) => String(id))
    }
  } catch {
    // Fall through to regex parsing.
  }

  const jsonArray = content.match(/\[[\s\S]*\]/)
  if (!jsonArray) {
    return []
  }

  try {
    const parsed = JSON.parse(jsonArray[0])
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.map((id) => String(id))
  } catch {
    return []
  }
}

export async function POST(request: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY ?? process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY environment variable." },
        { status: 500 },
      )
    }

    const body = (await request.json()) as { query?: string; alumni?: AlumniInput[] }
    const query = (body.query ?? "").trim()
    const alumni = Array.isArray(body.alumni) ? body.alumni : []

    if (!query) {
      return NextResponse.json({ ids: [] })
    }

    const cleanedAlumni = alumni.map((item) => ({
      id: String(item.id),
      full_name: item.full_name,
      batch_year: item.batch_year,
      location: item.location,
      bio: item.bio,
    }))

    const prompt = `Based on the alumni list: ${JSON.stringify(cleanedAlumni)}, filter only those who match the user query: ${query}. Return only an array of their IDs in JSON format.`

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        temperature: 0,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!groqResponse.ok) {
      const failureText = await groqResponse.text()
      console.error("[smart-search][groq error]", failureText)
      return NextResponse.json({ error: "AI provider request failed." }, { status: 502 })
    }

    const completion = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = completion.choices?.[0]?.message?.content ?? "[]"
    const ids = extractIds(content)

    return NextResponse.json({ ids })
  } catch (error) {
    console.error("[smart-search]", error)
    return NextResponse.json({ error: "Failed to process smart search." }, { status: 500 })
  }
}
