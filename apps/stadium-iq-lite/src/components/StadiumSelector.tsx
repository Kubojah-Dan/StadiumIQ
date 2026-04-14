import React, { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStadium, STADIUMS_INDIA } from '../context/StadiumContext';

export default function StadiumSelector() {
  const { stadium, setStadiumId } = useStadium();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group shadow-inner"
      >
        <div className="w-10 h-10 rounded-xl bg-stadium-neon/10 flex items-center justify-center text-stadium-neon group-hover:scale-105 transition-transform border border-stadium-neon/20">
          <MapPin size={20} />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Active Venue</p>
          <p className="text-sm font-bold text-white flex items-center gap-2">
            {stadium.name}
            <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-stadium-neon' : ''}`} />
          </p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-stadium-dark/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 mt-3 w-[320px] glass border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] px-4 py-3 border-b border-white/5 mb-2">Select Stadium</p>
                <div className="space-y-1">
                    {STADIUMS_INDIA.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => {
                        setStadiumId(s.id);
                        setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-[18px] transition-all ${stadium.id === s.id ? 'bg-stadium-neon/10 text-stadium-neon border border-stadium-neon/20' : 'hover:bg-white/5 text-slate-300 border border-transparent'}`}
                    >
                        <div className="text-left">
                        <p className={`text-sm ${stadium.id === s.id ? 'font-bold' : 'font-semibold'}`}>{s.name}</p>
                        <p className="text-[11px] opacity-60 font-medium">{s.city}, {s.state}</p>
                        </div>
                        {stadium.id === s.id && (
                            <div className="w-6 h-6 rounded-full bg-stadium-neon/20 flex items-center justify-center">
                                <Check size={14} strokeWidth={3} />
                            </div>
                        )}
                    </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
