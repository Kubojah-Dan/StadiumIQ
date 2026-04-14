import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, Download, Calendar, Activity } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';
import { useRealtime } from '../hooks/useRealtime';

export default function AnalyticsView() {
  const { stadium } = useStadium();
  const { twinState } = useRealtime();
  
  const zonesArray = Object.values(twinState.zones || {});
  const avgDensity = zonesArray.length > 0 ? zonesArray.reduce((acc, z) => acc + (z.density || 0), 0) / zonesArray.length : 0;
  const seed = avgDensity * 50;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3 text-white font-display">
            <Activity className="text-stadium-neon" size={24} />
            {stadium.name} Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 md:mt-2 max-w-xl">Deep telemetry exploration and operational trend cycles for venue performance.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-300 tap-target">
          <Download size={16} />
          Export Live Intel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Line Chart Card */}
        <div className="glass-card p-5 md:p-8 group overflow-hidden">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-stadium-neon" size={20} />
              <h2 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight">Capacity Velocity</h2>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-slate-800/50 rounded-lg border border-white/5 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Calendar size={12} />
              Live Cycle
            </div>
          </div>

          <div className="h-48 md:h-64 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              {[0, 50, 100, 150].map((y) => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              
              <path d="M0 100 Q 50 80, 100 90 T 200 110 T 300 85 T 400 95 V 200 H 0 Z" fill="url(#grad1)" opacity="0.1" />
              
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={`M0 ${100 + seed} Q 50 ${80 - seed}, 100 ${90 + seed} T 200 ${110 - seed} T 300 ${85 + seed} T 400 ${95 - seed}`} 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
                d={`M0 ${130 - seed} Q 50 ${140 + seed}, 100 ${120 - seed} T 200 ${140 + seed} T 300 ${125 - seed} T 400 ${135 + seed}`} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeLinecap="round"
              />

              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6 md:mt-10">
              <LegendItem color="#06b6d4" label="Main Flow" />
              <LegendItem color="#10b981" label="Expedited Array" />
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="glass-card p-5 md:p-8">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div className="flex items-center gap-3">
              <PieChart className="text-stadium-neon" size={20} />
              <h2 className="text-sm md:text-lg font-bold text-white uppercase tracking-tight">Zone Utilization</h2>
            </div>
            <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              CAP: {stadium.capacity?.toLocaleString()}
            </div>
          </div>

          <div className="h-48 md:h-64 flex items-center justify-center">
             <div className="relative w-32 h-32 md:w-56 md:h-56">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    
                    <motion.circle 
                        initial={{ strokeDasharray: "0 251.2" }}
                        animate={{ strokeDasharray: `${150 + seed * 5} 251.2` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="40" fill="transparent" stroke="#06b6d4" strokeWidth="12" 
                    />
                    <motion.circle 
                        initial={{ strokeDasharray: "0 251.2" }}
                        animate={{ strokeDasharray: `${50 - seed * 2} 251.2` }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" 
                        strokeDashoffset="-150"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl md:text-3xl font-black text-white">{60 + (seed % 30)}%</span>
                    <span className="text-[7px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 md:mt-1">LOAD DEPTH</span>
                </div>
             </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-6 md:mt-10">
            <LegendItem color="#06b6d4" label="Lower Array" />
            <LegendItem color="#10b981" label="Strategy Suites" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
