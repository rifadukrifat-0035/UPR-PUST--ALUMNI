"use client"

import Image from "next/image"
import { useCallback, useMemo, useState } from "react"
import { User } from "lucide-react"
import { AISearch } from "@/components/ai-search"

type AlumniProfile = {
  id: string
  full_name: string | null
  batch_year: number | null
  location: string | null
  bio: string | null
  avatar_url: string | null
}

type DirectoryClientProps = {
  profiles: AlumniProfile[]
}

export default function DirectoryClient({ profiles }: DirectoryClientProps) {
  const [resultIds, setResultIds] = useState<string[] | null>(null)

  const filteredProfiles = useMemo<AlumniProfile[]>(() => {
    if (!resultIds) {
      return profiles
    }

    const matchedIds = new Set(resultIds)
    return profiles.filter((profile) => matchedIds.has(profile.id))
  }, [profiles, resultIds])

  const handleResultIdsChange = useCallback((ids: string[] | null) => {
    setResultIds(ids)
  }, [])

  const emptyMessage = resultIds
    ? "No alumni matched your smart query."
    : "No alumni found."

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-100">Alumni Directory</h1>
        <p className="text-slate-400">Browse approved alumni from the URP community.</p>
      </div>

      <AISearch profiles={profiles} onResultIdsChange={handleResultIdsChange} />

      {filteredProfiles.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-300">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProfiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={`${profile.full_name ?? "Alumni"} avatar`}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-full border border-emerald-500/40 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-slate-800 text-emerald-400">
                    <User className="h-6 w-6" />
                  </div>
                )}

                <div>
                  <h2 className="font-medium text-slate-100">
                    {profile.full_name || "Unknown Alumni"}
                  </h2>
                  <p className="text-sm text-emerald-500">
                    Batch {profile.batch_year ?? "N/A"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {profile.location?.trim() || "Location not provided"}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-300">
                {profile.bio?.trim() ? profile.bio : "No bio available."}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
