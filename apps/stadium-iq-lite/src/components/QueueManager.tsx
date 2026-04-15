import React, { useState } from 'react';
import { 
  Search, 
  Coffee, 
  Navigation, 
  ChevronRight, 
  Clock, 
  MapPin,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useRealtime } from '../hooks/useRealtime';

export default function QueueManager({ onNavigateToAR }: { onNavigateToAR: () => void }) {
  const [activeCategory, setActiveCategory] = useState('food');
  const { twinState } = useRealtime();

  const getFilteredData = () => {
    if (activeCategory === 'food') return Object.values(twinState.food || {});
    if (activeCategory === 'restroom') return Object.values(twinState.toilets || {});
    return [];
  };

  const queues = getFilteredData();
  
  // Find a recommended one (shortest wait or lowest occupancy)
  const recommended = [...queues].sort((a: any, b: any) => {
     if (activeCategory === 'restroom') return (a.occupancy || 0) - (b.occupancy || 0);
     return (a.wait_time || 0) - (b.wait_time || 0);
  })[0];

  // Global exposure for subcomponents
  (window as any).__onNavigateToAR = onNavigateToAR;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Search & Categories Container */}
      <div className="flex flex-col gap-6 mb-8 md:mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-stadium-neon transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeCategory} arrays...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-stadium-neon/50 transition-all shadow-2xl placeholder:text-slate-600 text-sm"
          />
        </div>
        
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scroll-smooth custom-scrollbar">
          <QueueTab active={activeCategory === 'food'} onClick={() => setActiveCategory('food')}>Catering</QueueTab>
          <QueueTab active={activeCategory === 'restroom'} onClick={() => setActiveCategory('restroom')}>Hygiene</QueueTab>
          <QueueTab active={activeCategory === 'merch'} onClick={() => setActiveCategory('merch')}>Logistics</QueueTab>
        </div>
      </div>

      {/* Live Crowd Flow Section */}
      <section className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Zap size={16} className="text-stadium-neon" />
            Live {activeCategory} Telemetry
          </h2>
          <div className="inline-flex text-[8px] md:text-[9px] bg-stadium-neon/10 px-3 py-1 rounded-lg text-stadium-neon font-bold tracking-widest uppercase border border-stadium-neon/10 w-fit">
            AI Triage Priority
          </div>
        </div>
        
        {activeCategory === 'restroom' ? (
          <div className="space-y-3 md:space-y-4">
            {queues.map((q) => (
              <CapacityBar 
                key={q.id}
                section={q.id} 
                status={q.occupancy! < 30 ? "OPTIMAL" : q.occupancy! < 70 ? "NOMINAL" : "CONGESTED"} 
                color={q.occupancy! < 30 ? "text-stadium-success" : q.occupancy! < 70 ? "text-stadium-warning" : "text-stadium-emergency"} 
                percent={q.occupancy || 0} 
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {queues.map((q: any) => (
              <QueueCard 
                key={q.id}
                id={q.id} 
                name={q.id} 
                wait={q.wait_time} 
                level={q.wait_time < 10 ? "LOW" : q.wait_time < 25 ? "MED" : "HIGH"} 
                distance={q.distance || 'Near Section 102'} 
                recommended={recommended?.id === q.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Routing Advisory */}
      {recommended && (
        <div className="mt-8 md:mt-12 glass-card p-6 md:p-10 relative overflow-hidden group border-stadium-neon/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/5 blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 relative z-10 text-center sm:text-left">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-stadium-neon/10 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border border-stadium-neon/20 shadow-lg shadow-cyan-500/10">
              <Navigation className="text-stadium-neon size-6 md:size-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-none uppercase tracking-tight">Active Rerouting Target</h3>
              <p className="text-[11px] md:text-sm text-slate-400 leading-relaxed max-w-xl">
                Telemetry implies optimal flow at <span className="text-white font-bold">{activeCategory.toUpperCase()} Array</span>. 
                We recommend heading to <span className="text-stadium-neon font-black">{(recommended as any).id}</span>. 
                {activeCategory === 'restroom' ? (
                  <>Current occupancy: <span className="text-stadium-success font-black">{(recommended as any).occupancy}%</span></>
                ) : (
                  <>Est. wait: <span className="text-stadium-success font-black">{(recommended as any).wait_time} MINS</span></>
                )}
              </p>
              <button 
                onClick={onNavigateToAR}
                className="mt-6 md:mt-8 w-full sm:w-auto px-8 py-3 bg-stadium-neon text-stadium-dark font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20 tap-target flex items-center justify-center gap-3"
              >
                Start AR Navigation
                <Navigation size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface QueueItem { id: string; name: string; wait: number; level: string; distance: string; recommended: boolean }
function QueueCard({ id, name, wait, level, distance, recommended }: QueueItem) {
  return (
    <div className={`glass-card p-6 md:p-8 group cursor-pointer hover:border-stadium-neon/40 relative overflow-hidden transition-all ${recommended ? 'shadow-2xl border-stadium-neon/30 bg-stadium-neon/5' : 'border-white/5'}`}>
      {recommended && (
        <div className="absolute top-0 right-0 px-3 py-1.5 bg-stadium-neon text-stadium-dark text-[8px] font-bold uppercase tracking-widest rounded-bl-lg shadow-lg">
          HQ CHOICE
        </div>
      )}
      <div className="flex justify-between items-start mb-6 md:mb-8">
        <div>
          <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-black tracking-widest">{id}</p>
          <h3 className="text-base md:text-xl font-bold mt-1.5 text-white tracking-tight leading-none">{name}</h3>
        </div>
        <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl glass border transition-colors ${level === 'LOW' ? 'border-stadium-success/30 text-stadium-success' : 'border-stadium-emergency/30 text-stadium-emergency'}`}>
          <div className="flex flex-col items-center">
            <Clock className="size-4 md:size-4.5 mb-1" />
            <span className="text-[8px] font-black">{level}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/5 gap-4">
        <div className="flex gap-4 md:gap-6">
          <div>
            <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest">Wait</p>
            <p className={`text-base md:text-lg font-black mt-1 ${level === 'LOW' ? 'text-stadium-success' : 'text-stadium-emergency'}`}>{wait}m</p>
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest">Range</p>
            <div className="flex items-center gap-1 mt-1">
               <MapPin className="text-stadium-neon shrink-0 size-2.5 md:size-3" />
               <span className="text-xs md:text-sm font-bold text-slate-300 truncate">{distance}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); (window as any).__onNavigateToAR?.(); }}
          className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-stadium-neon hover:text-stadium-dark text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5 transition-all tap-target flex items-center justify-center gap-2"
        >
          Start AR Navigation
          <Navigation className="size-2.5" />
        </button>
      </div>
    </div>
  );
}

interface CapacityProps { section: string; status: string; color: string; percent: number }
function CapacityBar({ section, status, color, percent }: CapacityProps) {
  return (
    <div className="glass-card p-4 md:p-5 group flex items-center justify-between hover:bg-white/5 transition-all border-white/5">
      <div className="flex items-center gap-4 md:gap-5">
        <div className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-stadium-neon transition-colors border-white/10 overflow-hidden relative">
           <div className="absolute inset-x-0 bottom-0 bg-stadium-neon/10 transition-all" style={{ height: `${percent}%` }}></div>
           <Users className="relative z-10 size-4.5 md:size-5.5" />
        </div>
        <div>
          <p className="text-xs md:text-sm font-bold text-white tracking-tight">{section}</p>
          <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 md:mt-1 ${color}`}>{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={(e) => { e.stopPropagation(); (window as any).__onNavigateToAR?.(); }}
          className="hidden xs:flex px-3 py-1.5 bg-white/5 hover:bg-emerald-500 hover:text-white text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/5 transition-all items-center gap-2"
        >
          NAV
          <Navigation className="size-2.5" />
        </button>
        <div className="hidden xs:block w-24 md:w-32 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percent}%` }}
            className={`h-full ${color.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          ></motion.div>
        </div>
        <ChevronRight className="text-slate-600 transition-transform group-hover:translate-x-1 size-4 md:size-5" />
      </div>
    </div>
  );
}

interface TabProps { children: React.ReactNode; active: boolean; onClick: () => void }
function QueueTab({ children, active, onClick }: TabProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all whitespace-nowrap tap-target ${active ? 'bg-stadium-neon text-stadium-dark shadow-md shadow-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {children}
    </button>
  );
}
