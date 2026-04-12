import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleMapsLink,
  buildWikipediaSummaryUrl,
  findStadiumById,
  type Stadium,
} from "../../../../lib/stadiums";

export const runtime = "nodejs";

type NormalizedFeed = {
  updatedAt: string;
  occupancy: {
    current: number;
    capacity: number | null;
    percent: number;
  };
  gateWaitTimes: Array<{ gate: string; minutes: number; status: "normal" | "watch" | "critical" }>;
  heroImageUrl: string | null;
  notes: string[];
};

function toFeedEnvKey(stadiumId: string) {
  return `STADIUMIQ_FEED_${stadiumId.replace(/-/g, "_").toUpperCase()}`;
}

function withTimeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hashStadiumId(stadiumId: string): number {
  let out = 0;
  for (let i = 0; i < stadiumId.length; i += 1) {
    out = (out * 31 + stadiumId.charCodeAt(i)) % 100000;
  }
  return out;
}

function buildFallbackFeed(stadium: Stadium): NormalizedFeed {
  const capacity = stadium.capacity ?? 50000;
  const minuteBucket = Math.floor(Date.now() / 60000);
  const seed = hashStadiumId(stadium.id);
  const wave = (Math.sin((minuteBucket + seed) / 7) + 1) / 2;
  const percent = clamp(42 + wave * 38, 18, 95);
  const current = Math.round((capacity * percent) / 100);

  const gates = ["Gate A", "Gate B", "Gate C"].map((gate, idx) => {
    const gateWave = (Math.sin((minuteBucket + seed + idx * 9) / 5) + 1) / 2;
    const minutes = Math.round(4 + gateWave * 22);
    return {
      gate,
      minutes,
      status: minutes > 20 ? "critical" : minutes > 12 ? "watch" : "normal",
    } as const;
  });

  return {
    updatedAt: new Date().toISOString(),
    occupancy: {
      current,
      capacity,
      percent: Number(percent.toFixed(1)),
    },
    gateWaitTimes: gates,
    heroImageUrl: null,
    notes: [
      "Running on adapter fallback mode.",
      `To connect live stadium telemetry, configure ${toFeedEnvKey(stadium.id)} with an official JSON endpoint.`,
    ],
  };
}

function sanitizeUrl(input: unknown): string | null {
  if (typeof input !== "string" || !input.trim()) return null;
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeExternalFeed(stadium: Stadium, payload: unknown): NormalizedFeed | null {
  if (!payload || typeof payload !== "object") return null;
  const source = payload as Record<string, unknown>;

  const capacity = typeof source.capacity === "number" ? source.capacity : stadium.capacity ?? null;
  const current = typeof source.current_occupancy === "number" ? source.current_occupancy : null;
  const percentRaw =
    typeof source.occupancy_percent === "number"
      ? source.occupancy_percent
      : current !== null && capacity
        ? (current / capacity) * 100
        : null;

  if (percentRaw === null && current === null) return null;

  const waitPayload = Array.isArray(source.gate_wait_times) ? source.gate_wait_times : [];
  const gateWaitTimes = waitPayload
    .slice(0, 10)
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const obj = row as Record<string, unknown>;
      const gate = typeof obj.gate === "string" ? obj.gate : null;
      const minutes = typeof obj.minutes === "number" ? Math.round(obj.minutes) : null;
      if (!gate || minutes === null) return null;
      return {
        gate,
        minutes: clamp(minutes, 0, 180),
        status: minutes > 20 ? "critical" : minutes > 12 ? "watch" : "normal",
      } as const;
    })
    .filter((row): row is { gate: string; minutes: number; status: "normal" | "watch" | "critical" } => Boolean(row));

  const percent = clamp(Number((percentRaw ?? 0).toFixed(1)), 0, 100);

  return {
    updatedAt: typeof source.updated_at === "string" ? source.updated_at : new Date().toISOString(),
    occupancy: {
      current: current ?? Math.round(((capacity ?? 0) * percent) / 100),
      capacity: capacity ?? null,
      percent,
    },
    gateWaitTimes,
    heroImageUrl: sanitizeUrl(source.image_url),
    notes:
      Array.isArray(source.notes) && source.notes.every((n) => typeof n === "string")
        ? (source.notes as string[]).slice(0, 5)
        : [],
  };
}

async function fetchOfficialFeed(stadium: Stadium): Promise<NormalizedFeed | null> {
  const endpoint = process.env[toFeedEnvKey(stadium.id)];
  if (!endpoint) return null;
  const safeEndpoint = sanitizeUrl(endpoint);
  if (!safeEndpoint) return null;

  const { signal, cleanup } = withTimeoutSignal(3500);
  try {
    const response = await fetch(safeEndpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as unknown;
    return normalizeExternalFeed(stadium, json);
  } catch {
    return null;
  } finally {
    cleanup();
  }
}

async function fetchWikipediaImage(stadium: Stadium): Promise<string | null> {
  const summaryUrl = buildWikipediaSummaryUrl(stadium);
  if (!summaryUrl) return null;
  const { signal, cleanup } = withTimeoutSignal(2500);

  try {
    const response = await fetch(summaryUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
      cache: "force-cache",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as Record<string, unknown>;
    const thumbnail = json.thumbnail as Record<string, unknown> | undefined;
    return sanitizeUrl(thumbnail?.source) ?? null;
  } catch {
    return null;
  } finally {
    cleanup();
  }
}

export async function GET(req: NextRequest) {
  const stadiumId = req.nextUrl.searchParams.get("stadiumId") ?? "";
  const stadium = findStadiumById(stadiumId);
  if (!stadium) {
    return NextResponse.json({ error: "Invalid stadiumId" }, { status: 400 });
  }

  const officialFeed = await fetchOfficialFeed(stadium);
  const fallbackFeed = buildFallbackFeed(stadium);
  const mergedFeed: NormalizedFeed = officialFeed
    ? {
        ...fallbackFeed,
        ...officialFeed,
        gateWaitTimes: officialFeed.gateWaitTimes.length > 0 ? officialFeed.gateWaitTimes : fallbackFeed.gateWaitTimes,
        notes: [...fallbackFeed.notes, ...officialFeed.notes].slice(0, 6),
      }
    : fallbackFeed;

  const wikiImage = await fetchWikipediaImage(stadium);
  const heroImageUrl = mergedFeed.heroImageUrl ?? wikiImage;

  return NextResponse.json(
    {
      stadiumId: stadium.id,
      stadiumName: stadium.name,
      city: stadium.city,
      state: stadium.state,
      source: officialFeed ? "official_feed" : "adapter_fallback",
      updatedAt: mergedFeed.updatedAt,
      occupancy: mergedFeed.occupancy,
      gateWaitTimes: mergedFeed.gateWaitTimes,
      heroImageUrl,
      mapLink: buildGoogleMapsLink(stadium),
      officialWebsite: stadium.officialWebsite ?? null,
      notes: mergedFeed.notes,
      integration: {
        officialFeedConfigured: Boolean(process.env[toFeedEnvKey(stadium.id)]),
        wikipediaImageResolved: Boolean(wikiImage),
      },
    },
    { status: 200 },
  );
}

