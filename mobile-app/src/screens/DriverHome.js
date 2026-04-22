import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";

export default function DriverHome({
  name,
  session,
  onLeave,
  vibeMode = "standard",
  activeTheme,
}) {
  const isManifesto = vibeMode === "manifesto";
  const accent = isManifesto && activeTheme ? activeTheme.accent : "#3b82f6";

  const baseBg = isManifesto ? "bg-black" : "bg-white";
  const titleColor = isManifesto ? "text-white" : "text-slate-900";
  const mutedColor = isManifesto ? "text-slate-300" : "text-slate-500";
  const cardBg = isManifesto
    ? "bg-white/5 border border-white/10"
    : "bg-slate-50 border border-slate-200";
  const cardLabel = isManifesto ? "text-slate-400" : "text-slate-500";
  const cardValue = isManifesto ? "text-white" : "text-slate-900";

  return (
    <View className={`flex-1 ${baseBg}`}>
      {isManifesto && activeTheme?.poster && (
        <Image
          source={activeTheme.poster}
          className="absolute inset-0 w-full h-full opacity-15"
          style={{ tintColor: "gray" }}
          resizeMode="cover"
        />
      )}

      <ScrollView className="flex-1">
        <View className="px-6 pt-16 pb-8">
          <Text
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            Driver Dashboard
          </Text>
          <Text className={`${titleColor} text-4xl font-black mt-2`}>
            Hey, {name}
          </Text>
          <Text className={`${mutedColor} mt-1`}>
            You're behind the wheel. Drive safe.
          </Text>
        </View>

        <View className="px-6">
          <View className={`${cardBg} rounded-2xl p-5 mb-4`}>
            <Text
              className={`${cardLabel} text-xs uppercase tracking-wider mb-1`}
            >
              Co-pilot
            </Text>
            <Text className={`${cardValue} text-xl font-semibold`}>
              {session?.passengerName ?? "Waiting for passenger..."}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className={`${cardBg} rounded-2xl p-5 w-[48%]`}>
              <Text
                className={`${cardLabel} text-xs uppercase tracking-wider mb-1`}
              >
                Status
              </Text>
              <Text
                className="text-lg font-semibold"
                style={{ color: isManifesto ? accent : "#16a34a" }}
              >
                On the road
              </Text>
            </View>
            <View className={`${cardBg} rounded-2xl p-5 w-[48%]`}>
              <Text
                className={`${cardLabel} text-xs uppercase tracking-wider mb-1`}
              >
                Role
              </Text>
              <Text className={`${cardValue} text-lg font-semibold`}>
                Driver
              </Text>
            </View>
          </View>

          <Text className={`${titleColor} text-lg font-bold mt-4 mb-3`}>
            Quick Actions
          </Text>

          <TouchableOpacity
            className="rounded-2xl p-5 mb-3"
            style={{ backgroundColor: isManifesto ? accent : "#3b82f6" }}
          >
            <Text className="text-white font-bold text-base">
              Start Navigation
            </Text>
            <Text className="text-white/80 text-xs mt-1">
              Open maps with your route
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className={`${cardBg} rounded-2xl p-5 mb-3`}>
            <Text className={`${cardValue} font-bold text-base`}>
              Play Music
            </Text>
            <Text className={`${cardLabel} text-xs mt-1`}>
              Road trip playlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className={`${cardBg} rounded-2xl p-5 mb-3`}>
            <Text className={`${cardValue} font-bold text-base`}>
              Voice Commands
            </Text>
            <Text className={`${cardLabel} text-xs mt-1`}>
              Hands-free controls
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLeave}
            className="border border-red-500 rounded-2xl p-4 mt-6 mb-12"
          >
            <Text className="text-red-500 text-center font-semibold">
              End Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
