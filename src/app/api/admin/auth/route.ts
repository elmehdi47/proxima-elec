import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

/** GET /api/admin/auth — check whether the current session is authenticated */
export async function GET(req: NextRequest) {
  const authenticated = await isAdminRequest(req);
  return NextResponse.json(
    { authenticated, username: authenticated ? "admin" : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
