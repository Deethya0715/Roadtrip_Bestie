import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Linking,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import {
  loadTripPlan,
  saveTripPlan,
  clearTripPlan,
} from "../storage/tripPlan";
import { getThemeSurfaces } from "../themes/manifestoThemes";
import ThemedBackdrop from "../themes/ThemedBackdrop";

const EMPTY_PLAN = { origin: "", destination: "", stops: [] };

function buildRouteUrl(plan) {
  const points = [plan.origin, ...plan.stops.map((s) => s.label), plan.destination]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);

  if (points.length < 2) return null;

  const origin = encodeURIComponent(points[0]);
  const destination = encodeURIComponent(points[points.length - 1]);
  const waypoints = points
    .slice(1, -1)
    .map(encodeURIComponent)
    .join("|");

  const base = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  return waypoints ? `${base}&waypoints=${waypoints}` : base;
}

export default function RoadtripPlannerScreen({
  visible,
  onClose,
  accent = "#0f172a",
  theme = null,
}) {
  const surfaces = getThemeSurfaces(theme);
  const effectiveAccent = surfaces.isThemed ? surfaces.accent : accent;

  const [plan, setPlan] = useState(EMPTY_PLAN);
  const [stopDraft, setStopDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      const stored = await loadTripPlan();
      if (!cancelled) {
        setPlan(stored ?? EMPTY_PLAN);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!loaded) return;
    saveTripPlan(plan);
  }, [plan, loaded]);

  const addStop = () => {
    const label = stopDraft.trim();
    if (!label) return;
    setPlan((p) => ({
      ...p,
      stops: [...p.stops, { id: `${Date.now()}`, label }],
    }));
    setStopDraft("");
  };

  const removeStop = (id) =>
    setPlan((p) => ({ ...p, stops: p.stops.filter((s) => s.id !== id) }));

  const moveStop = (id, dir) => {
    setPlan((p) => {
      const idx = p.stops.findIndex((s) => s.id === id);
      if (idx < 0) return p;
      const next = [...p.stops];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return p;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...p, stops: next };
    });
  };

  const launchRoute = () => {
    const url = buildRouteUrl(plan);
    if (!url) {
      Alert.alert(
        "Need a start and end",
        "Add at least an origin and a destination to open the route."
      );
      return;
    }
    Linking.openURL(url).catch((err) =>
      Alert.alert("Couldn't open maps", err.message ?? "Try again in a moment.")
    );
  };

  const resetPlan = () => {
    Alert.alert(
      "Clear trip plan?",
      "This will remove your origin, destination, and all stops.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearTripPlan();
            setPlan(EMPTY_PLAN);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className={`flex-1 ${surfaces.rootBg}`}
      >
        <ThemedBackdrop surfaces={surfaces} />

        <View
          className={`px-6 pt-12 pb-4 flex-row items-center justify-between ${surfaces.headerBorder}`}
        >
          <View>
            <Text
              className={`text-xs uppercase tracking-widest ${surfaces.subtleText}`}
            >
              Your Trip
            </Text>
            <Text className={`text-2xl font-black mt-1 ${surfaces.titleText}`}>
              Roadtrip Planner
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className={`px-4 py-2 rounded-full ${surfaces.pillBg}`}
          >
            <Text className={`font-semibold ${surfaces.pillText}`}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
          >
            Starting from
          </Text>
          <TextInput
            placeholder="e.g. San Francisco, CA"
            placeholderTextColor={surfaces.placeholderColor}
            value={plan.origin}
            onChangeText={(v) => setPlan((p) => ({ ...p, origin: v }))}
            className={`rounded-xl p-4 mb-5 ${surfaces.inputBg}`}
          />

          <Text
            className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
          >
            Final destination
          </Text>
          <TextInput
            placeholder="e.g. Los Angeles, CA"
            placeholderTextColor={surfaces.placeholderColor}
            value={plan.destination}
            onChangeText={(v) => setPlan((p) => ({ ...p, destination: v }))}
            className={`rounded-xl p-4 mb-6 ${surfaces.inputBg}`}
          />

          <Text
            className={`text-xs uppercase tracking-widest mb-2 ${surfaces.subtleText}`}
          >
            Stops along the way ({plan.stops.length})
          </Text>

          <View className="flex-row items-center mb-3">
            <TextInput
              placeholder="Add a stop (city, landmark, address)"
              placeholderTextColor={surfaces.placeholderColor}
              value={stopDraft}
              onChangeText={setStopDraft}
              onSubmitEditing={addStop}
              returnKeyType="done"
              className={`flex-1 rounded-xl p-4 mr-2 ${surfaces.inputBg}`}
            />
            <TouchableOpacity
              onPress={addStop}
              className="px-4 py-4 rounded-xl"
              style={{ backgroundColor: effectiveAccent }}
            >
              <Text className="text-white font-bold">Add</Text>
            </TouchableOpacity>
          </View>

          {plan.stops.length === 0 ? (
            <View
              className={`rounded-2xl p-6 mb-4 ${surfaces.cardBg}`}
              style={{ borderStyle: "dashed" }}
            >
              <Text className={`text-center text-sm ${surfaces.mutedText}`}>
                No stops yet. Add diners, viewpoints, national parks — whatever
                you want to hit along the way.
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              {plan.stops.map((stop, idx) => (
                <View
                  key={stop.id}
                  className={`flex-row items-center rounded-2xl p-4 mb-2 ${surfaces.cardBg}`}
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: effectiveAccent }}
                  >
                    <Text className="text-white font-bold text-xs">
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    className={`flex-1 font-medium ${surfaces.titleText}`}
                    numberOfLines={2}
                  >
                    {stop.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => moveStop(stop.id, -1)}
                    disabled={idx === 0}
                    className="px-2 py-1"
                  >
                    <Text
                      style={{
                        color:
                          idx === 0
                            ? surfaces.isDark
                              ? "rgba(255,255,255,0.25)"
                              : "#cbd5e1"
                            : surfaces.isDark
                            ? "#e2e8f0"
                            : "#475569",
                        fontSize: 18,
                      }}
                    >
                      ↑
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => moveStop(stop.id, 1)}
                    disabled={idx === plan.stops.length - 1}
                    className="px-2 py-1"
                  >
                    <Text
                      style={{
                        color:
                          idx === plan.stops.length - 1
                            ? surfaces.isDark
                              ? "rgba(255,255,255,0.25)"
                              : "#cbd5e1"
                            : surfaces.isDark
                            ? "#e2e8f0"
                            : "#475569",
                        fontSize: 18,
                      }}
                    >
                      ↓
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeStop(stop.id)}
                    className="px-2 py-1 ml-1"
                  >
                    <Text className="text-red-500 font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={launchRoute}
            className="rounded-2xl p-5 mt-2"
            style={{ backgroundColor: effectiveAccent }}
          >
            <Text className="text-white text-center font-bold text-base">
              Open Route in Maps
            </Text>
            <Text className="text-white/80 text-center text-xs mt-1">
              Origin → {plan.stops.length} stop
              {plan.stops.length === 1 ? "" : "s"} → Destination
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetPlan}
            className={`rounded-2xl p-4 mt-3 mb-10 ${surfaces.cardBg}`}
          >
            <Text
              className={`text-center font-semibold ${surfaces.mutedText}`}
            >
              Clear plan
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
