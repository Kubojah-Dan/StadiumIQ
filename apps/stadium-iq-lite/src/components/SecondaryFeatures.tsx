import React from 'react';
import { Leaf, Award, Zap, Coins, Globe, TreePine } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStadium } from '../context/StadiumContext';
import { useRealtime } from '../hooks/useRealtime';

export function SustainabilityDashboard() {
  const { stadium } = useStadium();
  const { twinState } = useRealtime();
  
  // Calculate live seed based on aggregate gate flow
  const gates = Object.values(twinState.queues || {}).filter(q => q.category === 'food' || q.category === 'merch');
  const totalWait = gates.reduce((acc, g) => acc + (g.wait_time || 0), 0);
  const liveSeed = totalWait / 10;

  const carbon = (12.4 + liveSeed * 0.5).toFixed(1);
  const energy = (800 + liveSeed * 2);
  const renewable = (30 + Math.floor(liveSeed) % 40);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-6 md:p-10 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent border-emerald-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[120px] -mr-32 -mt-32"></div>
        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-8 md:mb-10 flex items-center gap-2 font-display">
          <Leaf className="size-4 md:size-4.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Sustainability Node
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10 font-sans">
          <EcoMetric label="Offset Pattern" value={`${carbon} T`} sub="Verified Net Reduction" icon={<Globe className="text-emerald-500" />} />
          <EcoMetric label="Grid Intensity" value={`${energy} kW`} sub={`Renewable Logic: ${renewable}%`} icon={<Zap className="text-yellow-500" />} />
        </div>
      </div>
      
      <div className="glass-card p-5 md:p-6 border-white/5">
        <h3 className="text-[9px] md:text-xs font-bold mb-4 uppercase tracking-widest text-slate-500">Resource Optimization</h3>
        <div className="space-y-4">
          <GreenBar label="Waste Path Integration" percent={60 + (Math.floor(liveSeed) % 35)} />
          <GreenBar label="Water Recovery Cycle" percent={40 + (Math.floor(liveSeed) % 50)} />
        </div>
      </div>
    </div>
  );
}

export function FanRewards() {
  const { stadium } = useStadium();
  const { twinState } = useRealtime();
  
  const zones = Object.values(twinState.zones || {});
  const avgDensity = zones.length > 0 ? zones.reduce((acc, z) => acc + (z.density || 0), 0) / zones.length : 0;
  
  const credits = (3000 + Math.floor(avgDensity * 1250)).toLocaleString();

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-6 md:p-10 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border-indigo-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[120px] -ml-32 -mt-32"></div>
        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-indigo-400 mb-8 md:mb-10 flex items-center gap-2 relative z-10 font-display">
          <Award className="size-4 md:size-4.5 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
          Loyalty Ecosystem
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 mb-10 md:mb-12 relative z-10 text-center sm:text-left">
          <div className="font-sans">
            <p className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">{credits}</p>
            <p className="text-[9px] md:text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mt-3 italic opacity-70">CREDITS AUTHENTICATED</p>
          </div>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-stadium-neon to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Coins className="text-white size-7 md:size-8" />
          </div>
        </div>
        
        <div className="space-y-3">
          <RewardItem icon={<Zap className="size-3.5" />} title={`Zone Exploration`} status="2/5 SYNCED" />
          <RewardItem icon={<TreePine className="size-3.5" />} title="Eco-Commute Uplink" status="AUTHORIZED" completed />
        </div>
      </div>
    </div>
  );
}

function EcoMetric({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/20 transition-all group flex items-start gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border border-white/5">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm md:text-lg font-black text-white leading-none truncate">{value}</p>
        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1 truncate">{label}</p>
        <p className="text-[8px] text-slate-600 mt-1 truncate">{sub}</p>
      </div>
    </div>
  );
}

function GreenBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div className="space-y-1.5 md:space-y-2">
      <div className="flex justify-between text-[8px] md:text-[10px] font-bold uppercase text-slate-500 tracking-widest">
        <span>{label}</span>
        <span className="text-emerald-500">{percent}%</span>
      </div>
      <div className="w-full h-1 md:h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }}
          className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        />
      </div>
    </div>
  );
}

function RewardItem({ icon, title, status, completed = false }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-indigo-400 bg-indigo-400/10 p-1.5 rounded-lg border border-indigo-400/20">{icon}</div>
        <span className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-tight">{title}</span>
      </div>
      <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${completed ? 'bg-stadium-success/10 text-stadium-success' : 'bg-slate-800 text-slate-500'}`}>
        {status}
      </span>
    </div>
  );
}
