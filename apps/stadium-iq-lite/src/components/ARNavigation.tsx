import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowUp, 
  Battery, 
  Navigation2, 
  Mic, 
  Map as MapIcon, 
  HelpCircle,
  Navigation,
  ChevronRight,
  Target,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStadium } from '../context/StadiumContext';

export default function ARNavigation() {
  const { stadium } = useStadium();
  const [mapView, setMapView] = useState(false);
  const [eta, setEta] = useState(3);
  const [distance, setDistance] = useState(50);
  const [instruction, setInstruction] = useState('Turn right ahead');
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    // Simulate dynamic updates
    const interval = setInterval(() => {
        setDistance(prev => Math.max(0, prev - 1));
        if (distance < 10) setInstruction('Arrived at Destination');
    }, 2000);
    return () => clearInterval(interval);
  }, [distance]);

  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      const msg = new SpeechSynthesisUtterance(`${instruction}. ${distance} meters to your section at ${stadium.name}.`);
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-[#020617] rounded-[3rem] overflow-hidden border-[8px] border-white/5 shadow-2xl font-sans">
      {/* Phone Notch/Status */}
      <div className="absolute top-0 left-0 right-0 h-10 flex justify-between items-center px-12 z-30">
        <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Live Cam</span>
        <div className="w-24 h-6 bg-black rounded-b-2xl border-x border-b border-white/5"></div>
        <div className="flex items-center gap-2">
          <Battery size={14} className="text-white/40" />
        </div>
      </div>

      {/* AR View Layer (Camera Simulation) or Map View */}
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
              {/* Mock Camera Background */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200')] bg-cover bg-center brightness-50 bg-no-repeat">
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-transparent to-stadium-dark/40"></div>
              </div>

              {/* AR Navigation Path Overlay */}
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" viewBox="0 0 400 600">
                <motion.path
                  d="M 200 600 L 200 450 L 350 350 L 350 100"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.circle
                  cx="350" cy="100" r="8"
                  fill="#06b6d4"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </svg>

              {/* Navigation Floating Arrow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [45, 45, 45] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 bg-stadium-neon rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)] neon-glow"
                >
                  <Navigation className="text-stadium-dark -rotate-45" size={28} strokeWidth={3} />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 glass px-8 py-5 rounded-[2rem] border-white/10 text-center shadow-2xl backdrop-blur-md"
                >
                  <p className="text-xl font-black text-white font-display tracking-tight leading-none">{instruction}</p>
                  <p className="text-[10px] text-stadium-neon font-black mt-2 uppercase tracking-[0.3em]">{distance}M • SECTION 237</p>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-[#0f172a] p-10 flex items-center justify-center"
            >
              {/* Mock Schematic Map */}
              <div className="w-full h-full relative rounded-3xl overflow-hidden border border-white/10">
                <img 
                  src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200" 
                  alt="Stadium Map" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-transparent to-transparent" />
                
                {/* Simulated Map Markers */}
                <div className="absolute top-1/4 left-1/2 w-4 h-4 bg-stadium-neon rounded-full neon-glow animate-ping" />
                <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-stadium-neon rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-red-500 rounded-full opacity-60" />
                
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white font-black uppercase text-xl tracking-tight">{stadium.name}</h3>
                  <p className="text-stadium-neon text-xs font-bold uppercase tracking-widest mt-1">Operational Map View</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Controls */}
        <div className="absolute top-16 left-6 right-6 z-20 flex justify-between items-center">
          <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all border-white/10 backdrop-blur-md">
            <ArrowLeft size={20} />
          </button>
          <div className="px-5 py-2 glass rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-stadium-neon border-stadium-neon/30 backdrop-blur-md">
            {mapView ? 'Schematic V2' : 'Visual Engine 4.0'}
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-[#020617]/95 backdrop-blur-3xl p-8 rounded-t-[3rem] relative z-30 shadow-[0_-30px_60px_rgba(0,0,0,0.8)] border-t border-white/5">
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
        
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Target</p>
            <p className="text-xs font-black text-white">237-A-12</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-white/5">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Arrival</p>
            <p className="text-xs font-black text-stadium-neon">{eta} Min</p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Entry</p>
            <p className="text-xs font-black text-white">Gate {Math.floor(Math.random()*8) + 1}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center gap-4">
          <button 
            onClick={toggleVoice}
            className={`flex-[2] flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${voiceActive ? 'bg-stadium-neon text-stadium-dark neon-glow' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'}`}
          >
            <Mic size={18} />
            <span>Assistant</span>
          </button>
          <button 
            onClick={() => setMapView(!mapView)}
            className={`w-16 h-16 flex items-center justify-center rounded-2xl transition-all border ${mapView ? 'bg-stadium-neon text-stadium-dark neon-glow border-stadium-neon' : 'glass text-slate-400 hover:text-white border-white/5'}`}
          >
            <MapIcon size={20} />
          </button>
          <button className="w-16 h-16 bg-stadium-emergency/10 border border-stadium-emergency/20 flex items-center justify-center rounded-2xl text-stadium-emergency hover:bg-stadium-emergency/20 transition-all font-bold">
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

