import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

export const ADMIN_COOKIE_NAME = "px_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_USERNAME = "admin";
const BCRYPT_ROUNDS = 12;

/** Password used to bootstrap the admin account (env overridable). */
function bootstrapPassword(): string {
  return process.env.ADMIN_PASSWORD || "proxima2025";
}

/** True when the public fallback password must NOT be used (production). */
export function bootstrapPasswordMissing(): boolean {
  return process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD;
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/* ------------------------------------------------------------------ */
/* Admin account                                                      */
/* ------------------------------------------------------------------ */

/**
 * Ensure the admin account exists. Called lazily on login so a fresh
 * deployment (Vercel) works even before the seed script is run.
 */
export async function ensureAdminUser(): Promise<void> {
  const count = await db.adminUser.count();
  if (count > 0) return;
  // Never silently create an admin with the public fallback password in production.
  if (bootstrapPasswordMissing()) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  const passwordHash = await bcrypt.hash(bootstrapPassword(), BCRYPT_ROUNDS);
  await db.adminUser.create({
    data: { username: ADMIN_USERNAME, passwordHash },
  });
}

/** Verify a password against the stored bcrypt hash (constant-time). */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const user = await db.adminUser.findUnique({ where: { username: ADMIN_USERNAME } });
  if (!user) return false;
  return bcrypt.compare(password, user.passwordHash);
}

/** Change the admin password (hash + revoke every session). */
export async function changeAdminPassword(newPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db.$transaction([
    db.adminUser.update({
      where: { username: ADMIN_USERNAME },
      data: { passwordHash },
    }),
    db.adminSession.deleteMany({}),
  ]);
}

/* ------------------------------------------------------------------ */
/* Sessions                                                           */
/* ------------------------------------------------------------------ */

/** Create a DB-backed session and return the raw token (for the cookie). */
export async function createAdminSession(): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const user = await db.adminUser.findUniqueOrThrow({
    where: { username: ADMIN_USERNAME },
  });
  const expiresAt = new Date(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000);
  await db.adminSession.create({
    data: { tokenHash: sha256(token), userId: user.id, expiresAt },
  });
  return token;
}

/** Validate the session cookie against the DB (expiry-aware). */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;

  const session = await db.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
  });
  if (!session) return false;

  if (session.expiresAt.getTime() < Date.now()) {
    await db.adminSession.delete({ where: { id: session.id } }).catch(() => undefined);
    return false;
  }
  return true;
}

/** Revoke the session bound to the request cookie. */
export async function revokeAdminSession(req: NextRequest): Promise<void> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;
  await db.adminSession
    .deleteMany({ where: { tokenHash: sha256(token) } })
    .catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Route guard                                                        */
/* ------------------------------------------------------------------ */

/**
 * CSRF protection: for state-changing methods, when an Origin/Referer
 * header is present, its host must match the request host.
 */
function sameOrigin(req: NextRequest): boolean {
  const originHeader = req.headers.get("origin") ?? req.headers.get("referer");
  const host = req.headers.get("host");
  if (!originHeader || !host) return true; // non-browser clients (curl) — cookie still required
  try {
    const origin = new URL(originHeader);
    // allow http/https scheme variance (local dev proxies)
    return origin.host === host;
  } catch {
    return false;
  }
}

/**
 * Guard for admin API routes. Returns a 401/403 NextResponse when the
 * request must be rejected, or null when the request is authorized.
 *
 * Usage:
 *   const denied = await requireAdmin(req);
 *   if (denied) return denied;
 */
export async function requireAdmin(
  req: NextRequest
): Promise<NextResponse | null> {
  const { NextResponse } = await import("next/server");

  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mutating = ["POST", "PATCH", "PUT", "DELETE"].includes(req.method);
  if (mutating && !sameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/** Cookie options for the admin session cookie. */
export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };
}
