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

  const queues = Object.values(twinState.queues || {}).filter(q => q.category === activeCategory);
  
  // Find a recommended one (shortest wait)
  const recommended = [...queues].sort((a, b) => a.wait_time - b.wait_time)[0];

  return (
    <div className="max-w-4xl mx-auto space-y-12 font-sans selection:bg-stadium-neon selection:text-stadium-dark">
      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-stadium-neon transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeCategory} services...`}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-stadium-neon/50 transition-all glass-card shadow-2xl placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-3 p-1 glass rounded-2xl border-white/5">
          <TabButton active={activeCategory === 'food'} onClick={() => setActiveCategory('food')}>Food</TabButton>
          <TabButton active={activeCategory === 'restroom'} onClick={() => setActiveCategory('restroom')}>Restrooms</TabButton>
          <TabButton active={activeCategory === 'merch'} onClick={() => setActiveCategory('merch')}>Merch</TabButton>
        </div>
      </div>

      {/* Live Crowd Flow */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <Zap size={16} className="text-stadium-neon" />
            Live {activeCategory} Flow
          </h2>
          <div className="text-[10px] bg-stadium-neon/10 px-3 py-1 rounded-lg text-stadium-neon font-black tracking-widest uppercase">
            Optimization Engine Active
          </div>
        </div>
        
        {activeCategory === 'restroom' ? (
          <div className="space-y-4">
            {queues.map((q) => (
              <RestroomRow 
                key={q.id}
                section={q.id} 
                status={q.occupancy! < 30 ? "High Availability" : q.occupancy! < 70 ? "Nominal Load" : "Peak Occupancy"} 
                color={q.occupancy! < 30 ? "text-stadium-success" : q.occupancy! < 70 ? "text-yellow-400" : "text-stadium-emergency"} 
                percent={q.occupancy || 0} 
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queues.map((q) => (
              <QueueCard 
                key={q.id}
                id={q.id} 
                name={q.id} 
                wait={`${q.wait_time} min`} 
                level={q.wait_time < 5 ? "LOW" : q.wait_time < 15 ? "MED" : "HIGH"} 
                distance={q.distance || '100m'} 
                recommended={recommended?.id === q.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Routing Advisory */}
      {recommended && activeCategory !== 'restroom' && (
        <div className="glass-card p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/5 blur-[100px] -mr-32 -mt-32"></div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-16 h-16 bg-stadium-neon/10 rounded-3xl flex items-center justify-center shrink-0 border border-stadium-neon/20 neon-glow">
              <Navigation className="text-stadium-neon" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-2 leading-none">Dynamic Re-routing</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                We've identified optimal flow for <span className="text-white font-bold">{activeCategory}</span>. 
                We recommend heading to <span className="text-stadium-neon font-black">{recommended.id}</span>. 
                Current wait: <span className="text-stadium-success font-black">{recommended.wait_time} mins</span>.
              </p>
              <button 
                onClick={onNavigateToAR}
                className="mt-8 px-8 py-3 bg-stadium-neon text-stadium-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center gap-3 neon-glow"
              >
                Start AR Navigation
                <ChevronRight size={16} />
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
    <div className={`glass-card p-8 group cursor-pointer hover:border-stadium-neon/40 relative overflow-hidden ${recommended ? 'shadow-[0_0_40px_rgba(6,182,212,0.2)] border-stadium-neon/30' : 'border-white/5'}`}>
      {recommended && (
        <div className="absolute top-0 right-0 px-4 py-2 bg-stadium-neon text-stadium-dark text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
          AI Choice
        </div>
      )}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">{id}</p>
          <h3 className="text-xl font-black mt-2 text-white">{name}</h3>
        </div>
        <div className={`p-3 rounded-2xl glass border ${level === 'LOW' ? 'border-stadium-success/30 text-stadium-success' : 'border-stadium-emergency/30 text-stadium-emergency'}`}>
          <Clock size={20} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Wait</p>
          <p className={`text-lg font-black mt-1 ${level === 'LOW' ? 'text-stadium-success' : 'text-stadium-emergency'}`}>{wait}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Load</p>
          <p className="text-sm font-bold mt-1 text-slate-300">{level}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Range</p>
          <div className="flex items-center gap-1 mt-1">
             <MapPin size={12} className="text-stadium-neon" />
             <span className="text-sm font-bold text-slate-300">{distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CapacityProps { section: string; status: string; color: string; percent: number }
function CapacityBar({ section, status, color, percent }: CapacityProps) {
  return (
    <div className="glass-card p-5 group flex items-center justify-between hover:bg-white/5 transition-all border-white/5">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-stadium-neon transition-colors border-white/10 overflow-hidden relative">
           <div className="absolute inset-x-0 bottom-0 bg-stadium-neon/10 transition-all" style={{ height: `${percent}%` }}></div>
           <Users size={22} className="relative z-10" />
        </div>
        <div>
          <p className="text-sm font-black text-white">{section}</p>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${color}`}>{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="hidden sm:block w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${percent}%` }}
            className={`h-full ${color.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          ></motion.div>
        </div>
        <ChevronRight className="text-slate-600 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}

interface TabProps { children: React.ReactNode; active: boolean; onClick: () => void }
function QueueTab({ children, active, onClick }: TabProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'bg-stadium-neon text-stadium-dark shadow-lg shadow-stadium-neon/20' : 'text-slate-500 hover:text-white'}`}
    >
      {children}
    </button>
  );
}
