import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function PassengerHome({ name, session, onLeave }) {
  return (
    <ScrollView className="flex-1 bg-slate-900">
      <View className="px-6 pt-16 pb-8">
        <Text className="text-purple-400 text-sm font-semibold uppercase tracking-widest">
          Passenger Dashboard
        </Text>
        <Text className="text-white text-4xl font-bold mt-2">
          Welcome, {name}
        </Text>
        <Text className="text-slate-400 mt-1">
          Sit back, relax, enjoy the ride.
        </Text>
      </View>

      <View className="px-6">
        <View className="bg-slate-800 rounded-2xl p-5 mb-4">
          <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
            Driver
          </Text>
          <Text className="text-white text-xl font-semibold">
            {session?.driverName ?? "Waiting for driver..."}
          </Text>
        </View>

        <View className="flex-row justify-between mb-4">
          <View className="bg-slate-800 rounded-2xl p-5 w-[48%]">
            <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Status
            </Text>
            <Text className="text-green-400 text-lg font-semibold">
              Cruising
            </Text>
          </View>
          <View className="bg-slate-800 rounded-2xl p-5 w-[48%]">
            <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Role
            </Text>
            <Text className="text-white text-lg font-semibold">Passenger</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mt-4 mb-3">
          Entertainment
        </Text>

        <TouchableOpacity className="bg-purple-500 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Play Games</Text>
          <Text className="text-purple-100 text-xs mt-1">
            Word games, trivia & more
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-slate-800 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Travel Playlist</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Queue up some tunes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-slate-800 rounded-2xl p-5 mb-3">
          <Text className="text-white font-bold text-base">Explore Nearby</Text>
          <Text className="text-slate-400 text-xs mt-1">
            Attractions along the route
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLeave}
          className="border border-red-500 rounded-2xl p-4 mt-6 mb-12"
        >
          <Text className="text-red-400 text-center font-semibold">
            Leave Trip
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
