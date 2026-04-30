import React from "react";
import { View, Image } from "react-native";

/**
 * Two-layer poster wash used behind every themed screen. Renders nothing
 * when the surfaces bundle has no theme, so it's safe to drop in on every
 * modal/page without extra branching.
 */
export default function ThemedBackdrop({ surfaces }) {
  if (!surfaces?.isThemed) return null;
  return (
    <>
      {surfaces.posterImage && (
        <Image
          pointerEvents="none"
          source={surfaces.posterImage}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: surfaces.posterImageOpacity }}
          resizeMode="cover"
        />
      )}
      {surfaces.posterColor && (
        <View
          pointerEvents="none"
          className="absolute inset-0"
          style={{
            backgroundColor: surfaces.posterColor,
            opacity: surfaces.posterOpacity,
          }}
        />
      )}
    </>
  );
}
