"use client"

import { useEffect, useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"

type SmartSearchProfile = {
  id: string
  full_name: string | null
  batch_year: number | null
  location: string | null
  bio: string | null
}

type SmartSearchProps = {
  profiles: SmartSearchProfile[]
  onResultIdsChange: (ids: string[] | null) => void
}

export function AISearch({ profiles, onResultIdsChange }: SmartSearchProps) {
  const [query, setQuery] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      onResultIdsChange(null)
      setError(null)
      setIsThinking(false)
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setIsThinking(true)
        setError(null)

        const response = await fetch("/api/smart-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmed,
            alumni: profiles,
          }),
          signal: controller.signal,
        })

        const payload = (await response.json()) as { ids?: string[]; error?: string }

        if (!response.ok) {
          throw new Error(payload.error || "AI search failed")
        }

        onResultIdsChange(Array.isArray(payload.ids) ? payload.ids : [])
      } catch (searchError) {
        if (!controller.signal.aborted) {
          setError(searchError instanceof Error ? searchError.message : "AI search failed")
          onResultIdsChange([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsThinking(false)
        }
      }
    }, 650)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query, profiles, onResultIdsChange])

  return (
    <div className="space-y-2">
      <div className="relative max-w-2xl rounded-xl border border-emerald-500/60 bg-slate-900/80 p-1 shadow-[0_0_18px_rgba(16,185,129,0.35)]">
        <div className="pointer-events-none absolute -inset-px rounded-xl border border-emerald-400/35" />

        <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
        <Input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask naturally: Who lives in Dhaka and is from 2018 batch?"
          className="h-11 border-0 bg-transparent pl-10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-emerald-500"
        />
      </div>

      {isThinking ? (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
