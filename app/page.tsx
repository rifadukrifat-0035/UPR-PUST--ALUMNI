import Link from "next/link";
import { GraduationCap, Users, MapPin, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 text-slate-200">
      <div className="absolute top-0 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="z-10 max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
          <Sparkles size={16} />
          <span>Powered by AI and GIS for URPians</span>
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
          Connecting <span className="text-emerald-500">PUST URP</span> Alumni Worldwide
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
          The official networking hub for the Department of Urban and Regional Planning,
          Pabna University of Science and Technology.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/directory"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500"
          >
            <Users size={20} />
            Explore Directory
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-8 py-4 font-semibold transition-all hover:bg-slate-800"
          >
            <GraduationCap size={20} />
            Join the Network
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 text-left md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 text-emerald-500">
              <MapPin size={24} />
            </div>
            <h3 className="mb-1 font-semibold">Global Map</h3>
            <p className="text-sm text-slate-500">
              Locate alumni working across different regions and sectors.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 text-emerald-500">
              <Sparkles size={24} />
            </div>
            <h3 className="mb-1 font-semibold">AI Search</h3>
            <p className="text-sm text-slate-500">
              Find mentors and peers with natural-language search.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="mb-3 text-emerald-500">
              <Users size={24} />
            </div>
            <h3 className="mb-1 font-semibold">Verified Portal</h3>
            <p className="text-sm text-slate-500">
              Secure access designed for PUST URP students and alumni.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
