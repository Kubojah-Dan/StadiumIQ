import React from 'react';
import { Activity, Bell, ShieldAlert, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopHeaderProps {
  title: string;
  onMenuClick?: () => void;
  onNotificationsClick: () => void;
  onEmergencyClick: () => void;
  isEmergency: boolean;
  status: string;
  isConnected: boolean;
  userImage: string;
}

export default function TopHeader({
  title,
  onMenuClick,
  onNotificationsClick,
  onEmergencyClick,
  isEmergency,
  status,
  isConnected,
  userImage
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b pt-[var(--safe-area-top)]">
      <div className="h-16 px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Logo & Menu (Mobile) */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <button onClick={onMenuClick} className="tap-target text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 bg-stadium-neon rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="text-white" size={20} />
            </div>
            <span className="hidden sm:block font-display font-bold text-xl tracking-tight text-white italic">SIQ</span>
          </div>
        </div>

        {/* Center: Dynamic Title */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm md:text-base font-bold text-white uppercase tracking-widest truncate max-w-[150px] sm:max-w-none"
          >
            {title}
          </motion.h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onEmergencyClick}
            className={`tap-target rounded-xl transition-all ${
              isEmergency 
                ? 'bg-stadium-emergency text-white animate-pulse' 
                : 'text-slate-400 hover:text-stadium-emergency hover:bg-white/5'
            }`}
          >
            <ShieldAlert size={20} />
          </button>
          
          <button
            onClick={onNotificationsClick}
            className="tap-target text-slate-400 hover:text-stadium-neon hover:bg-white/5 relative"
          >
            <Bell size={20} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-stadium-neon rounded-full border-2 border-stadium-dark shadow-sm"></span>
          </button>
          
          <div className="hidden sm:block h-6 w-px bg-white/10 mx-1"></div>
          
          <button className="tap-target p-0.5 rounded-full border border-white/10 overflow-hidden ring-2 ring-transparent hover:ring-stadium-neon/30 transition-all">
            <img src={userImage} alt="User" className="w-8 h-8 rounded-full object-cover" />
          </button>
        </div>
      </div>
      
      {/* Connectivity Banner (Mobile Only) */}
      <div className="md:hidden flex items-center justify-center py-1 bg-white/5 border-t border-white/5">
        <span className={`text-[8px] font-bold uppercase tracking-widest ${isConnected ? 'text-stadium-success' : 'text-stadium-warning'}`}>
          {status}
        </span>
      </div>
    </header>
  );
}
