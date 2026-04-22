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
}) {
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
        className="flex-1 bg-white"
      >
        <View className="px-6 pt-12 pb-4 flex-row items-center justify-between border-b border-slate-100">
          <View>
            <Text className="text-xs uppercase tracking-widest text-slate-500">
              Your Trip
            </Text>
            <Text className="text-2xl font-black text-slate-900 mt-1">
              Roadtrip Planner
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="px-4 py-2 rounded-full bg-slate-100"
          >
            <Text className="text-slate-700 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-5"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Starting from
          </Text>
          <TextInput
            placeholder="e.g. San Francisco, CA"
            placeholderTextColor="#94a3b8"
            value={plan.origin}
            onChangeText={(v) => setPlan((p) => ({ ...p, origin: v }))}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 mb-5"
          />

          <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Final destination
          </Text>
          <TextInput
            placeholder="e.g. Los Angeles, CA"
            placeholderTextColor="#94a3b8"
            value={plan.destination}
            onChangeText={(v) => setPlan((p) => ({ ...p, destination: v }))}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 mb-6"
          />

          <Text className="text-xs uppercase tracking-widest text-slate-500 mb-2">
            Stops along the way ({plan.stops.length})
          </Text>

          <View className="flex-row items-center mb-3">
            <TextInput
              placeholder="Add a stop (city, landmark, address)"
              placeholderTextColor="#94a3b8"
              value={stopDraft}
              onChangeText={setStopDraft}
              onSubmitEditing={addStop}
              returnKeyType="done"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 mr-2"
            />
            <TouchableOpacity
              onPress={addStop}
              className="px-4 py-4 rounded-xl"
              style={{ backgroundColor: accent }}
            >
              <Text className="text-white font-bold">Add</Text>
            </TouchableOpacity>
          </View>

          {plan.stops.length === 0 ? (
            <View className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 mb-4">
              <Text className="text-slate-500 text-center text-sm">
                No stops yet. Add diners, viewpoints, national parks — whatever
                you want to hit along the way.
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              {plan.stops.map((stop, idx) => (
                <View
                  key={stop.id}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-2"
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: accent }}
                  >
                    <Text className="text-white font-bold text-xs">
                      {idx + 1}
                    </Text>
                  </View>
                  <Text
                    className="flex-1 text-slate-900 font-medium"
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
                        color: idx === 0 ? "#cbd5e1" : "#475569",
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
                          idx === plan.stops.length - 1 ? "#cbd5e1" : "#475569",
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
            style={{ backgroundColor: accent }}
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
            className="border border-slate-200 rounded-2xl p-4 mt-3 mb-10"
          >
            <Text className="text-slate-600 text-center font-semibold">
              Clear plan
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
