import React, { useState, useEffect } from 'react';
import {
  Activity,
  Settings,
  Bell,
  Zap,
  Navigation,
  Coffee,
  ShieldAlert,
  Award,
  Database,
  BarChart3,
  LayoutDashboard,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Variants } from 'framer-motion';

// Views & Components
import Dashboard from './components/Dashboard';
import ARNavigation from './components/ARNavigation';
import QueueManager from './components/QueueManager';
import EmergencyPanel from './components/EmergencyPanel';
import { FanRewards } from './components/SecondaryFeatures';
import LandingPage from './components/LandingPage';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import StadiumSelector from './components/StadiumSelector';
import { useRealtime } from './hooks/useRealtime';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { connected, connectionStatus } = useRealtime();

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
    { id: 'dashboard', label: t('nav.overview'), icon: <LayoutDashboard /> },
    { id: 'analytics', label: t('nav.analytics'), icon: <BarChart3 /> },
    { id: 'ar', label: t('nav.map'), icon: <Navigation /> },
    { id: 'queue', label: t('nav.queues'), icon: <Coffee /> },
    { id: 'rewards', label: t('nav.rewards') || 'Rewards', icon: <Award /> },
  ];

  const pageVariants: Variants = {
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
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full mb-1">{t('nav.command_center')}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${connected ? 'bg-stadium-success/10 text-stadium-success' : 'bg-stadium-emergency/10 text-stadium-emergency'}`}>
                {isOffline ? t('dashboard.offline') : (connected ? t('dashboard.connected') : t('dashboard.syncing'))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsEmergency(!isEmergency)}
              className={`p-2.5 rounded-xl transition-all border ${isEmergency ? 'bg-stadium-emergency border-stadium-emergency text-white animate-pulse' : 'bg-white/5 border-white/5 text-slate-400 hover:text-stadium-emergency hover:bg-white/10'}`}
            >
              <ShieldAlert size={22} />
            </button>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-stadium-neon hover:bg-white/10 transition-all relative"
            >
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-stadium-emergency rounded-full border-2 border-stadium-dark"></span>
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 p-2 pr-5 rounded-2xl border border-white/5 transition-all group ${activeTab === 'settings' || isProfileOpen ? 'border-stadium-neon/40 ring-1 ring-stadium-neon/20' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg border border-white/10">
                  <img src={userProfile.image} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-white leading-none">{userProfile.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">{userProfile.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-56 glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('settings');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings size={16} />
                          {t('nav.settings')}
                        </button>
                        <div className="h-px bg-white/5 mx-2" />
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            setView('landing');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all text-left"
                        >
                          <LogOut size={16} />
                          {t('settings.logout')}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative pb-56 md:pb-8 custom-scrollbar bg-[#020617]/50">
          <AnimatePresence mode="wait">
            {isEmergency ? (
              <motion.div
                key="emergency"
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="p-8 min-h-full overflow-y-auto"
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

        {/* Mobile Navigation Container */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 z-50">
          <nav className="h-20 glass rounded-[32px] flex justify-around items-center px-4 shadow-2xl border border-white/5">
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

        {/* Notifications Drawer */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNotificationsOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full max-w-sm glass border-l z-[110] p-8 flex flex-col"
              >
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <Bell className="text-stadium-neon" size={24} />
                    Live Notifications
                  </h2>
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-white transition-all">
                    <Zap size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {[
                    { title: "System Online", desc: "Digital twin synchronized successfully.", time: "Just now", type: "success" },
                    { title: "Gateway Port 8001", desc: "Local WebSocket server unreachable. Fallback simulator active.", time: "2m ago", type: "warning" },
                    { title: "Security Alert", desc: "Localized density surge detected at North Concourse.", time: "5m ago", type: "critical" }
                  ].map((notif, i) => (
                    <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{notif.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="mt-6 w-full py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Clear All Alerts
                </button>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

