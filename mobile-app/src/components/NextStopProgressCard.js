import React, { useId, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Stop } from "react-native-svg";
import { MapPin } from "lucide-react-native";

const SIZE = 220;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 88;
const STROKE = 14;
const CIRC = 2 * Math.PI * R;

/**
 * Driver hero card: donut progress to next stop + destination row.
 * Gradient and pin color follow the active Manifesto / dashboard theme.
 */
export default function NextStopProgressCard({
  progress = 0,
  milesRemaining = null,
  detailLine = null,
  nextStopLabel,
  accent = "#3b82f6",
  posterColor = null,
  isDark = false,
}) {
  const rawId = useId();
  const gradId = useMemo(
    () => `ringGrad_${rawId.replace(/[^a-zA-Z0-9]/g, "")}`,
    [rawId]
  );

  const c1 = posterColor || "#f9a8d4";
  const c2 = accent;
  const c3 = "#7dd3fc";

  const p = Math.min(100, Math.max(0, progress)) / 100;
  const dashOffset = CIRC * (1 - p);

  const trackColor = isDark ? "rgba(255,255,255,0.14)" : "#e8eef4";
  const titleColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const pinColor = accent;

  const milesLine =
    detailLine != null && detailLine !== ""
      ? detailLine
      : milesRemaining != null && milesRemaining !== ""
        ? `${milesRemaining} miles remaining`
        : "Distance TBD";

  return (
    <View
      className={`rounded-3xl mb-4 overflow-hidden ${
        isDark ? "bg-white/10 border border-white/15" : "bg-white border border-slate-100"
      }`}
      style={styles.cardShadow}
    >
      <View className="items-center pt-6 pb-5 px-4">
        <View className="relative" style={{ width: SIZE, height: SIZE }}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Defs>
              <LinearGradient
                id={gradId}
                x1="32"
                y1={String(SIZE - 32)}
                x2={String(SIZE - 32)}
                y2="32"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={c1} />
                <Stop offset="0.45" stopColor={c2} />
                <Stop offset="1" stopColor={c3} />
              </LinearGradient>
            </Defs>
            <G transform={`rotate(-90 ${CX} ${CY})`}>
              <Circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={trackColor}
                strokeWidth={STROKE}
              />
              <Circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${CIRC} ${CIRC}`}
                strokeDashoffset={dashOffset}
              />
            </G>
          </Svg>
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Text
              style={[styles.percent, { color: titleColor }]}
            >{`${Math.round(progress)}%`}</Text>
            <Text style={[styles.subProgress, { color: mutedColor }]}>
              to next stop
            </Text>
          </View>
        </View>

        <View className="flex-row items-start mt-1 w-full max-w-[280px] pl-1">
          <MapPin size={22} color={pinColor} style={{ marginTop: 2 }} />
          <View className="ml-2 flex-1">
            <Text
              className="text-lg font-bold"
              style={{ color: titleColor }}
              numberOfLines={2}
            >
              {nextStopLabel}
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: mutedColor }}
            >
              {milesLine}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  percent: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },
  subProgress: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
});
