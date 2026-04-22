import React, { useMemo, useState } from "react";
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
  THEME_GROUPS,
  getNextTheme,
  resolveThemeAppearance,
  textOnColor,
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

  // Resolve what the current theme should look like *right now* (adaptive
  // themes depend on the local hour). Recomputed whenever the theme changes.
  const appearance = useMemo(
    () => (isManifesto ? resolveThemeAppearance(activeTheme) : null),
    [isManifesto, activeTheme]
  );

  const isDarkBase = isManifesto && appearance?.base === "dark";
  const accent = isManifesto && appearance?.accent ? appearance.accent : "#a855f7";
  const accentTextColor = textOnColor(accent);
  const posterColor = isManifesto ? appearance?.posterColor : null;

  const toggleVibe = () => {
    if (isManifesto) {
      setVibeMode("standard");
    } else {
      setVibeMode("manifesto");
      if (!activeTheme) setActiveTheme(MANIFESTO_THEMES[0]);
    }
  };

  const cycleTheme = () => setActiveTheme(getNextTheme(activeTheme));

  const baseBg = isDarkBase ? "bg-black" : "bg-white";
  const titleColor = isDarkBase ? "text-white" : "text-slate-900";
  const mutedColor = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardBg = isDarkBase
    ? "bg-white/10 border border-white/15"
    : "bg-slate-50 border border-slate-200";
  const cardLabel = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardValue = isDarkBase ? "text-white" : "text-slate-900";
  const posterOpacity = isDarkBase ? 0.28 : 0.2;

  return (
    <View className={`flex-1 ${baseBg}`}>
      {isManifesto && posterColor && (
        <View
          className="absolute inset-0"
          style={{ backgroundColor: posterColor, opacity: posterOpacity }}
        />
      )}
      {isManifesto && activeTheme?.poster && (
        <Image
          source={activeTheme.poster}
          className="absolute inset-0 w-full h-full opacity-20"
          style={{ tintColor: "gray" }}
          resizeMode="cover"
        />
      )}

      <ScrollView className="flex-1">
        <View className="px-6 pt-16 pb-8 flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-2">
              {isManifesto && (
                <View
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: accent }}
                />
              )}
              <Text
                className={`${titleColor} text-sm font-semibold uppercase tracking-widest`}
              >
                {isManifesto && activeTheme
                  ? `Manifesto · ${activeTheme.name}`
                  : "Passenger Dashboard"}
              </Text>
            </View>
            <Text className={`${titleColor} text-4xl font-black`}>
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
              isDarkBase
                ? "border-white/30 bg-white/10"
                : "border-slate-200 bg-white"
            }`}
          >
            <Text className={isDarkBase ? "text-white" : "text-slate-900"}>
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
                className={`${
                  isManifesto ? "" : "text-green-600"
                } text-lg font-semibold`}
                style={isManifesto ? { color: accent } : undefined}
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
            <Text
              className="font-bold text-base"
              style={{ color: isManifesto ? accentTextColor : "#ffffff" }}
            >
              Play Games
            </Text>
            <Text
              className="text-xs mt-1"
              style={{
                color: isManifesto
                  ? accentTextColor === "#ffffff"
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(15,23,42,0.7)"
                  : "rgba(255,255,255,0.8)",
              }}
            >
              Word games, trivia & more
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
      <Pressable onPress={onClose} className="flex-1 bg-black/40 justify-end">
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
            <ScrollView
              className="mt-4"
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-row justify-between items-center p-4 bg-slate-50 rounded-2xl mb-4">
                <View className="flex-1 pr-3">
                  <Text className="font-bold text-slate-900">Active Theme</Text>
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

              {THEME_GROUPS.map((group) => (
                <View key={group.id} className="mb-4">
                  <Text className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
                    {group.label}
                  </Text>
                  <View className="flex-row flex-wrap -mx-1">
                    {group.themes.map((theme) => {
                      const selected = activeTheme?.id === theme.id;
                      const selectedTextColor = textOnColor(theme.accent);
                      return (
                        <TouchableOpacity
                          key={theme.id}
                          onPress={() => onPickTheme(theme)}
                          className={`m-1 px-3 py-2 rounded-full border flex-row items-center ${
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
                          <View
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: theme.posterColor }}
                          />
                          <Text
                            className={selected ? "" : "text-slate-700"}
                            style={
                              selected
                                ? { color: selectedTextColor }
                                : undefined
                            }
                          >
                            {theme.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <Text className="text-center text-xs text-slate-400 mt-2 mb-2 italic">
                "Shake the phone to cycle through themes"
              </Text>
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
