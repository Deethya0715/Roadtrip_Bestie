import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ScrollView,
  Dimensions,
} from "react-native";
import ThemedBackdrop from "../../themes/ThemedBackdrop";

/**
 * Mandatory handoff checklist shown to the driver the moment we detect
 * the car leaving the charger. All boxes must be ticked before the
 * "Confirm & Share" button unlocks — EV handoff items plus the persisted
 * relocation inventory from Trip Settings.
 */
const EV_CHECKLIST_ITEMS = [
  { id: "unplugged", label: "Charging cable unplugged & returned" },
  { id: "newDriver", label: "New driver ready & buckled" },
  { id: "doors", label: "Doors closed, trash out, nothing forgotten" },
];

function buildRelocationRows(relocationItems) {
  const list = Array.isArray(relocationItems) ? relocationItems : [];
  return list.map((r) => ({
    id: `reloc:${r.id}`,
    label: `Do you have your ${r.label}?`,
  }));
}

export default function LeavingCheckInModal({
  visible,
  onClose,
  onSubmit,
  defaultDriver,
  chargerName,
  relocationItems = [],
  surfaces = null,
}) {
  const [checked, setChecked] = useState({});
  const [newDriver, setNewDriver] = useState(defaultDriver ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const relocationRows = buildRelocationRows(relocationItems);
  const allChecklistItems = [...EV_CHECKLIST_ITEMS, ...relocationRows];

  useEffect(() => {
    if (visible) {
      setChecked({});
      setNewDriver(defaultDriver ?? "");
      setNotes("");
      setSubmitting(false);
    }
  }, [visible, defaultDriver]);

  const allChecked = allChecklistItems.every((i) => checked[i.id]);
  const canSubmit =
    !submitting && allChecked && newDriver.trim().length >= 2;

  const sheetMaxH = Math.round(Dimensions.get("window").height * 0.88);

  const toggle = (id) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit({
      newDriver: newDriver.trim(),
      notes: notes.trim() || null,
      checklist: allChecklistItems.map((i) => ({
        id: i.id,
        label: i.label,
        done: !!checked[i.id],
      })),
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
          <View className="absolute inset-0 bg-slate-900" />
        )}
        <View className="flex-1 justify-end">
          <Pressable
            onPress={onClose}
            className="absolute inset-0"
            style={{
              backgroundColor: surfaces?.isThemed
                ? "rgba(0,0,0,0.14)"
                : "rgba(0,0,0,0.55)",
            }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss leaving check-in"
          />
          <ScrollView
            className="w-full bg-white rounded-t-3xl border-t border-slate-200"
            style={{ maxHeight: sheetMaxH }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled
            bounces={false}
          >
            <View className="p-6 pb-8">
              <Text className="text-amber-600 text-xs uppercase tracking-widest">
                Leaving · mandatory
              </Text>
              <Text className="text-slate-900 text-2xl font-black mt-1">
                Pulling out of {chargerName ?? "the charger"}?
              </Text>
              <Text className="text-slate-500 mt-2 mb-4">
                Tap each item once you&apos;ve confirmed it. This check-in
                can&apos;t be skipped.
              </Text>

              <View className="mb-4">
                {EV_CHECKLIST_ITEMS.map((item) => {
                  const done = !!checked[item.id];
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggle(item.id)}
                      className={`flex-row items-center p-4 rounded-2xl mb-2 border ${
                        done
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <View
                        className={`w-6 h-6 rounded-md mr-3 items-center justify-center border ${
                          done
                            ? "bg-green-500 border-green-500"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {done && (
                          <Text className="text-white font-black text-xs">
                            ✓
                          </Text>
                        )}
                      </View>
                      <Text
                        className={`flex-1 ${
                          done
                            ? "text-green-900 font-semibold"
                            : "text-slate-800"
                        }`}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {relocationRows.length > 0 && (
                  <>
                    <Text className="text-violet-700 text-xs font-bold uppercase tracking-wider mt-4 mb-2">
                      Pit stop — relocation
                    </Text>
                    <Text className="text-slate-500 text-sm mb-3">
                      Quick-fire list so nothing important stays in the lot.
                    </Text>
                    {relocationRows.map((item) => {
                      const done = !!checked[item.id];
                      return (
                        <TouchableOpacity
                          key={item.id}
                          onPress={() => toggle(item.id)}
                          className={`flex-row items-center p-4 rounded-2xl mb-2 border ${
                            done
                              ? "bg-violet-50 border-violet-200"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <View
                            className={`w-6 h-6 rounded-md mr-3 items-center justify-center border ${
                              done
                                ? "bg-violet-600 border-violet-600"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {done && (
                              <Text className="text-white font-black text-xs">
                                ✓
                              </Text>
                            )}
                          </View>
                          <Text
                            className={`flex-1 ${
                              done
                                ? "text-violet-900 font-semibold"
                                : "text-slate-800"
                            }`}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
              </View>

              <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                New driver
              </Text>
              <TextInput
                value={newDriver}
                onChangeText={setNewDriver}
                placeholder="Who's taking the wheel?"
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
                className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-3"
              />

              <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="ETA Vegas 11pm"
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
                className="bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl mb-4"
              />

              <View className="flex-row">
                <TouchableOpacity
                  onPress={onClose}
                  className="p-4 rounded-xl border border-slate-200 mr-2 flex-1"
                >
                  <Text className="text-slate-600 text-center font-semibold">
                    Not yet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  className={`p-4 rounded-xl flex-[2] ${
                    canSubmit ? "bg-slate-900" : "bg-slate-300"
                  }`}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    {submitting ? "Sharing..." : "Confirm & Share"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
