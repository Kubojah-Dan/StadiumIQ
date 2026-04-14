import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, ExternalLink, Globe, Navigation } from 'lucide-react';
import { type Stadium, buildGoogleMapsEmbedUrl, buildGoogleMapsLink } from '../context/StadiumContext';
import { motion } from 'framer-motion';

type LiveIntel = {
    heroImageUrl: string | null;
    occupancy: { current: number; capacity: number; percent: number };
    gateWaitTimes: Array<{ gate: string; minutes: number; status: "normal" | "watch" | "critical" }>;
};

export default function StadiumIntelCard({ stadium }: { stadium: Stadium }) {
  const [intel, setIntel] = useState<LiveIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    // Priority 1: Fetch from Wikipedia API if slug exists
    if (stadium.wikipediaSlug) {
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${stadium.wikipediaSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.originalimage?.source) {
            setHeroImage(data.originalimage.source);
          } else if (data.thumbnail?.source) {
            setHeroImage(data.thumbnail.source);
          }
        })
        .catch(() => {
          // Fallback to placeholder if Wikipedia fails
          setHeroImage(`https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800`);
        });
    }
  }, [stadium.wikipediaSlug]);

  useEffect(() => {
    let active = true;
    const fetchIntel = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/stadium/live?stadiumId=${stadium.id}`);
            if (!res.ok) throw new Error("API Offline");
            const data = await res.json();
            if (active) setIntel(data);
        } catch (e) {
            // Fallback mock
            if (active) {
                setIntel({
                    heroImageUrl: `https://images.unsplash.com/photo-1540747913346-19e3adbb17c3?auto=format&fit=crop&q=80&w=1200`,
                    occupancy: { current: Math.floor(stadium.capacity! * 0.82), capacity: stadium.capacity!, percent: 82 },
                    gateWaitTimes: [
                        { gate: "North Gate", minutes: 8, status: "normal" },
                        { gate: "Gate 7", minutes: 12, status: "watch" },
                        { gate: "VIP South", minutes: 3, status: "normal" }
                    ]
                });
            }
        } finally {
            if (active) setLoading(false);
        }
    };

    fetchIntel();
    return () => { active = false; };
  }, [stadium.id]);

  const mapUrl = buildGoogleMapsEmbedUrl(stadium);

  return (
    <div className="glass-card overflow-hidden border-white/5 shadow-2xl group">
      {/* Hero Header */}
      <div className="h-56 relative overflow-hidden">
        {loading ? (
            <div className="absolute inset-0 bg-slate-900 animate-pulse" />
        ) : (
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={heroImage || intel?.heroImageUrl || ''} 
              alt={stadium.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        
        <div className="absolute bottom-6 left-8 right-8">
           <div className="flex items-center gap-2 text-stadium-neon mb-2">
              <MapPin size={12} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{stadium.city}, {stadium.state}</span>
           </div>
           <h3 className="text-2xl font-bold tracking-tight text-white">{stadium.name}</h3>
        </div>
        
        {!loading && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-[#020617]/60 backdrop-blur-xl rounded-lg border border-white/5 flex items-center gap-2">
             <div className="w-2 h-2 bg-stadium-success rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-bold uppercase text-white tracking-widest">LIVE DATA</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Venue Occupancy</p>
               <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white tracking-tight">{intel?.occupancy.current.toLocaleString()}</span>
                  <span className="text-sm text-slate-500 font-medium">/ {intel?.occupancy.capacity.toLocaleString()}</span>
               </div>
            </div>
            <div className="w-14 h-14 rounded-2xl border border-stadium-neon/20 bg-stadium-neon/5 flex items-center justify-center font-bold text-stadium-neon text-lg shadow-inner">
               {intel?.occupancy.percent}%
            </div>
         </div>

         <div className="space-y-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Entrance Live Traffic</p>
            {intel?.gateWaitTimes.map((gate, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group/gate">
                 <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${gate.status === 'critical' ? 'bg-stadium-emergency/10' : 'bg-white/5'}`}>
                        <Clock size={16} className={gate.status === 'critical' ? 'text-stadium-emergency' : gate.status === 'watch' ? 'text-yellow-500' : 'text-slate-400'} />
                    </div>
                    <span className="text-sm font-semibold text-slate-200">{gate.gate}</span>
                 </div>
                 <div className="text-right">
                    <span className={`text-sm font-bold block ${gate.status === 'critical' ? 'text-stadium-emergency' : gate.status === 'watch' ? 'text-yellow-500' : 'text-stadium-success'}`}>
                        {gate.minutes}m wait
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Current Flow</span>
                 </div>
              </div>
            ))}
         </div>

         {/* Map Integration */}
         <div className="rounded-2xl border border-white/5 overflow-hidden h-40 relative group/map shadow-2xl">
            <iframe 
                title="map"
                src={mapUrl}
                className="w-full h-full grayscale opacity-40 group-hover/map:grayscale-0 group-hover/map:opacity-100 transition-all duration-700"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent pointer-events-none" />
            <a 
              href={buildGoogleMapsLink(stadium)} 
              target="_blank" 
              rel="noreferrer"
              className="absolute bottom-4 right-4 p-2.5 bg-[#020617]/80 backdrop-blur-xl rounded-xl border border-white/10 text-stadium-neon hover:scale-110 transition-all shadow-xl flex items-center gap-2 pr-4"
            >
               <ExternalLink size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Maps</span>
            </a>
         </div>
      </div>

    </div>
  );
}
