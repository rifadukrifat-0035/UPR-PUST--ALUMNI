import Link from 'next/link';
import { GraduationCap, Users, MapPin, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="max-w-4xl text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
          <Sparkles size={16} />
          <span>Powered by AI & GIS for URPians</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Connecting <span className="text-emerald-500">PUST URP</span> Alumni Worldwide
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The official networking hub for the Department of Urban and Regional Planning, Pabna University of Science & Technology.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/directory" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <Users size={20} />
            Explore Directory
          </Link>
          <Link href="/login" className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2">
            <GraduationCap size={20} />
            Join the Network
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="text-emerald-500 mb-3"><MapPin size={24}/></div>
            <h3 className="font-semibold mb-1">Global Map</h3>
            <p className="text-sm text-slate-500">Locate our alumni in various sectors around the globe.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="text-emerald-500 mb-3"><Sparkles size={24}/></div>
            <h3 className="font-semibold mb-1">AI Search</h3>
            <p className="text-sm text-slate-500">Find mentors and researchers using natural language.</p>
          </div>
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl">
            <div className="text-emerald-500 mb-3"><Users size={24}/></div>
            <h3 className="font-semibold mb-1">Verified Portal</h3>
            <p className="text-sm text-slate-500">Secure and exclusive access for PUST URP students only.</p>
          </div>
        </div>
      </div>
    </main>
  );
}