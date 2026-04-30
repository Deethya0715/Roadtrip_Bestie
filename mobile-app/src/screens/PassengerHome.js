// Passenger dashboard screen.
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Pressable,
  Keyboard,
  Dimensions,
} from "react-native";
import {
  MANIFESTO_THEMES,
  THEME_GROUPS,
  getNextTheme,
  getThemeSurfaces,
  resolveThemeAppearance,
  textOnColor,
} from "../themes/manifestoThemes";
import HomeFeatureCards from "./HomeFeatureCards";
import { useSafeCheckIn } from "../features/safeCheckIn/useSafeCheckIn";
import SafeCheckInPanel from "../features/safeCheckIn/SafeCheckInPanel";
import VibeCheckModal from "../features/safeCheckIn/VibeCheckModal";
import BlackoutMode from "../features/safeCheckIn/BlackoutMode";
import RelocationInventorySection from "../features/safeCheckIn/RelocationInventorySection";

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
  const safe = useSafeCheckIn({ role: "passenger", name, session });
  const isManifesto = vibeMode === "manifesto";

  // Resolve what the current theme should look like *right now* (adaptive
  // themes depend on the local hour). Recomputed whenever the theme changes.
  const appearance = useMemo(
    () => (isManifesto ? resolveThemeAppearance(activeTheme) : null),
    [isManifesto, activeTheme]
  );

  const surfaces = useMemo(
    () => (isManifesto && activeTheme ? getThemeSurfaces(activeTheme) : null),
    [isManifesto, activeTheme]
  );

  const isDarkBase = isManifesto && appearance?.base === "dark";
  const accent = isManifesto && appearance?.accent ? appearance.accent : "#a855f7";
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

          <SafeCheckInPanel
            role="passenger"
            entries={safe.entries}
            latestByType={safe.latestByType}
            nextVibeAt={safe.nextVibeAt}
            onOpenVibe={safe.simulateVibeNudge}
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
              Leave Trip
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <VibeCheckModal
        visible={safe.vibeModalOpen}
        onClose={() => safe.setVibeModalOpen(false)}
        onSubmit={safe.postVibe}
        defaultDriver={session?.driverName}
      />

      <PassengerSettings
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        vibeMode={vibeMode}
        onToggleVibe={toggleVibe}
        activeTheme={activeTheme}
        onCycleTheme={cycleTheme}
        onPickTheme={setActiveTheme}
        safeSettings={safe.settings}
        onUpdateSafeSettings={safe.updateSettings}
        contacts={safe.contacts}
        onUpdateContacts={safe.updateContacts}
      />

      <BlackoutMode
        visible={safe.blackoutActive}
        onOverride={() => safe.updateSettings({ forceBlackout: false })}
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
  safeSettings,
  onUpdateSafeSettings,
  contacts = [],
  onUpdateContacts,
}) {
  const isManifesto = vibeMode === "manifesto";
  const [newContact, setNewContact] = useState("");

  const addContact = () => {
    const trimmed = newContact.trim();
    if (!trimmed) return;
    const next = Array.from(new Set([...contacts, trimmed])).slice(0, 8);
    onUpdateContacts?.(next);
    setNewContact("");
  };
  const removeContact = (name) =>
    onUpdateContacts?.(contacts.filter((c) => c !== name));

  const windowH = Dimensions.get("window").height;
  const sheetMaxH = Math.round(windowH * 0.85);
  const scrollViewportH = Math.max(260, sheetMaxH - 100);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          onPress={onClose}
          className="absolute inset-0 bg-black/40"
          accessibilityRole="button"
          accessibilityLabel="Close trip settings"
        />
        <View
          className="w-full bg-white rounded-t-3xl border-t border-slate-200 px-6 pt-6"
          style={{ maxHeight: sheetMaxH }}
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

          <ScrollView
            style={{ maxHeight: scrollViewportH }}
            contentContainerStyle={{ paddingBottom: 36 }}
            showsVerticalScrollIndicator
            bounces
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2 mt-1">
            Safe Check-In
          </Text>
          <SafeSettingsBlock
            settings={safeSettings}
            onUpdate={onUpdateSafeSettings}
          />

          <RelocationInventorySection
            items={safeSettings?.relocationInventory ?? []}
            onChange={(next) =>
              onUpdateSafeSettings?.({ relocationInventory: next })
            }
          />

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2 mt-4">
            Emergency Contacts
          </Text>
          <View className="p-4 bg-slate-50 rounded-2xl mb-4">
            <Text className="text-xs text-slate-500 mb-2">
              Names that get dropped into every check-in message so your group
              chat knows who&apos;s being pinged.
            </Text>
            <View className="flex-row flex-wrap -mx-1 mb-2">
              {contacts.length === 0 && (
                <Text className="m-1 text-slate-400 italic">
                  No contacts yet.
                </Text>
              )}
              {contacts.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => removeContact(c)}
                  className="m-1 px-3 py-1 rounded-full bg-slate-900"
                >
                  <Text className="text-white text-sm">{c} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row">
              <TextInput
                value={newContact}
                onChangeText={setNewContact}
                onSubmitEditing={addContact}
                returnKeyType="done"
                blurOnSubmit
                onBlur={() => Keyboard.dismiss()}
                placeholder="Add a name"
                placeholderTextColor="#94a3b8"
                className="flex-1 bg-white border border-slate-200 text-slate-900 p-3 rounded-xl mr-2"
              />
              <TouchableOpacity
                onPress={addContact}
                className="px-4 rounded-xl bg-slate-900 justify-center"
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text className="text-slate-500 text-xs uppercase tracking-wider mb-2">
            Vibe Mode
          </Text>
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
            <View className="mt-4">
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
            </View>
          )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/**
 * The three Safe Check-In toggles: pause the automation entirely, force
 * Blackout Mode on (demo / early bedtime), and opt into real GPS-driven
 * arrival detection.
 */
function SafeSettingsBlock({ settings, onUpdate }) {
  const s = settings ?? {};
  const Row = ({ label, hint, value, onToggle }) => (
    <View className="flex-row justify-between items-center p-4 bg-slate-50 rounded-2xl mb-2">
      <View className="flex-1 pr-3">
        <Text className="font-bold text-slate-900">{label}</Text>
        {hint ? (
          <Text className="text-xs text-slate-500">{hint}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={onToggle}
        className={`w-12 h-6 rounded-full px-1 justify-center ${
          value ? "bg-green-500" : "bg-slate-300"
        }`}
      >
        <View
          className={`bg-white w-4 h-4 rounded-full ${
            value ? "self-end" : "self-start"
          }`}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <Row
        label="Automation"
        hint="Auto-send Arrived / Vibe / Leaving pings"
        value={s.enabled !== false}
        onToggle={() => onUpdate?.({ enabled: !(s.enabled !== false) })}
      />
      <Row
        label="Location detection"
        hint="Use GPS to detect arrivals at chargers"
        value={!!s.locationEnabled}
        onToggle={() => onUpdate?.({ locationEnabled: !s.locationEnabled })}
      />
      <Row
        label="Force Blackout Mode"
        hint="Dim-moon overlay now (also auto 2–6 AM)"
        value={!!s.forceBlackout}
        onToggle={() => onUpdate?.({ forceBlackout: !s.forceBlackout })}
      />
    </View>
  );
}
