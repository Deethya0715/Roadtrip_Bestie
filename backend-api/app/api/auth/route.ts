import { NextResponse } from "next/server";
import { smartcarClient } from "@/app/lib/smartcar";

/**
 * Step 1 of the handshake.
 *
 * GET /api/auth
 *   -> 302 redirect to Smartcar Connect (OAuth authorize URL).
 *
 * After the user authorizes, Smartcar redirects to SMARTCAR_REDIRECT_URI
 * (e.g. /api/auth/callback) with `?code=...`.
 *
 * Scopes: any list passed to getAuthUrl overrides the Smartcar Dashboard
 * "Vehicle Access" defaults (see "Build the Connect URL" in Smartcar docs).
 * You can also use "Share Connect Link" in the dashboard to compare URLs.
 */
export async function GET() {
  const scope = [
    "read_vehicle_info",
    "read_location",
    "read_odometer",
    "read_battery",
    "read_charge",
    "read_fuel",
    "read_tires",
  ];

  const authUrl = smartcarClient.getAuthUrl(scope, {
    forcePrompt: true,
  });

  return NextResponse.redirect(authUrl);
}
