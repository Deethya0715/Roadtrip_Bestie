// Tunable Safe Check-In constants. All timings in milliseconds.

// How often the Ongoing "Vibe Check" nudge fires on the passenger phone.
// 30 minutes per the module spec.
export const VIBE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

// After the car stops moving, how long the driver must stay parked before
// we consider them "arrived" at the charger. Prevents false positives at
// red lights / drive-thrus.
export const ARRIVAL_DWELL_MS = 60 * 1000;

// Anything slower than this (m/s) counts as "stopped" for arrival detection.
// 1.5 m/s ≈ walking speed — good buffer for GPS jitter while parked.
export const STOP_SPEED_THRESHOLD_MPS = 1.5;

// Once arrived, a sustained speed above this threshold flips us into the
// "leaving" state and triggers the mandatory checklist.
export const DEPART_SPEED_THRESHOLD_MPS = 4; // ~9 mph

// Radius around a known charger (metres) within which we count as
// "arrived at a charger" instead of just "stopped somewhere random".
export const CHARGER_GEOFENCE_METRES = 200;

// Blackout Mode window on the passenger phone — 2:00 AM → 6:00 AM local time.
export const BLACKOUT_START_HOUR = 2;
export const BLACKOUT_END_HOUR = 6;

/**
 * A tiny seed list of chargers for demo purposes. Swap this for a real
 * API (PlugShare / OpenChargeMap / Tesla) in production. Coordinates are
 * public Supercharger / fast-charger sites.
 */
export const DEMO_CHARGERS = [
  {
    id: "supercharger-mountain-view",
    name: "Mountain View Supercharger",
    lat: 37.3941,
    lng: -122.0765,
  },
  {
    id: "supercharger-kettleman",
    name: "Kettleman City Supercharger",
    lat: 36.0052,
    lng: -119.9569,
  },
  {
    id: "electrify-america-baker",
    name: "Electrify America — Baker, CA",
    lat: 35.2687,
    lng: -116.0706,
  },
  {
    id: "evgo-barstow",
    name: "EVgo — Barstow Outlets",
    lat: 34.864,
    lng: -117.086,
  },
];

export const MOOD_OPTIONS = [
  { id: "chill", label: "Chill" },
  { id: "hype", label: "Hype" },
  { id: "sleepy", label: "Sleepy" },
  { id: "hangry", label: "Hangry" },
  { id: "feral", label: "Feral" },
];

/**
 * Haversine distance in metres between two lat/lng points. Used to test
 * whether the car has stopped close enough to a known charger to count
 * as an "arrived" event.
 */
export function distanceMetres(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Find the closest charger to a given location, if it's inside the
 * geofence radius. Returns null otherwise.
 *
 * @param {{lat:number, lng:number}} location
 * @param {Array} chargers
 */
export function findNearbyCharger(location, chargers = DEMO_CHARGERS) {
  if (!location) return null;
  let best = null;
  for (const c of chargers) {
    const d = distanceMetres(location, c);
    if (d <= CHARGER_GEOFENCE_METRES && (!best || d < best.distance)) {
      best = { ...c, distance: d };
    }
  }
  return best;
}

export function isInBlackoutWindow(date = new Date()) {
  const h = date.getHours();
  if (BLACKOUT_START_HOUR < BLACKOUT_END_HOUR) {
    return h >= BLACKOUT_START_HOUR && h < BLACKOUT_END_HOUR;
  }
  // window wraps midnight (not our case today, but kept for safety)
  return h >= BLACKOUT_START_HOUR || h < BLACKOUT_END_HOUR;
}
