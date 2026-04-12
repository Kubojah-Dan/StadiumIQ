
"use client";

import React from 'react';
import { LayoutDashboard, Settings, Map, ShieldAlert, BarChart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '../../components/BrandMark';
import { StadiumPicker } from '../../components/StadiumPicker';
import { UserMenu } from '../../components/UserMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const items = [
    { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/map', label: 'Venue Map', icon: <Map size={20} /> },
    { href: '/dashboard/incidents', label: 'Incidents', icon: <ShieldAlert size={20} /> },
    { href: '/dashboard/analytics', label: 'Analytics', icon: <BarChart size={20} /> },
  ] as const;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 glass-panel border-r border-white/10 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <BrandMark href="/dashboard" />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} />
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-stretch overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden">
              <BrandMark href="/dashboard" iconClassName="h-5 w-5" textClassName="text-lg" />
            </div>
            <h1 className="hidden md:block text-lg font-semibold tracking-tight">Command Center</h1>
            <div className="min-w-0">
              <StadiumPicker />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-slate-300">System Online</span>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 bg-gradient-to-br from-background to-background/50">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed left-4 right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50">
        <div className="glass-panel border border-white/10 backdrop-blur-xl rounded-[999px] shadow-2xl px-2 py-2">
          <div className="grid grid-cols-5 gap-1">
            {items.map((item) => (
              <MobileNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
              />
            ))}
            <MobileNavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={pathname.startsWith('/dashboard/settings')} />
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group ${
        active 
          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      }`}
    >
      <div className={`${active ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'} transition-colors duration-200`}>
        {icon}
      </div>
      <span className="ml-3 font-medium text-sm">{label}</span>
      {active && <div className="ml-auto w-1 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.8)]" />}
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex flex-col items-center justify-center py-2 rounded-[999px] transition-all duration-200 ${
        active
          ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
          : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      <div className={`${active ? 'text-primary' : 'text-slate-400'} transition-colors`}>{icon}</div>
      <div className="mt-0.5 text-[10px] font-medium leading-none">{label}</div>
    </Link>
  );
}
