import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

/**
 * Full-screen passenger "Blackout Mode" overlay. Active between 2:00 and
 * 6:00 AM local time so the co-pilot is forced to rest during the night
 * leg. A small, dim moon drifts in the middle — nothing else to look at.
 *
 * The parent screen (PassengerHome) renders this *above* everything,
 * including the status bar area, by placing it last in the tree with
 * absolute positioning.
 */
export default function BlackoutMode({ visible, onOverride }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  if (!visible) return null;

  const moonOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.55],
  });
  const moonScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  return (
    <View
      pointerEvents="auto"
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: "#000000" }}
    >
      <Animated.View
        style={{
          opacity: moonOpacity,
          transform: [{ scale: moonScale }],
          alignItems: "center",
        }}
      >
        <Svg width={140} height={140} viewBox="0 0 120 120">
          {/* Soft halo so the moon has depth at low brightness */}
          <Circle cx="60" cy="60" r="52" fill="#0f172a" />
          {/* Crescent */}
          <Path
            d="M72 20 a44 44 0 1 0 28 72 A34 34 0 0 1 72 20 z"
            fill="#e2e8f0"
            opacity={0.9}
          />
          <Circle cx="48" cy="52" r="2" fill="#94a3b8" opacity={0.5} />
          <Circle cx="58" cy="70" r="1.5" fill="#94a3b8" opacity={0.5} />
          <Circle cx="40" cy="78" r="1" fill="#94a3b8" opacity={0.5} />
        </Svg>
        <Text
          className="text-slate-300 text-base mt-6 tracking-widest"
          style={{ opacity: 0.6 }}
        >
          REST UP
        </Text>
        <Text
          className="text-slate-400 text-xs mt-2"
          style={{ opacity: 0.5 }}
        >
          Your driver&apos;s got the night leg.
        </Text>
      </Animated.View>

      {onOverride && (
        <TouchableOpacity
          onPress={onOverride}
          className="absolute bottom-10"
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
        >
          <Text
            className="text-slate-500 text-xs tracking-widest"
            style={{ opacity: 0.35 }}
          >
            tap to wake
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
