"use client";

/**
 * fetch() wrapper for admin API calls.
 *
 * When any admin endpoint answers 401 (session expired / revoked), a global
 * event is dispatched. AdminShell listens for it and switches the admin app
 * back to the login view — instead of every view silently degrading into
 * misleading "empty" states.
 */

export const AUTH_EXPIRED_EVENT = "px-admin-auth-expired";

export async function adminFetch(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
  }
  return res;
}
