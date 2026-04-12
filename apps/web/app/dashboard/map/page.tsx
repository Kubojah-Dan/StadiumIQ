
"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Map as MapIcon, Crosshair, Layers, Users, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useRealtime } from '../../../hooks/useRealtime';

type PanZoom = { x: number; y: number; scale: number };

export default function VenueMapPage() {
  const { twinState } = useRealtime();
  const zones = useMemo(() => Object.entries(twinState.zones || {}), [twinState.zones]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showHeat, setShowHeat] = useState(true);

  const [panZoom, setPanZoom] = useState<PanZoom>({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  const zonePoints = useMemo(() => {
    const points: Record<string, { x: number; y: number }> = {
      'Gate A': { x: 170, y: 300 },
      'Gate B': { x: 500, y: 120 },
      'Gate C': { x: 830, y: 300 },
    };

    // Fallback positions for unknown zones: place them around the ring
    const unknown = zones.map(([id]) => id).filter((id) => !points[id]);
    for (let i = 0; i < unknown.length; i++) {
      const angle = (Math.PI * 2 * i) / Math.max(unknown.length, 1);
      points[unknown[i]] = { x: 500 + Math.cos(angle) * 320, y: 300 + Math.sin(angle) * 190 };
    }

    return points;
  }, [zones]);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      baseX: panZoom.x,
      baseY: panZoom.y,
    };
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPanZoom((p) => ({ ...p, x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy }));
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = () => {
    dragRef.current.active = false;
  };

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    setPanZoom((p) => {
      const nextScale = Math.min(2.5, Math.max(0.85, p.scale + (delta > 0 ? -0.08 : 0.08)));
      return { ...p, scale: nextScale };
    });
  };

  const recenter = () => setPanZoom({ x: 0, y: 0, scale: 1 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center">
            <MapIcon className="mr-3 h-6 w-6 text-primary" />
            Interactive Venue Map
          </h2>
          <p className="text-muted-foreground mt-1">Real-time geographical tracking of crowd movements and zones.</p>
        </div>
        <div className="flex space-x-3">
          <button
            className="glass-panel px-4 py-2 rounded-md hover:bg-white/5 transition border border-white/10 flex items-center text-sm font-medium"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <Layers className="mr-2 h-4 w-4" />
            Filters
          </button>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center text-sm font-medium"
            onClick={recenter}
          >
            <Crosshair className="mr-2 h-4 w-4" />
            Recenter Map
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 glass-panel p-4 rounded-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none mix-blend-overlay"></div>

          {filtersOpen && (
            <div className="absolute top-4 right-4 z-20 w-56 rounded-xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-3 shadow-2xl">
              <div className="text-xs font-semibold text-slate-200 mb-2">Map Filters</div>
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm"
                onClick={() => setShowLabels((v) => !v)}
              >
                <span className="flex items-center text-slate-200">
                  {showLabels ? <Eye className="w-4 h-4 mr-2 text-slate-300" /> : <EyeOff className="w-4 h-4 mr-2 text-slate-300" />}
                  Labels
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${showLabels ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-slate-700 bg-slate-900/40 text-slate-300'}`}>
                  {showLabels ? 'On' : 'Off'}
                </span>
              </button>
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm"
                onClick={() => setShowHeat((v) => !v)}
              >
                <span className="flex items-center text-slate-200">
                  <Users className="w-4 h-4 mr-2 text-slate-300" />
                  Heat Overlay
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${showHeat ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-slate-700 bg-slate-900/40 text-slate-300'}`}>
                  {showHeat ? 'On' : 'Off'}
                </span>
              </button>
              <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                <button
                  className="text-xs text-slate-300 hover:text-white transition"
                  onClick={() => setFiltersOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div
            className="relative h-[520px] rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden touch-none select-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
          >
            {zones.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Waiting for live data… (WebSocket sync)
              </div>
            ) : (
              <div
                className="absolute inset-0 will-change-transform"
                style={{ transform: `translate3d(${panZoom.x}px, ${panZoom.y}px, 0) scale(${panZoom.scale})`, transformOrigin: '50% 50%' }}
              >
                <svg viewBox="0 0 1000 600" className="w-full h-full">
                  <defs>
                    <radialGradient id="fieldGlow" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.12)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" />
                    </filter>
                  </defs>

                  {/* Stadium bowl */}
                  <ellipse cx="500" cy="300" rx="430" ry="250" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
                  <ellipse cx="500" cy="300" rx="360" ry="205" fill="rgba(2,6,23,0.65)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

                  {/* Seating section ticks */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const a = (Math.PI * 2 * i) / 16;
                    const x1 = 500 + Math.cos(a) * 360;
                    const y1 = 300 + Math.sin(a) * 205;
                    const x2 = 500 + Math.cos(a) * 430;
                    const y2 = 300 + Math.sin(a) * 250;
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.06)" strokeWidth="2" />;
                  })}

                  {/* Field */}
                  <rect x="320" y="210" width="360" height="180" rx="18" fill="rgba(2,132,199,0.08)" stroke="rgba(59,130,246,0.18)" strokeWidth="2" />
                  <rect x="360" y="240" width="280" height="120" rx="14" fill="url(#fieldGlow)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                  <line x1="500" y1="240" x2="500" y2="360" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
                  <circle cx="500" cy="300" r="32" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />

                  {/* Zones */}
                  {zones.map(([zoneId, zone]) => {
                    const p = zonePoints[zoneId] || { x: 500, y: 300 };
                    const density = Number(zone.density || 0);
                    const densityPct = Math.round(density * 100);
                    const alertLevel = (zone.alertLevel || 'Normal') as 'Normal' | 'Warning' | 'Critical';

                    const baseColor =
                      alertLevel === 'Critical' ? '#ef4444' : alertLevel === 'Warning' ? '#f59e0b' : '#3b82f6';

                    return (
                      <g key={zoneId} filter="url(#softShadow)">
                        {showHeat && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={80}
                            fill={baseColor}
                            opacity={Math.min(0.22, Math.max(0.06, density * 0.22))}
                          />
                        )}
                        <circle cx={p.x} cy={p.y} r={16} fill="rgba(2,6,23,0.85)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                        <circle cx={p.x} cy={p.y} r={10} fill={baseColor} opacity={0.95} />
                        {alertLevel !== 'Normal' && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={22}
                            fill={baseColor}
                            opacity={0.12}
                          />
                        )}
                        {showLabels && (
                          <g>
                            <text x={p.x + 22} y={p.y - 6} fontSize="14" fill="rgba(226,232,240,0.95)" fontWeight="700">
                              {zoneId}
                            </text>
                            <text x={p.x + 22} y={p.y + 14} fontSize="12" fill="rgba(148,163,184,0.95)">
                              Density {densityPct}% • {alertLevel}
                            </text>
                          </g>
                        )}
                        <title>{`${zoneId} • ${densityPct}% • ${alertLevel}`}</title>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            <div className="absolute left-3 top-3 text-[10px] text-slate-300 bg-slate-950/50 border border-white/10 rounded-full px-3 py-1 backdrop-blur">
              Drag to pan • Scroll to zoom
            </div>
          </div>
        </div>

        {/* Live Zone List */}
        <div className="glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-40 pointer-events-none" />

          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-white font-semibold">Live Zones</div>
              <div className="text-xs text-muted-foreground mt-0.5">Density, alerts, and surge probability.</div>
            </div>
            <div className="text-[10px] text-slate-300 border border-white/10 bg-white/5 rounded-full px-2 py-1">
              {zones.length} zones
            </div>
          </div>

          {zones.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground">Awaiting sync…</div>
          ) : (
            <div className="space-y-3">
              {zones
                .slice()
                .sort((a, b) => (Number(b[1]?.density || 0) - Number(a[1]?.density || 0)))
                .map(([zoneId, zone]) => {
                  const densityPct = Math.round(((zone.density || 0) * 100));
                  const alertLevel = zone.alertLevel || 'Normal';
                  const badge =
                    alertLevel === 'Critical'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : alertLevel === 'Warning'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        : 'bg-green-500/15 text-green-300 border-green-500/30';

                  return (
                    <div key={zoneId} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-semibold">{zoneId}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Live density + alert status</div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full border ${badge}`}>{alertLevel}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-300">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          Density
                        </div>
                        <div className="font-semibold text-white">{densityPct}%</div>
                      </div>

                      <div className="mt-2 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${alertLevel === 'Critical' ? 'bg-red-500' : alertLevel === 'Warning' ? 'bg-yellow-500' : 'bg-primary'} h-2 rounded-full`}
                          style={{ width: `${densityPct}%` }}
                        />
                      </div>

                      {zone.surge_prob !== undefined && (
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center">
                            <AlertTriangle className="w-3.5 h-3.5 mr-2 text-yellow-400" />
                            Surge probability
                          </div>
                          <div className="font-semibold text-white">{Math.round((zone.surge_prob || 0) * 100)}%</div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
