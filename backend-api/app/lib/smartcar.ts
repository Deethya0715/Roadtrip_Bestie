import smartcar from "smartcar";

/**
 * Shared Smartcar AuthClient. Used by both the `/api/auth` redirect
 * route and the `/api/auth/callback` token-exchange route so we only
 * configure credentials in one place.
 *
 * Required env vars (set in backend-api/.env):
 *   SMARTCAR_CLIENT_ID
 *   SMARTCAR_CLIENT_SECRET
 *   SMARTCAR_REDIRECT_URI   e.g. http://localhost:3000/api/auth/callback
 *   SMARTCAR_MODE           "test" while developing, "live" in the Mach-E
 */
export const smartcarClient = new smartcar.AuthClient({
  clientId: process.env.SMARTCAR_CLIENT_ID!,
  clientSecret: process.env.SMARTCAR_CLIENT_SECRET!,
  redirectUri: process.env.SMARTCAR_REDIRECT_URI!,
  mode: (process.env.SMARTCAR_MODE as "test" | "live" | "simulated") ?? "test",
});

export { smartcar };
