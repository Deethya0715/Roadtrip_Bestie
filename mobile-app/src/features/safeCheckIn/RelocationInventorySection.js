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
export default function RelocationInventorySection({ items = [], onChange }) {
  const [draft, setDraft] = useState("");

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
      <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
        Relocation inventory
      </Text>
      <Text className="text-xs text-slate-500 mb-3">
        Before you confirm Leaving and text your people, you&apos;ll confirm
        each item — your life-in-the-trunk checklist.
      </Text>
      <View className="flex-row flex-wrap -mx-1 mb-2">
        {items.length === 0 && (
          <Text className="m-1 text-slate-400 italic">No items yet.</Text>
        )}
        {items.map((x) => (
          <TouchableOpacity
            key={x.id}
            onPress={() => remove(x.id)}
            className="m-1 px-3 py-1 rounded-full bg-violet-100 border border-violet-200"
          >
            <Text className="text-violet-900 text-sm">
              {x.label} <Text className="text-violet-500">✕</Text>
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
          placeholderTextColor="#94a3b8"
          className="flex-1 bg-white border border-slate-200 text-slate-900 p-3 rounded-xl mr-2"
        />
        <TouchableOpacity
          onPress={add}
          disabled={items.length >= MAX_ITEMS}
          className={`px-4 rounded-xl justify-center ${
            items.length >= MAX_ITEMS ? "bg-slate-300" : "bg-violet-600"
          }`}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={resetDefaults} className="py-2">
        <Text className="text-violet-700 text-sm font-semibold text-center">
          Reset to default list
        </Text>
      </TouchableOpacity>
    </View>
  );
}
