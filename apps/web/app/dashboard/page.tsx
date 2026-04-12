"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useRealtime } from "../../hooks/useRealtime";
import { useStadium } from "../../components/stadium-context";
import type { Stadium } from "../../lib/stadiums";
import { buildGoogleMapsEmbedUrl } from "../../lib/stadiums";

type StadiumLiveData = {
  source: "official_feed" | "adapter_fallback";
  updatedAt: string;
  occupancy: { current: number; capacity: number | null; percent: number };
  gateWaitTimes: Array<{ gate: string; minutes: number; status: "normal" | "watch" | "critical" }>;
  heroImageUrl: string | null;
  mapLink: string;
  officialWebsite: string | null;
  notes: string[];
  integration: { officialFeedConfigured: boolean; wikipediaImageResolved: boolean };
};

type AssistantOutput = {
  source: "gemini" | "rule_engine";
  generatedAt: string;
  priority: "low" | "medium" | "high";
  summary: string;
  actions: string[];
};

export default function DashboardPage() {
  const { stadiumId, stadium } = useStadium();
  const { twinState, alerts, connected } = useRealtime();

  const [stadiumLive, setStadiumLive] = useState<StadiumLiveData | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);
  const [assistant, setAssistant] = useState<AssistantOutput | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(true);

  const zonesArray = useMemo(() => Object.entries(twinState.zones || {}), [twinState.zones]);
  const avgDensity =
    zonesArray.length > 0 ? zonesArray.reduce((acc, [, z]) => acc + (z.density || 0), 0) / zonesArray.length : 0;
  const totalAlerts = alerts.filter((a) => a.alert_level === "Critical" || a.alert_level === "Warning").length;

  const topZones = useMemo(
    () =>
      zonesArray
        .slice()
        .sort((a, b) => Number(b[1].density || 0) - Number(a[1].density || 0))
        .slice(0, 6)
        .map(([id, zone]) => ({
          id,
          density: Number(zone.density || 0),
          alertLevel: zone.alertLevel || "Normal",
          queueMinutes: deriveQueueForZone(id, twinState.queues || {}),
        })),
    [zonesArray, twinState.queues],
  );

  useEffect(() => {
    let active = true;
    let timer: number | null = null;
    const abort = new AbortController();

    const load = async () => {
      try {
        if (active) setLiveLoading(true);
        const response = await fetch(`/api/stadium/live?stadiumId=${encodeURIComponent(stadiumId)}`, {
          signal: abort.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not fetch stadium feed.");
        const data = (await response.json()) as StadiumLiveData;
        if (active) setStadiumLive(data);
      } catch {
        if (active) setStadiumLive(null);
      } finally {
        if (active) setLiveLoading(false);
      }
    };

    void load();
    timer = window.setInterval(() => {
      void load();
    }, 45000);

    return () => {
      active = false;
      abort.abort();
      if (timer) window.clearInterval(timer);
    };
  }, [stadiumId]);

  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    const debounce = window.setTimeout(async () => {
      try {
        if (active) setAssistantLoading(true);
        const response = await fetch("/api/assistant/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stadiumId,
            context: {
              avgDensity,
              activeAlerts: totalAlerts,
              queueCount: Object.keys(twinState.queues || {}).length,
              connected,
              zones: topZones,
            },
          }),
          signal: abort.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not fetch assistant output.");
        const output = (await response.json()) as AssistantOutput;
        if (active) setAssistant(output);
      } catch {
        if (active) setAssistant(null);
      } finally {
        if (active) setAssistantLoading(false);
      }
    }, 1100);

    return () => {
      active = false;
      abort.abort();
      window.clearTimeout(debounce);
    };
  }, [stadiumId, avgDensity, totalAlerts, topZones, connected, twinState.queues]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Zone Density"
          value={`${(avgDensity * 100).toFixed(1)}%`}
          change={connected ? "Live Sync" : "Feed reconnecting"}
          isIncrease={null}
          icon={<Users className="text-blue-500" size={24} />}
        />
        <StatCard
          title="Active Queues"
          value={Object.keys(twinState.queues || {}).length.toString()}
          change={stadiumLive ? `${stadiumLive.gateWaitTimes.length} gate tracks` : "Live Sync"}
          isIncrease={null}
          icon={<Clock className="text-yellow-500" size={24} />}
        />
        <StatCard
          title="Active Surges"
          value={totalAlerts.toString()}
          change="Last 60 alerts tracked"
          isIncrease={totalAlerts > 0}
          icon={<AlertTriangle className={totalAlerts > 0 ? "text-red-500" : "text-green-500"} size={24} />}
        />
        <StatCard
          title="System Status"
          value={connected ? "Online" : "Recovering"}
          change={assistant?.source === "gemini" ? "Gemini Copilot Ready" : "Rule Copilot Ready"}
          isIncrease={null}
          icon={<Activity className={connected ? "text-green-500" : "text-orange-400"} size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Real-Time Digital Twin</h3>
              <p className="text-sm text-muted-foreground">Live localized density and queue times.</p>
            </div>
            <div className="flex space-x-2 text-xs items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1" /> Critical
              <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block mr-1 ml-3" /> Warning
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1 ml-3" /> Normal
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 h-[300px]">
            {Object.keys(twinState.zones).length === 0 ? (
              <div className="col-span-3 flex items-center justify-center text-muted-foreground">Awaiting Twin Sync...</div>
            ) : (
              Object.entries(twinState.zones).map(([zoneId, zoneCtx]) => {
                let alertColorStyles = "bg-slate-800 border-slate-700";
                if (zoneCtx.alertLevel === "Critical") {
                  alertColorStyles = "bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]";
                } else if (zoneCtx.alertLevel === "Warning") {
                  alertColorStyles = "bg-yellow-500/20 border-yellow-500/50";
                }

                return (
                  <div
                    key={zoneId}
                    className={`relative flex flex-col justify-center items-center rounded-xl border p-4 transition-all duration-300 ${alertColorStyles}`}
                  >
                    <h4 className="font-bold text-white mb-2">{zoneId}</h4>
                    <p className="text-xs text-slate-300 mb-1">Density: {(zoneCtx.density * 100).toFixed(0)}%</p>
                    {zoneCtx.surge_prob && (
                      <p className="text-xs font-semibold text-red-300">Surge Prob: {(zoneCtx.surge_prob * 100).toFixed(0)}%</p>
                    )}
                    {Object.entries(twinState.queues)
                      .filter(([id]) => id.toLowerCase().includes(zoneId.toLowerCase().split(" ")[1] || ""))
                      .map(([queueId, queue]) => (
                        <span
                          key={queueId}
                          className="absolute bottom-2 text-[10px] bg-slate-900 px-2 py-1 rounded-full border border-slate-700 text-white shadow-lg flex items-center"
                        >
                          <Clock size={10} className="mr-1 text-yellow-400" /> Wait: {queue.wait_time}m
                        </span>
                      ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <StadiumIntelCard stadium={stadium} live={stadiumLive} loading={liveLoading} />
          <AssistantCard assistant={assistant} loading={assistantLoading} />
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col h-[420px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold tracking-tight flex items-center">
            <Zap className="mr-2 text-primary w-5 h-5" />
            AI Surge Alerts
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              connected ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${connected ? "bg-green-500 animate-pulse" : "bg-orange-400"}`} />
            {connected ? "Live" : "Reconnecting"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
              <Navigation className="w-8 h-8 mb-3 opacity-50" />
              <p className="text-sm">Waiting for live data...</p>
            </div>
          ) : (
            alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start animate-in slide-in-from-right-4 fade-in duration-300"
              >
                <div
                  className={`mt-0.5 p-1.5 rounded-md mr-3 ${
                    alert.alert_level === "Critical" ? "bg-red-400/20" : "bg-yellow-400/20"
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${alert.alert_level === "Critical" ? "text-red-400" : "text-yellow-400"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-slate-200 truncate">{String(alert.zone_id || "Unknown zone")}</p>
                    <span className="text-[10px] text-muted-foreground font-semibold px-2 rounded-lg bg-slate-800">
                      {String(alert.alert_level || "Alert")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{String(alert.mitigation_recommendation || "No recommendation provided.")}</p>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${alert.alert_level === "Critical" ? "bg-red-500" : "bg-yellow-500"} h-1.5 rounded-full`}
                      style={{ width: `${(Number(alert.surge_probability || 0) * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StadiumIntelCard({
  stadium,
  live,
  loading,
}: {
  stadium: Stadium;
  live: StadiumLiveData | null;
  loading: boolean;
}) {
  const occupancyLabel = live?.occupancy.capacity
    ? `${live.occupancy.current.toLocaleString()} / ${live.occupancy.capacity.toLocaleString()}`
    : `${live?.occupancy.current.toLocaleString() ?? "—"} attendees`;

  const mapEmbedUrl = buildGoogleMapsEmbedUrl(stadium, process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY);

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      <div className="h-40 bg-slate-900/60 relative">
        {live?.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={live.heroImageUrl} alt={`${stadium.name} live view`} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-xs text-slate-300 flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary" />
            {stadium.city}, {stadium.state}
          </div>
          <div className="text-white font-semibold">{stadium.name}</div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Live occupancy</div>
            <div className="text-lg text-white font-semibold">{loading ? "Loading..." : occupancyLabel}</div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-200">
            {live ? `${live.occupancy.percent}%` : "--%"}
          </span>
        </div>

        <div className="space-y-2">
          {(live?.gateWaitTimes ?? []).slice(0, 3).map((gate) => (
            <div key={gate.gate} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{gate.gate}</span>
              <span
                className={`font-semibold ${
                  gate.status === "critical" ? "text-red-300" : gate.status === "watch" ? "text-yellow-300" : "text-green-300"
                }`}
              >
                {gate.minutes} min
              </span>
            </div>
          ))}
          {live?.gateWaitTimes.length === 0 && <div className="text-xs text-slate-500">No gate wait feed available.</div>}
        </div>

        <div className="rounded-lg border border-white/10 overflow-hidden h-28">
          <iframe
            title={`${stadium.name} map`}
            src={mapEmbedUrl}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{live ? `Source: ${live.source === "official_feed" ? "Official Feed" : "Adapter Fallback"}` : "Source: --"}</span>
          <a
            href={live?.mapLink || "#"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition"
          >
            Open map
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function AssistantCard({ assistant, loading }: { assistant: AssistantOutput | null; loading: boolean }) {
  const priorityStyles =
    assistant?.priority === "high"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : assistant?.priority === "medium"
        ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
        : "border-green-500/30 bg-green-500/10 text-green-200";

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-primary" />
          Ops Copilot
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full border ${priorityStyles}`}>
          {assistant ? assistant.priority.toUpperCase() : "ANALYZING"}
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-slate-400">Analyzing live context and generating recommendations...</div>
      ) : assistant ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-200 leading-relaxed">{assistant.summary}</p>
          <ul className="space-y-2">
            {assistant.actions.map((action, idx) => (
              <li key={idx} className="text-xs text-slate-300 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                {action}
              </li>
            ))}
          </ul>
          <div className="text-[11px] text-slate-500">
            Generated via {assistant.source === "gemini" ? "Google Gemini" : "local policy engine"} at{" "}
            {new Date(assistant.generatedAt).toLocaleTimeString()}.
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-400">No recommendation available yet.</div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isIncrease: boolean | null;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, isIncrease, icon }: StatCardProps) {
  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10 group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h4 className="text-3xl font-bold tracking-tight text-white mb-2">{value}</h4>
          <div className="flex items-center text-sm">
            {isIncrease !== null &&
              (isIncrease ? (
                <ArrowUpRight className="w-4 h-4 mr-1 text-red-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1 text-green-400" />
              ))}
            <span
              className={
                isIncrease === false
                  ? "text-green-400 font-medium"
                  : isIncrease === true
                    ? "text-red-400 font-medium"
                    : "text-slate-400"
              }
            >
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

function deriveQueueForZone(zoneId: string, queues: Record<string, { wait_time: number }>): number {
  const tokens = zoneId.toLowerCase().split(/\s+/).filter(Boolean);
  const matching = Object.entries(queues)
    .filter(([id]) => tokens.some((token) => id.toLowerCase().includes(token)))
    .map(([, queue]) => queue.wait_time);
  if (matching.length === 0) return 0;
  return Math.round(matching.reduce((sum, n) => sum + n, 0) / matching.length);
}
