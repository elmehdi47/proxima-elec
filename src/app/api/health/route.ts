import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — public uptime probe + database keep-alive.
 *
 * Runs a trivial query (`SELECT 1`) so each call:
 *   - proves the app AND the database are reachable (monitoring),
 *   - registers as real activity on hosted free tiers (Neon, Supabase),
 *     which prevents the project from ever being flagged "inactive",
 *     paused, or cleaned up.
 *
 * Hit automatically once a day by the Vercel cron defined in vercel.json,
 * so no one has to remember to do it manually.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      db: "up",
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check — database unreachable:", error);
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
