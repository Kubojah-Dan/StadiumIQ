export type DigitalTwinState = {
  zones: Record<string, ZoneState>;
  toilets: Record<string, ToiletState>;
  food: Record<string, FoodStallState>;
  gates: Record<string, GateState>;
  event?: EventState;
};

export type ZoneState = {
  id: string;
  density: number;
  alertLevel: "Normal" | "Warning" | "Critical";
  surge_prob?: number;
};

export type ToiletState = {
  id: string;
  status: 'open' | 'busy' | 'maintenance';
  occupancy: number;
  is_accessible: boolean;
};

export type FoodStallState = {
  id: string;
  wait_time: number;
  service_load: number;
  status: 'active' | 'closed';
};

export type GateState = {
  id: string;
  congestion: number;
  status: 'open' | 'restricted' | 'closed';
};

export type EventState = {
  phase: string;
  score: string;
  clock: string;
};

export type RealtimeEvent = {
  type: "twin:state_sync" | "crowd:update" | "surge:alert" | "queue:update" | "CROWD_UPDATE" | "TOILET_UPDATE" | "FOOD_UPDATE" | "GATE_UPDATE" | "EMERGENCY_ALERT" | "EVENT_UPDATE";
  stadium_id?: string;
  data?: any;
  [key: string]: any;
};

export type RealtimeAlert = {
  zone_id?: string;
  alert_level?: "Normal" | "Warning" | "Critical" | string;
  message?: string;
  mitigation_recommendation?: string;
  surge_probability?: number;
  estimated_surge_time?: string;
  [key: string]: unknown;
};
