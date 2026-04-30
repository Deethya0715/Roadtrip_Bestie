import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Battery, CheckCircle2, TrendingUp } from "lucide-react-native";
import { VIBE_CHECK_INTERVAL_MS } from "../features/safeCheckIn/constants";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function latestVibeBatteryPercent(entries) {
  const vibe = entries?.find((e) => e.type === "vibe");
  if (!vibe) return null;
  const fromPayload = vibe.payload?.battery;
  if (fromPayload != null && !Number.isNaN(Number(fromPayload))) {
    return Math.round(Number(fromPayload));
  }
  const m = typeof vibe.message === "string" && vibe.message.match(/Battery (\d+)%/);
  return m ? Number(m[1]) : null;
}

/** mi/kWh from the newest check-in that carries telemetry (optional). */
export function latestDrivingEfficiency(entries) {
  for (const e of entries ?? []) {
    const p = e.payload;
    if (!p || typeof p !== "object") continue;
    const raw = p.miPerKwh ?? p.efficiency ?? p.efficiencyMpkwh;
    if (raw != null && !Number.isNaN(Number(raw))) {
      return Math.round(Number(raw) * 10) / 10;
    }
  }
  return null;
}

/** Next vibe deadline visible to both phones (from shared log). */
export function inferNextVibeDeadlineFromLog(entries) {
  const vibe = entries?.find((e) => e.type === "vibe");
  if (!vibe?.createdAt) return null;
  const last = new Date(vibe.createdAt).getTime();
  if (Number.isNaN(last)) return null;
  let next = last + VIBE_CHECK_INTERVAL_MS;
  const now = Date.now();
  while (next <= now) {
    next += VIBE_CHECK_INTERVAL_MS;
  }
  return next;
}

/**
 * Prominent trip snapshot: battery + next check-in row, current alphabet game,
 * and driving efficiency — matches the passenger dashboard hero cards and is
 * reused on the driver screen.
 */
export default function TripAtAGlance({
  role,
  entries = [],
  nextVibeAt,
  onOpenGames,
  isDarkBase = false,
}) {
  const pct = useMemo(() => latestVibeBatteryPercent(entries), [entries]);

  const resolvedNextVibeAt = useMemo(() => {
    if (nextVibeAt != null) return nextVibeAt;
    return inferNextVibeDeadlineFromLog(entries);
  }, [nextVibeAt, entries]);

  const [countdownLabel, setCountdownLabel] = useState("—");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      if (!resolvedNextVibeAt) {
        setCountdownLabel("—");
        setProgress(0);
        return;
      }
      const remaining = resolvedNextVibeAt - Date.now();
      if (remaining <= 0) {
        setCountdownLabel("any moment");
        setProgress(1);
        return;
      }
      const totalSec = Math.floor(remaining / 1000);
      const mm = Math.floor(totalSec / 60);
      const ss = totalSec % 60;
      setCountdownLabel(`${mm}:${ss.toString().padStart(2, "0")}`);
      const elapsed = VIBE_CHECK_INTERVAL_MS - remaining;
      setProgress(
        Math.min(1, Math.max(0, elapsed / VIBE_CHECK_INTERVAL_MS))
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [resolvedNextVibeAt]);

  const daySeed = Math.floor(Date.now() / 86400000);
  const letter = ALPHABET[daySeed % ALPHABET.length];
  const efficiency = useMemo(
    () => latestDrivingEfficiency(entries),
    [entries]
  );

  const checkTitle =
    role === "driver" ? "Co-pilot check-in" : "Your check-in";

  const titleColor = isDarkBase ? "text-white" : "text-slate-900";
  const mutedColor = isDarkBase ? "text-slate-400" : "text-slate-500";

  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-3">
        <View
          className={`w-[48%] rounded-2xl p-4 border ${
            isDarkBase
              ? "bg-emerald-950/40 border-emerald-500/35"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <View className="flex-row items-center mb-3">
            <View
              className={`w-9 h-9 rounded-xl items-center justify-center mr-2 ${
                isDarkBase ? "bg-emerald-500/30" : "bg-emerald-400"
              }`}
            >
              <Battery
                size={20}
                color={isDarkBase ? "#a7f3d0" : "#fff"}
                strokeWidth={2.2}
              />
            </View>
            <Text className={`${titleColor} font-bold text-base flex-1`}>
              Battery
            </Text>
          </View>
          <Text className={`${titleColor} text-3xl font-black mb-1`}>
            {pct != null ? `${pct}%` : "—"}
          </Text>
          <Text className={`${mutedColor} text-xs`}>Current charge</Text>
        </View>

        <View
          className={`w-[48%] rounded-2xl p-4 border ${
            isDarkBase
              ? "bg-sky-950/40 border-sky-500/35"
              : "bg-sky-50 border-sky-200"
          }`}
        >
          <View className="flex-row items-start mb-3">
            <View
              className={`w-9 h-9 rounded-xl items-center justify-center mr-2 ${
                isDarkBase ? "bg-sky-500/30" : "bg-sky-400"
              }`}
            >
              <CheckCircle2
                size={20}
                color={isDarkBase ? "#bae6fd" : "#fff"}
                strokeWidth={2.2}
              />
            </View>
            <Text
              className={`${titleColor} font-bold text-base flex-1 leading-5`}
            >
              {checkTitle}
            </Text>
          </View>
          <View
            className={`h-1.5 rounded-full overflow-hidden mb-2 ${
              isDarkBase ? "bg-white/15" : "bg-sky-200/80"
            }`}
          >
            <View
              className="h-full rounded-full bg-rose-400"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </View>
          <Text className={`${mutedColor} text-xs`}>
            {countdownLabel === "—" ? "Waiting for schedule" : `${countdownLabel} until next`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={onOpenGames ? 0.92 : 1}
        disabled={!onOpenGames}
        onPress={onOpenGames}
        className="rounded-2xl overflow-hidden mb-3 border border-pink-200/80"
        style={{
          backgroundColor: isDarkBase ? "rgba(131, 24, 67, 0.35)" : "#fdf2f8",
        }}
      >
        <View
          className="absolute inset-0 opacity-50"
          style={{
            backgroundColor: isDarkBase ? "#0ea5e9" : "#bae6fd",
            width: "55%",
          }}
        />
        <View className="p-6 items-center">
          <Text
            className={`${mutedColor} text-xs font-semibold uppercase tracking-widest mb-3 self-start`}
          >
            Current game
          </Text>
          <Text
            className={`${titleColor} text-7xl font-black mb-2`}
            style={{ textShadowColor: "rgba(0,0,0,0.12)", textShadowRadius: 8 }}
          >
            {letter}
          </Text>
          <Text className={`${isDarkBase ? "text-sky-200" : "text-sky-700"} text-center text-sm font-medium px-2`}>
            Alphabet Game — find a word starting with {letter}
          </Text>
        </View>
      </TouchableOpacity>

      <View
        className={`rounded-2xl p-5 border ${
          isDarkBase
            ? "bg-white/10 border-white/15"
            : "bg-white border-pink-100"
        }`}
      >
        <View className="flex-row items-center mb-2">
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
              isDarkBase ? "bg-pink-500/25" : "bg-pink-100"
            }`}
          >
            <TrendingUp
              size={20}
              color={isDarkBase ? "#f9a8d4" : "#db2777"}
              strokeWidth={2.2}
            />
          </View>
          <Text className={`${titleColor} font-bold text-base`}>
            Driving efficiency
          </Text>
        </View>
        <View className="flex-row items-baseline mb-1">
          <Text className={`${titleColor} text-4xl font-black`}>
            {efficiency != null ? efficiency.toFixed(1) : "—"}
          </Text>
          {efficiency != null ? (
            <Text className={`${mutedColor} text-base font-medium ml-2`}>
              mi/kWh
            </Text>
          ) : null}
        </View>
        <Text className={`${mutedColor} text-sm`}>
          {efficiency != null
            ? "Great job keeping it smooth!"
            : "No driving data yet"}
        </Text>
      </View>
    </View>
  );
}
