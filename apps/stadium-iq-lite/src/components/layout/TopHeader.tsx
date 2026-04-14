import React from 'react';
import { Activity, Bell, ShieldAlert, User, Menu, ChevronDown, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { STADIUMS_INDIA, useStadium } from '../../context/StadiumContext';

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
  const { stadiumId, setStadiumId, stadium } = useStadium();

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

        {/* Center: Stadium Dropdown */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className="relative group/dropdown max-w-[200px] md:max-w-xs w-full">
            <select 
              value={stadiumId}
              onChange={(e) => setStadiumId(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            >
              {STADIUMS_INDIA.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center justify-between gap-3 group-hover/dropdown:bg-white/10 transition-all">
              <div className="flex items-center gap-2 overflow-hidden">
                 <MapPin size={14} className="text-stadium-neon shrink-0" />
                 <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest truncate">
                   {stadium.name}
                 </span>
              </div>
              <ChevronDown size={14} className="text-slate-500 shrink-0" />
            </div>
          </div>
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
