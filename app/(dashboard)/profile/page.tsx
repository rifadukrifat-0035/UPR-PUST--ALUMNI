import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"
import ProfileForm from "./profile-form"

type ProfileRow = {
  full_name: string | null
  bio: string | null
  batch_year: number | null
  location: string | null
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
    .select("full_name, bio, batch_year, location, lat, lng")
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
    const location = String(formData.get("location") ?? "").trim()

    const rawBatchYear = String(formData.get("batch_year") ?? "").trim()
    const parsedBatchYear = rawBatchYear ? Number.parseInt(rawBatchYear, 10) : Number.NaN
    const batchYear = Number.isFinite(parsedBatchYear) ? parsedBatchYear : null

    const rawLat = String(formData.get("lat") ?? "").trim()
    const rawLng = String(formData.get("lng") ?? "").trim()
    const parsedLat = rawLat ? Number.parseFloat(rawLat) : Number.NaN
    const parsedLng = rawLng ? Number.parseFloat(rawLng) : Number.NaN

    const lat = Number.isFinite(parsedLat) ? parsedLat : null
    const lng = Number.isFinite(parsedLng) ? parsedLng : null

    const { error } = await supabase.from("profiles").upsert(
      {
        id: session.user.id,
        full_name: fullName || null,
        bio: bio || null,
        batch_year: batchYear,
        location: location || null,
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
            location: profile?.location ?? "",
            lat: profile?.lat !== null && profile?.lat !== undefined ? String(profile.lat) : "",
            lng: profile?.lng !== null && profile?.lng !== undefined ? String(profile.lng) : "",
          }}
          updateProfile={updateProfile}
        />
      </div>
    </section>
  )
}
