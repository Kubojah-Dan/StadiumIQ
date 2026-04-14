import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, Download, Calendar, Activity } from 'lucide-react';
import { useStadium } from '../context/StadiumContext';
import { useRealtime } from '../hooks/useRealtime';

export default function AnalyticsView() {
  const { stadium } = useStadium();
  const { twinState } = useRealtime();
  
  // Calculate dynamic seed based on average density to make charts 'jitter' with real data
  const zonesArray = Object.values(twinState.zones || {});
  const avgDensity = zonesArray.length > 0 ? zonesArray.reduce((acc, z) => acc + (z.density || 0), 0) / zonesArray.length : 0;
  const seed = avgDensity * 50;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="text-stadium-neon" />
            {stadium.name} Analytics
          </h1>
          <p className="text-slate-400 mt-2">Comprehensive data analysis and trend reports for operations telemetry.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-semibold text-sm">
          <Download size={18} />
          Export Hub Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart Card */}
        <div className="glass-card p-8 group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-stadium-neon" size={20} />
              <h2 className="text-lg font-bold">Traffic Capacity Trends</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5 text-[10px] font-bold text-slate-400 uppercase">
              <Calendar size={12} />
              REAL-TIME FEED
            </div>
          </div>

          <div className="h-64 w-full relative">
            {/* Simple SVG Chart */}
            <svg className="w-full h-full" viewBox="0 0 400 200">
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
                stroke="#3b82f6" 
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
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="flex justify-center gap-6 mt-8">
              <LegendItem color="#3b82f6" label={`Gate North (${stadium.city})`} />
              <LegendItem color="#10b981" label="Gate South" />
            </div>
          </div>
        </div>

        {/* Donut Chart Card */}
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <PieChart className="text-stadium-neon" size={20} />
              <h2 className="text-lg font-bold">Zone Distribution</h2>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/50 rounded-lg border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Capacity: {stadium.capacity?.toLocaleString()}
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
             <div className="relative w-48 h-48">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                    
                    <motion.circle 
                        initial={{ strokeDasharray: "0 251.2" }}
                        animate={{ strokeDasharray: `${150 + seed * 5} 251.2` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" 
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
                    <span className="text-2xl font-black text-white">{60 + (seed % 30)}%</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Occupancy</span>
                </div>
             </div>
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <LegendItem color="#3b82f6" label="Lower Stands" />
            <LegendItem color="#10b981" label="Premium Suites" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}
