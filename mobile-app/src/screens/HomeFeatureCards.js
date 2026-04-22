import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import GamesScreen from "./GamesScreen";
import AmenitiesScreen from "./AmenitiesScreen";
import RoadtripPlannerScreen from "./RoadtripPlannerScreen";

/**
 * Three large feature cards rendered prominently on the homepage:
 *   1. Games
 *   2. Amenities
 *   3. Roadtrip Planner
 *
 * Each card opens a full-screen modal experience. The active Manifesto
 * `theme` is forwarded so every downstream screen (and the games inside
 * Games) can render its own poster wash, accent, and dark/light base.
 */
export default function HomeFeatureCards({
  accent = "#3b82f6",
  isDarkBase = false,
  theme = null,
}) {
  const [open, setOpen] = useState(null); // 'games' | 'amenities' | 'planner' | null

  const titleColor = isDarkBase ? "text-white" : "text-slate-900";
  const subColor = isDarkBase ? "text-slate-300" : "text-slate-500";
  const cardBg = isDarkBase
    ? "bg-white/10 border border-white/15"
    : "bg-slate-50 border border-slate-200";

  const FEATURES = [
    {
      id: "games",
      emoji: "🎮",
      title: "Games",
      blurb: "Ghost, Hide & Seek, License Plate Map & more.",
    },
    {
      id: "amenities",
      emoji: "🗺️",
      title: "Amenities",
      blurb: "Gas, food, rest stops & hotels nearby.",
    },
    {
      id: "planner",
      emoji: "🧭",
      title: "Roadtrip Planner",
      blurb: "Map your origin, stops, and destination.",
    },
  ];

  return (
    <View>
      <Text
        className={`${titleColor} text-lg font-bold mt-4 mb-3`}
      >
        On this trip
      </Text>

      {FEATURES.map((f) => (
        <TouchableOpacity
          key={f.id}
          onPress={() => setOpen(f.id)}
          className={`${cardBg} rounded-2xl p-5 mb-3 flex-row items-center`}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: accent + (isDarkBase ? "33" : "22") }}
          >
            <Text style={{ fontSize: 24 }}>{f.emoji}</Text>
          </View>
          <View className="flex-1">
            <Text className={`${titleColor} font-bold text-base`}>
              {f.title}
            </Text>
            <Text className={`${subColor} text-xs mt-1`}>{f.blurb}</Text>
          </View>
          <Text
            className="font-bold"
            style={{ color: accent, fontSize: 20 }}
          >
            ›
          </Text>
        </TouchableOpacity>
      ))}

      <GamesScreen
        visible={open === "games"}
        onClose={() => setOpen(null)}
        accent={accent}
        theme={theme}
      />
      <AmenitiesScreen
        visible={open === "amenities"}
        onClose={() => setOpen(null)}
        accent={accent}
        theme={theme}
      />
      <RoadtripPlannerScreen
        visible={open === "planner"}
        onClose={() => setOpen(null)}
        accent={accent}
        theme={theme}
      />
    </View>
  );
}
