import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Map, ShieldAlert, BarChart3, Activity, Globe, Zap, X, User as UserIcon, Building, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { STADIUMS_INDIA } from '../context/StadiumContext';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-stadium-dark text-white relative overflow-x-hidden font-sans selection:bg-stadium-neon selection:text-stadium-dark">
      <AnimatePresence>
        {showRegister && <RegistrationModal onClose={() => setShowRegister(false)} />}
        {showLogin && <LoginModal onLogin={onEnter} onClose={() => setShowLogin(false)} />}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-stadium-neon/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="h-16 md:h-20 flex items-center justify-between px-6 md:px-16 sticky top-0 z-50 border-b border-white/5 bg-stadium-dark/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-stadium-neon rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="text-stadium-dark size-4.5 md:size-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase font-display leading-none">StadiumIQ</h1>
            <span className="text-[8px] text-slate-500 font-bold tracking-widest block mt-0.5 md:mt-0 uppercase">Operational Hub</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setShowRegister(true)}
            className="hidden sm:block text-[10px] md:text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest"
          >
            Access Request
          </button>
          <button 
            onClick={() => setShowLogin(true)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-stadium-neon text-stadium-dark font-black rounded-lg md:rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all text-[10px] md:text-xs uppercase tracking-widest tap-target"
          >
            Authenticate
          </button>
        </div>
      </header>

      <main className="relative z-10 px-6 md:px-16 pt-16 md:pt-24 pb-24 md:pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-stadium-neon mb-6 md:mb-8">
              <Sparkles size={14} className="animate-pulse" />
              Unified Venue Intelligence
            </div>
            
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] md:leading-[1] mb-6 md:mb-8 font-display">
              ONE COMMAND <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stadium-neon to-blue-400">INTERFACE.</span>
              <br className="hidden sm:block" />TOTAL CONTROL.
            </h2>
            
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl mb-10 md:mb-12 font-medium mx-auto lg:mx-0">
              StadiumIQ visualizes live density, logistics flow, and surge risk across India's premier arenas. 
              Built for high-stakes precision, powered by AI, and designed for real-time triage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 md:py-4 bg-stadium-neon text-stadium-dark font-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all group uppercase tracking-widest text-xs md:text-sm tap-target"
              >
                Launch Ops Center
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowRegister(true)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl md:rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs md:text-sm tap-target"
              >
                Partner Request
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden sm:block lg:block"
          >
            <div className="glass-card p-3 md:p-4 border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-stadium-neon/10 to-transparent pointer-events-none" />
              <div className="aspect-video bg-stadium-dark rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" 
                  alt="Stadium Visualization" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[4000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark/90 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8">
                  <div className="flex items-center gap-2 text-stadium-neon mb-1.5 md:mb-2 text-[9px] md:text-[10px]">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-stadium-neon rounded-full animate-pulse shadow-sm shadow-cyan-500/50" />
                    <span className="font-bold uppercase tracking-widest">Digital Twin Engine v4</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight uppercase font-display text-white">Live Operations Grid</h3>
                </div>
              </div>
            </div>

            {/* Floating Widget */}
            <div className="absolute -top-6 -right-6 glass-card p-5 md:p-6 border-stadium-neon/30 rounded-2xl md:rounded-3xl shadow-2xl shadow-cyan-500/10 animate-vertical-float hidden md:block">
              <Zap className="text-yellow-400 mb-2" size={24} />
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Flow Hazard</p>
              <p className="text-xl md:text-2xl font-black text-white">NOMINAL</p>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <section className="mt-24 md:mt-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Map />} 
            title="Density Hub" 
            desc="Live spatio-temporal heatmaps derived from multisensor arrays."
          />
          <FeatureCard 
            icon={<ShieldAlert />} 
            title="Strategic Triage" 
            desc="Gemini-accelerated risk assessment and mitigation strategy."
          />
          <FeatureCard 
            icon={<BarChart3 />} 
            title="Flow Telemetry" 
            desc="Real-time predictive wait times for catering and entry nodes."
          />
          <FeatureCard 
            icon={<Globe />} 
            title="Sector Sync" 
            desc="End-to-end encrypted logs across decentralized operational units."
          />
        </section>

        {/* Venues Grid */}
        <section className="mt-24 md:mt-40">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 md:mb-12">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase font-display">Sector Integration</h2>
              <p className="text-slate-500 font-medium text-sm mt-1 md:mt-2">Managing infrastructure across India's hub network.</p>
            </div>
            <button className="text-stadium-neon font-black text-[10px] md:text-xs uppercase tracking-widest border-b-2 border-stadium-neon/20 pb-1 hover:border-stadium-neon transition-all w-fit mx-auto sm:mx-0">
              Explore Network
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {STADIUMS_INDIA.slice(0, 6).map((s) => (
              <div key={s.id} className="glass-card p-5 md:p-6 border-white/5 hover:border-stadium-neon/20 transition-all group hover:-translate-y-1 bg-white/[0.01]">
                <p className="text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-1.5">{s.city}, {s.state}</p>
                <h4 className="text-base md:text-lg font-bold tracking-tight group-hover:text-stadium-neon transition-colors font-display text-white">{s.name}</h4>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                   <div className="text-[9px] md:text-[10px] text-slate-500 font-bold flex items-center gap-1.5 leading-none">
                      <Users size={12} className="shrink-0"/> {s.capacity?.toLocaleString()}
                   </div>
                   <div className="text-[9px] md:text-[10px] text-stadium-success font-black flex items-center gap-1.5 leading-none">
                      <div className="w-1.5 h-1.5 bg-stadium-success rounded-full opacity-60 animate-pulse"/> 
                      SYNCED
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-8 md:px-16 py-12 md:py-16 border-t border-white/5 bg-stadium-dark/50 backdrop-blur-3xl mt-24 md:mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-center md:text-left">
             © 2026 STADIUMIQ OPERATIONS • GLOBAL MISSION CONTROL
           </div>
           <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
             <a href="#" className="hover:text-stadium-neon transition-colors">Strategic Protocols</a>
             <a href="#" className="hover:text-stadium-neon transition-colors">Terms of Engagement</a>
             <a href="#" className="hover:text-stadium-neon transition-colors">Data Shield</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function LoginModal({ onLogin, onClose }: { onLogin: () => void, onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('siq_credentials');
    if (saved) {
      const { email: savedEmail, password: savedPass } = JSON.parse(saved);
      setEmail(savedEmail);
      setPassword(savedPass);
    } else {
      setEmail('admin@stadiumiq.demo');
      setPassword('admin');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-stadium-dark/95 backdrop-blur-3xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8 md:p-10 relative overflow-hidden border-stadium-neon/30 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/10 blur-[100px] -mr-32 -mt-32" />
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all tap-target">
          <X size={24} />
        </button>

        <div className="relative z-10 text-center">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-stadium-neon/10 rounded-2xl flex items-center justify-center text-stadium-neon mb-8 mx-auto border border-stadium-neon/20 shadow-xl shadow-cyan-500/10">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase font-display mb-2">Ops Portal</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">Credentials Authorization Required</p>

          <form className="space-y-5 md:space-y-6 text-left" onSubmit={handleLogin}>
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Identification Node</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/60 transition-all text-sm font-bold text-white" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Alpha Pattern Key</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/60 transition-all text-sm font-bold text-white" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" disabled={isVerifying}
              className="w-full py-5 bg-stadium-neon text-stadium-dark font-black rounded-xl md:rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-3 group tap-target"
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-stadium-dark/20 border-t-stadium-dark rounded-full animate-spin" />
              ) : (
                <>
                  Connect Uplink
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RegistrationModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-stadium-dark/95 backdrop-blur-3xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="max-w-lg w-full glass-card p-8 md:p-10 relative overflow-hidden border-stadium-neon/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/10 blur-[100px] -mr-32 -mt-32" />
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all tap-target">
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-stadium-neon/10 rounded-2xl flex items-center justify-center text-stadium-neon mb-6 md:mb-8 border border-stadium-neon/20">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase font-display mb-2">Request Access</h2>
          <p className="text-slate-400 text-sm font-medium mb-8 md:mb-10 leading-relaxed">
            Register your venue into the elite network of stadium intelligence solutions.
          </p>

          <form className="space-y-5 md:space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Operator Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input type="text" placeholder="Alpha Prime" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/60 transition-all text-sm font-bold text-white" required />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Secure Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                      <input type="email" placeholder="hq@venue.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/60 transition-all text-sm font-bold text-white" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Organization Node</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="text" placeholder="Global Venue Authority" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/60 transition-all text-sm font-bold text-white" required />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-stadium-neon text-stadium-dark font-black rounded-xl md:rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-3 tap-target">
                  Submit Verification
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-10 md:py-12 text-center">
                <div className="w-20 h-20 bg-stadium-success/10 rounded-full flex items-center justify-center text-stadium-success mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                  <Activity size={40} className="animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Encryption Pending</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                  Application registered. Operational command will authorize your link shortly.
                </p>
                <button onClick={onClose} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all tap-target">
                  Return to Port
                </button>
              </motion.div>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-6 md:p-8 border-white/10 hover:border-stadium-neon/40 transition-all group bg-white/[0.01]">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-stadium-neon mb-6 group-hover:scale-110 transition-all shadow-lg">
        {React.cloneElement(icon as React.ReactElement, { className: "size-6 md:size-7" })}
      </div>
      <h3 className="text-lg md:text-xl font-bold tracking-tight mb-2 md:mb-3 group-hover:text-stadium-neon transition-colors uppercase font-display text-white">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function Users({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
