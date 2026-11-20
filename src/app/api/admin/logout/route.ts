import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, revokeAdminSession } from "@/lib/auth";

/** POST /api/admin/logout — revoke the session server-side + clear the cookie */
export async function POST(req: NextRequest) {
  await revokeAdminSession(req);

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
