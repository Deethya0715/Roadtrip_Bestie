import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const TYPE_LABEL = {
  arrived: "Arrived",
  vibe: "Vibe Check",
  leaving: "Leaving",
  blackout: "Blackout",
};

const TYPE_COLOR = {
  arrived: "#10b981", // emerald
  vibe: "#8b5cf6", // violet
  leaving: "#f59e0b", // amber
  blackout: "#64748b", // slate
};

function formatRelative(iso) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * Compact dashboard card summarising the Safe Check-In automation.
 * Shows the last shared event, the countdown to the next Vibe Check
 * (passenger only), and the appropriate manual triggers for each role.
 *
 * Designed to slot into DriverHome and PassengerHome above the existing
 * "Quick Actions" section without fighting the Manifesto theme.
 */
export default function SafeCheckInPanel({
  role,
  entries,
  latestByType,
  nextVibeAt,
  atCharger,
  onSimulateArrival,
  onSimulateDeparture,
  onOpenVibe,
  isDark = false,
  accent = "#0f172a",
}) {
  const cardBg = isDark
    ? "bg-white/10 border border-white/15"
    : "bg-slate-50 border border-slate-200";
  const titleColor = isDark ? "text-white" : "text-slate-900";
  const mutedColor = isDark ? "text-slate-300" : "text-slate-500";
  const subCardBg = isDark ? "bg-white/5" : "bg-white";

  const latest = entries?.[0];

  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    if (!nextVibeAt) {
      setCountdown("");
      return;
    }
    const update = () => {
      const diff = nextVibeAt - Date.now();
      if (diff <= 0) {
        setCountdown("any second");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m}m ${s.toString().padStart(2, "0")}s`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [nextVibeAt]);

  return (
    <View className={`${cardBg} rounded-2xl p-5 mb-4`}>
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text
            className={`${mutedColor} text-xs uppercase tracking-widest`}
          >
            Safe Check-In
          </Text>
          <Text className={`${titleColor} text-lg font-bold`}>
            &quot;I&apos;m safe&quot; automation
          </Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{
            backgroundColor: latest ? TYPE_COLOR[latest.type] : "#94a3b8",
          }}
        >
          <Text className="text-white text-xs font-bold uppercase tracking-wider">
            {latest ? TYPE_LABEL[latest.type] : "Idle"}
          </Text>
        </View>
      </View>

      <View className={`${subCardBg} rounded-xl p-3 mb-3`}>
        {latest ? (
          <>
            <Text className={`${mutedColor} text-xs`}>
              {latest.author} · {formatRelative(latest.createdAt)}
            </Text>
            <Text
              className={`${titleColor} text-sm mt-1`}
              numberOfLines={3}
            >
              {latest.message}
            </Text>
          </>
        ) : (
          <Text className={`${mutedColor} text-sm`}>
            No check-ins yet. The first arrival at a charger will auto-post.
          </Text>
        )}
      </View>

      {role === "passenger" && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className={`${mutedColor} text-xs`}>
            Next Vibe Check in
          </Text>
          <Text className={`${titleColor} text-sm font-semibold`}>
            {countdown || "—"}
          </Text>
        </View>
      )}

      {role === "driver" && atCharger && (
        <View className="flex-row items-center justify-between mb-3">
          <Text className={`${mutedColor} text-xs`}>Parked at</Text>
          <Text
            className={`${titleColor} text-sm font-semibold`}
            numberOfLines={1}
          >
            {atCharger.name}
          </Text>
        </View>
      )}

      <View className="flex-row flex-wrap -mx-1">
        {role === "driver" && (
          <>
            <TouchableOpacity
              onPress={onSimulateArrival}
              className="m-1 px-3 py-2 rounded-full"
              style={{ backgroundColor: accent }}
            >
              <Text className="text-white text-xs font-semibold">
                Simulate Arrival
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSimulateDeparture}
              className="m-1 px-3 py-2 rounded-full border border-amber-400"
            >
              <Text className="text-amber-600 text-xs font-semibold">
                I&apos;m leaving
              </Text>
            </TouchableOpacity>
          </>
        )}
        {role === "passenger" && (
          <TouchableOpacity
            onPress={onOpenVibe}
            className="m-1 px-3 py-2 rounded-full"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-white text-xs font-semibold">
              Send Vibe Check now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
