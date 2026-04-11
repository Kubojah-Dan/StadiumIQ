import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.enum(["fan", "staff", "admin", "security"]),
  createdAt: z.string().datetime()
});
export type User = z.infer<typeof UserSchema>;

export const VenueSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  capacity: z.number(),
  layoutData: z.any().optional()
});
export type Venue = z.infer<typeof VenueSchema>;

export const EventSchema = z.object({
  id: z.number(),
  venueId: z.number(),
  name: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: z.enum(["scheduled", "active", "completed"])
});
export type Event = z.infer<typeof EventSchema>;

export const SensorDataSchema = z.object({
  id: z.number(),
  venueId: z.number(),
  sensorType: z.enum(["camera", "lidar", "ble"]),
  zone: z.string(),
  value: z.number(),
  timestamp: z.string().datetime()
});
export type SensorData = z.infer<typeof SensorDataSchema>;

export const IncidentSchema = z.object({
  id: z.number(),
  venueId: z.number(),
  type: z.enum(["medical", "security", "congestion"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  zone: z.string(),
  status: z.enum(["open", "resolved"]),
  reportedAt: z.string().datetime()
});
export type Incident = z.infer<typeof IncidentSchema>;
