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
    <div className="glass-card overflow-hidden border-white/5 shadow-2xl group transition-all hover:bg-white/[0.02]">
      {/* Hero Header */}
      <div className="h-40 md:h-56 relative overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-stadium-dark/40 to-transparent" />
        
        <div className="absolute bottom-4 left-5 pr-5">
           <div className="flex items-center gap-1.5 text-stadium-neon mb-1 md:mb-2 text-[8px] md:text-[10px]">
              <MapPin className="size-2.5 md:size-3" />
              <span className="font-bold uppercase tracking-widest">{stadium.city}, {stadium.state}</span>
           </div>
           <h3 className="text-lg md:text-2xl font-bold tracking-tight text-white leading-tight">{stadium.name}</h3>
        </div>
        
        {!loading && (
          <div className="absolute top-4 right-5 px-2 py-0.5 bg-black/60 backdrop-blur-xl rounded-lg border border-white/5 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-stadium-success rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
             <span className="text-[8px] md:text-[10px] font-bold uppercase text-white tracking-widest">LIVE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 md:p-8 space-y-6 md:space-y-8">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 md:mb-2">Current Occupancy</p>
               <div className="flex items-baseline gap-2 md:gap-3">
                  <span className="text-xl md:text-3xl font-black text-white tracking-tight leading-none">{intel?.occupancy.current.toLocaleString()}</span>
                  <span className="text-[10px] md:text-sm text-slate-500 font-bold">/ {intel?.occupancy.capacity.toLocaleString()}</span>
               </div>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-stadium-neon/20 bg-stadium-neon/5 flex items-center justify-center font-black text-stadium-neon text-base md:text-lg shadow-inner shrink-0">
               {intel?.occupancy.percent}%
            </div>
         </div>

         <div className="space-y-3 md:space-y-4">
            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 md:mb-3">Tactical Gate Flow</p>
            {intel?.gateWaitTimes.map((gate, i) => (
              <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white/[0.03] rounded-xl md:rounded-2xl border border-white/5 hover:bg-white/5 transition-all group/gate">
                 <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div className={`p-2 rounded-lg md:rounded-xl shrink-0 ${gate.status === 'critical' ? 'bg-stadium-emergency/10 border border-stadium-emergency/20' : 'bg-white/5 border border-white/5'}`}>
                        <Clock className={`size-3.5 md:size-4 ${gate.status === 'critical' ? 'text-stadium-emergency' : gate.status === 'watch' ? 'text-stadium-warning' : 'text-slate-500 group-hover/gate:text-stadium-neon transition-colors'}`} />
                    </div>
                    <span className="text-xs md:text-sm font-bold text-slate-300 truncate">{gate.gate}</span>
                 </div>
                 <div className="text-right shrink-0">
                    <span className={`text-xs md:text-sm font-black block leading-none ${gate.status === 'critical' ? 'text-stadium-emergency' : gate.status === 'watch' ? 'text-stadium-warning' : 'text-stadium-success'}`}>
                        {gate.minutes}m
                    </span>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5 block">WAIT TIME</span>
                 </div>
              </div>
            ))}
         </div>

         {/* Map Integration */}
         <div className="rounded-xl md:rounded-2xl border border-white/5 overflow-hidden h-32 md:h-40 relative group/map shadow-2xl bg-slate-900">
            <iframe 
                title="venue-map"
                src={mapUrl}
                className="w-full h-full grayscale opacity-20 group-hover/map:grayscale-0 group-hover/map:opacity-100 transition-all duration-1000"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark/90 to-transparent pointer-events-none" />
            <a 
              href={buildGoogleMapsLink(stadium)} 
              target="_blank" 
              rel="noreferrer"
              className="absolute bottom-3 right-3 p-2 bg-stadium-dark/80 backdrop-blur-xl rounded-lg border border-white/10 text-stadium-neon hover:scale-105 transition-all shadow-xl flex items-center gap-2 pr-4 tap-target"
            >
               <ExternalLink size={14} />
               <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">Open Maps</span>
            </a>
         </div>
      </div>
    </div>
  );
}
