import React from "react";
import { View, Image } from "react-native";
import { compositePosterWashSolid } from "./manifestoThemes";

/**
 * Themed full-bleed layers behind Manifesto UI.
 *
 * variant "default"    — home/dashboard: poster image, then soft color wash.
 * variant "modal"      — full-screen & sheet modals: solid poster color, then
 *                        poster image on top (no translucent wash).
 * variant "modalSolid" — same solid base color as modal, no poster image
 *                        (Games, Amenities, Planner).
 */
export default function ThemedBackdrop({ surfaces, variant = "default" }) {
  if (!surfaces?.isThemed) return null;

  if (variant === "modalSolid") {
    const solid = compositePosterWashSolid(
      surfaces.isDark,
      surfaces.posterColor,
      surfaces.posterOpacity
    );
    return (
      <View
        pointerEvents="none"
        className="absolute inset-0"
        style={{ backgroundColor: solid }}
      />
    );
  }

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
