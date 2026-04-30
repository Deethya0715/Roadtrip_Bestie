import { NextRequest, NextResponse } from "next/server";
import { smartcarClient, smartcar } from "@/app/lib/smartcar";
import { persistSmartcarLink } from "@/app/lib/vehicleSmartcar";

/**
 * Step 2 of the handshake.
 *
 * GET /api/auth/callback?code=...
 *   -> swap the short-lived `code` for a long-lived access token
 *   -> return the token payload as JSON
 *
 * In production you would persist `access.accessToken` + `access.refreshToken`
 * against the signed-in user (Supabase/Prisma) instead of returning them.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing `code` query parameter" },
      { status: 400 }
    );
  }

  try {
    const access = await smartcarClient.exchangeCode(code);

    try {
      const { vehicles } = await smartcar.getVehicles(access.accessToken);
      const vehicleId = vehicles[0];
      if (vehicleId) {
        await persistSmartcarLink(access, vehicleId);
      }
    } catch (linkErr) {
      console.error("Smartcar persist link failed (tokens still returned)", linkErr);
    }

    return NextResponse.json({
      accessToken: access.accessToken,
      refreshToken: access.refreshToken,
      expiration: access.expiration,
      refreshExpiration: access.refreshExpiration,
    });
  } catch (err) {
    console.error("Smartcar exchangeCode failed", err);
    return NextResponse.json(
      { error: "Failed to exchange Smartcar authorization code" },
      { status: 500 }
    );
  }
}
