const API_BASE = "https://api.sunrise-sunset.org/json";

export const MAGIC_HOUR_LEAD_MS = 15 * 60 * 1000;

/**
 * @param {number} lat
 * @param {number} lng
 * @param {string} [dateYmd] "YYYY-MM-DD" in local calendar for the request (optional)
 * @returns {Promise<{ sunset: Date, sunrise: Date }>}
 */
export async function fetchSunsetTimes(lat, lng, dateYmd = null) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    formatted: "0",
  });
  if (dateYmd) params.set("date", dateYmd);

  const res = await fetch(`${API_BASE}?${params}`);
  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(data.status || "Sun API error");
  }
  return {
    sunrise: new Date(data.results.sunrise),
    sunset: new Date(data.results.sunset),
  };
}

function tomorrowYmd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Next "magic hour" start (15 minutes before sunset) after `now`.
 * @returns {Promise<{ magicHourStart: number, sunsetMs: number }>}
 */
export async function getNextMagicHourStart(lat, lng) {
  const now = Date.now();
  const today = await fetchSunsetTimes(lat, lng);
  let magicStart = today.sunset.getTime() - MAGIC_HOUR_LEAD_MS;
  let sunsetMs = today.sunset.getTime();

  if (magicStart > now) {
    return { magicHourStart: magicStart, sunsetMs };
  }

  const tmr = await fetchSunsetTimes(lat, lng, tomorrowYmd());
  magicStart = tmr.sunset.getTime() - MAGIC_HOUR_LEAD_MS;
  sunsetMs = tmr.sunset.getTime();
  return { magicHourStart: magicStart, sunsetMs };
}
