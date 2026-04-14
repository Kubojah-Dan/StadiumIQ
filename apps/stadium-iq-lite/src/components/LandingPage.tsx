import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Map, ShieldAlert, BarChart3, Activity, Globe, Zap, X, User as UserIcon, Building, Mail, KeyRound, ShieldCheck } from 'lucide-react';
import { STADIUMS_INDIA } from '../context/StadiumContext';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-stadium-dark text-white relative overflow-hidden font-sans">
      <AnimatePresence>
        {showRegister && <RegistrationModal onClose={() => setShowRegister(false)} />}
        {showLogin && <LoginModal onLogin={onEnter} onClose={() => setShowLogin(false)} />}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-stadium-neon/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="h-20 flex items-center justify-between px-8 md:px-16 relative z-10 border-b border-white/5 glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stadium-neon rounded-xl flex items-center justify-center neon-glow">
            <Activity className="text-stadium-dark" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase font-display">StadiumIQ</h1>
            <span className="text-[9px] text-slate-500 font-bold tracking-widest block -mt-1">Live Operations</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowRegister(true)}
            className="text-sm font-black text-slate-400 hover:text-white transition uppercase tracking-widest"
          >
            Sign In / Sign Up
          </button>
          <button 
            onClick={() => setShowLogin(true)}
            className="px-6 py-2.5 bg-stadium-neon text-stadium-dark font-black rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all text-sm uppercase tracking-widest"
          >
            Launch Hub
          </button>
        </div>
      </header>

      <main className="relative z-10 px-8 md:px-16 pt-20 pb-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-stadium-neon mb-8">
              <Sparkles size={14} className="animate-pulse" />
              Next-Gen Venue Intelligence
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 font-display">
              ONE COMMAND <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stadium-neon to-indigo-400">CENTER.</span>
              <br />TOTAL SAFETY.
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-12 font-medium">
              StadiumIQ visualizes live density, queues, and surge risk across India's premier venues. 
              Built for precision, powered by Gemini, and designed for life-saving triage in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-stadium-neon text-stadium-dark font-black rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 transition-all group uppercase tracking-widest text-sm"
              >
                Open Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowRegister(true)}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
              >
                Request Access
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="glass-card p-4 border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-stadium-neon/10 to-transparent pointer-events-none" />
              <div className="aspect-video bg-stadium-dark rounded-[2rem] overflow-hidden relative border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000" 
                  alt="Stadium Visualization" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stadium-dark via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 text-stadium-neon mb-2">
                    <div className="w-2 h-2 bg-stadium-neon rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Integration Active</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight uppercase font-display">Virtual Twin Engine v4.0.2</h3>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-10 -right-10 glass-card p-6 border-stadium-neon/30 rounded-3xl neon-glow animate-bounce-slow">
              <Zap className="text-yellow-400 mb-2" size={24} />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Surge Risk</p>
              <p className="text-2xl font-black text-white">LOW</p>
            </div>
          </motion.div>
        </div>

        {/* Features Slider */}
        <section className="mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Map />} 
            title="Spatio-Temporal Maps" 
            desc="Granular heatmaps revealing crowd flow patterns in real-time."
          />
          <FeatureCard 
            icon={<ShieldAlert />} 
            title="Incident Triage" 
            desc="Automated risk detection with Gemini-powered mitigation plans."
          />
          <FeatureCard 
            icon={<BarChart3 />} 
            title="Flow Analytics" 
            desc="Deep learning insights into concession and gate wait times."
          />
          <FeatureCard 
            icon={<Globe />} 
            title="Unified Records" 
            desc="Compliant, encrypted operational logs across all venues."
          />
        </section>

        {/* Stadiums List */}
        <section className="mt-40">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase font-display">Connected Venues</h2>
              <p className="text-slate-500 font-medium mt-2">Scale across India's premier sporting infrastructure.</p>
            </div>
            <button className="text-stadium-neon font-black text-xs uppercase tracking-[0.2em] border-b border-stadium-neon/30 pb-1 hover:border-stadium-neon transition-all">
              View All 24 Stadiums
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STADIUMS_INDIA.slice(0, 6).map((s) => (
              <div key={s.id} className="glass-card p-6 border-white/5 hover:border-stadium-neon/20 transition-all group hover:-translate-y-1">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{s.city}, {s.state}</p>
                <h4 className="text-lg font-black tracking-tight group-hover:text-stadium-neon transition-colors font-display">{s.name}</h4>
                <div className="flex items-center gap-4 mt-4">
                   <div className="text-[10px] text-slate-400 font-bold"><Users size={12} className="inline mr-1"/> {s.capacity?.toLocaleString()}</div>
                   <div className="text-[10px] text-stadium-success font-bold uppercase italic"><div className="w-1.5 h-1.5 bg-stadium-success rounded-full inline-block mr-1 opacity-60"/> Active</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-16 py-12 border-t border-white/5 glass mt-20 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
             © 2026 STADIUMIQ OPERATIONAL COMMAND. ALL RIGHTS RESERVED.
           </div>
           <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
             <a href="#" className="hover:text-stadium-neon">Privacy</a>
             <a href="#" className="hover:text-stadium-neon">Terms</a>
             <a href="#" className="hover:text-stadium-neon">Security</a>
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
    // Auto-populate logic
    const saved = localStorage.getItem('siq_credentials');
    if (saved) {
      const { email: savedEmail, password: savedPass } = JSON.parse(saved);
      setEmail(savedEmail);
      setPassword(savedPass);
    } else {
      // Hardcoded fallback for first-time use
      setEmail('admin@stadiumiq.demo');
      setPassword('admin');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    // Simulate auth check
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-stadium-dark/95 backdrop-blur-2xl"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full glass-card p-10 relative overflow-hidden border-stadium-neon/30 shadow-[0_0_80px_rgba(6,182,212,0.15)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/5 blur-[100px] -mr-32 -mt-32" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-stadium-neon/10 rounded-2xl flex items-center justify-center text-stadium-neon mb-8 mx-auto border border-stadium-neon/20 shadow-inner">
            <KeyRound size={32} />
          </div>

          <h2 className="text-3xl font-black tracking-tighter uppercase font-display mb-2">Command Gateway</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
            Identity Authorization Required
          </p>

          <form className="space-y-6 text-left" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Security Node (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/50 transition-all text-sm font-semibold" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Access Key (Password)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/50 transition-all text-sm font-semibold" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isVerifying}
              className="w-full py-5 bg-stadium-neon text-stadium-dark font-black rounded-xl shadow-lg shadow-stadium-neon/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 group"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-stadium-dark/20 border-t-stadium-dark rounded-full animate-spin" />
                  Decrypting...
                </>
              ) : (
                <>
                  Authorize Node
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-600 font-bold text-center mt-6">
              SYSTEM ENCRYPTED: RFC 7519 COMPLIANT
            </p>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stadium-dark/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-xl w-full glass-card p-10 relative overflow-hidden border-stadium-neon/20 shadow-[0_0_100px_rgba(6,182,212,0.1)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-stadium-neon/5 blur-[100px] -mr-32 -mt-32" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-stadium-neon/10 rounded-2xl flex items-center justify-center text-stadium-neon mb-8 border border-stadium-neon/20">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-3xl font-black tracking-tighter uppercase font-display mb-2">Request Access</h2>
          <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
            Join the elite network of stadiums utilizing advanced crowd intelligence for enterprise-grade safety.
          </p>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/50 transition-all text-sm font-semibold" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input type="email" placeholder="john@stadium.in" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/50 transition-all text-sm font-semibold" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">Organization / Venue</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="GCA / Narendra Modi Stadium" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-stadium-neon/50 transition-all text-sm font-semibold" required />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-stadium-neon text-stadium-dark font-black rounded-xl shadow-lg shadow-stadium-neon/20 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                >
                  Verify Credentials
                  <ArrowRight size={18} />
                </button>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 bg-stadium-success/10 rounded-full flex items-center justify-center text-stadium-success mx-auto mb-6 border border-stadium-success/20">
                  <Activity size={40} className="animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">Verification Pending</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                  Your request has been submitted to the StadiumIQ Operational Command. You will receive an invitation link via email shortly.
                </p>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Back to Site
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
    <div className="glass-card p-8 border-white/10 hover:border-stadium-neon/30 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-stadium-neon mb-6 group-hover:scale-110 transition-transform shadow-lg">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-stadium-neon transition-colors uppercase font-display">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function Users({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}


