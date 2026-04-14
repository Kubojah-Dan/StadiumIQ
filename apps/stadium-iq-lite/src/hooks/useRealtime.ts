import { useEffect, useRef, useState, useMemo } from 'react';
import { useStadium } from '../context/StadiumContext';
import type { DigitalTwinState, RealtimeAlert, RealtimeEvent } from '../types';

const MAX_ALERTS = 60;

export function useRealtime() {
  const { stadiumId } = useStadium();
  const [twinState, setTwinState] = useState<DigitalTwinState>({ zones: {}, queues: {} });
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [connected, setConnected] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const connect = async () => {
      if (cancelled) return;
      
      // Reset state for new stadium
      setConnected(false);
      setIsSimulator(false);

      try {
        // Attempt discovery
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname;
        let wsUrl = '';

        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          wsUrl = `${protocol}://${host}:8001/ws/dashboard?stadium_id=${stadiumId}&token=admin`;
        } else if (host.includes('stadiumiq-web')) {
          const realtimeHost = host.replace('stadiumiq-web', 'stadiumiq-realtime');
          wsUrl = `${protocol}://${realtimeHost}/ws/dashboard?stadium_id=${stadiumId}&token=admin`;
        }

        if (wsUrl) {
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            setConnected(true);
            attempt = 0;
            console.log(`Connected to Realtime: ${stadiumId}`);
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data) as RealtimeEvent;
              handleRealtimeEvent(payload, setTwinState, setAlerts);
            } catch (e) {
              console.error("Parse error", e);
            }
          };

          ws.onclose = () => {
            if (cancelled) return;
            setConnected(false);
            attempt++;
            const delay = Math.min(10000, 1000 * Math.pow(1.5, attempt));
            reconnectRef.current = window.setTimeout(connect, delay);
          };

          // Fallback to simulator if no connection after 3 seconds
          window.setTimeout(() => {
            if (!connected && !cancelled && ws.readyState !== WebSocket.OPEN) {
              console.warn("WebSocket timeout, starting simulator");
              startSimulator();
            }
          }, 3000);
        } else {
          startSimulator();
        }
      } catch (e) {
        startSimulator();
      }
    };

    const startSimulator = () => {
      if (connected || cancelled) return;
      setIsSimulator(true);
      setConnected(true);
      
      // Initial Sync with more comprehensive data
      const initialZones: Record<string, any> = {};
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach(letter => {
        const id = `Zone ${letter}`;
        const density = 0.2 + (Math.random() * 0.6);
        initialZones[id] = { 
          id, 
          density, 
          alertLevel: density > 0.8 ? 'Critical' : density > 0.6 ? 'Warning' : 'Normal',
          surge_prob: density > 0.6 ? (density - 0.5) * 2 : 0
        };
      });

      setTwinState({
        zones: initialZones,
        queues: {
          'Alpha Grill': { id: 'Alpha Grill', wait_time: 4, category: 'food', distance: '120m' },
          'Stadium Snacks': { id: 'Stadium Snacks', wait_time: 14, category: 'food', distance: '180m' },
          'Boutique Merch': { id: 'Boutique Merch', wait_time: 2, category: 'merch', distance: '45m' },
          'Team Store': { id: 'Team Store', wait_time: 18, category: 'merch', distance: '210m' },
          'North Restrooms': { id: 'North Restrooms', wait_time: 1, category: 'restroom', occupancy: 15 },
          'East Restrooms': { id: 'East Restrooms', wait_time: 8, category: 'restroom', occupancy: 85 },
        }
      });

      // Simulation Interval - more dynamic
      const interval = window.setInterval(() => {
        setTwinState(prev => {
          const nextZones = { ...prev.zones };
          Object.keys(nextZones).forEach(z => {
            const noise = (Math.random() - 0.5) * 0.15;
            nextZones[z].density = Math.max(0.1, Math.min(1, nextZones[z].density + noise));
            nextZones[z].alertLevel = nextZones[z].density > 0.85 ? 'Critical' : nextZones[z].density > 0.65 ? 'Warning' : 'Normal';
          });

          const nextQueues = { ...prev.queues };
          Object.keys(nextQueues).forEach(q => {
            const noise = Math.floor((Math.random() - 0.5) * 4);
            nextQueues[q].wait_time = Math.max(1, Math.min(30, nextQueues[q].wait_time + noise));
            if (nextQueues[q].occupancy !== undefined) {
              const occNoise = Math.floor((Math.random() - 0.5) * 10);
              nextQueues[q].occupancy = Math.max(5, Math.min(100, nextQueues[q].occupancy + occNoise));
            }
          });

          return { zones: nextZones, queues: nextQueues };
        });
      }, 5000);

      return () => clearInterval(interval);
    };

    connect();

    return () => {
      cancelled = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [stadiumId]);

  return { twinState, alerts, connected, isSimulator };
}

function handleRealtimeEvent(payload: RealtimeEvent, setTwinState: any, setAlerts: any) {
  // Logic same as official dashboard (simplified for lite if needed)
  if (payload.type === 'twin:state_sync') {
    setTwinState(payload.data);
  } else if (payload.type === 'surge:alert') {
    setAlerts((prev: any) => [payload.data, ...prev].slice(0, MAX_ALERTS));
  }
}
