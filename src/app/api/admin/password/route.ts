import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  adminCookieOptions,
  createAdminSession,
  requireAdmin,
  verifyAdminPassword,
  changeAdminPassword,
} from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

/** POST /api/admin/password — change the admin password (revokes all sessions) */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  // brute-force guard even for authenticated users
  const rl = rateLimit(`pwchange:${clientIp(req)}`, 3, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts — try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = changeSchema.parse(body);

    if (!(await verifyAdminPassword(currentPassword))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    await changeAdminPassword(newPassword);

    // re-create a session for the current admin so they stay logged in
    const token = await createAdminSession();
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions());
    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }
    console.error("POST /api/admin/password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
