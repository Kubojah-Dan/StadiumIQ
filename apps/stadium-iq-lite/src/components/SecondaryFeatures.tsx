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
    <div className="space-y-6">
      <div className="glass-card p-10 bg-gradient-to-br from-green-600/10 via-transparent to-transparent border-green-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[120px] -mr-32 -mt-32"></div>
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-green-500 mb-10 flex items-center gap-2 drop-shadow-md font-display">
          <Leaf size={18} className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          Sustainability Hub
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 font-sans">
          <EcoMetric label="Carbon Offset" value={`${carbon} Tons`} sub="Verified Emission Reduction" icon={<Globe className="text-green-500" />} />
          <EcoMetric label="Energy Usage" value={`${energy} kW/h`} sub={`Renewable Intensity: ${renewable}%`} icon={<Zap className="text-yellow-500" />} />
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-slate-400">Green Initiatives</h3>
        <div className="space-y-3">
          <GreenBar label="Waste Diversion" percent={60 + (Math.floor(liveSeed) % 35)} />
          <GreenBar label="Water Optimization" percent={40 + (Math.floor(liveSeed) % 50)} />
        </div>
      </div>
    </div>
  );
}

export function FanRewards() {
  const { stadium } = useStadium();
  const { twinState } = useRealtime();
  
  // Aggregate zone density to drive loyalty point velocity
  const zones = Object.values(twinState.zones || {});
  const avgDensity = zones.length > 0 ? zones.reduce((acc, z) => acc + (z.density || 0), 0) / zones.length : 0;
  
  const credits = (3000 + Math.floor(avgDensity * 1250)).toLocaleString();

  return (
    <div className="space-y-6">
      <div className="glass-card p-10 bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent border-indigo-500/20 relative overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.1)]">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[120px] -ml-32 -mt-32"></div>
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-10 flex items-center gap-2 relative z-10 font-display">
          <Award size={18} className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
          Loyalty Ecosystem
        </h2>
        <div className="flex items-center justify-between mb-12 relative z-10">
          <div className="font-sans">
            <p className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{credits}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mt-3 italic opacity-70">SIQ Loyalty Credits</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-tr from-stadium-neon to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <Coins size={32} className="text-white" />
          </div>
        </div>
        <div className="space-y-4">
          <RewardItem icon={<Zap size={16} />} title={`${stadium.name} AR Hunt`} status="2/5 Found" />
          <RewardItem icon={<TreePine size={16} />} title="Eco-Commute Bonus" status="Claimed" />
        </div>
      </div>
    </div>
  );
}

function EcoMetric({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-green-500/20 transition-all group">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm font-black text-white">{value}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p>
        <p className="text-[8px] text-slate-600 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function GreenBar({ label, percent }: { label: string, percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }}
          className="h-full bg-green-500"
        />
      </div>
    </div>
  );
}

function RewardItem({ icon, title, status }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="text-indigo-400">{icon}</div>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <span className="text-[10px] font-bold text-slate-500">{status}</span>
    </div>
  );
}
