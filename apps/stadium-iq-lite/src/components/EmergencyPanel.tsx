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
            className="fixed inset-0 bg-stadium-emergency/95 backdrop-blur-3xl z-[200] flex flex-col items-center justify-center p-10"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8" />
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4">Command Uplink...</h2>
            <p className="text-white/60 text-xs md:text-sm font-bold max-w-sm leading-relaxed">AUTHENTICATING SIGNAL. PLEASE STAND BY FOR IMMEDIATE RESPONDER HANDOVER.</p>
            <button 
              onClick={() => setIsCalling(false)}
              className="mt-12 px-10 py-4 bg-white text-stadium-emergency font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all text-xs tap-target shadow-2xl"
            >
              Terminate Signal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Close Button */}
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white transition-all z-[110] group tap-target"
      >
        <X className="size-5 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Background Pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-stadium-emergency/10 rounded-full animate-ping opacity-10"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8 relative z-10 font-sans pt-10"
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-stadium-emergency rounded-2xl md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-500/40 mb-6 neon-glow">
            <ShieldAlert className="text-white animate-pulse size-8 md:size-10" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none font-display">Triage Protocol</h2>
          <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-stadium-emergency/20 rounded-lg border border-stadium-emergency/30">
            <span className="w-1.5 h-1.5 bg-stadium-emergency rounded-full animate-ping"></span>
            <span className="text-[8px] md:text-[9px] font-bold text-stadium-emergency tracking-[0.2em] uppercase">Status: Priority Delta-7</span>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 border-stadium-emergency/30 bg-gradient-to-br from-stadium-emergency/10 to-transparent backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <AnimatePresence>
            {showMap && (
              <motion.div 
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="absolute inset-0 bg-stadium-dark z-20 p-5 flex flex-col border-2 border-emerald-500/50"
              >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Strategic Evacuation Path</h3>
                    <button onClick={() => setShowMap(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-center gap-2">
                    <MapIcon className="text-emerald-500/20 size-8" />
                    <p className="text-emerald-500 font-bold text-[8px] uppercase tracking-[0.2em] animate-pulse">Schematic: Sector Gate D</p>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 mb-6 text-left">
            <div className="p-3 bg-stadium-emergency/20 rounded-xl border border-stadium-emergency/20 shrink-0">
              <Navigation className="text-stadium-emergency size-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white font-display leading-tight uppercase">Emergency Rerouting</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">Active Target: Sector Gate D</p>
            </div>
          </div>

          <p className="text-left text-slate-400 text-[11px] md:text-xs leading-relaxed mb-6 pb-6 border-b border-white/5 font-medium">
            AI Triage recommends <span className="text-white font-bold underline decoration-stadium-emergency/30">Gate D</span>. 
            Predicted bottleneck density: <span className="text-emerald-400 font-black">12%</span>. 
            Maintain steady pace and follow laser-guided floor arrays.
          </p>

          <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-3">
              <LogOut className="text-stadium-neon size-5" />
              <div className="text-left">
                <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Range</p>
                <p className="text-xl font-black text-stadium-neon tracking-tighter leading-none">350 FT</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Arrival</p>
              <p className="text-xl font-black tracking-tighter text-white leading-none">2.5 MIN</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setIsCalling(true)}
            className="flex items-center justify-center gap-3 py-4 md:py-5 bg-stadium-emergency text-white rounded-xl font-black shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs tap-target"
          >
            <Phone className="size-4.5" fill="currentColor" />
            Vocal Uplink
          </button>
          <button 
            onClick={() => setShowMap(true)}
            className="flex items-center justify-center gap-3 py-4 md:py-5 bg-white/5 text-slate-300 rounded-xl font-black border border-white/10 hover:bg-white/10 active:scale-95 transition-all uppercase tracking-widest text-[10px] md:text-xs tap-target"
          >
            <MapIcon className="size-4.5" />
            Tactical Map
          </button>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] hover:text-white transition-colors py-4 uppercase"
        >
          Operational Override
        </button>
      </motion.div>

      {/* Connectivity Status */}
      <div className="hidden md:flex fixed bottom-10 left-10 flex-col gap-3 text-left">
        <div className="flex items-center gap-3 bg-stadium-dark/40 p-2 rounded-lg border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Wifi className="text-emerald-500 size-3.5" />
          </div>
          <div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Mesh Latency</p>
             <p className="text-[10px] font-black text-white leading-none mt-1">4.2ms</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-stadium-dark/40 p-2 rounded-lg border border-white/5 backdrop-blur-md">
          <div className="w-8 h-8 rounded-lg bg-stadium-neon/10 flex items-center justify-center border border-stadium-neon/20">
            <Activity className="text-stadium-neon size-3.5" />
          </div>
          <div>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Triage Bot</p>
             <p className="text-[10px] font-black text-white leading-none mt-1">ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
