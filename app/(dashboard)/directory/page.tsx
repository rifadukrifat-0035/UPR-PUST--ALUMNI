import { createServerComponentClient } from "@/lib/supabase/server"
import DirectoryClient from "./directory-client"

type AlumniProfile = {
  id: string
  full_name: string | null
  batch_year: number | null
  location_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default async function AlumniDirectoryPage() {
  const supabase = await createServerComponentClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, batch_year, location_name, bio, avatar_url")
    .eq("status", "approved")
    .order("full_name", { ascending: true })

  if (error) {
    console.error("[directory fetch error]", error)
  }

  const profiles: AlumniProfile[] = (data ?? []) as AlumniProfile[]

  return <DirectoryClient profiles={profiles} />
}
