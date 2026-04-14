import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Map as MapIcon, 
  Settings, 
  Bell, 
  User, 
  Zap, 
  Navigation, 
  Coffee, 
  Droplets, 
  ShieldAlert, 
  Globe, 
  Award,
  Leaf,
  Database,
  BarChart3,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Views & Components
import Dashboard from './components/Dashboard';
import ARNavigation from './components/ARNavigation';
import QueueManager from './components/QueueManager';
import EmergencyPanel from './components/EmergencyPanel';
import { SustainabilityDashboard, FanRewards } from './components/SecondaryFeatures';
import LandingPage from './components/LandingPage';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import StadiumSelector from './components/StadiumSelector';
import { useStadium } from './context/StadiumContext';

export default function App() {
  const { stadium } = useStadium();
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: "Felix K.",
    role: "Lead Operations Officer",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 /> },
    { id: 'ar', label: 'Venue Map', icon: <Navigation /> },
    { id: 'queue', label: 'Queues', icon: <Coffee /> },
    { id: 'rewards', label: 'Fan Rewards', icon: <Award /> },
  ];

  const pageVariants = {
    initial: { opacity: 0, scale: 0.99, y: 10 },
    enter: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.99, y: -5, transition: { duration: 0.3 } }
  };

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />;
  }

  return (
    <div className="min-h-screen bg-stadium-dark flex overflow-hidden selection:bg-stadium-neon selection:text-white font-sans">
      {/* Sidebar - Desktop Only */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 90 : 260 }}
        className="hidden md:flex flex-col h-screen glass border-r relative z-50 pt-10 px-4"
      >
        <div className="flex items-center gap-3 px-3 mb-12 overflow-hidden whitespace-nowrap cursor-pointer" onClick={() => setView('landing')}>
          <div className="min-w-[44px] h-11 bg-stadium-neon rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
            <Activity className="text-white" size={24} />
          </div>
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-1">
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">StadiumIQ</h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 block">Enterprise Operations</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item w-full cursor-pointer relative group ${activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <div className="min-w-[24px] flex items-center justify-center">
                {React.cloneElement(item.icon as React.ReactElement, { size: 20, strokeWidth: activeTab === item.id ? 2.5 : 2 })}
              </div>
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -5 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="whitespace-nowrap font-semibold"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activePill"
                  className="absolute left-0 w-1 h-6 bg-stadium-neon rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mb-10 space-y-2 border-t border-white/5 pt-8">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`sidebar-item w-full cursor-pointer ${activeTab === 'settings' ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span className="font-semibold">Settings</span>}
          </button>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="sidebar-item w-full sidebar-item-inactive group cursor-pointer"
          >
            <Zap size={20} className="group-hover:text-yellow-400 transition-all font-semibold" />
            {!isSidebarCollapsed && <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">Compact Mode</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 glass-nav border-b z-40">
          <div className="flex items-center gap-8">
            <div className="md:hidden flex items-center gap-3">
               <div className="w-10 h-10 bg-stadium-neon rounded-xl flex items-center justify-center" onClick={() => setView('landing')}>
                  <Activity className="text-white" size={20} />
               </div>
               <span className="font-bold tracking-tight text-xl">SIQ</span>
            </div>

            <div className="hidden md:block">
              <StadiumSelector />
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full mb-1">Command Center</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-stadium-success rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-300">System Online</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsEmergency(!isEmergency)}
              className={`p-2.5 rounded-xl transition-all border ${isEmergency ? 'bg-stadium-emergency border-stadium-emergency text-white animate-pulse' : 'bg-white/5 border-white/5 text-slate-400 hover:text-stadium-emergency hover:bg-white/10'}`}
            >
              <ShieldAlert size={22} />
            </button>
            <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-stadium-neon hover:bg-white/10 transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-stadium-emergency rounded-full border-2 border-stadium-dark"></span>
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 p-2 pr-5 rounded-2xl border border-white/5 transition-all group ${activeTab === 'settings' ? 'border-stadium-neon/40 ring-1 ring-stadium-neon/20' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={userProfile.image} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-white leading-none">{userProfile.name}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{userProfile.role}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative pb-32 md:pb-8 custom-scrollbar bg-[#020617]/50">
          <AnimatePresence mode="wait">
            {isEmergency ? (
              <motion.div
                key="emergency"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="p-8 h-full"
              >
                <EmergencyPanel onClose={() => setIsEmergency(false)} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="p-8 h-full"
              >
                <div className="max-w-[1600px] mx-auto h-full">
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'analytics' && <AnalyticsView />}
                  {activeTab === 'ar' && <ARNavigation />}
                  {activeTab === 'queue' && <QueueManager onNavigateToAR={() => setActiveTab('ar')} />}
                  {activeTab === 'rewards' && <FanRewards />}
                  {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdateProfile={setUserProfile} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline Status */}
          <AnimatePresence>
            {isOffline && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-50 px-8 py-4 glass rounded-[24px] flex items-center gap-4 shadow-2xl border border-stadium-neon/20"
              >
                <Database className="text-stadium-neon" size={20} />
                <div className="text-left">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Sync Offline</p>
                  <p className="text-xs text-slate-400">Operating on locally cached telemetry</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Mobile Navigation - Only visible on small screens */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-[32px] z-50 flex justify-around items-center px-4 shadow-2xl border border-white/5">
          {navItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`bottom-nav-item flex-1 ${activeTab === item.id ? 'bottom-nav-active' : 'text-slate-500'}`}
            >
              <div className={`p-2.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-stadium-neon/10 -translate-y-2' : ''}`}>
                {React.cloneElement(item.icon as React.ReactElement, { size: 24, strokeWidth: activeTab === item.id ? 2.5 : 2 })}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

