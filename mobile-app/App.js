import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import "./global.css";
import {
  getSession,
  claimSeat,
  leaveSeat,
  resetEntireSession,
} from "./src/api/session";
import {
  saveLocalSession,
  loadLocalSession,
  clearLocalSession,
} from "./src/storage/localSession";
import { clearTripPlan } from "./src/storage/tripPlan";
import DriverHome from "./src/screens/DriverHome";
import PassengerHome from "./src/screens/PassengerHome";

const POLL_INTERVAL_MS = 3000;
/** Require this long with a sustained seat mismatch before kicking (avoids flaky polls). */
const SEAT_LOSS_DEBOUNCE_MS = 4500;

function normalizeSeatNameForMatch(value) {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
}

function isStillInSeat(role, session, localName) {
  const mine = normalizeSeatNameForMatch(localName);
  if (mine.length < 2) return false;
  const server =
    role === "driver"
      ? normalizeSeatNameForMatch(session.driverName)
      : normalizeSeatNameForMatch(session.passengerName);
  return server.length >= 2 && server === mine;
}

export default function App() {
  const [role, setRole] = useState(null); // 'driver' or 'passenger'
  const [name, setName] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [session, setSession] = useState({
    driverName: null,
    passengerName: null,
  });
  const [isJoining, setIsJoining] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const selfResetInProgress = useRef(false);
  const seatMismatchSinceRef = useRef(null);

  // Global vibe state. Default is the clean white base; the passenger can
  // flip into "manifesto" mode from their settings sheet to get the
  // monochrome movie-poster backdrop and theme colors.
  const [vibeMode, setVibeMode] = useState("standard"); // 'standard' | 'manifesto'
  const [activeTheme, setActiveTheme] = useState(null);

  // On launch: if we have a local session, skip the role picker and go
  // straight to the homepage. Re-assert the seat on the backend so the
  // session row is in sync even if it was reset (or we're coming back
  // from a reload). Only "End Trip" clears local storage.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await loadLocalSession();

        if (cancelled) return;

        if (stored) {
          const trimmedName = stored.name.trim();
          const result = await claimSeat(stored.role, trimmedName);
          if (cancelled) return;

          if (result.ok) {
            setSession(result.session);
            setRole(stored.role);
            setName(trimmedName);
            setIsConfirmed(true);
            if (trimmedName !== stored.name) {
              await saveLocalSession({ role: stored.role, name: trimmedName });
            }
          } else {
            // Someone else is holding our seat under a different name —
            // fall back to role selection.
            if (result.session) setSession(result.session);
            await clearLocalSession();
          }
        } else {
          const current = await getSession().catch(() => null);
          if (!cancelled && current) setSession(current);
        }
      } catch (err) {
        console.warn("Session restore failed:", err.message);
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await getSession();
        if (!cancelled) setSession(data);
      } catch (err) {
        console.warn("Session poll failed:", err.message);
      }
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // If the server clears our seat (e.g. driver reset trip for everyone), drop
  // local session so we return to the command center.
  useEffect(() => {
    if (!isConfirmed || !role || !name) return;
    if (selfResetInProgress.current) return;
    if (isStillInSeat(role, session, name)) {
      seatMismatchSinceRef.current = null;
      return;
    }

    const now = Date.now();
    if (seatMismatchSinceRef.current == null) {
      seatMismatchSinceRef.current = now;
      return;
    }
    if (now - seatMismatchSinceRef.current < SEAT_LOSS_DEBOUNCE_MS) {
      return;
    }

    seatMismatchSinceRef.current = null;
    let cancelled = false;
    (async () => {
      await clearLocalSession();
      await clearTripPlan();
      if (cancelled) return;
      setIsConfirmed(false);
      setRole(null);
      setName("");
      setVibeMode("standard");
      setActiveTheme(null);
      Alert.alert(
        "Trip ended",
        "This trip ended for everyone (someone left or reset the trip). You can join again when ready."
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isConfirmed,
    role,
    name,
    session.driverName,
    session.passengerName,
  ]);

  const handleRoleSelection = (selectedRole) => {
    // Don't block taken seats — the user might be rejoining after an app
    // reload. The backend allows a rejoin if the name matches the seat.
    setRole(selectedRole);
  };

  const joinTrip = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      Alert.alert("Wait!", "Please enter your name first.");
      return;
    }

    setIsJoining(true);
    const result = await claimSeat(role, trimmed);
    setIsJoining(false);

    if (!result.ok) {
      if (result.session) setSession(result.session);
      const s = result.session;
      const hint =
        s &&
        (role === "driver"
          ? s.passengerName
            ? `\n\nPassenger seat: ${s.passengerName} (choose Passenger if that is you).`
            : ""
          : s.driverName
          ? `\n\nDriver seat: ${s.driverName} (choose Driver if that is you).`
          : "");
      Alert.alert(
        "Could not join",
        `${result.error ?? "Could not claim seat."}${hint}`
      );
      return;
    }

    setSession(result.session);
    setIsConfirmed(true);
    setName(trimmed);
    await saveLocalSession({ role, name: trimmed });
  };

  const handleLeave = async () => {
    selfResetInProgress.current = true;
    try {
      try {
        await leaveSeat(role);
      } catch (err) {
        console.warn("leaveSeat failed:", err.message);
      }
      await clearLocalSession();
      await clearTripPlan();
      setSession({
        driverName: null,
        passengerName: null,
        activeTheme: "Phineas",
      });
      setIsConfirmed(false);
      setRole(null);
      setName("");
      setVibeMode("standard");
      setActiveTheme(null);
    } finally {
      selfResetInProgress.current = false;
    }
  };

  const handleResetTripForEveryone = async () => {
    selfResetInProgress.current = true;
    try {
      try {
        await resetEntireSession();
      } catch (err) {
        console.warn("resetEntireSession failed:", err.message);
        Alert.alert("Error", "Could not reset the trip. Check your connection.");
        return;
      }
      await clearLocalSession();
      await clearTripPlan();
      setSession({
        driverName: null,
        passengerName: null,
        activeTheme: "Phineas",
      });
      setIsConfirmed(false);
      setRole(null);
      setName("");
      setVibeMode("standard");
      setActiveTheme(null);
    } finally {
      selfResetInProgress.current = false;
    }
  };

  if (isRestoring) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
        <Text className="text-slate-500 mt-4">Loading your trip...</Text>
      </View>
    );
  }

  if (!isConfirmed) {
    return (
      <View className="flex-1 bg-white justify-center px-8">
        <Text className="text-slate-900 text-4xl font-black mb-8 text-center">
          Command Center
        </Text>

        <Text className="text-slate-500 text-center mb-4">
          Select your role:
        </Text>

        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            onPress={() => handleRoleSelection("driver")}
            className={`p-6 rounded-2xl w-[48%] border ${
              role === "driver"
                ? "bg-blue-500 border-blue-500"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                role === "driver" ? "text-white" : "text-slate-900"
              }`}
            >
              Driver
            </Text>
            {session.driverName && (
              <Text
                className={`text-xs text-center ${
                  role === "driver" ? "text-red-100" : "text-red-500"
                }`}
              >
                Taken
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelection("passenger")}
            className={`p-6 rounded-2xl w-[48%] border ${
              role === "passenger"
                ? "bg-purple-500 border-purple-500"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                role === "passenger" ? "text-white" : "text-slate-900"
              }`}
            >
              Passenger
            </Text>
            {session.passengerName && (
              <Text
                className={`text-xs text-center ${
                  role === "passenger" ? "text-red-100" : "text-red-500"
                }`}
              >
                Taken
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {role && (
          <View>
            {(() => {
              const takenName =
                role === "driver" ? session.driverName : session.passengerName;
              if (!takenName) return null;
              return (
                <Text className="text-amber-600 text-center mb-3">
                  This seat is held by "{takenName}". Enter the same name to
                  rejoin.
                </Text>
              );
            })()}
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
              onChangeText={setName}
              value={name}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity
              onPress={joinTrip}
              disabled={isJoining}
              className={`p-4 rounded-xl ${
                isJoining ? "bg-slate-300" : "bg-slate-900"
              }`}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isJoining ? "Joining..." : "Start Road Trip"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  if (role === "driver") {
    return (
      <DriverHome
        name={name}
        session={session}
        onLeave={handleLeave}
        onResetTripForEveryone={handleResetTripForEveryone}
        vibeMode={vibeMode}
        activeTheme={activeTheme}
      />
    );
  }

  return (
    <PassengerHome
      name={name}
      session={session}
      onLeave={handleLeave}
      vibeMode={vibeMode}
      setVibeMode={setVibeMode}
      activeTheme={activeTheme}
      setActiveTheme={setActiveTheme}
    />
  );
}
