import { NextResponse } from "next/server";
import { getSettings } from "@/lib/site-settings";

/** GET /api/settings — public, live site content (CMS) */
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
