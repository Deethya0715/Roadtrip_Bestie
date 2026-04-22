import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";
import { getThemeSurfaces } from "../../themes/manifestoThemes";

// Tile-grid layout of U.S. states. Each entry is [col, row] in a 12x8 grid
// that approximates the country's shape. Tapping a tile logs a sighting.
const STATE_TILES = [
  { code: "AK", name: "Alaska", col: 0, row: 0 },
  { code: "ME", name: "Maine", col: 11, row: 0 },
  { code: "VT", name: "Vermont", col: 10, row: 1 },
  { code: "NH", name: "New Hampshire", col: 11, row: 1 },
  { code: "WA", name: "Washington", col: 1, row: 2 },
  { code: "ID", name: "Idaho", col: 2, row: 2 },
  { code: "MT", name: "Montana", col: 3, row: 2 },
  { code: "ND", name: "North Dakota", col: 4, row: 2 },
  { code: "MN", name: "Minnesota", col: 5, row: 2 },
  { code: "WI", name: "Wisconsin", col: 7, row: 2 },
  { code: "MI", name: "Michigan", col: 8, row: 2 },
  { code: "NY", name: "New York", col: 10, row: 2 },
  { code: "MA", name: "Massachusetts", col: 11, row: 2 },
  { code: "OR", name: "Oregon", col: 1, row: 3 },
  { code: "NV", name: "Nevada", col: 2, row: 3 },
  { code: "WY", name: "Wyoming", col: 3, row: 3 },
  { code: "SD", name: "South Dakota", col: 4, row: 3 },
  { code: "IA", name: "Iowa", col: 5, row: 3 },
  { code: "IL", name: "Illinois", col: 6, row: 3 },
  { code: "IN", name: "Indiana", col: 7, row: 3 },
  { code: "OH", name: "Ohio", col: 8, row: 3 },
  { code: "PA", name: "Pennsylvania", col: 9, row: 3 },
  { code: "NJ", name: "New Jersey", col: 10, row: 3 },
  { code: "CT", name: "Connecticut", col: 11, row: 3 },
  { code: "CA", name: "California", col: 1, row: 4 },
  { code: "UT", name: "Utah", col: 2, row: 4 },
  { code: "CO", name: "Colorado", col: 3, row: 4 },
  { code: "NE", name: "Nebraska", col: 4, row: 4 },
  { code: "MO", name: "Missouri", col: 5, row: 4 },
  { code: "KY", name: "Kentucky", col: 6, row: 4 },
  { code: "WV", name: "West Virginia", col: 7, row: 4 },
  { code: "VA", name: "Virginia", col: 8, row: 4 },
  { code: "MD", name: "Maryland", col: 9, row: 4 },
  { code: "DE", name: "Delaware", col: 10, row: 4 },
  { code: "RI", name: "Rhode Island", col: 11, row: 4 },
  { code: "AZ", name: "Arizona", col: 2, row: 5 },
  { code: "NM", name: "New Mexico", col: 3, row: 5 },
  { code: "KS", name: "Kansas", col: 4, row: 5 },
  { code: "AR", name: "Arkansas", col: 5, row: 5 },
  { code: "TN", name: "Tennessee", col: 6, row: 5 },
  { code: "NC", name: "North Carolina", col: 7, row: 5 },
  { code: "SC", name: "South Carolina", col: 8, row: 5 },
  { code: "OK", name: "Oklahoma", col: 4, row: 6 },
  { code: "LA", name: "Louisiana", col: 5, row: 6 },
  { code: "MS", name: "Mississippi", col: 6, row: 6 },
  { code: "AL", name: "Alabama", col: 7, row: 6 },
  { code: "GA", name: "Georgia", col: 8, row: 6 },
  { code: "HI", name: "Hawaii", col: 0, row: 7 },
  { code: "TX", name: "Texas", col: 4, row: 7 },
  { code: "FL", name: "Florida", col: 8, row: 7 },
];

const GRID_COLS = 12;
const GRID_ROWS = 8;
const TILE = 38;
const GAP = 4;
const PAD = 4;
const VB_W = GRID_COLS * (TILE + GAP) + PAD * 2;
const VB_H = GRID_ROWS * (TILE + GAP) + PAD * 2;

/**
 * License Plate Game — interactive SVG tile map of the U.S. Each state is
 * a tappable tile laid out roughly in its geographic position. Tap to log
 * a sighting; tap again to clear.
 */
export default function LicensePlateMap({
  accent = "#a855f7",
  surfaces: injected,
}) {
  const surfaces = injected ?? getThemeSurfaces(null);
  const [spotted, setSpotted] = useState({});
  const [recent, setRecent] = useState(null);

  const count = useMemo(
    () => Object.values(spotted).filter(Boolean).length,
    [spotted]
  );

  const toggle = (state) => {
    setSpotted((prev) => {
      const next = { ...prev, [state.code]: !prev[state.code] };
      setRecent({ ...state, on: !prev[state.code] });
      return next;
    });
  };

  const reset = () => {
    setSpotted({});
    setRecent(null);
  };

  return (
    <ScrollView className="flex-1 pt-2" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-end justify-between mb-3">
        <View>
          <Text
            className={`text-xs uppercase tracking-widest ${surfaces.subtleText}`}
          >
            License Plate Game
          </Text>
          <Text className={`text-3xl font-black mt-1 ${surfaces.titleText}`}>
            {count}{" "}
            <Text className={surfaces.mutedText}>/ 50</Text>
          </Text>
          <Text className={`text-xs mt-1 ${surfaces.mutedText}`}>
            Tap a state the moment you spot its plate.
          </Text>
        </View>
        <TouchableOpacity
          onPress={reset}
          className={`px-3 py-2 rounded-full ${surfaces.pillBg}`}
        >
          <Text className={`text-xs font-semibold ${surfaces.pillText}`}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <View className={`rounded-2xl p-3 mb-3 ${surfaces.cardBg}`}>
        <Svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          height={undefined}
          style={{ aspectRatio: VB_W / VB_H }}
        >
          {STATE_TILES.map((s) => {
            const on = !!spotted[s.code];
            const x = PAD + s.col * (TILE + GAP);
            const y = PAD + s.row * (TILE + GAP);
            const idleFill = surfaces.isDark
              ? "rgba(255,255,255,0.08)"
              : "#ffffff";
            const idleStroke = surfaces.isDark
              ? "rgba(255,255,255,0.2)"
              : "#e2e8f0";
            const idleText = surfaces.isDark ? "#e2e8f0" : "#0f172a";
            return (
              <G key={s.code} onPress={() => toggle(s)}>
                <Rect
                  x={x}
                  y={y}
                  width={TILE}
                  height={TILE}
                  rx={6}
                  ry={6}
                  fill={on ? accent : idleFill}
                  stroke={on ? accent : idleStroke}
                  strokeWidth={1.25}
                />
                <SvgText
                  x={x + TILE / 2}
                  y={y + TILE / 2 + 4.5}
                  fontSize={13}
                  fontWeight="700"
                  fill={on ? "#ffffff" : idleText}
                  textAnchor="middle"
                >
                  {s.code}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {recent && (
        <View
          className="rounded-2xl p-4 mb-3"
          style={{
            backgroundColor: recent.on
              ? accent + "22"
              : surfaces.isDark
              ? "rgba(255,255,255,0.06)"
              : "#f1f5f9",
            borderWidth: 1,
            borderColor: recent.on
              ? accent
              : surfaces.isDark
              ? "rgba(255,255,255,0.15)"
              : "#e2e8f0",
          }}
        >
          <Text
            className="text-xs uppercase tracking-widest"
            style={{
              color: recent.on
                ? accent
                : surfaces.isDark
                ? "#cbd5e1"
                : "#64748b",
            }}
          >
            {recent.on ? "Logged" : "Removed"}
          </Text>
          <Text className={`font-bold text-base mt-1 ${surfaces.titleText}`}>
            {recent.name} ({recent.code})
          </Text>
        </View>
      )}

      <View className="mb-12" />
    </ScrollView>
  );
}
