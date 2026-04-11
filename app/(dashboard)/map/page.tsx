"use client"

import dynamic from "next/dynamic"

const AlumniMapClient = dynamic(() => import("./map-client"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-300">
      Loading alumni map...
    </div>
  ),
})

export default function AlumniMapPage() {
  return <AlumniMapClient />
}
