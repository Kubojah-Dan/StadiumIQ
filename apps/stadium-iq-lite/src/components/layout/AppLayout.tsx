import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';
import { 
  Activity, 
  Home,
  LayoutDashboard, 
  BarChart3, 
  Navigation, 
  Coffee, 
  Award,
  Settings,
  Bell,
  Zap,
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (id: string) => void;
  title: string;
  status: string;
  isConnected: boolean;
  isEmergency: boolean;
  setIsEmergency: (val: boolean) => void;
  userProfile: { name: string; role: string; image: string };
  onLogout: () => void;
  onNotificationsClick: () => void;
}

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  title,
  status,
  isConnected,
  isEmergency,
  setIsEmergency,
  userProfile,
  onLogout,
  onNotificationsClick
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home /> },
    { id: 'ar', label: 'Tactical Map', icon: <Navigation /> },
    { id: 'dashboard', label: 'Live Twin', icon: <LayoutDashboard /> },
    { id: 'analytics', label: 'Intelligence', icon: <BarChart3 /> },
    { id: 'queue', label: 'Facilities', icon: <Coffee /> },
    { id: 'rewards', label: 'Rewards', icon: <Award /> },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-stadium-dark flex overflow-hidden selection:bg-stadium-neon selection:text-white font-sans">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-stadium-dark/80 backdrop-blur-sm z-[100] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-[280px] bg-stadium-dark border-r border-white/10 z-[110] md:hidden flex flex-col p-6 pt-[calc(1.5rem+var(--safe-area-top))]"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stadium-neon rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <Activity className="text-white" size={24} />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-none">StadiumIQ</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="tap-target text-slate-500">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                      activeTab === item.id ? 'bg-stadium-neon/10 text-stadium-neon' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                    <span className="font-semibold">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/5 space-y-2 pb-[var(--safe-area-bottom)]">
                <button
                  onClick={() => handleNavClick('settings')}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                    activeTab === 'settings' ? 'bg-stadium-neon/10 text-stadium-neon' : 'text-slate-400'
                  }`}
                >
                  <Settings size={20} />
                  <span className="font-semibold">Settings</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-semibold"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop Only */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 90 : 260 }}
        className="hidden md:flex flex-col h-screen glass border-r relative z-50 pt-10 px-4"
      >
        <div className="flex items-center gap-3 px-3 mb-12 overflow-hidden whitespace-nowrap cursor-pointer" onClick={() => window.location.reload()}>
          <div className="min-w-[44px] h-11 bg-stadium-neon rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
            <Activity className="text-white" size={24} />
          </div>
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-1">
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">StadiumIQ</h1>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 block">Enterprise Ops Hub</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item w-full cursor-pointer relative group tap-target ${
                  isActive ? 'bg-stadium-neon/10 text-stadium-neon' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="min-w-[24px] flex items-center justify-center">
                  {React.cloneElement(item.icon as React.ReactElement, { size: 20, strokeWidth: isActive ? 2.5 : 2 })}
                </div>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="whitespace-nowrap font-semibold text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute left-0 w-1 h-6 bg-stadium-neon rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mb-10 space-y-2 border-t border-white/5 pt-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`sidebar-item w-full cursor-pointer tap-target ${activeTab === 'settings' ? 'bg-stadium-neon/10 text-stadium-neon' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Settings</span>}
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="sidebar-item w-full tap-target text-slate-400 hover:text-white hover:bg-white/5 group transition-all"
          >
            <Zap size={20} className="group-hover:text-yellow-400 transition-all font-semibold" />
            {!isSidebarCollapsed && <span className="font-semibold text-slate-400 group-hover:text-white transition-colors text-sm">Compact View</span>}
          </button>
          <button
            onClick={onLogout}
            className="sidebar-item w-full tap-target text-red-400 hover:bg-red-500/10 group transition-all"
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span className="font-semibold text-sm">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative">
        <TopHeader 
          title={title}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onNotificationsClick={onNotificationsClick}
          onEmergencyClick={() => setIsEmergency(!isEmergency)}
          isEmergency={isEmergency}
          status={status}
          isConnected={isConnected}
          userImage={userProfile.image}
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-stadium-dark safe-padding-b md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isEmergency ? '-emer' : '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomNav 
          items={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}
