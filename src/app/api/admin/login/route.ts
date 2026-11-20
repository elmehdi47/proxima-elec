import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  bootstrapPasswordMissing,
  createAdminSession,
  ensureAdminUser,
  verifyAdminPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/** POST /api/admin/login — authenticate with the admin password */
export async function POST(req: NextRequest) {
  // brute-force protection: 8 attempts per 10 minutes per IP
  const rl = rateLimit(`login:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts — try again in ${rl.retryAfterSec}s.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { password } = z
      .object({ password: z.string().min(1).max(100) })
      .parse(body);

    // lazily create the admin account on first run (fresh deployments);
    // in production this refuses to run until ADMIN_PASSWORD is configured.
    if (bootstrapPasswordMissing()) {
      return NextResponse.json(
        {
          error:
            "This server has no ADMIN_PASSWORD configured. Add it in your hosting environment variables, then reload this page.",
        },
        { status: 500 }
      );
    }
    try {
      await ensureAdminUser();
    } catch {
      return NextResponse.json(
        { error: "Could not initialize the admin account" },
        { status: 500 }
      );
    }

    if (!(await verifyAdminPassword(password))) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // housekeeping: drop expired sessions
    await db.adminSession
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => undefined);

    const token = await createAdminSession();

    const res = NextResponse.json({ success: true, username: "admin" });
    res.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
