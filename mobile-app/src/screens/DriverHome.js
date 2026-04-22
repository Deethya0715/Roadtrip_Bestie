import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function DriverHome({ name, session, onLeave }) {
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
          Driver Dashboard
        </Text>
        <Text className="text-white text-4xl font-bold mt-2">
          Hey, {name}
        </Text>
        <Text className="text-slate-400 mt-1">
          You're behind the wheel. Drive safe.
        </Text>
      </View>

      <View className="px-6">
        <View className="bg-slate-800 rounded-2xl p-5 mb-4">
          <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
            Co-pilot
          </Text>
          <Text className="text-white text-xl font-semibold">
            {session?.passengerName ?? "Waiting for passenger..."}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="bg-slate-800 rounded-2xl p-5 w-[48%]">
            <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Status
            </Text>
            <Text className="text-green-400 text-lg font-semibold">
              On the road
            </Text>
          </View>
          <View className="bg-slate-800 rounded-2xl p-5 w-[48%]">
            <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Role
            </Text>
            <Text className="text-white text-lg font-semibold">Driver</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mt-4 mb-3">
          Quick Actions
        </Text>

        <TouchableOpacity className="bg-blue-500 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Start Navigation</Text>
          <Text className="text-blue-100 text-xs mt-1">
            Open maps with your route
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-slate-800 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Play Music</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Road trip playlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-slate-800 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Voice Commands</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Hands-free controls
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLeave}
          className="border border-red-500 rounded-2xl p-4 mt-6 mb-12"
        >
          <Text className="text-red-400 text-center font-semibold">
            End Trip
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
