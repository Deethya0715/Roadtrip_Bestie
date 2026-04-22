import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import "./global.css";
import { getSession, claimSeat, leaveSeat } from "./src/api/session";
import {
  saveLocalSession,
  loadLocalSession,
  clearLocalSession,
} from "./src/storage/localSession";
import DriverHome from "./src/screens/DriverHome";
import PassengerHome from "./src/screens/PassengerHome";

const POLL_INTERVAL_MS = 3000;

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
          const result = await claimSeat(stored.role, stored.name);
          if (cancelled) return;

          if (result.ok) {
            setSession(result.session);
            setRole(stored.role);
            setName(stored.name);
            setIsConfirmed(true);
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

  const handleRoleSelection = (selectedRole) => {
    // Don't block taken seats — the user might be rejoining after an app
    // reload. The backend allows a rejoin if the name matches the seat.
    setRole(selectedRole);
  };

  const joinTrip = async () => {
    if (name.length < 2) {
      Alert.alert("Wait!", "Please enter your name first.");
      return;
    }

    setIsJoining(true);
    const result = await claimSeat(role, name);
    setIsJoining(false);

    if (!result.ok) {
      Alert.alert("Error", result.error ?? "Could not claim seat.");
      if (result.session) setSession(result.session);
      return;
    }

    setSession(result.session);
    setIsConfirmed(true);
    await saveLocalSession({ role, name });
  };

  const handleLeave = async () => {
    try {
      await leaveSeat(role);
    } catch (err) {
      console.warn("leaveSeat failed:", err.message);
    }
    await clearLocalSession();
    setIsConfirmed(false);
    setRole(null);
    setName("");
  };

  if (isRestoring) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="text-slate-400 mt-4">Loading your trip...</Text>
      </View>
    );
  }

  if (!isConfirmed) {
    return (
      <View className="flex-1 bg-slate-900 justify-center px-8">
        <Text className="text-white text-4xl font-bold mb-8 text-center">
          Command Center
        </Text>

        <Text className="text-slate-400 text-center mb-4">
          Select your role:
        </Text>

        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            onPress={() => handleRoleSelection("driver")}
            className={`p-6 rounded-2xl w-[48%] ${
              role === "driver" ? "bg-blue-500" : "bg-slate-800"
            }`}
          >
            <Text className="text-white text-center font-bold">Driver</Text>
            {session.driverName && (
              <Text className="text-xs text-red-400 text-center">Taken</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelection("passenger")}
            className={`p-6 rounded-2xl w-[48%] ${
              role === "passenger" ? "bg-purple-500" : "bg-slate-800"
            }`}
          >
            <Text className="text-white text-center font-bold">Passenger</Text>
            {session.passengerName && (
              <Text className="text-xs text-red-400 text-center">Taken</Text>
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
                <Text className="text-amber-300 text-center mb-3">
                  This seat is held by "{takenName}". Enter the same name to
                  rejoin.
                </Text>
              );
            })()}
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
              className="bg-slate-800 text-white p-4 rounded-xl mb-4"
              onChangeText={setName}
              value={name}
            />
            <TouchableOpacity
              onPress={joinTrip}
              disabled={isJoining}
              className={`p-4 rounded-xl ${
                isJoining ? "bg-green-900" : "bg-green-500"
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
    return <DriverHome name={name} session={session} onLeave={handleLeave} />;
  }

  return <PassengerHome name={name} session={session} onLeave={handleLeave} />;
}
