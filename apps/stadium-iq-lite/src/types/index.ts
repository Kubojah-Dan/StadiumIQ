export type DigitalTwinState = {
  zones: Record<string, ZoneState>;
  queues: Record<string, QueueState>;
};

export type ZoneState = {
  id: string;
  density: number;
  alertLevel: "Normal" | "Warning" | "Critical";
  surge_prob?: number;
};

export type QueueState = {
  id: string;
  wait_time: number;
  category?: 'food' | 'restroom' | 'merch';
  distance?: string;
  occupancy?: number;
};

export type RealtimeEvent = {
  type: "twin:state_sync" | "crowd:update" | "surge:alert" | "queue:update";
  data: unknown;
};

export type RealtimeAlert = {
  zone_id?: string;
  alert_level?: "Normal" | "Warning" | "Critical" | string;
  mitigation_recommendation?: string;
  surge_probability?: number;
  estimated_surge_time?: string;
  [key: string]: unknown;
};
