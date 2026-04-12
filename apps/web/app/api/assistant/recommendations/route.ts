import { NextRequest, NextResponse } from "next/server";
import { findStadiumById } from "../../../../lib/stadiums";

export const runtime = "nodejs";

type ZoneSnapshot = {
  id: string;
  density: number;
  alertLevel: "Normal" | "Warning" | "Critical";
  queueMinutes: number;
};

type AssistantContext = {
  avgDensity: number;
  activeAlerts: number;
  queueCount: number;
  connected: boolean;
  zones: ZoneSnapshot[];
};

type AssistantResponse = {
  source: "gemini" | "rule_engine";
  generatedAt: string;
  priority: "low" | "medium" | "high";
  summary: string;
  actions: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function sanitizeText(input: unknown, maxLength: number) {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function parseContext(input: unknown): AssistantContext | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const zonesRaw = Array.isArray(raw.zones) ? raw.zones : [];

  const zones: ZoneSnapshot[] = zonesRaw
    .slice(0, 12)
    .map((zone) => {
      if (!zone || typeof zone !== "object") return null;
      const z = zone as Record<string, unknown>;
      const id = sanitizeText(z.id, 60);
      if (!id) return null;
      const density = clamp(Number(z.density ?? 0), 0, 1);
      const alertLevelRaw = sanitizeText(z.alertLevel, 16);
      const alertLevel: ZoneSnapshot["alertLevel"] =
        alertLevelRaw === "Critical" || alertLevelRaw === "Warning" ? alertLevelRaw : "Normal";
      const queueMinutes = clamp(Math.round(Number(z.queueMinutes ?? 0)), 0, 180);
      return { id, density, alertLevel, queueMinutes };
    })
    .filter((z): z is ZoneSnapshot => Boolean(z));

  const avgDensity = clamp(Number(raw.avgDensity ?? 0), 0, 1);
  const activeAlerts = clamp(Math.round(Number(raw.activeAlerts ?? 0)), 0, 200);
  const queueCount = clamp(Math.round(Number(raw.queueCount ?? 0)), 0, 200);
  const connected = Boolean(raw.connected);

  return {
    avgDensity,
    activeAlerts,
    queueCount,
    connected,
    zones,
  };
}

function ruleEngineRecommendations(context: AssistantContext): AssistantResponse {
  const criticalZones = context.zones.filter((z) => z.alertLevel === "Critical");
  const warningZones = context.zones.filter((z) => z.alertLevel === "Warning");
  const heavyQueueZones = context.zones.filter((z) => z.queueMinutes >= 16);
  const densest = context.zones.slice().sort((a, b) => b.density - a.density)[0];

  const actions: string[] = [];
  let summary = "Operations are stable. Continue standard monitoring cadence.";
  let priority: AssistantResponse["priority"] = "low";

  if (!context.connected) {
    priority = "high";
    summary = "Realtime feed is disconnected. Restore ingestion before making crowd movement decisions.";
    actions.push("Switch to contingency SOP and dispatch a responder to each primary gate for manual count checks.");
    actions.push("Restart websocket/realtime service and verify telemetry heartbeat before resuming automation.");
  }

  if (criticalZones.length > 0) {
    priority = "high";
    summary = `${criticalZones.length} critical zone(s) detected. Initiate immediate decongestion protocol.`;
    actions.push(
      `Deploy stewards to ${criticalZones.slice(0, 2).map((z) => z.id).join(", ")} and open alternate ingress routes.`,
    );
  }

  if (warningZones.length > 0 && priority !== "high") {
    priority = "medium";
    summary = `Warning-level pressure detected in ${warningZones.length} zone(s). Pre-position staff now.`;
    actions.push(
      `Broadcast directional signage updates for ${warningZones
        .slice(0, 2)
        .map((z) => z.id)
        .join(", ")} to spread crowd flow.`,
    );
  }

  if (context.avgDensity > 0.74) {
    priority = "high";
    actions.push("Throttle gate inflow for 8-10 minutes and increase egress staffing at secondary exits.");
  } else if (context.avgDensity > 0.56) {
    if (priority === "low") priority = "medium";
    actions.push("Start proactive queue redistribution before density crosses critical threshold.");
  }

  if (heavyQueueZones.length > 0 || context.queueCount > 8) {
    if (priority === "low") priority = "medium";
    actions.push("Open temporary service counters and publish shortest-queue guidance in the fan app.");
  }

  if (densest && densest.density > 0.8) {
    actions.push(`Set ${densest.id} to one-way pedestrian routing until density drops below 70%.`);
  }

  if (actions.length === 0) {
    actions.push("Maintain current staffing plan and monitor zone density every 5 minutes.");
    actions.push("Run a pre-emptive public announcement to keep circulation lanes clear.");
  }

  return {
    source: "rule_engine",
    generatedAt: new Date().toISOString(),
    priority,
    summary,
    actions: actions.slice(0, 5),
  };
}

function buildGeminiPrompt(stadiumName: string, context: AssistantContext) {
  const trimmedZones = context.zones.slice(0, 6).map((z) => ({
    id: z.id,
    density_percent: Math.round(z.density * 100),
    alert_level: z.alertLevel,
    queue_minutes: z.queueMinutes,
  }));

  return [
    "You are StadiumIQ, an operations copilot for live venue control rooms.",
    "Return strict JSON only with keys: priority, summary, actions.",
    "Rules:",
    '- priority must be one of "low", "medium", "high".',
    "- summary must be <= 160 chars.",
    "- actions must be an array of 3 to 5 concise actionable strings, each <= 120 chars.",
    "- No markdown, no extra keys.",
    "",
    `Stadium: ${stadiumName}`,
    `Connected: ${context.connected}`,
    `Average density: ${Math.round(context.avgDensity * 100)}%`,
    `Active alerts: ${context.activeAlerts}`,
    `Queue count: ${context.queueCount}`,
    `Top zones: ${JSON.stringify(trimmedZones)}`,
  ].join("\n");
}

function safeJsonFromModelText(text: string): Partial<AssistantResponse> | null {
  const trimmed = text.trim();
  const jsonBlock = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  try {
    return JSON.parse(jsonBlock) as Partial<AssistantResponse>;
  } catch {
    return null;
  }
}

function normalizeModelResponse(input: Partial<AssistantResponse>): AssistantResponse | null {
  const priorityRaw = sanitizeText(input.priority, 10);
  const priority: AssistantResponse["priority"] =
    priorityRaw === "high" || priorityRaw === "medium" || priorityRaw === "low" ? priorityRaw : "medium";

  const summary = sanitizeText(input.summary, 160);
  const actionsRaw = Array.isArray(input.actions) ? input.actions : [];
  const actions = actionsRaw
    .map((a) => sanitizeText(a, 120))
    .filter((a) => a.length > 0)
    .slice(0, 5);

  if (!summary || actions.length < 2) return null;

  return {
    source: "gemini",
    generatedAt: new Date().toISOString(),
    priority,
    summary,
    actions,
  };
}

async function fetchGeminiRecommendations(
  stadiumName: string,
  context: AssistantContext,
): Promise<AssistantResponse | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildGeminiPrompt(stadiumName, context) }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 350,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as Record<string, unknown>;
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const firstCandidate = candidates[0] as Record<string, unknown> | undefined;
  const content = firstCandidate?.content as Record<string, unknown> | undefined;
  const parts = Array.isArray(content?.parts) ? content?.parts : [];
  const textPart = parts.find((part) => typeof (part as Record<string, unknown>).text === "string") as
    | Record<string, unknown>
    | undefined;
  const modelText = sanitizeText(textPart?.text, 2500);
  if (!modelText) return null;
  const parsed = safeJsonFromModelText(modelText);
  if (!parsed) return null;
  return normalizeModelResponse(parsed);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const stadiumId = sanitizeText(payload.stadiumId, 80);
  const context = parseContext(payload.context);

  if (!stadiumId || !context) {
    return NextResponse.json({ error: "stadiumId and context are required." }, { status: 400 });
  }

  const stadium = findStadiumById(stadiumId);
  if (!stadium) {
    return NextResponse.json({ error: "Unknown stadiumId." }, { status: 400 });
  }

  try {
    const geminiResponse = await fetchGeminiRecommendations(stadium.name, context);
    if (geminiResponse) return NextResponse.json(geminiResponse, { status: 200 });
  } catch {
    // Fall through to deterministic recommendations.
  }

  return NextResponse.json(ruleEngineRecommendations(context), { status: 200 });
}

