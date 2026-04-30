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
import { useSafeCheckIn } from "../features/safeCheckIn/useSafeCheckIn";
import SafeCheckInPanel from "../features/safeCheckIn/SafeCheckInPanel";
import LeavingCheckInModal from "../features/safeCheckIn/LeavingCheckInModal";
import RelocationInventorySection from "../features/safeCheckIn/RelocationInventorySection";
import ThemedBackdrop from "../themes/ThemedBackdrop";
import NextStopProgressCard from "../components/NextStopProgressCard";
import TripAtAGlance from "../components/TripAtAGlance";
import { getNextStopLabel, loadTripPlan } from "../storage/tripPlan";
import {
  loadDriverDarkMode,
  saveDriverDarkMode,
} from "../storage/driverAppearance";

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
  const [driverDarkMode, setDriverDarkMode] = useState(false);
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

  const isDarkBase =
    driverDarkMode || (isManifesto && appearance?.base === "dark");
  const accent =
    isManifesto && appearance?.accent ? appearance.accent : "#3b82f6";
  const posterColor = isManifesto ? appearance?.posterColor : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const on = await loadDriverDarkMode();
      if (!cancelled) setDriverDarkMode(on);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
              {(isManifesto || driverDarkMode) && (
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
                  : driverDarkMode
                  ? "Driver · Dark"
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
                  isManifesto
                    ? ""
                    : isDarkBase
                    ? "text-emerald-400"
                    : "text-green-600"
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

          <TripAtAGlance
            role="driver"
            entries={safe.entries}
            isDarkBase={isDarkBase}
          />

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
            className={`rounded-2xl p-4 mt-6 border ${
              isDarkBase
                ? "border-red-500 bg-red-950/50"
                : "border-red-600 bg-red-50"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                isDarkBase ? "text-red-400" : "text-red-600"
              }`}
            >
              Reset trip & kick everyone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLeave}
            className={`rounded-2xl p-4 mt-3 mb-12 border ${
              isDarkBase ? "border-white/25" : "border-slate-300"
            }`}
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
        surfaces={
          isManifesto && activeTheme ? getThemeSurfaces(activeTheme) : null
        }
      />

      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <View className="flex-1">
          {isManifesto && activeTheme ? (
            <ThemedBackdrop
              surfaces={getThemeSurfaces(activeTheme)}
              variant="modal"
            />
          ) : (
            <View className="absolute inset-0 bg-slate-900" />
          )}
          <View className="flex-1 justify-end">
            <Pressable
              onPress={() => setSettingsOpen(false)}
              className="absolute inset-0"
              style={{
                backgroundColor:
                  isManifesto && activeTheme
                    ? "rgba(0,0,0,0.14)"
                    : "rgba(0,0,0,0.4)",
              }}
              accessibilityRole="button"
              accessibilityLabel="Close trip settings"
            />
            <View
              className={`w-full rounded-t-3xl border-t px-6 pt-6 ${
                isDarkBase
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
              style={{ maxHeight: tripSettingsSheetMaxH }}
            >
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className={`text-xl font-bold ${
                  isDarkBase ? "text-white" : "text-slate-900"
                }`}
              >
                Trip Settings
              </Text>
              <TouchableOpacity
                onPress={() => setSettingsOpen(false)}
                className={`px-3 py-1 rounded-full ${
                  isDarkBase ? "bg-white/15" : "bg-slate-100"
                }`}
              >
                <Text
                  className={isDarkBase ? "text-slate-200" : "text-slate-600"}
                >
                  Done
                </Text>
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
              <View
                className={`flex-row justify-between items-center p-4 rounded-2xl mb-4 ${
                  isDarkBase ? "bg-white/10" : "bg-slate-50"
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text
                    className={`font-bold ${
                      isDarkBase ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Dark mode
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDarkBase ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Easier on the eyes for night driving
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDriverDarkMode((v) => {
                      const next = !v;
                      saveDriverDarkMode(next);
                      return next;
                    });
                  }}
                  className={`w-12 h-6 rounded-full px-1 justify-center ${
                    driverDarkMode ? "bg-sky-500" : "bg-slate-300"
                  }`}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: driverDarkMode }}
                >
                  <View
                    className={`bg-white w-4 h-4 rounded-full ${
                      driverDarkMode ? "self-end" : "self-start"
                    }`}
                  />
                </TouchableOpacity>
              </View>
              <RelocationInventorySection
                items={safe.settings?.relocationInventory ?? []}
                onChange={(next) =>
                  safe.updateSettings({ relocationInventory: next })
                }
                variant={isDarkBase ? "dark" : "light"}
              />
            </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
