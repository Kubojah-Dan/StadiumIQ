import { 
  ShieldAlert, 
  LogOut, 
  Phone, 
  Map, 
  Wifi,
  Navigation,
  Activity,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmergencyPanel({ onClose }) {
  return (
    <div className="h-full bg-stadium-emergency/5 flex flex-col items-center justify-center p-6 text-center relative">
      {/* Top Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all z-[100] group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
      {/* Background Pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-stadium-emergency/10 rounded-full animate-ping opacity-20"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-10 relative z-10 font-sans"
      >
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-stadium-emergency rounded-[2.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.6)] mb-8 neon-glow">
            <ShieldAlert size={56} className="text-white animate-pulse" />
          </div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none font-display">Priority Alert</h2>
          <div className="mt-4 flex items-center gap-3 px-4 py-1.5 bg-stadium-emergency/10 rounded-xl border border-stadium-emergency/30">
            <span className="w-2 h-2 bg-stadium-emergency rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-stadium-emergency tracking-[0.3em] uppercase">Emergency Protocol: Delta-7</span>
          </div>
        </div>

        <div className="glass-card p-10 border-stadium-emergency/30 bg-gradient-to-br from-stadium-emergency/10 to-transparent backdrop-blur-[40px] shadow-2xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 bg-stadium-emergency/20 rounded-2xl border border-stadium-emergency/20">
              <Navigation className="text-stadium-emergency" size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-black text-white font-display">Immediate Evacuation</h3>
              <p className="text-sm text-slate-300 font-medium">Route Optimized: Gate D (South Enclosure)</p>
            </div>
          </div>

          <p className="text-left text-slate-400 text-sm leading-relaxed mb-10 pb-10 border-b border-white/5">
            AI Crowd Analysis recommends <span className="text-white font-black">Gate D</span>. 
            Route is currently <span className="text-stadium-success font-bold">12% congested</span>. 
            Follow the active laser-guiding tracks on the concourse ceiling.
          </p>

          <div className="glass bg-white/5 p-6 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-5">
              <LogOut className="text-stadium-neon" size={32} />
              <div className="text-left">
                <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Distance</p>
                <p className="text-3xl font-black text-stadium-neon tracking-tighter">350 ft</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">ETA</p>
              <p className="text-3xl font-black tracking-tighter text-white">2.5 min</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <button className="flex items-center justify-center gap-4 py-6 bg-stadium-emergency text-white rounded-2xl font-black shadow-xl hover:brightness-110 transition-all uppercase tracking-[0.2em] text-sm">
            <Phone size={24} fill="currentColor" />
            Live Response
          </button>
          <button className="flex items-center justify-center gap-4 py-6 bg-white/5 text-slate-300 rounded-2xl font-black border border-white/10 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-sm">
            <Map size={24} />
            Evac Map
          </button>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors py-4"
        >
          Staff Dashboard Override
        </button>
      </motion.div>

      {/* Connectivity Status */}
      <div className="absolute bottom-10 left-10 flex flex-col gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stadium-success/20 flex items-center justify-center">
            <Wifi size={14} className="text-stadium-success" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Mesh Latency: 4ms</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stadium-neon/20 flex items-center justify-center">
            <Activity size={14} className="text-stadium-neon" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">YOLOv8 Sensors: Dispersal Optimized</span>
        </div>
      </div>
    </div>
  );
}
