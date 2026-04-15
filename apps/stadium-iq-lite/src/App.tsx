import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Zap, 
  Database,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Layout & Components
import AppLayout from './components/layout/AppLayout';
import ResponsiveContainer from './components/layout/ResponsiveContainer';
import Dashboard from './components/Dashboard';
import ARNavigation from './components/ARNavigation';
import QueueManager from './components/QueueManager';
import EmergencyPanel from './components/EmergencyPanel';
import { FanRewards } from './components/SecondaryFeatures';
import FanHome from './components/FanHome';
import LandingPage from './components/LandingPage';
import SettingsView from './components/SettingsView';
import AnalyticsView from './components/AnalyticsView';
import { useRealtime } from './hooks/useRealtime';

export default function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('home');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('app')} />;
  }

  const getPageTitle = () => {
    if (isEmergency) return 'EMERGENCY PROTOCOL';
    switch (activeTab) {
      case 'home': return 'Home Hub';
      case 'dashboard': return t('nav.overview');
      case 'analytics': return t('nav.analytics');
      case 'ar': return t('nav.map');
      case 'queue': return t('nav.queues');
      case 'rewards': return t('nav.rewards') || 'Fan Rewards';
      case 'settings': return t('nav.settings');
      default: return 'StadiumIQ';
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={getPageTitle()}
      status={isOffline ? t('dashboard.offline') : (connected ? t('dashboard.connected') : t('dashboard.syncing'))}
      isConnected={connected && !isOffline}
      isEmergency={isEmergency}
      setIsEmergency={setIsEmergency}
      userProfile={userProfile}
      onLogout={() => setView('landing')}
      onNotificationsClick={() => setIsNotificationsOpen(true)}
    >
      <ResponsiveContainer className="py-6 md:py-10" maxWidth={activeTab === 'dashboard' ? '1600px' : '7xl'}>
        {isEmergency ? (
          <EmergencyPanel onClose={() => setIsEmergency(false)} />
        ) : (
          <>
            {activeTab === 'home' && <FanHome onNavigate={setActiveTab} />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'ar' && <ARNavigation />}
            {activeTab === 'queue' && <QueueManager onNavigateToAR={() => setActiveTab('ar')} />}
            {activeTab === 'rewards' && <FanRewards />}
            {activeTab === 'settings' && <SettingsView userProfile={userProfile} onUpdateProfile={setUserProfile} />}
          </>
        )}
      </ResponsiveContainer>

      {/* Global Overlays */}
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
              className="fixed top-0 right-0 h-full w-full max-w-sm glass border-l z-[110] p-6 flex flex-col pt-[calc(1.5rem+var(--safe-area-top))]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white font-display">
                  <Bell className="text-stadium-neon" size={24} />
                  Live Intel
                </h2>
                <button onClick={() => setIsNotificationsOpen(false)} className="tap-target text-slate-500 hover:text-white">
                  <Zap size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {[
                  { title: "System Ready", desc: "Digital twin synchronized successfully.", time: "Just now", type: "success" },
                  { title: "Low Signal", desc: "Telemetry link jitter detected in North Sector.", time: "2m ago", type: "warning" },
                  { title: "Density Surge", desc: "Localized congestion at Gate 4.", time: "5m ago", type: "error" }
                ].map((notif, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setIsNotificationsOpen(false)}
                className="mt-6 w-full py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white"
              >
                Archive All
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Offline Alert */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 glass rounded-2xl flex items-center gap-4 shadow-2xl border border-stadium-neon/20"
          >
            <Database className="text-stadium-neon" size={20} />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">Offline Sync</p>
              <p className="text-[10px] text-slate-500 mt-1">Telemetry cached locally</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

