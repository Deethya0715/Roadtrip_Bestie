import React from "react";
import { View, Image } from "react-native";

/**
 * Themed full-bleed layers behind Manifesto UI.
 *
 * variant "default" — home/dashboard: poster image, then soft color wash.
 * variant "modal"   — full-screen & sheet modals: solid poster color, then
 *                     poster image on top (no translucent wash).
 */
export default function ThemedBackdrop({ surfaces, variant = "default" }) {
  if (!surfaces?.isThemed) return null;

  if (variant === "modal") {
    const solid =
      surfaces.posterColor || surfaces.accent || "#0f172a";
    return (
      <>
        <View
          pointerEvents="none"
          className="absolute inset-0"
          style={{ backgroundColor: solid }}
        />
        {surfaces.posterImage ? (
          <Image
            pointerEvents="none"
            source={surfaces.posterImage}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: surfaces.posterImageOpacity }}
            resizeMode="cover"
          />
        ) : null}
      </>
    );
  }

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
