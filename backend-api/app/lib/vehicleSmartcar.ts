import { prisma } from "@/app/lib/prisma";
import { smartcarClient } from "@/app/lib/smartcar";

const LINK_ID = "default";
const EXPIRY_SKEW_MS = 90_000;

function toDate(
  v: Date | string | number | null | undefined
): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

type AccessShape = {
  accessToken: string;
  refreshToken: string;
  expiration?: Date | string | number;
};

/**
 * Called from the OAuth callback after `exchangeCode` so later routes can
 * poll charge status without sending the user through Connect again.
 */
export async function persistSmartcarLink(
  access: AccessShape,
  vehicleId: string
) {
  const exp = toDate(access.expiration);
  await prisma.vehicleToken.upsert({
    where: { id: LINK_ID },
    create: {
      id: LINK_ID,
      vehicleId,
      accessToken: access.accessToken,
      refreshToken: access.refreshToken,
      accessExpiresAt: exp,
    },
    update: {
      vehicleId,
      accessToken: access.accessToken,
      refreshToken: access.refreshToken,
      accessExpiresAt: exp,
    },
  });
}

async function accessTokenWithRefresh(row: {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date | null;
}): Promise<string> {
  const now = Date.now();
  const exp = row.accessExpiresAt?.getTime() ?? 0;
  if (exp - EXPIRY_SKEW_MS > now) {
    return row.accessToken;
  }
  const next = await smartcarClient.exchangeRefreshToken(row.refreshToken);
  const nextExp = toDate(next.expiration);
  await prisma.vehicleToken.update({
    where: { id: LINK_ID },
    data: {
      accessToken: next.accessToken,
      refreshToken: next.refreshToken,
      accessExpiresAt: nextExp,
    },
  });
  return next.accessToken;
}

export type VehicleChargePayload =
  | {
      ok: true;
      configured: true;
      isPluggedIn: boolean;
      state: string | null;
      isCharging: boolean;
    }
  | { ok: true; configured: false }
  | { ok: false; error: string };

/**
 * GET https://api.smartcar.com/v2.0/vehicles/{id}/charge
 * Requires prior Connect flow and persisted vehicle id (see persistSmartcarLink).
 */
export async function fetchVehicleChargeStatus(): Promise<VehicleChargePayload> {
  const row = await prisma.vehicleToken.findUnique({
    where: { id: LINK_ID },
  });
  if (!row?.vehicleId) {
    return { ok: true, configured: false };
  }

  let token: string;
  try {
    token = await accessTokenWithRefresh(row);
  } catch (err) {
    console.error("Smartcar token refresh failed", err);
    return { ok: false, error: "token_refresh_failed" };
  }

  const url = `https://api.smartcar.com/v2.0/vehicles/${encodeURIComponent(row.vehicleId)}/charge`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Smartcar charge GET failed", res.status, text);
    return { ok: false, error: `smartcar_${res.status}` };
  }

  const body = (await res.json()) as {
    isPluggedIn?: boolean;
    state?: string;
  };
  const state = body.state ?? null;
  const isPluggedIn = !!body.isPluggedIn;
  const isCharging =
    typeof state === "string" && state.toUpperCase().includes("CHARGING");

  return { ok: true, configured: true, isPluggedIn, state, isCharging };
}
