import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AISearch from "@/components/AISearch";

export default async function DirectoryPage() {
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies: cookies,
  });

  // শুধুমাত্র approved অ্যালুমনাইদের ডাটা ফেচ করা
  const { data: alumni, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("status", "approved")
    .order("batch_year", { ascending: false });

  if (error) {
    return <div className="p-10 text-red-500">Error loading directory.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">URP Alumni Directory</h1>
          <p className="text-slate-400 text-lg">
            Connect with the global network of PUST Urban Planners.
          </p>
        </header>

        {/* AI Search Component - আমরা এখানে অ্যালুমনাই লিস্ট পাস করছি */}
        <AISearch initialAlumni={alumni || []} />
      </div>
    </div>
  );
}