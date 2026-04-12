import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStadium } from "../components/stadium-context";
import { useAuth } from "../components/auth-context";
import type { DigitalTwinState, RealtimeEvent } from "../types";

const MAX_ALERTS = 60;

type RealtimeAlert = {
  zone_id?: string;
  alert_level?: "Normal" | "Warning" | "Critical" | string;
  mitigation_recommendation?: string;
  surge_probability?: number;
  estimated_surge_time?: string;
  [key: string]: unknown;
};

export function useRealtime() {
  const { stadiumId } = useStadium();
  const { user } = useAuth();
  const token = useMemo(() => (user?.role === "admin" ? "admin" : "guest"), [user?.role]);

  const [twinState, setTwinState] = useState<DigitalTwinState>({ zones: {}, queues: {} });
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    setTwinState({ zones: {}, queues: {} });
    setAlerts([]);
    setConnected(false);

    let cancelled = false;
    let attempt = 0;

    const clearReconnect = () => {
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    const connectWs = async () => {
      if (cancelled) return;

      let wsBaseUrl = "";
      try {
        // Fetch dynamic config from our API route
        const configRes = await fetch("/api/config");
        const config = await configRes.json();
        const configured = config.NEXT_PUBLIC_REALTIME_WS_URL?.trim();

        if (configured) {
          if (configured.startsWith("http://")) wsBaseUrl = `ws://${configured.slice("http://".length)}`.replace(/\/$/, "");
          else if (configured.startsWith("https://")) wsBaseUrl = `wss://${configured.slice("https://".length)}`.replace(/\/$/, "");
          else wsBaseUrl = configured.replace(/\/$/, "");
        }
      } catch (err) {
        console.error("Failed to fetch runtime config, falling back to discovery", err);
      }

      // Fallback discovery logic if config fetch fails or is empty
      if (!wsBaseUrl) {
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        const host = window.location.hostname;
        // If we are on Cloud Run, we likely don't have a port 8001 open on the same host
        const port = "8001";
        wsBaseUrl = `${protocol}://${host}${host.includes("localhost") || host.includes("127.0.0.1") ? `:${port}` : ""}`;
      }

      if (cancelled) return;

      const qs = new URLSearchParams({ stadium_id: stadiumId, token });
      const url = `${wsBaseUrl}/ws/dashboard?${qs.toString()}`;
      
      console.log(`Connecting to Realtime WebSocket: ${wsBaseUrl}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as RealtimeEvent;
          handleRealtimeEvent(payload, setTwinState, setAlerts);
        } catch (error) {
          console.error("Failed to parse realtime payload", error);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        clearReconnect();
        attempt += 1;
        const baseDelay = Math.min(15000, Math.floor(1000 * 1.7 ** attempt));
        const jitter = Math.floor(Math.random() * 500);
        reconnectRef.current = window.setTimeout(connectWs, baseDelay + jitter);
      };
    };

    connectWs();

    return () => {
      cancelled = true;
      clearReconnect();
      if (wsRef.current) wsRef.current.close();
    };
  }, [stadiumId, token]);

  return { twinState, alerts, connected };
}

function handleRealtimeEvent(
  payload: RealtimeEvent,
  setTwinState: Dispatch<SetStateAction<DigitalTwinState>>,
  setAlerts: Dispatch<SetStateAction<RealtimeAlert[]>>,
) {
  if (!payload || typeof payload !== "object") return;

  if (payload.type === "twin:state_sync") {
    const data = payload.data as DigitalTwinState;
    setTwinState({
      zones: data?.zones ?? {},
      queues: data?.queues ?? {},
    });
    return;
  }

  if (payload.type === "crowd:update") {
    const data = payload.data as { camera_id?: string; calculated_density?: number };
    const cameraId = String(data?.camera_id ?? "");
    const zone = `Gate ${cameraId.slice(-1).toUpperCase() || "?"}`;
    const density = Number(data?.calculated_density ?? 0);
    setTwinState((prev) => {
      const prevZone = prev.zones[zone] ?? { id: zone, density: 0, alertLevel: "Normal" as const };
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zone]: { ...prevZone, density: Math.max(0, Math.min(1, density)) },
        },
      };
    });
    return;
  }

  if (payload.type === "surge:alert") {
    const data = payload.data as {
      zone_id?: string;
      surge_probability?: number;
      alert_level?: "Normal" | "Warning" | "Critical";
    };
    const zoneId = data?.zone_id || "Unknown";
    const alertLevel = data?.alert_level ?? "Warning";
    const surgeProb = Number(data?.surge_probability ?? 0);

    setTwinState((prev) => {
      const prevZone = prev.zones[zoneId] ?? { id: zoneId, density: 0, alertLevel: "Normal" as const };
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: {
            ...prevZone,
            alertLevel,
            surge_prob: Math.max(0, Math.min(1, surgeProb)),
          },
        },
      };
    });

    setAlerts((prev) => [payload.data as RealtimeAlert, ...prev].slice(0, MAX_ALERTS));
    return;
  }

  if (payload.type === "queue:update") {
    const data = payload.data as { concession_id?: string; estimated_wait_time_minutes?: number };
    const queueId = data?.concession_id || "queue_unknown";
    const waitTime = Number(data?.estimated_wait_time_minutes ?? 0);
    setTwinState((prev) => {
      const prevQueue = prev.queues[queueId] ?? { id: queueId, wait_time: 0 };
      return {
        ...prev,
        queues: {
          ...prev.queues,
          [queueId]: { ...prevQueue, wait_time: Math.max(0, Math.round(waitTime)) },
        },
      };
    });
  }
}
