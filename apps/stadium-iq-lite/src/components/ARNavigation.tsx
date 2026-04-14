import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Battery, 
  Mic, 
  Map as MapIcon, 
  Navigation,
  ChevronRight,
  Maximize2,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStadium } from '../context/StadiumContext';
import { useRealtime } from '../hooks/useRealtime';

export default function ARNavigation() {
  const { stadium } = useStadium();
  const { alerts } = useRealtime();
  const [mapView, setMapView] = useState(false);
  const [eta, setEta] = useState(3);
  const [distance, setDistance] = useState(50);
  const [instruction, setInstruction] = useState('Proceed to North Concourse');
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      setInstruction(`Caution: ${alerts[0].message}`);
    } else {
      setInstruction('Route Optimized: Proceed to Gate D');
    }
  }, [alerts]);

  useEffect(() => {
    const interval = setInterval(() => {
        setDistance(prev => Math.max(0, prev - 1));
        if (distance < 10) setInstruction('Arrived at Destination');
    }, 2000);
    return () => clearInterval(interval);
  }, [distance]);

  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      const msg = new SpeechSynthesisUtterance(`${instruction}. ${distance} meters to your target at ${stadium.name}.`);
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[700px] max-w-lg mx-auto relative bg-stadium-dark rounded-[2.5rem] overflow-hidden border-4 md:border-[8px] border-white/5 shadow-2xl font-sans group">
      
      {/* Visual Header / Notch Control */}
      <div className="absolute top-0 left-0 right-0 h-12 flex justify-between items-center px-8 z-30 pointer-events-none">
        <span className="text-[8px] md:text-[10px] font-bold tracking-widest text-white/40 uppercase">Tactical Feed</span>
        <div className="w-20 md:w-24 h-5 md:h-6 bg-black rounded-b-2xl border-x border-b border-white/5 shadow-lg"></div>
        <div className="flex items-center gap-2">
          <Battery className="text-white/40 size-3.5 md:size-4" />
        </div>
      </div>

      {/* Main View Layer: AR or Map */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {!mapView ? (
            <motion.div 
              key="ar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200')] bg-cover bg-center brightness-[0.4] contrast-125 scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-transparent to-stadium-dark/60"></div>
              </div>

              {/* Dynamic AR Path Overlay */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 400 600" preserveAspectRatio="none">
                <motion.path
                  d="M 200 600 L 200 450 L 320 350 L 320 150"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                />
                <motion.circle
                  cx="320" cy="150" r="6"
                  fill="#06b6d4"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="drop-shadow-[0_0_10px_rgba(6,182,212,1)]"
                />
              </svg>

              {/* Centered HUD */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center w-full px-6">
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [45, 45, 45] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 md:w-16 md:h-16 bg-stadium-neon rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40"
                >
                  <Navigation className="text-stadium-dark -rotate-45 size-6 md:size-8" strokeWidth={3} />
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 md:mt-12 glass px-6 md:px-10 py-5 md:py-6 rounded-[2rem] border-white/10 text-center shadow-2xl backdrop-blur-xl w-full max-w-xs"
                >
                  <p className="text-sm md:text-lg font-bold text-white font-display tracking-tight leading-snug">{instruction}</p>
                  <div className="flex items-center justify-center gap-2 mt-2 md:mt-3">
                    <span className="text-[9px] md:text-[11px] text-stadium-neon font-black uppercase tracking-[0.2em]">{distance}M</span>
                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                    <span className="text-[9px] md:text-[11px] text-white/60 font-black uppercase tracking-[0.2em]">ZONE 237</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-[#020617] p-6 md:p-10 flex items-center justify-center"
              onClick={() => setMapView(false)}
            >
              <div className="w-full h-full relative rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200" 
                  alt="Stadium Map" 
                  className="w-full h-full object-cover opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-transparent to-transparent" />
                
                <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-stadium-neon rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-red-500/40 rounded-full" />
                
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-bold uppercase text-lg tracking-tight">{stadium.name}</h3>
                  <p className="text-stadium-neon text-[9px] font-bold uppercase tracking-widest mt-1 underline decoration-stadium-neon/30">Tactical Map v.4</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating View Control */}
        <div className="absolute top-14 md:top-20 left-6 right-6 z-20 flex justify-between items-center pointer-events-none">
          <button className="w-10 h-10 md:w-12 md:h-12 glass rounded-xl md:rounded-2xl flex items-center justify-center text-white/60 hover:text-white transition-all border-white/5 pointer-events-auto tap-target">
            <ArrowLeft className="size-4.5" />
          </button>
          <div className="px-4 py-1.5 md:py-2 glass rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-stadium-neon border-stadium-neon/20 backdrop-blur-md">
            {mapView ? 'STRATEGY LAYER' : 'VISUAL HUB'}
          </div>
        </div>
      </div>

      {/* Info Panel / Controller */}
      <div className="bg-stadium-dark/95 backdrop-blur-3xl p-6 md:p-10 rounded-t-[2.5rem] relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] border-t border-white/5">
        <div className="w-10 h-1.5 bg-white/10 rounded-full mx-auto mb-6 md:mb-10"></div>
        
        <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          <PanelMetric label="Target" value="237-A" />
          <PanelMetric label="ETA" value={`${eta}m`} highlight />
          <PanelMetric label="Link" value="GATE 4" />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleVoice}
            className={`flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all ${
              voiceActive ? 'bg-stadium-neon text-stadium-dark shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
            } tap-target`}
          >
            <Mic className="size-4.5" />
            <span>Voice HUD</span>
          </button>
          
          <button 
            onClick={() => setMapView(!mapView)}
            className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl transition-all border shrink-0 tap-target ${
              mapView ? 'bg-stadium-neon text-stadium-dark border-stadium-neon' : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
          >
            <MapIcon className="size-5 md:size-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelMetric({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <p className="text-[8px] md:text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
      <p className={`text-xs md:text-base font-black tracking-tight ${highlight ? 'text-stadium-neon' : 'text-white'}`}>{value}</p>
    </div>
  );
}
