"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useStadium } from "./stadium-context";

export function StadiumPicker() {
  const { stadium, stadiumId, stadiums, setStadiumId } = useStadium();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stadiums;
    return stadiums.filter((s) => `${s.name} ${s.city} ${s.state}`.toLowerCase().includes(q));
  }, [query, stadiums]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-panel border border-white/10 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 hover:bg-white/5 transition shadow-[0_0_18px_rgba(0,0,0,0.25)]"
        aria-label="Select stadium"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <div className="text-left leading-tight">
          <div className="text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-[260px]">
            {stadium.name}
          </div>
          <div className="hidden sm:block text-[11px] text-slate-400 truncate max-w-[260px]">
            {stadium.city}, {stadium.state}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-slate-950/75 backdrop-blur-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/10 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
              <Search className="h-4 w-4 text-slate-300" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stadiums in India…"
              className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500"
              autoFocus
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No stadiums match your search.</div>
            ) : (
              filtered.map((s) => {
                const active = s.id === stadiumId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStadiumId(s.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition ${
                      active ? "bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold truncate ${active ? "text-primary" : "text-white"}`}>
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {s.city}, {s.state}
                          {s.capacity ? ` • ${s.capacity.toLocaleString()} cap` : ""}
                        </div>
                      </div>
                      {active && (
                        <span className="text-[10px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 text-[11px] text-slate-400">
            Data source: local simulator / demo feeds. Add real integrations in `services/` when ready.
          </div>
        </div>
      )}
    </div>
  );
}
