import { useState } from 'react';
import { 
  ShieldAlert, 
  LogOut, 
  Phone, 
  Map as MapIcon, 
  Wifi,
  Navigation,
  Activity,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyPanel({ onClose }: { onClose: () => void }) {
  const [isCalling, setIsCalling] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="min-h-full bg-stadium-emergency/5 flex flex-col items-center p-6 text-center relative overflow-y-auto custom-scrollbar pb-32">
      <AnimatePresence>
        {isCalling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stadium-emergency/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center p-12"
          >
            <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Connecting to Command...</h2>
            <p className="text-white/60 text-sm font-medium max-w-sm">Please stand by. An emergency responder is prioritizing your signal now.</p>
            <button 
              onClick={() => setIsCalling(false)}
              className="mt-10 px-8 py-3 bg-white text-stadium-emergency font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all text-sm"
            >
              Cancel Call
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Close Button - Higher Z for visibility */}
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white transition-all z-[110] group"
      >
        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Background Pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-stadium-emergency/10 rounded-full animate-ping opacity-10"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 relative z-10 font-sans pt-12"
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-stadium-emergency rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)] mb-6 neon-glow">
            <ShieldAlert size={40} className="text-white animate-pulse" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none font-display">Priority Alert</h2>
          <div className="mt-3 flex items-center gap-2 px-3 py-1 bg-stadium-emergency/20 rounded-lg border border-stadium-emergency/40">
            <span className="w-1.5 h-1.5 bg-stadium-emergency rounded-full animate-ping"></span>
            <span className="text-[9px] font-black text-stadium-emergency tracking-[0.2em] uppercase">Emergency Protocol: Delta-7</span>
          </div>
        </div>

        <div className="glass-card p-8 border-stadium-emergency/30 bg-gradient-to-br from-stadium-emergency/15 to-transparent backdrop-blur-[30px] shadow-2xl relative overflow-hidden">
          <AnimatePresence>
            {showMap && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0 bg-stadium-dark z-20 p-6 flex flex-col border-2 border-stadium-success"
              >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-stadium-success font-black uppercase tracking-widest text-sm">Detailed Evac Route</h3>
                    <button onClick={() => setShowMap(false)} className="text-slate-500 hover:text-white transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                    <MapIcon size={48} className="text-stadium-success opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <p className="text-stadium-success font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Schematic: Sector Gate D</p>
                    </div>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 mb-6 text-left">
            <div className="p-3 bg-stadium-emergency/20 rounded-xl border border-stadium-emergency/20">
              <Navigation className="text-stadium-emergency" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-display">Immediate Evacuation</h3>
              <p className="text-xs text-slate-300 font-medium">Route Optimized: Gate D (South Enclosure)</p>
            </div>
          </div>

          <p className="text-left text-slate-400 text-xs leading-relaxed mb-8 pb-8 border-b border-white/5">
            AI Crowd Analysis recommends <span className="text-white font-black">Gate D</span>. 
            Estimated congestion is <span className="text-stadium-success font-bold">12%</span>. 
            Follow the active laser-guiding tracks.
          </p>

          <div className="glass bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-4">
              <LogOut className="text-stadium-neon" size={24} />
              <div className="text-left">
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Distance</p>
                <p className="text-2xl font-black text-stadium-neon tracking-tighter">350 ft</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">ETA</p>
              <p className="text-2xl font-black tracking-tighter text-white">2.5 min</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setIsCalling(true)}
            className="flex items-center justify-center gap-3 py-5 bg-stadium-emergency text-white rounded-xl font-black shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.1em] text-xs"
          >
            <Phone size={20} fill="currentColor" />
            Live Response
          </button>
          <button 
            onClick={() => setShowMap(true)}
            className="flex items-center justify-center gap-3 py-5 bg-white/5 text-slate-300 rounded-xl font-black border border-white/10 hover:bg-white/10 active:scale-95 transition-all uppercase tracking-[0.1em] text-xs"
          >
            <MapIcon size={20} />
            Evac Map
          </button>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors py-2"
        >
          Staff Dashboard Override
        </button>
      </motion.div>

      {/* Connectivity Status */}
      <div className="hidden md:flex absolute bottom-8 left-8 flex-col gap-3 text-left opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-stadium-success/20 flex items-center justify-center">
            <Wifi size={12} className="text-stadium-success" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Mesh Latency: 4ms</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-stadium-neon/20 flex items-center justify-center">
            <Activity size={12} className="text-stadium-neon" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">AI Optimizers: Operational</span>
        </div>
      </div>
    </div>
  );
}
