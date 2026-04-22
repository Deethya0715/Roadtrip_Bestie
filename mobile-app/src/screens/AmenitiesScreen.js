import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Platform,
  Alert,
} from "react-native";

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

  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encoded}`
      : `geo:0,0?q=${encoded}`;

  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encoded}`
    ).catch((err) => {
      Alert.alert("Couldn't open maps", err.message ?? "Try again in a moment.");
    });
  });
}

export default function AmenitiesScreen({ visible, onClose, accent = "#3b82f6" }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        <View className="px-6 pt-12 pb-4 flex-row items-center justify-between border-b border-slate-100">
          <View>
            <Text className="text-xs uppercase tracking-widest text-slate-500">
              Along the way
            </Text>
            <Text className="text-2xl font-black text-slate-900 mt-1">
              Amenities
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="px-4 py-2 rounded-full bg-slate-100"
          >
            <Text className="text-slate-700 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-5">
          <Text className="text-slate-500 text-sm px-1 mb-3">
            Tap to open maps with nearby results.
          </Text>

          <View className="flex-row flex-wrap -mx-1">
            {AMENITIES.map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => openMapsSearch(a.query)}
                className="m-1 bg-slate-50 border border-slate-200 rounded-2xl p-4"
                style={{ width: "48%" }}
              >
                <Text className="text-3xl mb-2">{a.icon}</Text>
                <Text className="text-slate-900 font-bold text-base">
                  {a.label}
                </Text>
                <Text className="text-slate-500 text-xs mt-1">{a.blurb}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => openMapsSearch("anything")}
            className="mt-4 mb-10 rounded-2xl p-5"
            style={{ backgroundColor: accent }}
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
