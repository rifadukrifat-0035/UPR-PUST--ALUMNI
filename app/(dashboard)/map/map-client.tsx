"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import type { DivIcon, LatLngExpression } from "leaflet"
import { createClientComponentClient } from "@/lib/supabase/client"

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false },
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false },
)

const Marker = dynamic(
  () => import("react-leaflet").then((module) => module.Marker),
  { ssr: false },
)

const Popup = dynamic(
  () => import("react-leaflet").then((module) => module.Popup),
  { ssr: false },
)

type AlumniProfile = {
  id: string
  full_name: string | null
  batch_year: number | null
  location: string | null
  lat: number
  lng: number
}

const FALLBACK_CENTER: LatLngExpression = [23.8103, 90.4125]

export default function AlumniMapClient() {
  const [profiles, setProfiles] = useState<AlumniProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emeraldIcon, setEmeraldIcon] = useState<DivIcon | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProfiles() {
      try {
        const supabase = createClientComponentClient()

        const { data, error: queryError } = await supabase
          .from("profiles")
          .select("id, full_name, batch_year, location, lat, lng")
          .eq("status", "approved")
          .not("lat", "is", null)

        if (queryError) {
          throw queryError
        }

        const mapped = (data ?? [])
          .filter((profile) => profile.lng !== null)
          .map((profile) => ({
            id: String(profile.id),
            full_name: profile.full_name,
            batch_year: profile.batch_year,
            location: profile.location,
            lat: Number(profile.lat),
            lng: Number(profile.lng),
          }))
          .filter((profile) => Number.isFinite(profile.lat) && Number.isFinite(profile.lng))

        if (isMounted) {
          setProfiles(mapped)
          setError(null)
        }
      } catch (fetchError) {
        if (isMounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load alumni map data."
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfiles()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadIcon() {
      if (typeof window === "undefined") return

      const L = await import("leaflet")
      const icon = L.divIcon({
        className: "",
        html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#10b981;border:2px solid rgba(15,23,42,0.9);box-shadow:0 0 0 4px rgba(16,185,129,0.25);"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -10],
      })

      if (isMounted) {
        setEmeraldIcon(icon)
      }
    }

    loadIcon()

    return () => {
      isMounted = false
    }
  }, [])

  const center = useMemo<LatLngExpression>(() => {
    if (!profiles.length) return FALLBACK_CENTER

    const avgLat = profiles.reduce((sum, profile) => sum + profile.lat, 0) / profiles.length
    const avgLng = profiles.reduce((sum, profile) => sum + profile.lng, 0) / profiles.length
    return [avgLat, avgLng]
  }, [profiles])

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-100">Alumni Map</h1>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-300">
          Loading approved alumni locations...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-100">Alumni Map</h1>
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-200">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Alumni Map</h1>
        <p className="text-slate-400">Explore approved URP alumni around the world.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        <MapContainer center={center} zoom={4} className="h-[560px] w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {profiles.map((profile) => (
            <Marker
              key={profile.id}
              position={[profile.lat, profile.lng]}
              {...(emeraldIcon ? { icon: emeraldIcon } : {})}
            >
              <Popup>
                <div className="space-y-1 text-slate-900">
                  <p className="font-semibold text-emerald-500">{profile.full_name ?? "Unknown Alumni"}</p>
                  <p>
                    <span className="font-medium">Batch:</span> {profile.batch_year ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {profile.location?.trim() || "Not provided"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="text-sm text-slate-400">
        Showing {profiles.length} approved alumni with map coordinates.
      </p>
    </section>
  )
}
