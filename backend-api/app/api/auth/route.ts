import { NextResponse } from "next/server";
import { smartcarClient } from "@/app/lib/smartcar";

/**
 * Step 1 of the handshake.
 *
 * GET /api/auth
 *   -> 302 redirect to Ford / Smartcar login
 *
 * After the user logs in, Smartcar bounces them back to
 * SMARTCAR_REDIRECT_URI (which should point at /api/auth/callback)
 * with a `?code=...` query param.
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
