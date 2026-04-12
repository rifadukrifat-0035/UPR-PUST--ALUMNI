"use client"

import dynamic from "next/dynamic"

const AlumniMapClient = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-300">
      Loading alumni map...
    </div>
  ),
})

export default function AlumniMapPage() {
  return <AlumniMapClient />
}
