import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { getCheckIns, postCheckIn } from "../../api/checkIn";
import { shareMessage } from "../../api/share";
import {
  ARRIVAL_DWELL_MS,
  DEPART_SPEED_THRESHOLD_MPS,
  STOP_SPEED_THRESHOLD_MPS,
  VIBE_CHECK_INTERVAL_MS,
  findNearbyCharger,
  isInBlackoutWindow,
} from "./constants";
import {
  DEFAULT_SETTINGS,
  loadContacts,
  loadNextVibeAt,
  loadSettings,
  saveContacts,
  saveNextVibeAt,
  saveSettings,
} from "./storage";

const CHECKIN_POLL_MS = 5000;
const CLOCK_TICK_MS = 30 * 1000;

/**
 * The single hook that powers the Safe Check-In module for both roles.
 *
 * It:
 *   1. Polls /api/check-in so both phones see the same latest events.
 *   2. Runs the driver-side "arrived" geofence detector.
 *   3. Runs the passenger-side 30-min vibe check timer + blackout window.
 *   4. Exposes imperative `trigger*` helpers so UI can simulate events
 *      and post check-ins with composed messages.
 *
 * All side effects are gated by `role` so we don't run the driver's
 * location watcher on the passenger phone or vice-versa.
 */
export function useSafeCheckIn({ role, name, session }) {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [contacts, setContacts] = useState([]);

  // Driver-only: where the car is right now + whether we think we're
  // parked at a charger (so "leaving" detection knows when to fire).
  const [location, setLocation] = useState(null);
  const [atCharger, setAtCharger] = useState(null); // {id,name,lat,lng,distance} | null
  const [stopSince, setStopSince] = useState(null); // timestamp we first went slow

  // Modal gating for the UI layer.
  const [vibeModalOpen, setVibeModalOpen] = useState(false);
  const [leavingModalOpen, setLeavingModalOpen] = useState(false);
  const [nextVibeAt, setNextVibeAt] = useState(null);

  // Passenger-only: track what the clock thinks so BlackoutMode rerenders
  // when the hour rolls over.
  const [now, setNow] = useState(new Date());

  const isDriver = role === "driver";
  const isPassenger = role === "passenger";

  const locationEnabled = settings.locationEnabled;
  const automationEnabled = settings.enabled;

  // ─── Bootstrap: load local settings + first server snapshot ──────────
  useEffect(() => {
    (async () => {
      const [s, c] = await Promise.all([loadSettings(), loadContacts()]);
      setSettings(s);
      setContacts(c);
    })();
  }, []);

  // Poll the shared log. We rely on server `createdAt` so both phones
  // stay consistent even if their local clocks drift.
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const next = await getCheckIns();
      if (!cancelled && next) setEntries(next);
    };
    tick();
    const iv = setInterval(tick, CHECKIN_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  // ─── Passenger: clock tick for Blackout Mode ─────────────────────────
  useEffect(() => {
    if (!isPassenger) return;
    const sync = () => setNow(new Date());
    sync();
    const iv = setInterval(sync, CLOCK_TICK_MS);
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") sync();
    });
    return () => {
      clearInterval(iv);
      sub.remove();
    };
  }, [isPassenger]);

  // ─── Passenger: 30-minute Vibe Check nudge ───────────────────────────
  // The target timestamp is persisted to AsyncStorage so the cadence
  // survives backgrounding, cold starts, and force-quits. The timer
  // never stops or restarts — it only rolls forward by one interval
  // each time the target is reached (catching up missed intervals in a
  // single pop if the app was closed past one or more targets).
  const automationEnabledRef = useRef(automationEnabled);
  automationEnabledRef.current = automationEnabled;

  useEffect(() => {
    if (!isPassenger) return;

    let cancelled = false;
    let timeoutId = null;

    const runTick = async () => {
      if (cancelled) return;
      const now = Date.now();
      let target = await loadNextVibeAt();

      if (target == null) {
        target = now + VIBE_CHECK_INTERVAL_MS;
        await saveNextVibeAt(target);
      } else if (target <= now) {
        const missed =
          Math.floor((now - target) / VIBE_CHECK_INTERVAL_MS) + 1;
        target = target + missed * VIBE_CHECK_INTERVAL_MS;
        await saveNextVibeAt(target);
        if (automationEnabledRef.current) {
          setVibeModalOpen(true);
        }
      }

      if (cancelled) return;
      setNextVibeAt(target);

      const delay = Math.max(0, target - Date.now());
      timeoutId = setTimeout(runTick, delay);
    };

    runTick();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (timeoutId) clearTimeout(timeoutId);
        runTick();
      }
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      sub.remove();
    };
  }, [isPassenger]);

  // ─── Driver: location watcher + arrival / departure detection ────────
  useEffect(() => {
    if (!isDriver || !locationEnabled || !automationEnabled) return;

    let subscription = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;
          const coord = {
            lat: latitude,
            lng: longitude,
            speed: speed ?? 0,
            at: pos.timestamp,
          };
          setLocation(coord);
          handleLocationUpdate(coord);
        }
      );
    })();

    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver, locationEnabled, automationEnabled]);

  // Keep the latest arrival state in a ref so the async watcher callback
  // sees the current value without re-subscribing.
  const atChargerRef = useRef(null);
  atChargerRef.current = atCharger;
  const stopSinceRef = useRef(null);
  stopSinceRef.current = stopSince;

  const handleLocationUpdate = useCallback(
    async (coord) => {
      const speed = Math.max(0, coord.speed ?? 0);
      const stopped = speed < STOP_SPEED_THRESHOLD_MPS;
      const moving = speed > DEPART_SPEED_THRESHOLD_MPS;

      if (stopped) {
        if (!stopSinceRef.current) setStopSince(Date.now());
      } else {
        setStopSince(null);
      }

      const dwellMs = stopSinceRef.current
        ? Date.now() - stopSinceRef.current
        : 0;

      // ─ Arrived ─
      if (!atChargerRef.current && stopped && dwellMs >= ARRIVAL_DWELL_MS) {
        const charger = findNearbyCharger(coord);
        if (charger) {
          setAtCharger(charger);
          await postArrived({ charger, coord });
        }
      }

      // ─ Leaving ─
      if (atChargerRef.current && moving) {
        // Surface the mandatory checklist; the driver confirms and we
        // post the "leaving" check-in from there.
        setLeavingModalOpen(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, session?.passengerName, session?.driverName, contacts]
  );

  // ─── Message composers ───────────────────────────────────────────────
  const contactHeader = useMemo(() => {
    if (!contacts?.length) return "";
    const joined = contacts.slice(0, 4).join(", ");
    return `Hey ${joined} — `;
  }, [contacts]);

  const composeArrivedMessage = useCallback(
    ({ charger, coord }) => {
      const where = charger
        ? charger.name
        : `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`;
      const driver = session?.driverName ?? name ?? "Driver";
      return (
        `${contactHeader}we made it. Car just stopped at ${where}. ` +
        `${driver} is plugging in now. All good — next ping in ~30 min.`
      );
    },
    [contactHeader, name, session?.driverName]
  );

  const composeVibeMessage = useCallback(
    ({ battery, driverName, mood, note }) => {
      const d = driverName || session?.driverName || "Driver";
      const parts = [
        `Battery ${battery}%`,
        `Driver: ${d}`,
        mood ? `Mood: ${mood}` : null,
      ].filter(Boolean);
      const body = parts.join(" · ");
      const tail = note ? `\n"${note}"` : "";
      return `${contactHeader}Vibe Check ✓  ${body}${tail}`;
    },
    [contactHeader, session?.driverName]
  );

  const composeLeavingMessage = useCallback(
    ({ newDriver, notes }) => {
      const nd = newDriver || session?.driverName || name || "Driver";
      const tail = notes ? ` — ${notes}` : "";
      return (
        `${contactHeader}Rolling out. Car unplugged, ${nd} is driving the ` +
        `next leg, everyone buckled${tail}.`
      );
    },
    [contactHeader, name, session?.driverName]
  );

  // ─── Trigger helpers (wrapped so UI doesn't talk to fetch directly) ─
  const postArrived = useCallback(
    async ({ charger, coord }) => {
      const message = composeArrivedMessage({ charger, coord });
      const payload = {
        charger: charger
          ? { id: charger.id, name: charger.name }
          : null,
        lat: coord?.lat,
        lng: coord?.lng,
      };
      const res = await postCheckIn({
        type: "arrived",
        role: role ?? "driver",
        author: name ?? "Driver",
        message,
        payload,
      });
      if (res.ok && res.entries) setEntries(res.entries);
      await shareMessage(message, "Arrived check-in");
      return res;
    },
    [composeArrivedMessage, name, role]
  );

  const postVibe = useCallback(
    async ({ battery, driverName, mood, note }) => {
      const message = composeVibeMessage({ battery, driverName, mood, note });
      const res = await postCheckIn({
        type: "vibe",
        role: role ?? "passenger",
        author: name ?? "Passenger",
        message,
        payload: { battery, driverName, mood, note },
      });
      if (res.ok && res.entries) setEntries(res.entries);
      await shareMessage(message, "Vibe Check");
      setVibeModalOpen(false);
      return res;
    },
    [composeVibeMessage, name, role]
  );

  const postLeaving = useCallback(
    async ({ newDriver, notes, checklist }) => {
      const message = composeLeavingMessage({ newDriver, notes });
      const res = await postCheckIn({
        type: "leaving",
        role: role ?? "driver",
        author: name ?? "Driver",
        message,
        payload: { newDriver, notes, checklist },
      });
      if (res.ok && res.entries) setEntries(res.entries);
      await shareMessage(message, "Leaving check-in");
      setLeavingModalOpen(false);
      setAtCharger(null);
      setStopSince(null);
      return res;
    },
    [composeLeavingMessage, name, role]
  );

  // Dev / demo: fire an arrival without real GPS (the keynote-demo path).
  const simulateArrival = useCallback(
    async (charger) => {
      const fake = charger ?? {
        id: "demo-sim",
        name: "Demo Charger",
        lat: 0,
        lng: 0,
      };
      setAtCharger(fake);
      await postArrived({
        charger: fake,
        coord: { lat: fake.lat, lng: fake.lng, speed: 0 },
      });
    },
    [postArrived]
  );

  const simulateDeparture = useCallback(() => {
    setAtCharger((prev) => prev ?? { id: "sim", name: "Demo Charger" });
    setLeavingModalOpen(true);
  }, []);

  const simulateVibeNudge = useCallback(() => {
    setVibeModalOpen(true);
  }, []);

  // ─── Settings + contacts mutators ────────────────────────────────────
  const updateSettings = useCallback(async (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateContacts = useCallback(async (next) => {
    setContacts(next);
    await saveContacts(next);
  }, []);

  // ─── Blackout visibility ─────────────────────────────────────────────
  const blackoutActive =
    isPassenger && (settings.forceBlackout || isInBlackoutWindow(now));

  const latestByType = useMemo(() => {
    const out = {};
    for (const e of entries) {
      if (!out[e.type]) out[e.type] = e;
    }
    return out;
  }, [entries]);

  return {
    // data
    entries,
    latestByType,
    contacts,
    settings,
    location,
    atCharger,
    nextVibeAt,
    blackoutActive,
    // modal visibility
    vibeModalOpen,
    setVibeModalOpen,
    leavingModalOpen,
    setLeavingModalOpen,
    // actions
    postVibe,
    postLeaving,
    postArrived,
    simulateArrival,
    simulateDeparture,
    simulateVibeNudge,
    updateSettings,
    updateContacts,
  };
}
