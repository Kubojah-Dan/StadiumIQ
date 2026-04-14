import React from 'react';
import { LayoutDashboard, BarChart3, Navigation, Coffee, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export default function BottomNav({
  items,
  activeTab,
  setActiveTab
}: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 sm:px-4 pb-[calc(1rem+var(--safe-area-bottom))] bg-gradient-to-t from-stadium-dark via-stadium-dark/95 to-transparent">
      <div className="h-16 glass rounded-[32px] flex items-center justify-around px-2 shadow-2xl border border-white/10 ring-1 ring-white/5">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 flex-1 relative ${
                isActive ? 'text-stadium-neon' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-stadium-neon/10 scale-110 -translate-y-1' : ''
              }`}>
                {React.cloneElement(item.icon as React.ReactElement, { 
                  size: 20, 
                  strokeWidth: isActive ? 2.5 : 2 
                })}
              </div>
              <motion.span 
                initial={false}
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  y: isActive ? 0 : 4,
                  scale: isActive ? 1 : 0.8
                }}
                className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap ${
                    isActive ? '' : 'absolute invisible'
                }`}
              >
                {item.label.split(' ')[0]}
              </motion.span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 bg-stadium-neon rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
