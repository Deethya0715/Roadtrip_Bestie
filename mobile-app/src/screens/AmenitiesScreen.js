import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
} from "react-native";
import { getThemeSurfaces } from "../themes/manifestoThemes";
import ThemedBackdrop from "../themes/ThemedBackdrop";

const AMENITIES = [
  {
    id: "gas",
    label: "Gas Stations",
    blurb: "Fill up before the next leg.",
    query: "gas stations",
    icon: "⛽",
  },
  {
    id: "food",
    label: "Restaurants",
    blurb: "Grab a bite nearby.",
    query: "restaurants",
    icon: "🍔",
  },
  {
    id: "coffee",
    label: "Coffee",
    blurb: "Caffeinate the driver.",
    query: "coffee shops",
    icon: "☕",
  },
  {
    id: "rest",
    label: "Rest Stops",
    blurb: "Stretch, reset, repeat.",
    query: "rest stops",
    icon: "🛑",
  },
  {
    id: "restroom",
    label: "Restrooms",
    blurb: "When the next exit matters.",
    query: "public restrooms",
    icon: "🚻",
  },
  {
    id: "hotel",
    label: "Hotels",
    blurb: "Find a bed for the night.",
    query: "hotels",
    icon: "🏨",
  },
  {
    id: "ev",
    label: "EV Charging",
    blurb: "Top up the battery.",
    query: "EV charging stations",
    icon: "🔌",
  },
  {
    id: "parking",
    label: "Parking",
    blurb: "Lots & garages nearby.",
    query: "parking",
    icon: "🅿️",
  },
  {
    id: "scenic",
    label: "Scenic Spots",
    blurb: "Views worth the detour.",
    query: "scenic overlooks",
    icon: "🏞️",
  },
  {
    id: "grocery",
    label: "Grocery & Snacks",
    blurb: "Stock up the cooler.",
    query: "grocery stores",
    icon: "🛒",
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    blurb: "Meds, essentials, first aid.",
    query: "pharmacy",
    icon: "💊",
  },
  {
    id: "atm",
    label: "ATM",
    blurb: "Cash for tolls and diners.",
    query: "ATM",
    icon: "🏧",
  },
];

function openMapsSearch(query) {
  const encoded = encodeURIComponent(`${query} near me`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

  Linking.openURL(googleMapsUrl).catch((err) => {
    Alert.alert("Couldn't open maps", err.message ?? "Try again in a moment.");
  });
}

export default function AmenitiesScreen({
  visible,
  onClose,
  accent = "#3b82f6",
  theme = null,
}) {
  const surfaces = getThemeSurfaces(theme);
  const effectiveAccent = surfaces.isThemed ? surfaces.accent : accent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className={`flex-1 ${surfaces.rootBg}`}>
        <ThemedBackdrop surfaces={surfaces} variant="modalSolid" />

        <View
          className={`px-6 pt-12 pb-4 flex-row items-center justify-between ${surfaces.headerBorder}`}
        >
          <View>
            <Text
              className={`text-xs uppercase tracking-widest ${surfaces.subtleText}`}
            >
              Along the way
            </Text>
            <Text className={`text-2xl font-black mt-1 ${surfaces.titleText}`}>
              Amenities
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className={`px-4 py-2 rounded-full ${surfaces.pillBg}`}
          >
            <Text className={`font-semibold ${surfaces.pillText}`}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-5">
          <Text className={`text-sm px-1 mb-3 ${surfaces.mutedText}`}>
            Tap to open maps with nearby results.
          </Text>

          <View className="flex-row flex-wrap -mx-1">
            {AMENITIES.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => openMapsSearch(a.query)}
                className={`m-1 rounded-2xl p-4 ${surfaces.cardBg}`}
                style={{ width: "48%" }}
              >
                <Text className="text-3xl mb-2">{a.icon}</Text>
                <Text className={`font-bold text-base ${surfaces.titleText}`}>
                  {a.label}
                </Text>
                <Text className={`text-xs mt-1 ${surfaces.mutedText}`}>
                  {a.blurb}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => openMapsSearch("anything")}
            className="mt-4 mb-10 rounded-2xl p-5"
            style={{ backgroundColor: effectiveAccent }}
          >
            <Text className="text-white text-center font-bold text-base">
              Open Maps
            </Text>
            <Text className="text-white/80 text-center text-xs mt-1">
              Search for anything nearby
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
