import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import "./global.css";
import { getSession, claimSeat } from "./src/api/session";

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

    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRoleSelection = (selectedRole) => {
    if (selectedRole === "driver" && session.driverName) {
      Alert.alert("Error", "Driver seat is already taken!");
      return;
    }
    if (selectedRole === "passenger" && session.passengerName) {
      Alert.alert("Error", "Passenger seat is already taken!");
      return;
    }
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
  };

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

  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-white text-2xl">Welcome, {name}!</Text>
      <Text className="text-slate-500">Role: {role}</Text>
    </View>
  );
}
