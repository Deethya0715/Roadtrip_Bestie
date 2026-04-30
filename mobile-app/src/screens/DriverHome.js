import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
  Dimensions,
  AppState,
  Alert,
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
import NextStopProgressCard from "../components/NextStopProgressCard";
import { getNextStopLabel, loadTripPlan } from "../storage/tripPlan";

export default function DriverHome({
  name,
  session,
  onLeave,
  onResetTripForEveryone,
  vibeMode = "standard",
  activeTheme,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tripPlan, setTripPlan] = useState(null);
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

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      loadTripPlan().then((p) => {
        if (!cancelled) setTripPlan(p);
      });
    };
    refresh();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });
    const poll = setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      sub.remove();
      clearInterval(poll);
    };
  }, []);

  const nextStopLabel = getNextStopLabel(tripPlan);
  const hasRoute = !!nextStopLabel;

  const baseBg = isDarkBase ? "bg-black" : "bg-white";
  const titleColor = isDarkBase ? "text-white" : "text-slate-900";
  const mutedColor = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardBg = isDarkBase
    ? "bg-white/10 border border-white/15"
    : "bg-slate-50 border border-slate-200";
  const cardLabel = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardValue = isDarkBase ? "text-white" : "text-slate-900";

  const windowH = Dimensions.get("window").height;
  const tripSettingsSheetMaxH = Math.round(windowH * 0.85);
  const tripSettingsScrollH = Math.max(260, tripSettingsSheetMaxH - 100);

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
          <NextStopProgressCard
            progress={hasRoute ? 70 : 0}
            milesRemaining={hasRoute ? 45 : null}
            detailLine={
              hasRoute ? undefined : "Add your route in Roadtrip Planner"
            }
            nextStopLabel={nextStopLabel ?? "Open Roadtrip Planner"}
            accent={accent}
            posterColor={posterColor}
            isDark={isDarkBase}
          />

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
            onPress={() =>
              Alert.alert(
                "Reset trip for everyone?",
                "This clears both seats, safe check-ins on the server, and the trip theme. All phones will return to the join screen.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset everyone",
                    style: "destructive",
                    onPress: () => onResetTripForEveryone?.(),
                  },
                ]
              )
            }
            className="border border-red-600 bg-red-50 rounded-2xl p-4 mt-6"
          >
            <Text className="text-red-600 text-center font-semibold">
              Reset trip & kick everyone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLeave}
            className="border border-slate-300 rounded-2xl p-4 mt-3 mb-12"
          >
            <Text
              className={`${
                isDarkBase ? "text-slate-200" : "text-slate-700"
              } text-center font-semibold`}
            >
              Leave trip (ends for everyone)
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
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setSettingsOpen(false)}
            className="absolute inset-0 bg-black/40"
            accessibilityRole="button"
            accessibilityLabel="Close trip settings"
          />
          <View
            className="w-full bg-white rounded-t-3xl border-t border-slate-200 px-6 pt-6"
            style={{ maxHeight: tripSettingsSheetMaxH }}
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
            <ScrollView
              style={{ maxHeight: tripSettingsScrollH }}
              contentContainerStyle={{ paddingBottom: 36 }}
              showsVerticalScrollIndicator
              bounces
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <RelocationInventorySection
                items={safe.settings?.relocationInventory ?? []}
                onChange={(next) =>
                  safe.updateSettings({ relocationInventory: next })
                }
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
