"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClientComponentClient } from '@/lib/supabase/client';
import 'leaflet/dist/leaflet.css';

// Leaflet সরাসরি SSR এ কাজ করে না, তাই dynamic import প্রয়োজন
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

type AlumniProfile = {
  id: string;
  full_name: string | null;
  batch_year: number | null;
  location_name: string | null;
  lat: number;
  lng: number;
};

export default function AlumniMap() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAlumniWithLocation = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .not('lat', 'is', null);

      if (!error && data) {
        setAlumni(data);
      }
      setLoading(false);
    };

    fetchAlumniWithLocation();
    
    // Leaflet Icon fix (Next.js এ আইকন না দেখা গেলে এটি প্রয়োজন)
    import('leaflet').then((L) => {
      // @ts-expect-error Leaflet adds this internal method at runtime.
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, [supabase]);

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-emerald-500">Loading Map Intelligence...</div>;

  return (
    <div className="h-screen w-full bg-slate-950 p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Global Alumni Map</h1>
        <p className="text-slate-400">Showing {alumni.length} verified URPians on the grid.</p>
      </div>

      <div className="h-[70vh] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/5">
        <MapContainer 
          center={[23.6850, 90.3563]} // বাংলাদেশ সেন্টার
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Dark Mode Map Tiles - আরবান প্ল্যানিং লুকের জন্য */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {alumni.map((person) => (
            <Marker key={person.id} position={[person.lat, person.lng]}>
              <Popup>
                <div className="p-2 leading-tight">
                  <h3 className="font-bold text-slate-900">{person.full_name}</h3>
                  <p className="text-xs text-emerald-600 font-semibold">Batch {person.batch_year}</p>
                  <p className="text-xs text-slate-600 mt-1 italic">{person.location_name}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 text-center uppercase tracking-widest">
        Integrated Spatial Intelligence | PUST URP Connect
      </div>
    </div>
  );
}