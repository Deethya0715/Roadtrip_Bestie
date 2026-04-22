/**
 * Client for /api/check-in on backend-api.
 *
 * Each entry has the shape:
 *   {
 *     id, type, role, author, message, payload?, createdAt
 *   }
 * where `type` is one of: "arrived" | "vibe" | "leaving" | "blackout".
 *
 * Failures are non-fatal — Safe Check-In falls back to a local-only log
 * if the backend is unreachable so the user still sees their own events.
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getCheckIns() {
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, { method: "GET" });
    if (!res.ok) throw new Error(`getCheckIns failed: ${res.status}`);
    const body = await res.json();
    return Array.isArray(body.entries) ? body.entries : [];
  } catch (err) {
    console.warn("getCheckIns failed:", err.message);
    return null; // null => caller should keep its local view
  }
}

/**
 * Append a Safe Check-In event.
 * @param {{type:string, role:string, author:string, message:string, payload?:object}} payload
 * @returns {Promise<{ok:boolean, entry?:object, entries?:object[]}>}
 */
export async function postCheckIn(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: body.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, entry: body.entry, entries: body.entries };
  } catch (err) {
    console.warn("postCheckIn failed:", err.message);
    return { ok: false, error: err.message };
  }
}

export async function resetCheckIns() {
  try {
    const res = await fetch(`${BASE_URL}/api/check-in`, { method: "DELETE" });
    if (!res.ok) throw new Error(`resetCheckIns failed: ${res.status}`);
    return true;
  } catch (err) {
    console.warn("resetCheckIns failed:", err.message);
    return false;
  }
}
