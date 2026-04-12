export interface Zone {
    id: string;
    density: number;
    alertLevel: "Normal" | "Warning" | "Critical";
    surge_prob?: number;
}

export interface Queue {
    id: string;
    wait_time: number;
}

export interface DigitalTwinState {
    zones: Record<string, Zone>;
    queues: Record<string, Queue>;
}

export interface RealtimeEvent {
    type: "twin:state_sync" | "crowd:update" | "surge:alert" | "queue:update" | "route:update" | "emergency:update";
    data: unknown;
}
