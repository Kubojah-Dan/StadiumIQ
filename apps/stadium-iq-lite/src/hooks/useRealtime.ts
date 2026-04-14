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
  const [connectionStatus, setConnectionStatus] = useState<string>("Initializing...");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const statusRef = useRef({ connected: false, isSimulator: false });

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const connect = async () => {
      if (cancelled) return;
      
      // Reset state for new stadium
      setConnected(false);
      setIsSimulator(false);
      setConnectionStatus("Discovering Gateway...");
      statusRef.current = { connected: false, isSimulator: false };

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname;
        let wsUrl = '';

        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          wsUrl = `${protocol}://${host}:8001/ws/dashboard?stadium_id=${stadiumId}&token=admin`;
        } else if (host.includes('stadiumiq-web') || host.includes('stadiumiq-lite')) {
          const realtimeHost = host.replace('stadiumiq-web', 'stadiumiq-realtime').replace('stadiumiq-lite', 'stadiumiq-realtime');
          wsUrl = `${protocol}://${realtimeHost}/ws/dashboard?stadium_id=${stadiumId}&token=admin`;
        }

        if (wsUrl) {
          setConnectionStatus(`Connecting to ${wsUrl.includes(':8001') ? 'Local Hub (8001)...' : 'Cloud Node...'}`);
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            setConnected(true);
            setConnectionStatus("Operational: Real-time Link Active");
            statusRef.current.connected = true;
            attempt = 0;
            console.log(`Connected to Realtime: ${stadiumId}`);
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data) as RealtimeEvent;
              handleRealtimeEvent(payload, setTwinState, setAlerts);
            } catch (e) { /* ignore parse err */ }
          };

          ws.onclose = () => {
            if (cancelled) return;
            setConnected(false);
            setConnectionStatus("Link Closed. Retrying...");
            statusRef.current.connected = false;
            attempt++;
            const delay = Math.min(10000, 1000 * Math.pow(1.5, attempt));
            reconnectRef.current = window.setTimeout(connect, delay);
          };

          // Fallback to simulator if no connection after 3 seconds
          window.setTimeout(() => {
            if (!statusRef.current.connected && !cancelled && ws.readyState !== WebSocket.OPEN) {
              console.warn("WebSocket timeout, starting simulator");
              startSimulator("Gateway Unreachable (Port 8001)");
            }
          }, 3000);
        } else {
          startSimulator("No Hub Configured");
        }
      } catch (e) {
        startSimulator("Connection Error");
      }
    };

    const startSimulator = (reason: string) => {
      if (statusRef.current.connected || statusRef.current.isSimulator || cancelled) return;
      
      setIsSimulator(true);
      setConnected(true);
      setConnectionStatus(`Simulator Active: ${reason}`);
      statusRef.current.isSimulator = true;
      statusRef.current.connected = true;
      
      // Initial Sync
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

      const updateInterval = window.setInterval(() => {
        setTwinState(prev => {
          const nextZones = { ...prev.zones };
          Object.keys(nextZones).forEach(z => {
            const noise = (Math.random() - 0.5) * 0.15;
            nextZones[z].density = Math.max(0.1, Math.min(1, nextZones[z].density + noise));
            nextZones[z].alertLevel = nextZones[z].density > 0.85 ? 'Critical' : nextZones[z].density > 0.65 ? 'Warning' : 'Normal';
          });

          const nextQueues = { ...prev.queues };
          Object.keys(nextQueues).forEach(q => {
             const change = Math.floor((Math.random() - 0.5) * 4);
             if (nextQueues[q].category === 'restroom') {
                nextQueues[q].occupancy = Math.max(5, Math.min(100, (nextQueues[q].occupancy || 50) + change * 5));
             } else {
                nextQueues[q].wait_time = Math.max(1, Math.min(45, (nextQueues[q].wait_time || 10) + change));
             }
          });

          return { ...prev, zones: nextZones, queues: nextQueues };
        });

        // Periodic synthetic alerts
        if (Math.random() > 0.7) {
           const zoneLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
           const randomZone = `Zone ${zoneLetters[Math.floor(Math.random() * zoneLetters.length)]}`;
           const newAlert: RealtimeAlert = {
              zone_id: randomZone,
              alert_level: Math.random() > 0.5 ? 'Warning' : 'Critical',
              message: `High density detected near ${randomZone}. Flow optimization required.`,
              surge_probability: 0.7 + Math.random() * 0.2,
              estimated_surge_time: '5m'
           };
           setAlerts(prev => [newAlert, ...prev].slice(0, MAX_ALERTS));
        }
      }, 5000);

      return () => clearInterval(updateInterval);
    };

    connect();

    return () => {
      cancelled = true;
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [stadiumId]);

  return { twinState, alerts, connected, isSimulator, connectionStatus };
}

function handleRealtimeEvent(payload: RealtimeEvent, setTwinState: any, setAlerts: any) {
  // Logic same as official dashboard (simplified for lite if needed)
  if (payload.type === 'twin:state_sync') {
    setTwinState(payload.data);
  } else if (payload.type === 'surge:alert') {
    setAlerts((prev: any) => [payload.data, ...prev].slice(0, MAX_ALERTS));
  }
}
