import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";

export const DEFAULT_RELOCATION_INVENTORY = [
  { id: "laptop", label: "Laptop" },
  { id: "suitcase", label: "Suitcase" },
  { id: "crochet", label: "Crochet kit" },
  { id: "friend", label: "Friend" },
];

const MAX_ITEMS = 24;

/**
 * Editable list of “pit stop” items persisted with trip settings. Shown on
 * the Leaving check-in modal so nothing important gets left in the lot.
 */
export default function RelocationInventorySection({
  items = [],
  onChange,
  variant = "light",
}) {
  const [draft, setDraft] = useState("");
  const isDark = variant === "dark";

  const add = () => {
    const t = draft.trim();
    if (!t || items.length >= MAX_ITEMS) return;
    onChange?.([
      ...items,
      { id: `custom-${Date.now()}`, label: t },
    ]);
    setDraft("");
    Keyboard.dismiss();
  };

  const remove = (id) => onChange?.(items.filter((x) => x.id !== id));

  const resetDefaults = () =>
    onChange?.(DEFAULT_RELOCATION_INVENTORY.map((x) => ({ ...x })));

  return (
    <View className="mb-4">
      <Text
        className={`text-xs uppercase tracking-wider mb-1 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        Relocation inventory
      </Text>
      <Text
        className={`text-xs mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        Before you confirm Leaving and text your people, you&apos;ll confirm
        each item — your life-in-the-trunk checklist.
      </Text>
      <View className="flex-row flex-wrap -mx-1 mb-2">
        {items.length === 0 && (
          <Text
            className={`m-1 italic ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            No items yet.
          </Text>
        )}
        {items.map((x) => (
          <TouchableOpacity
            key={x.id}
            onPress={() => remove(x.id)}
            className={`m-1 px-3 py-1 rounded-full border ${
              isDark
                ? "bg-violet-500/20 border-violet-400/40"
                : "bg-violet-100 border-violet-200"
            }`}
          >
            <Text
              className={`text-sm ${isDark ? "text-violet-200" : "text-violet-900"}`}
            >
              {x.label}{" "}
              <Text className={isDark ? "text-violet-400" : "text-violet-500"}>
                ✕
              </Text>
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row mb-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          returnKeyType="done"
          blurOnSubmit
          onBlur={() => Keyboard.dismiss()}
          placeholder="Add an item (e.g. Meds)"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          className={`flex-1 border p-3 rounded-xl mr-2 ${
            isDark
              ? "bg-white/10 border-slate-600 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        />
        <TouchableOpacity
          onPress={add}
          disabled={items.length >= MAX_ITEMS}
          className={`px-4 rounded-xl justify-center ${
            items.length >= MAX_ITEMS
              ? isDark
                ? "bg-slate-600"
                : "bg-slate-300"
              : "bg-violet-600"
          }`}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={resetDefaults} className="py-2">
        <Text
          className={`text-sm font-semibold text-center ${
            isDark ? "text-violet-300" : "text-violet-700"
          }`}
        >
          Reset to default list
        </Text>
      </TouchableOpacity>
    </View>
  );
}
