import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import {
  getThemeSurfaces,
  resolveThemeAppearance,
} from "../themes/manifestoThemes";
import HomeFeatureCards from "./HomeFeatureCards";
import { useSafeCheckIn } from "../features/safeCheckIn/useSafeCheckIn";
import SafeCheckInPanel from "../features/safeCheckIn/SafeCheckInPanel";
import LeavingCheckInModal from "../features/safeCheckIn/LeavingCheckInModal";
import RelocationInventorySection from "../features/safeCheckIn/RelocationInventorySection";

export default function DriverHome({
  name,
  session,
  onLeave,
  vibeMode = "standard",
  activeTheme,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const safe = useSafeCheckIn({ role: "driver", name, session });
  const isManifesto = vibeMode === "manifesto";

  const appearance = useMemo(
    () => (isManifesto ? resolveThemeAppearance(activeTheme) : null),
    [isManifesto, activeTheme]
  );

  const surfaces = useMemo(
    () => (isManifesto && activeTheme ? getThemeSurfaces(activeTheme) : null),
    [isManifesto, activeTheme]
  );

  const isDarkBase = isManifesto && appearance?.base === "dark";
  const accent =
    isManifesto && appearance?.accent ? appearance.accent : "#3b82f6";
  const posterColor = isManifesto ? appearance?.posterColor : null;

  const baseBg = isDarkBase ? "bg-black" : "bg-white";
  const titleColor = isDarkBase ? "text-white" : "text-slate-900";
  const mutedColor = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardBg = isDarkBase
    ? "bg-white/10 border border-white/15"
    : "bg-slate-50 border border-slate-200";
  const cardLabel = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardValue = isDarkBase ? "text-white" : "text-slate-900";
  return (
    <View className={`flex-1 ${baseBg}`}>
      {isManifesto && activeTheme?.poster && (
        <Image
          source={activeTheme.poster}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: surfaces?.posterImageOpacity ?? 0.5 }}
          resizeMode="cover"
        />
      )}
      {isManifesto && posterColor && (
        <View
          className="absolute inset-0"
          style={{
            backgroundColor: posterColor,
            opacity: surfaces?.posterOpacity ?? 0.22,
          }}
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
                  : "Driver Dashboard"}
              </Text>
            </View>
            <Text className={`${titleColor} text-4xl font-black`}>
              Hey, {name}
            </Text>
            <Text className={`${mutedColor} mt-1`}>
              {isManifesto && activeTheme
                ? activeTheme.tagline
                : "You're behind the wheel. Drive safe."}
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
                className={`${
                  isManifesto ? "" : "text-green-600"
                } text-lg font-semibold`}
                style={isManifesto ? { color: accent } : undefined}
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

          <SafeCheckInPanel
            role="driver"
            entries={safe.entries}
            latestByType={safe.latestByType}
            atCharger={safe.atCharger}
            onSimulateArrival={safe.simulateArrival}
            onSimulateDeparture={safe.simulateDeparture}
            isDark={isDarkBase}
            accent={accent}
          />

          <HomeFeatureCards
            accent={accent}
            isDarkBase={isDarkBase}
            theme={isManifesto ? activeTheme : null}
          />

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

      <LeavingCheckInModal
        visible={safe.leavingModalOpen}
        onClose={() => safe.setLeavingModalOpen(false)}
        onSubmit={safe.postLeaving}
        defaultDriver={session?.driverName ?? name}
        chargerName={safe.atCharger?.name}
        relocationItems={safe.settings?.relocationInventory ?? []}
      />

      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable
          onPress={() => setSettingsOpen(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <Pressable
            onPress={() => {}}
            className="p-6 bg-white rounded-t-3xl border-t border-slate-200"
            style={{ maxHeight: "85%" }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-slate-900 text-xl font-bold">
                Trip Settings
              </Text>
              <TouchableOpacity
                onPress={() => setSettingsOpen(false)}
                className="px-3 py-1 rounded-full bg-slate-100"
              >
                <Text className="text-slate-600">Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <RelocationInventorySection
                items={safe.settings?.relocationInventory ?? []}
                onChange={(next) =>
                  safe.updateSettings({ relocationInventory: next })
                }
              />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
