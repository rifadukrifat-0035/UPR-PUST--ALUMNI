import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase/server"

type CurrentUserProfile = {
  role: string | null
}

export async function Navbar() {
  const supabase = await createServerComponentClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let isAdmin = false

  if (session?.user?.id) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle()

    const profile = (data ?? null) as CurrentUserProfile | null
    isAdmin = profile?.role === "admin"
  }

  async function logout() {
    "use server"

    const supabase = await createServerComponentClient()
    await supabase.auth.signOut()
    redirect("/login")
  }

  return (
    <header className="border-b border-zinc-800/80 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="text-sm font-semibold tracking-wide text-zinc-100">Alumni Portal</div>

        {session?.user?.id ? (
          <nav className="flex items-center gap-5 text-xs font-medium text-zinc-300">
            <Link href="/directory" className="transition-colors hover:text-emerald-400">
              Directory
            </Link>
            <Link href="/map" className="transition-colors hover:text-emerald-400">
              Map
            </Link>
            <Link href="/profile" className="transition-colors hover:text-emerald-400">
              My Profile
            </Link>
            {isAdmin && (
              <Link href="/admin" className="transition-colors hover:text-emerald-400">
                Admin
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
              >
                Logout
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-5 text-xs font-medium text-zinc-300">
            <Link href="/directory" className="transition-colors hover:text-emerald-400">
              Directory
            </Link>
            <Link href="/map" className="transition-colors hover:text-emerald-400">
              Map
            </Link>
            <Link href="/login" className="transition-colors hover:text-emerald-400">
              Sign In
            </Link>
            <Link href="/login" className="transition-colors hover:text-emerald-400">
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}