import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  getSettings,
  saveSettings,
  settingsSchema,
  type SiteSettings,
} from "@/lib/site-settings";

/** GET /api/admin/settings — full settings object (admin only) */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const settings = await getSettings();
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

/** PUT /api/admin/settings — save the full settings object (admin only) */
export async function PUT(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body) as SiteSettings;
    await saveSettings(data);
    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: `Invalid settings: ${error.issues[0]?.path.join(".") ?? ""} — ${error.issues[0]?.message ?? "invalid value"}`,
        },
        { status: 400 }
      );
    }
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
