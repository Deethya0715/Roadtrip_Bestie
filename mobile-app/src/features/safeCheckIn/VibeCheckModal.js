import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import ThemedBackdrop from "../../themes/ThemedBackdrop";
import { MOOD_OPTIONS } from "./constants";

/**
 * Passenger-facing Vibe Check. Surfaces every ~30 min (or when the
 * passenger manually triggers it) and collects Battery %, current
 * driver, mood, and an optional one-line note before sharing.
 */
export default function VibeCheckModal({
  visible,
  onClose,
  onSubmit,
  defaultDriver,
  defaultBattery,
  surfaces = null,
}) {
  const [battery, setBattery] = useState(
    defaultBattery != null ? String(defaultBattery) : ""
  );
  const [driver, setDriver] = useState(defaultDriver ?? "");
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setBattery(defaultBattery != null ? String(defaultBattery) : "");
      setDriver(defaultDriver ?? "");
      setMood(null);
      setNote("");
      setSubmitting(false);
    }
  }, [visible, defaultBattery, defaultDriver]);

  const canSubmit =
    !submitting &&
    battery.trim().length > 0 &&
    !Number.isNaN(Number(battery)) &&
    driver.trim().length >= 2 &&
    mood != null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({
      battery: Math.max(0, Math.min(100, Math.round(Number(battery)))),
      driverName: driver.trim(),
      mood,
      note: note.trim() || null,
    });
    setSubmitting(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {surfaces?.isThemed ? (
          <ThemedBackdrop surfaces={surfaces} variant="modal" />
        ) : (
          <View className="absolute inset-0 bg-slate-800" />
        )}
        <View className="flex-1 justify-end">
          <Pressable
            onPress={onClose}
            className="absolute inset-0"
            style={{
              backgroundColor: surfaces?.isThemed
                ? "rgba(0,0,0,0.14)"
                : "rgba(0,0,0,0.5)",
            }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss vibe check"
          />
          <View className="w-full p-6 bg-white rounded-t-3xl border-t border-slate-200">
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="text-slate-500 text-xs uppercase tracking-widest">
                Ongoing · every 30 min
              </Text>
              <Text className="text-slate-900 text-2xl font-black">
                Vibe Check
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="px-3 py-1 rounded-full bg-slate-100"
            >
              <Text className="text-slate-600">Later</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-slate-500 mb-4">
            Quick status ping so the group chat knows you&apos;re safe.
          </Text>

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
            Battery %
          </Text>
          <TextInput
            keyboardType="number-pad"
            value={battery}
            onChangeText={setBattery}
            placeholder="e.g. 72"
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
            className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-3"
          />

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
            Current driver
          </Text>
          <TextInput
            value={driver}
            onChangeText={setDriver}
            placeholder="Who's behind the wheel?"
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
            className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-3"
          />

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
            Mood
          </Text>
          <View className="flex-row flex-wrap -mx-1 mb-3">
            {MOOD_OPTIONS.map((m) => {
              const selected = mood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  onPress={() => setMood(m.id)}
                  className={`m-1 px-4 py-2 rounded-full border ${
                    selected
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selected ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
            Note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Stopping in Barstow for snacks"
            placeholderTextColor="#94a3b8"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => Keyboard.dismiss()}
            className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`p-4 rounded-xl ${
              canSubmit ? "bg-slate-900" : "bg-slate-300"
            }`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {submitting ? "Sharing..." : "Send Vibe Check"}
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
