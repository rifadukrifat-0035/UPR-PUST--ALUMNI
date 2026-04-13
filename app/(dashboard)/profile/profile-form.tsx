"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormStatus } from "react-dom"
import { MapPin, Loader2, LocateFixed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ProfileFormProps = {
  defaultValues: {
    fullName: string
    bio: string
    batchYear: string
    location: string
    lat: string
    lng: string
  }
  updateProfile: (formData: FormData) => void | Promise<void>
}

type GeocodeState = "idle" | "searching" | "ready" | "not-found" | "error"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 w-full rounded-lg bg-emerald-400 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving Profile...
        </>
      ) : (
        "Save Profile"
      )}
    </Button>
  )
}

export default function ProfileForm({ defaultValues, updateProfile }: ProfileFormProps) {
  const [locationInput, setLocationInput] = useState(defaultValues.location)
  const [lat, setLat] = useState(defaultValues.lat)
  const [lng, setLng] = useState(defaultValues.lng)
  const [geocodeState, setGeocodeState] = useState<GeocodeState>("idle")

  useEffect(() => {
    const query = locationInput.trim()

    if (!query) {
      setLat("")
      setLng("")
      setGeocodeState("idle")
      return
    }

    if (query.length < 3) {
      setGeocodeState("idle")
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setGeocodeState("searching")

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Geocoding failed with status ${response.status}`)
        }

        const results = (await response.json()) as Array<{ lat?: string; lon?: string }>

        if (!results.length || !results[0]?.lat || !results[0]?.lon) {
          setLat("")
          setLng("")
          setGeocodeState("not-found")
          return
        }

        setLat(results[0].lat)
        setLng(results[0].lon)
        setGeocodeState("ready")
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("[profile geocode error]", error)
        setGeocodeState("error")
      }
    }, 600)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [locationInput])

  const geocodeLabel = useMemo(() => {
    if (geocodeState === "searching") return "Finding coordinates for map pin..."
    if (geocodeState === "ready") return "Coordinates synced for alumni map."
    if (geocodeState === "not-found") return "Location not found. Try a more specific place name."
    if (geocodeState === "error") return "Could not fetch coordinates right now."
    if (lat && lng) return "Using current coordinates from your profile."
    return "Type a location to auto-generate map coordinates."
  }, [geocodeState, lat, lng])

  return (
    <form action={updateProfile} className="space-y-6">
      <input type="hidden" name="lat" value={lat} readOnly />
      <input type="hidden" name="lng" value={lng} readOnly />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="full_name" className="text-sm font-medium text-slate-200">
            Full Name
          </label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={defaultValues.fullName}
            placeholder="Your full name"
            className="h-11 border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="bio" className="text-sm font-medium text-slate-200">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={defaultValues.bio}
            placeholder="Share what you do, your interests, and how alumni can connect."
            rows={5}
            className="w-full rounded-md border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="batch_year" className="text-sm font-medium text-slate-200">
            Batch Year
          </label>
          <Input
            id="batch_year"
            name="batch_year"
            type="number"
            min="1980"
            max="2100"
            defaultValue={defaultValues.batchYear}
            placeholder="e.g. 2018"
            className="h-11 border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-slate-200">
            Location Name
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-300/80" />
            <Input
              id="location"
              name="location"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              placeholder="City, Country"
              className="h-11 border-slate-700/80 bg-slate-950/70 pl-10 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-400/20 bg-slate-950/40 p-4">
        <div className="flex items-center gap-2 text-sm text-emerald-200">
          {geocodeState === "searching" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          <span>{geocodeLabel}</span>
        </div>

        {(lat || lng) && (
          <p className="mt-2 text-xs text-slate-300/90">
            lat: <span className="font-mono">{lat || "-"}</span> | lng:{" "}
            <span className="font-mono">{lng || "-"}</span>
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
