"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { createClientComponentClient } from "@/src/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Loader2, MapPin, UserCircle2, CalendarDays, FileText, AlertCircle } from "lucide-react"

type ProfileRow = {
	id: string
	full_name: string | null
	batch_year: number | null
	bio: string | null
	location_name: string | null
	lat: number | null
	lng: number | null
}

type NominatimResult = {
	lat?: string
	lon?: string
}

export default function MyProfilePage() {
	const supabase = useMemo(() => createClientComponentClient(), [])

	const [fullName, setFullName] = useState("")
	const [batchYear, setBatchYear] = useState("")
	const [bio, setBio] = useState("")
	const [locationName, setLocationName] = useState("")

	const [lat, setLat] = useState<number | null>(null)
	const [lng, setLng] = useState<number | null>(null)

	const [isFetching, setIsFetching] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGeocoding, setIsGeocoding] = useState(false)

	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	useEffect(() => {
		let isMounted = true

		const loadProfile = async () => {
			setIsFetching(true)
			setErrorMessage(null)

			try {
				const {
					data: { user },
					error: userError,
				} = await supabase.auth.getUser()

				if (userError || !user?.id) {
					throw new Error(userError?.message || "Could not identify the current user.")
				}

				const { data, error } = await supabase
					.from("profiles")
					.select("id, full_name, batch_year, bio, location_name, lat, lng")
					.eq("id", user.id)
					.maybeSingle()

				if (error) {
					throw new Error(error.message)
				}

				if (!isMounted) return

				const profile = (data ?? null) as ProfileRow | null
				setFullName(profile?.full_name ?? "")
				setBatchYear(profile?.batch_year != null ? String(profile.batch_year) : "")
				setBio(profile?.bio ?? "")
				setLocationName(profile?.location_name ?? "")
				setLat(profile?.lat ?? null)
				setLng(profile?.lng ?? null)
			} catch (err: unknown) {
				if (!isMounted) return
				setErrorMessage(err instanceof Error ? err.message : "Failed to load profile.")
			} finally {
				if (isMounted) {
					setIsFetching(false)
				}
			}
		}

		void loadProfile()

		return () => {
			isMounted = false
		}
	}, [supabase])

	useEffect(() => {
		if (!successMessage) return

		const timer = window.setTimeout(() => {
			setSuccessMessage(null)
		}, 3200)

		return () => window.clearTimeout(timer)
	}, [successMessage])

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setErrorMessage(null)
		setSuccessMessage(null)

		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser()

		if (userError || !user?.id) {
			setErrorMessage("User session not found. Please log in again.")
			return
		}

		const cleanedName = fullName.trim()
		const cleanedBio = bio.trim()
		const cleanedLocation = locationName.trim()
		const parsedBatchYear = Number.parseInt(batchYear, 10)

		if (!cleanedName) {
			setErrorMessage("Full Name is required.")
			return
		}

		if (!Number.isInteger(parsedBatchYear) || parsedBatchYear < 1980 || parsedBatchYear > 2100) {
			setErrorMessage("Batch Year must be a valid number between 1980 and 2100.")
			return
		}

		setIsSubmitting(true)

		try {
			let nextLat: number | null = null
			let nextLng: number | null = null

			if (cleanedLocation) {
				setIsGeocoding(true)

				const geoRes = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedLocation)}`,
					{
						headers: {
							Accept: "application/json",
							"User-Agent": "URP-Connect-App",
						},
						cache: "no-store",
					},
				)

				if (!geoRes.ok) {
					throw new Error(`Geocoding request failed with status ${geoRes.status}`)
				}

				const geoResults = (await geoRes.json()) as NominatimResult[]
				console.log("[profile geocode][nominatim response]", geoResults)
				const topResult = geoResults[0]

				if (!topResult?.lat || !topResult?.lon) {
					throw new Error("Could not find coordinates for the provided location.")
				}

				const parsedLat = Number.parseFloat(topResult.lat)
				const parsedLng = Number.parseFloat(topResult.lon)

				if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
					throw new Error("Received invalid coordinates from geocoding service.")
				}

				nextLat = parsedLat
				nextLng = parsedLng
			}

			const { error } = await supabase
				.from("profiles")
				.update({
					full_name: cleanedName,
					batch_year: parsedBatchYear,
					bio: cleanedBio || null,
					location_name: cleanedLocation || null,
					lat: nextLat,
					lng: nextLng,
				})
				.eq("id", user.id)

			if (error) {
				console.log("[profile update][supabase error]", error)
				throw new Error(error.message)
			}

			setLat(nextLat)
			setLng(nextLng)
			setSuccessMessage("Profile updated successfully.")
		} catch (err: unknown) {
			setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.")
		} finally {
			setIsGeocoding(false)
			setIsSubmitting(false)
		}
	}

	return (
		<section className="min-h-screen bg-slate-950 px-4 py-8 md:px-8 md:py-12">
			<div className="mx-auto w-full max-w-3xl rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-6 shadow-2xl shadow-emerald-900/20 backdrop-blur md:p-8">
				<div className="mb-8 space-y-2">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Dashboard</p>
					<h1 className="text-3xl font-bold text-slate-100">My Profile</h1>
					<p className="text-sm text-slate-400">
						Keep your alumni profile current so others can discover you by city and batch.
					</p>
				</div>

				{errorMessage && (
					<Alert className="mb-5 border-red-500/40 bg-red-950/50 text-red-200">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Update Failed</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}

				{successMessage && (
					<div className="fixed bottom-5 right-5 z-50 w-[90vw] max-w-sm rounded-xl border border-emerald-500/50 bg-slate-900/95 p-4 text-emerald-200 shadow-2xl shadow-emerald-900/30">
						<div className="flex items-start gap-3">
							<CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
							<div>
								<p className="text-sm font-semibold">Success</p>
								<p className="text-sm text-emerald-100/90">{successMessage}</p>
							</div>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<label htmlFor="full_name" className="text-sm font-medium text-slate-200">
							Full Name
						</label>
						<div className="relative">
							<UserCircle2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-400" />
							<Input
								id="full_name"
								value={fullName}
								onChange={(event) => setFullName(event.target.value)}
								placeholder="Your full name"
								disabled={isFetching || isSubmitting}
								className="h-11 border-slate-700 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-500"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="batch_year" className="text-sm font-medium text-slate-200">
							Batch Year
						</label>
						<div className="relative">
							<CalendarDays className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-400" />
							<Input
								id="batch_year"
								type="number"
								value={batchYear}
								onChange={(event) => setBatchYear(event.target.value)}
								placeholder="e.g. 2018"
								min={1980}
								max={2100}
								disabled={isFetching || isSubmitting}
								className="h-11 border-slate-700 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-500"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="bio" className="text-sm font-medium text-slate-200">
							Bio
						</label>
						<div className="relative">
							<FileText className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-400" />
							<textarea
								id="bio"
								value={bio}
								onChange={(event) => setBio(event.target.value)}
								placeholder="What do you do and how can alumni connect with you?"
								rows={5}
								disabled={isFetching || isSubmitting}
								className="w-full rounded-md border border-slate-700 bg-slate-950 px-10 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
							/>
						</div>
					</div>

					<div className="space-y-2">
						<label htmlFor="location_name" className="text-sm font-medium text-slate-200">
							Location Name (Current City)
						</label>
						<div className="relative">
							<MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-400" />
							<Input
								id="location_name"
								value={locationName}
								onChange={(event) => setLocationName(event.target.value)}
								placeholder="Dhaka, Bangladesh"
								disabled={isFetching || isSubmitting}
								className="h-11 border-slate-700 bg-slate-950 pl-10 text-slate-100 placeholder:text-slate-500"
							/>
						</div>
					</div>

					{(lat !== null || lng !== null) && (
						<p className="rounded-lg border border-emerald-500/20 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
							Current Coordinates: lat {lat ?? "-"}, lng {lng ?? "-"}
						</p>
					)}

					<Button
						type="submit"
						disabled={isFetching || isSubmitting}
						className="h-11 w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-70"
					>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{isGeocoding ? "Geocoding..." : "Saving..."}
							</>
						) : (
							"Update Profile"
						)}
					</Button>
				</form>
			</div>
		</section>
	)
}
