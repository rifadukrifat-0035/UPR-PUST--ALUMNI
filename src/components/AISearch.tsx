"use client";

import { useState } from "react";
import { Search, Sparkles, User, MapPin, GraduationCap } from "lucide-react";

export default function AISearch({ initialAlumni }: { initialAlumni: any[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(initialAlumni);
  const [isLoading, setIsLoading] = useState(false);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults(initialAlumni);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are an assistant for a university alumni portal. 
              Given the following alumni data in JSON format, filter and return ONLY a JSON array of IDs that match the user's natural language request. 
              Data: ${JSON.stringify(initialAlumni.map(a => ({ id: a.id, name: a.full_name, batch: a.batch_year, location: a.location_name, bio: a.bio })))}`
            },
            { role: "user", content: query }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const matchedIds = JSON.parse(data.choices[0].message.content).ids;
      
      const filtered = initialAlumni.filter(alumnus => matchedIds.includes(alumnus.id));
      setResults(filtered);
    } catch (error) {
      console.error("AI Search Error:", error);
      // Fallback: Simple keyword search if AI fails
      const fallback = initialAlumni.filter(a => 
        a.full_name.toLowerCase().includes(query.toLowerCase()) || 
        a.batch_year.toString().includes(query)
      );
      setResults(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleAISearch} className="relative max-w-2xl mx-auto group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: '2019 batch alumni living in Dhaka'..."
          className="w-full bg-slate-900 border border-emerald-500/30 rounded-full py-4 px-6 pl-14 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-lg shadow-emerald-500/5"
        />
        <Search className="absolute left-5 top-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
        <button 
          type="submit"
          className="absolute right-3 top-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all active:scale-95"
        >
          {isLoading ? "Thinking..." : <><Sparkles size={18} /> Ask AI</>}
        </button>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((alumnus) => (
          <div key={alumnus.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/40 transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-full">
                <User className="text-emerald-500" size={24} />
              </div>
              <span className="text-xs font-mono text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/20">
                Batch {alumnus.batch_year}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">{alumnus.full_name}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <MapPin size={14} /> {alumnus.location_name || "Location hidden"}
            </div>
            <p className="text-slate-500 text-sm line-clamp-2 italic">
              "{alumnus.bio || "No bio available."}"
            </p>
          </div>
        ))}
      </div>

      {results.length === 0 && !isLoading && (
        <div className="text-center py-20 text-slate-500">
          No alumni found matching your smart search.
        </div>
      )}
    </div>
  );
}