import { NextResponse } from "next/server";
import { fetchVehicleChargeStatus } from "@/app/lib/vehicleSmartcar";

/**
 * GET /api/vehicle/charge-status
 * Uses stored Smartcar tokens + vehicle id (see OAuth callback).
 * Mobile polls lightly to detect charging sessions and prompt for cost.
 */
export async function GET() {
  try {
    const result = await fetchVehicleChargeStatus();
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, configured: true },
        { status: 502 }
      );
    }
    if (!result.configured) {
      return NextResponse.json({ configured: false });
    }
    return NextResponse.json({
      configured: true,
      isPluggedIn: result.isPluggedIn,
      state: result.state,
      isCharging: result.isCharging,
    });
  } catch (err) {
    console.error("GET /api/vehicle/charge-status failed", err);
    return NextResponse.json(
      { error: "charge_status_failed" },
      { status: 500 }
    );
  }
}
