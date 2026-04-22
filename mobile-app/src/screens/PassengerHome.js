import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Pressable,
} from "react-native";
import {
  MANIFESTO_THEMES,
  getNextTheme,
} from "../themes/manifestoThemes";

export default function PassengerHome({
  name,
  session,
  onLeave,
  vibeMode,
  setVibeMode,
  activeTheme,
  setActiveTheme,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isManifesto = vibeMode === "manifesto";

  const toggleVibe = () => {
    if (isManifesto) {
      setVibeMode("standard");
    } else {
      setVibeMode("manifesto");
      if (!activeTheme) setActiveTheme(MANIFESTO_THEMES[0]);
    }
  };

  const cycleTheme = () => {
    setActiveTheme(getNextTheme(activeTheme));
  };

  const accent = isManifesto && activeTheme ? activeTheme.accent : "#a855f7";

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
        <View className="px-6 pt-16 pb-8 flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              {isManifesto && activeTheme
                ? `Manifesto · ${activeTheme.name}`
                : "Passenger Dashboard"}
            </Text>
            <Text className={`${titleColor} text-4xl font-black mt-2`}>
              {isManifesto && activeTheme
                ? activeTheme.name
                : `Welcome, ${name}`}
            </Text>
            <Text className={`${mutedColor} mt-1`}>
              {isManifesto && activeTheme
                ? activeTheme.tagline
                : "Sit back, relax, enjoy the ride."}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            className={`px-3 py-2 rounded-full border ${
              isManifesto
                ? "border-white/30 bg-white/10"
                : "border-slate-200 bg-white"
            }`}
          >
            <Text className={isManifesto ? "text-white" : "text-slate-900"}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6">
          <View className={`${cardBg} rounded-2xl p-5 mb-4`}>
            <Text
              className={`${cardLabel} text-xs uppercase tracking-wider mb-1`}
            >
              Driver
            </Text>
            <Text className={`${cardValue} text-xl font-semibold`}>
              {session?.driverName ?? "Waiting for driver..."}
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
                Cruising
              </Text>
            </View>
            <View className={`${cardBg} rounded-2xl p-5 w-[48%]`}>
              <Text
                className={`${cardLabel} text-xs uppercase tracking-wider mb-1`}
              >
                Role
              </Text>
              <Text className={`${cardValue} text-lg font-semibold`}>
                Passenger
              </Text>
            </View>
          </View>

          <Text className={`${titleColor} text-lg font-bold mt-4 mb-3`}>
            Entertainment
          </Text>

          <TouchableOpacity
            className="rounded-2xl p-5 mb-3"
            style={{ backgroundColor: isManifesto ? accent : "#a855f7" }}
          >
            <Text className="text-white font-bold text-base">Play Games</Text>
            <Text className="text-white/80 text-xs mt-1">
              Word games, trivia & more
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className={`${cardBg} rounded-2xl p-5 mb-3`}>
            <Text className={`${cardValue} font-bold text-base`}>
              Travel Playlist
            </Text>
            <Text className={`${cardLabel} text-xs mt-1`}>
              Queue up some tunes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className={`${cardBg} rounded-2xl p-5 mb-3`}>
            <Text className={`${cardValue} font-bold text-base`}>
              Explore Nearby
            </Text>
            <Text className={`${cardLabel} text-xs mt-1`}>
              Attractions along the route
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLeave}
            className="border border-red-500 rounded-2xl p-4 mt-6 mb-12"
          >
            <Text className="text-red-500 text-center font-semibold">
              Leave Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PassengerSettings
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        vibeMode={vibeMode}
        onToggleVibe={toggleVibe}
        activeTheme={activeTheme}
        onCycleTheme={cycleTheme}
        onPickTheme={setActiveTheme}
      />
    </View>
  );
}

function PassengerSettings({
  visible,
  onClose,
  vibeMode,
  onToggleVibe,
  activeTheme,
  onCycleTheme,
  onPickTheme,
}) {
  const isManifesto = vibeMode === "manifesto";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/40 justify-end"
      >
        <Pressable
          onPress={() => {}}
          className="p-6 bg-white rounded-t-3xl border-t border-slate-200"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-slate-900 text-xl font-bold">
              Trip Settings
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="px-3 py-1 rounded-full bg-slate-100"
            >
              <Text className="text-slate-600">Done</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <View className="flex-1 pr-3">
              <Text className="font-bold text-slate-900">
                Manifesto Themes
              </Text>
              <Text className="text-xs text-slate-500">
                Enable movie themes & 3D tiles
              </Text>
            </View>

            <TouchableOpacity
              onPress={onToggleVibe}
              className={`w-12 h-6 rounded-full px-1 justify-center ${
                isManifesto ? "bg-green-500" : "bg-slate-300"
              }`}
            >
              <View
                className={`bg-white w-4 h-4 rounded-full ${
                  isManifesto ? "self-end" : "self-start"
                }`}
              />
            </TouchableOpacity>
          </View>

          {isManifesto && (
            <View className="mt-4">
              <View className="flex-row justify-between items-center p-4 bg-slate-50 rounded-2xl mb-3">
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-slate-900">
                    Active Theme
                  </Text>
                  <Text className="text-xs text-slate-500">
                    {activeTheme?.name ?? "No theme yet"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onCycleTheme}
                  className="px-4 py-2 rounded-full bg-slate-900"
                >
                  <Text className="text-white font-semibold">Next</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
                Pick a vibe
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {MANIFESTO_THEMES.map((theme) => {
                  const selected = activeTheme?.id === theme.id;
                  return (
                    <TouchableOpacity
                      key={theme.id}
                      onPress={() => onPickTheme(theme)}
                      className={`m-1 px-3 py-2 rounded-full border ${
                        selected
                          ? "border-transparent"
                          : "border-slate-200 bg-white"
                      }`}
                      style={
                        selected
                          ? { backgroundColor: theme.accent }
                          : undefined
                      }
                    >
                      <Text
                        className={selected ? "text-white" : "text-slate-700"}
                      >
                        {theme.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text className="text-center text-xs text-slate-400 mt-4 italic">
                "Shake the phone to cycle through themes"
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
