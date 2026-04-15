import { useEffect, useRef, useState, useMemo } from 'react';
import { useStadium } from '../context/StadiumContext';
import type { DigitalTwinState, RealtimeAlert, RealtimeEvent } from '../types';

const MAX_ALERTS = 60;

export function useRealtime() {
  const { stadiumId, stadium } = useStadium();
  const [twinState, setTwinState] = useState<DigitalTwinState>({ 
    zones: {}, 
    toilets: {}, 
    food: {}, 
    gates: {} 
  });
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
          setConnectionStatus(`Connecting...`);
          const ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = () => {
            setConnected(true);
            setConnectionStatus("Live Link Active");
            statusRef.current.connected = true;
            attempt = 0;
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data) as RealtimeEvent;
              if (payload.stadium_id && payload.stadium_id !== stadiumId) return;
              handleRealtimeEvent(payload, setTwinState, setAlerts);
            } catch (e) { /* ignore */ }
          };

          ws.onclose = () => {
            if (cancelled) return;
            setConnected(false);
            setConnectionStatus("Retrying...");
            statusRef.current.connected = false;
            attempt++;
            const delay = Math.min(10000, 1000 * Math.pow(1.5, attempt));
            reconnectRef.current = window.setTimeout(connect, delay);
          };

          window.setTimeout(() => {
            if (!statusRef.current.connected && !cancelled && ws.readyState !== WebSocket.OPEN) {
              startSimulator("Port 8001 Timeout");
            }
          }, 3000);
        } else {
          startSimulator("No Hub Config");
        }
      } catch (e) {
        startSimulator("Connection Error");
      }
    };

    const startSimulator = (reason: string) => {
      if (statusRef.current.connected || statusRef.current.isSimulator || cancelled) return;
      
      setIsSimulator(true);
      setConnected(true);
      setConnectionStatus(`Simulator: ${reason}`);
      statusRef.current.isSimulator = true;
      statusRef.current.connected = true;
      
      // Seed initial state based on stadium metadata
      const initialZones: Record<string, any> = {};
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach(letter => {
        const id = `Zone ${letter}`;
        initialZones[id] = { id, density: 0.2 + Math.random() * 0.4, alertLevel: 'Normal' };
      });

      const initialToilets: Record<string, any> = {};
      (stadium.toiletNodes || ["T1", "T2"]).forEach(id => {
        initialToilets[id] = { id, status: 'open', occupancy: 20 + Math.random() * 30, is_accessible: true };
      });

      const initialFood: Record<string, any> = {};
      (stadium.foodZones || ["Snack Bar"]).forEach(id => {
        initialFood[id] = { id, wait_time: 5 + Math.floor(Math.random() * 10), service_load: 0.3, status: 'active' };
      });

      const initialGates: Record<string, any> = {};
      (stadium.gateList || ["Main Gate"]).forEach(id => {
        initialGates[id] = { id, congestion: 0.1, status: 'open' };
      });

      setTwinState({
        zones: initialZones,
        toilets: initialToilets,
        food: initialFood,
        gates: initialGates,
        event: { phase: 'LIVE', score: '124/2', clock: '15.4 overs' }
      });

      const updateInterval = window.setInterval(() => {
        setTwinState(prev => {
          const next = { ...prev };
          
          // Evolve densities
          Object.keys(next.zones).forEach(z => {
            const noise = (Math.random() - 0.5) * 0.1;
            next.zones[z].density = Math.max(0.1, Math.min(1, next.zones[z].density + noise));
            next.zones[z].alertLevel = next.zones[z].density > 0.85 ? 'Critical' : next.zones[z].density > 0.65 ? 'Warning' : 'Normal';
          });

          // Evolve Wait Times
          Object.keys(next.food).forEach(f => {
            next.food[f].wait_time = Math.max(2, Math.min(50, next.food[f].wait_time + (Math.random() > 0.5 ? 1 : -1)));
            next.food[f].service_load = next.food[f].wait_time / 50;
          });

          // Evolve Toilets
          Object.keys(next.toilets).forEach(t => {
            next.toilets[t].occupancy = Math.max(0, Math.min(100, next.toilets[t].occupancy + (Math.random() - 0.5) * 10));
            next.toilets[t].status = next.toilets[t].occupancy > 90 ? 'busy' : 'open';
          });

          return { ...next };
        });

        if (Math.random() > 0.85) {
          const newAlert: RealtimeAlert = {
            zone_id: `Zone ${['A','B','C','D'][Math.floor(Math.random()*4)]}`,
            alert_level: 'Warning',
            message: 'Localized density surge reported.',
            surge_probability: 0.7,
            estimated_surge_time: '2m'
          };
          setAlerts(prev => [newAlert, ...prev].slice(0, MAX_ALERTS));
        }
      }, 3000);

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
  if (payload.type === 'twin:state_sync') {
    setTwinState(payload.data);
  } else if (payload.type === 'surge:alert' || payload.type === 'EMERGENCY_ALERT') {
    const alertData = payload.data || payload;
    setAlerts((prev: any) => [{
      zone_id: alertData.zone_id || alertData.scope,
      alert_level: alertData.alert_level || alertData.severity,
      message: alertData.message,
      surge_probability: alertData.surge_probability || 0.9,
      estimated_surge_time: alertData.estimated_surge_time || 'Now'
    }, ...prev].slice(0, MAX_ALERTS));
  } else if (payload.type === 'CROWD_UPDATE') {
    setTwinState((prev: DigitalTwinState) => ({
      ...prev,
      zones: {
        ...prev.zones,
        [payload.zone_id]: { 
          id: payload.zone_id, 
          density: payload.calculated_density,
          alertLevel: payload.calculated_density > 0.8 ? 'Critical' : payload.calculated_density > 0.6 ? 'Warning' : 'Normal'
        }
      }
    }));
  } else if (payload.type === 'TOILET_UPDATE') {
    setTwinState((prev: DigitalTwinState) => ({
      ...prev,
      toilets: { ...prev.toilets, [payload.toilet_id]: payload }
    }));
  } else if (payload.type === 'FOOD_UPDATE') {
    setTwinState((prev: DigitalTwinState) => ({
      ...prev,
      food: { ...prev.food, [payload.stall_id]: payload }
    }));
  } else if (payload.type === 'GATE_UPDATE') {
    setTwinState((prev: DigitalTwinState) => ({
      ...prev,
      gates: { ...prev.gates, [payload.gate_id]: payload }
    }));
  } else if (payload.type === 'EVENT_UPDATE') {
    setTwinState((prev: DigitalTwinState) => ({
      ...prev,
      event: payload
    }));
  }
}
