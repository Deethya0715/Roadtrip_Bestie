/**
 * Thin client for the /api/session route on backend-api.
 *
 * Set the backend base URL with EXPO_PUBLIC_API_URL in a `.env` file
 * at the root of mobile-app, e.g.:
 *
 *   EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
 *
 * Use your laptop's LAN IP (not localhost) so your phone can reach it.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getSession() {
  const res = await fetch(`${BASE_URL}/api/session`, { method: "GET" });
  if (!res.ok) throw new Error(`getSession failed: ${res.status}`);
  return res.json();
}

/**
 * Claim a seat.
 * @param {"driver" | "passenger"} role
 * @param {string} name
 * @returns {Promise<{ok: boolean, session?: any, error?: string}>}
 */
export async function claimSeat(role, name) {
  const res = await fetch(`${BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, name }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: body.error ?? `HTTP ${res.status}` };
  }
  return { ok: true, session: body };
}

export async function setActiveTheme(activeTheme) {
  const res = await fetch(`${BASE_URL}/api/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activeTheme }),
  });
  if (!res.ok) throw new Error(`setActiveTheme failed: ${res.status}`);
  return res.json();
}

export async function leaveSeat(role) {
  const res = await fetch(`${BASE_URL}/api/session`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`leaveSeat failed: ${res.status}`);
  return res.json();
}

/** Clears both seats, check-in log, and theme on the server (driver-only UX). */
export async function resetEntireSession() {
  const res = await fetch(`${BASE_URL}/api/session`, { method: "DELETE" });
  if (!res.ok) throw new Error(`resetEntireSession failed: ${res.status}`);
  return res.json();
}
