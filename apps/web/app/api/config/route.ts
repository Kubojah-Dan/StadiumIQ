import { NextResponse } from "next/server";

/**
 * Dynamic Configuration API
 * This route allows the frontend to fetch environment variables at runtime,
 * which is essential for Cloud Run where URLs are not known during build.
 */
export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_REALTIME_WS_URL: process.env.NEXT_PUBLIC_REALTIME_WS_URL || "",
  });
}

// Force the route to be dynamic (never cached)
export const dynamic = "force-dynamic";
