import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeCheck, FileText, Lock, ShieldCheck } from "lucide-react"

type PendingProfile = {
  id: string
  full_name: string | null
  batch_year: number | null
  verification_url: string | null
}

type CurrentProfile = {
  role: string | null
}

async function approveProfile(formData: FormData) {
  "use server"

  const profileId = String(formData.get("profileId") || "")
  if (!profileId) return

  const supabase = await createServerComponentClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user?.id) {
    return
  }

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle()

  if (currentProfileError) {
    console.error("[admin approve role fetch error]", currentProfileError)
    return
  }

  const profile = currentProfile as CurrentProfile | null
  if (profile?.role !== "admin") {
    return
  }

  const { error } = await supabase
    .from("profiles")
    .update({ status: "approved", is_verified: true })
    .eq("id", profileId)

  if (error) {
    console.error("[admin approve error]", error)
  }

  revalidatePath("/admin")
}

export default async function AdminVerificationPage() {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("[admin session error]", sessionError)
  }

  if (!session?.user?.id) {
    redirect("/login")
  }

  const currentUserId = session.user.id
  const { data: currentProfile, error: currentProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUserId)
    .maybeSingle()

  if (currentProfileError) {
    console.error("[admin profile role error]", currentProfileError)
  }

  const profile = currentProfile as CurrentProfile | null
  console.log("User Role:", profile?.role ?? null)

  if (profile?.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border border-emerald-500/40 bg-slate-900/50 text-slate-200">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Restricted</span>
            </div>
            <CardTitle className="text-2xl text-slate-100">Access Denied</CardTitle>
            <CardDescription className="text-slate-400">
              You are not authorized to access the admin verification dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, batch_year, verification_url")
    .eq("status", "pending")
    .neq("id", currentUserId)
    .order("batch_year", { ascending: false })

  if (error) {
    console.error("[admin fetch pending error]", error)
  }

  const pendingProfiles: PendingProfile[] = (data ?? []) as PendingProfile[]

  return (
    <section className="space-y-6 rounded-xl bg-slate-950 p-1">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wide">Admin Panel</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-100">Admin Verification Dashboard</h1>
        <p className="text-slate-400">Review pending alumni verification submissions.</p>
      </div>

      <Card className="border border-slate-800 bg-slate-900/50 text-slate-200">
        <CardContent className="p-0">
          {pendingProfiles.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No pending profiles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Batch Year</th>
                    <th className="px-4 py-3 font-medium">Document</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProfiles.map((profile) => (
                    <tr key={profile.id} className="border-b border-slate-800/70">
                      <td className="px-4 py-3 text-slate-200">{profile.full_name || "Unknown"}</td>
                      <td className="px-4 py-3 text-slate-300">{profile.batch_year ?? "N/A"}</td>
                      <td className="px-4 py-3">
                        {profile.verification_url ? (
                          <a
                            href={profile.verification_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            View Document
                          </a>
                        ) : (
                          <span className="text-slate-500">No document</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <form action={approveProfile}>
                          <input type="hidden" name="profileId" value={profile.id} />
                          <Button
                            type="submit"
                            className="h-8 bg-emerald-500 px-3 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                          >
                            <BadgeCheck className="h-4 w-4" />
                            Approve
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
