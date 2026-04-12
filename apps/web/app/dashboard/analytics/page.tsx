
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Download, PieChart as PieChartIcon, Activity, BarChart } from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useRealtime } from '../../../hooks/useRealtime';

export default function AnalyticsPage() {
  const { twinState } = useRealtime();
  const [series, setSeries] = useState<Array<Record<string, number | string>>>([]);

  const zones = useMemo(() => Object.keys(twinState.zones || {}).sort(), [twinState.zones]);
  const palette = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];

  const pieData = useMemo(() => {
    const out = zones.map((z) => ({
      name: z,
      value: Math.round(((twinState.zones?.[z]?.density || 0) as number) * 100),
    }));
    return out.filter((d) => d.value > 0);
  }, [twinState.zones, zones]);

  useEffect(() => {
    if (!twinState || !twinState.zones) return;
    if (Object.keys(twinState.zones).length === 0) return;

    const point: Record<string, number | string> = { time: new Date().toLocaleTimeString() };
    for (const z of zones) point[z] = Math.round(((twinState.zones[z]?.density || 0) * 100));

    setSeries(prev => {
      const next = [...prev, point];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
  }, [twinState, zones]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <BarChart className="mr-3 h-6 w-6 text-purple-400" />
            Historical Analytics
          </h2>
          <p className="text-muted-foreground mt-1">Comprehensive data analysis and trend reports across events.</p>
        </div>
        <button className="glass-panel px-4 py-2 rounded-md hover:bg-white/5 transition border border-white/10 flex items-center text-sm font-medium">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
              Traffic Capacity Trends
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">Last 7 Events</span>
          </div>
          {series.length < 2 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
              <Activity className="h-10 w-10 text-slate-600 mb-3 opacity-50" />
              <p className="text-sm">Waiting for live samples to build a short trendline…</p>
            </div>
          ) : (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(148,163,184,0.9)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 11 }} />
                  {zones.map((z, idx) => (
                    <Line
                      key={z}
                      type="monotone"
                      dataKey={z}
                      stroke={palette[idx % palette.length]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold tracking-tight text-white flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-blue-400" />
              Zone Congestion Distribution
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">Avg. 15min Windows</span>
          </div>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
              <PieChartIcon className="h-10 w-10 text-slate-600 mb-3 opacity-50" />
              <p className="text-sm">Waiting for live density data to compute distribution…</p>
            </div>
          ) : (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
                    formatter={(value) => [`${value}%`, 'Density']}
                  />
                  <Legend wrapperStyle={{ color: 'rgba(148,163,184,0.9)', fontSize: 11 }} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="rgba(255,255,255,0.08)"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={entry.name} fill={palette[idx % palette.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
