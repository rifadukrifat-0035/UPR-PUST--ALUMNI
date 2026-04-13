import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"
import ProfileForm from "./profile-form"

type ProfileRow = {
  full_name: string | null
  bio: string | null
  batch_year: number | null
  location_name: string | null
  lat: number | null
  lng: number | null
}

export default async function MyProfilePage() {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("[profile session error]", sessionError)
  }

  if (!session?.user?.id) {
    redirect("/login")
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, bio, batch_year, location_name, lat, lng")
    .eq("id", session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error("[profile fetch error]", profileError)
  }

  const profile = (profileData ?? null) as ProfileRow | null

  async function updateProfile(formData: FormData) {
    "use server"

    const supabase = await createServerComponentClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user?.id) {
      redirect("/login")
    }

    const fullName = String(formData.get("full_name") ?? "").trim()
    const bio = String(formData.get("bio") ?? "").trim()
    const currentCity = String(formData.get("current_city") ?? "").trim()

    const rawBatchYear = String(formData.get("batch_year") ?? "").trim()
    const parsedBatchYear = rawBatchYear ? Number.parseInt(rawBatchYear, 10) : Number.NaN
    const batchYear = Number.isFinite(parsedBatchYear) ? parsedBatchYear : null

    let lat: number | null = null
    let lng: number | null = null

    if (currentCity) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(currentCity)}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "UPR-PUST-ALUMNI/1.0",
            },
            cache: "no-store",
          },
        )

        if (!response.ok) {
          throw new Error(`Geocoding failed with status ${response.status}`)
        }

        const results = (await response.json()) as Array<{ lat?: string; lon?: string }>
        const matched = results[0]

        if (matched?.lat && matched?.lon) {
          const parsedLat = Number.parseFloat(matched.lat)
          const parsedLng = Number.parseFloat(matched.lon)

          lat = Number.isFinite(parsedLat) ? parsedLat : null
          lng = Number.isFinite(parsedLng) ? parsedLng : null
        }
      } catch (error) {
        console.error("[profile geocode error]", error)
      }
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        full_name: fullName || null,
        bio: bio || null,
        batch_year: batchYear,
        location_name: currentCity || null,
        lat,
        lng,
      },
      { onConflict: "id" },
    )

    if (error) {
      console.error("[profile update error]", error)
      return
    }

    revalidatePath("/profile")
    redirect("/profile")
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-900/50 p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(45,212,191,0.12),transparent_30%)]" />

      <div className="relative space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300/90">My Profile</p>
          <h1 className="text-3xl font-semibold text-slate-100 md:text-4xl">Edit Your Alumni Profile</h1>
          <p className="max-w-2xl text-sm text-slate-300/80 md:text-base">
            Keep your details current so other alumni can find you in the directory and map.
          </p>
        </div>

        <ProfileForm
          defaultValues={{
            fullName: profile?.full_name ?? "",
            bio: profile?.bio ?? "",
            batchYear: profile?.batch_year ? String(profile.batch_year) : "",
            currentCity: profile?.location_name ?? "",
          }}
          updateProfile={updateProfile}
        />
      </div>
    </section>
  )
}
