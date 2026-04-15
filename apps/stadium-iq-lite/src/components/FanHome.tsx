import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Navigation, 
  Coffee, 
  Ticket, 
  Calendar,
  Clock,
  ArrowRight,
  X,
  QrCode
} from 'lucide-react';
import { useStadium } from '../context/StadiumContext';

export default function FanHome({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { stadium } = useStadium();
  const [showPass, setShowPass] = useState(false);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  
  // Target match date: April 17, 2026
  const targetDate = useMemo(() => new Date('2026-04-17T19:30:00+05:30'), []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setCountdown({ d, h, m, s });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const [weather] = useState({ temp: 28, condition: 'Clear', humidity: 45 });

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
      {/* Hero Section: Countdown */}
      <section className="relative glass-card p-8 md:p-12 overflow-hidden border-white/5 bg-gradient-to-br from-indigo-600/20 to-transparent shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-stadium-neon/10 blur-[120px] -mr-40 -mt-40" />
        <div className="relative z-10">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stadium-neon mb-4">Match Day Countdown</p>
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none tabular-nums">
            {countdown.d > 0 && <span>{String(countdown.d).padStart(2, '0')}<span className="text-white/20">:</span></span>}
            {String(countdown.h).padStart(2, '0')}<span className="text-white/20">:</span>
            {String(countdown.m).padStart(2, '0')}<span className="text-white/20">:</span>
            {String(countdown.s).padStart(2, '0')}
          </h2>
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Calendar size={18} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">Date</p>
                <p className="text-xs md:text-sm font-bold text-white mt-1">APR 17, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Clock size={18} className="text-stadium-neon" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-none">First Ball</p>
                <p className="text-xs md:text-sm font-bold text-white mt-1">19:30 IST</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Weather Widget */}
        <div className="glass-card p-6 md:p-8 border-white/5 bg-white/[0.02]">
          <h3 className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Sun size={14} className="text-yellow-400" />
            Atmospheric Feed
          </h3>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-4xl md:text-5xl font-black text-white">{weather.temp}°C</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{weather.condition}</p>
            </div>
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="text-yellow-400 opacity-20"
            >
               <Sun size={64} strokeWidth={1} />
            </motion.div>
          </div>
          <div className="flex gap-6 py-4 border-t border-white/5">
             <div className="flex items-center gap-2">
                <Wind size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">12 km/h</span>
             </div>
             <div className="flex items-center gap-2">
                <CloudRain size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{weather.humidity}% HUM</span>
             </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ActionCard 
            icon={<Navigation size={24} />} 
            title="AR Navigation" 
            desc="Live density-aware routing to your seat." 
            onClick={() => onNavigate('ar')}
            color="stadium-neon"
          />
          <ActionCard 
            icon={<Coffee size={24} />} 
            title="Queue Triage" 
            desc="Real-time catering and facility metrics." 
            onClick={() => onNavigate('queue')}
            color="indigo-400"
          />
        </div>
      </div>

      {/* Ticket/Membership Preview */}
      <section className="glass-card p-6 md:p-10 border-white/5 bg-gradient-to-r from-stadium-neon/5 to-transparent relative overflow-hidden group">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-stadium-neon rounded-2xl md:rounded-3xl flex items-center justify-center text-stadium-dark shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Ticket className="w-8 h-8 md:w-10 md:h-10" />
               </div>
               <div className="text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase mb-1">Elite VIP Access</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Member ID: IQ-77243-DELTA</p>
               </div>
            </div>
            <button 
              onClick={() => setShowPass(true)}
              className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stadium-neon hover:text-stadium-dark transition-all flex items-center gap-2 shadow-lg"
            >
               View Pass
               <ArrowRight size={14} />
            </button>
         </div>
      </section>

      {/* VIP PASS MODAL */}
      <AnimatePresence>
        {showPass && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stadium-dark/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-card p-8 border-stadium-neon/30 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-stadium-neon/10 blur-[80px] -mr-20 -mt-20" />
              
              <button 
                onClick={() => setShowPass(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-stadium-neon rounded-2xl flex items-center justify-center text-stadium-dark mb-6">
                  <Ticket size={32} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Elite VIP Pass</h3>
                <p className="text-[10px] font-bold text-stadium-neon uppercase tracking-[0.2em] mb-8">Digital Membership</p>

                <div className="w-full bg-white p-6 rounded-3xl mb-8 flex flex-col items-center gap-4">
                  <QrCode size={180} className="text-stadium-dark" />
                  <p className="text-xs font-black text-stadium-dark opacity-50 tracking-widest">SCAN AT GATE 1A</p>
                </div>

                <div className="w-full space-y-4 text-left">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">IQ-77243-DELTA</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Venue</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{stadium?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tier</span>
                    <span className="text-[10px] font-bold text-stadium-neon uppercase tracking-widest">VIP GOLD</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionCard({ icon, title, desc, onClick, color }: { icon: any, title: string, desc: string, onClick: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`glass-card p-6 md:p-8 text-left border-white/5 hover:border-${color}/40 transition-all group relative overflow-hidden bg-white/[0.01]`}
    >
      <div className={`text-${color} mb-6 group-hover:scale-110 transition-transform bg-${color}/10 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border border-${color}/20`}>
        {icon}
      </div>
      <h4 className="text-lg md:text-xl font-bold text-white tracking-tight mb-2 uppercase">{title}</h4>
      <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </button>
  );
}

