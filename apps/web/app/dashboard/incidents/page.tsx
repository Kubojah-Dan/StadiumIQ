
"use client";

import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Filter } from 'lucide-react';
import { useRealtime } from '../../../hooks/useRealtime';

export default function IncidentsPage() {
  const { alerts } = useRealtime();
  const critical = alerts.filter(a => a.alert_level === 'Critical');
  const warnings = alerts.filter(a => a.alert_level === 'Warning');
  const info = alerts.filter(a => a.alert_level !== 'Critical' && a.alert_level !== 'Warning');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <ShieldAlert className="mr-3 h-6 w-6 text-red-500" />
            Incident Management
          </h2>
          <p className="text-muted-foreground mt-1">Monitor, triage, and clear real-time security and congestion alerts.</p>
        </div>
        <button className="glass-panel px-4 py-2 rounded-md hover:bg-white/5 transition border border-white/10 flex items-center text-sm font-medium">
          <Filter className="mr-2 h-4 w-4" />
          Filter Alerts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-5 rounded-xl border border-red-500/20 bg-red-500/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-200">Critical Alerts</p>
              <h4 className="text-3xl font-bold text-red-400 mt-1">{critical.length}</h4>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500/50" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-yellow-200">Warnings</p>
              <h4 className="text-3xl font-bold text-yellow-400 mt-1">{warnings.length}</h4>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500/50" />
          </div>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-200">Information</p>
              <h4 className="text-3xl font-bold text-blue-400 mt-1">{info.length}</h4>
            </div>
            <Info className="h-8 w-8 text-blue-500/50" />
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 font-medium text-sm flex grid grid-cols-12 gap-4 text-muted-foreground">
          <div className="col-span-2">Severity</div>
          <div className="col-span-3">Zone Location</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Time</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        {alerts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-1">No Active Incidents</h3>
            <p className="text-sm text-slate-400 max-w-sm">Waiting for live alerts from the realtime event bus.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {alerts.slice(0, 25).map((a, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 p-4 text-sm items-center">
                <div className="col-span-2">
                  <span
                    className={`text-[10px] px-2 py-1 rounded-full border ${
                      a.alert_level === 'Critical'
                        ? 'bg-red-500/15 text-red-300 border-red-500/30'
                        : a.alert_level === 'Warning'
                          ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                    }`}
                  >
                    {a.alert_level || 'Info'}
                  </span>
                </div>
                <div className="col-span-3 text-slate-200 font-medium">{a.zone_id || '-'}</div>
                <div className="col-span-4 text-slate-400 truncate">{a.mitigation_recommendation || '—'}</div>
                <div className="col-span-2 text-slate-400">{a.estimated_surge_time ? 'ETA set' : '—'}</div>
                <div className="col-span-1 text-right text-primary hover:underline cursor-pointer">View</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
