// Manifesto Mode theme catalog.
//
// Each theme has:
//   posterColor     – backdrop/wash color (the "poster")
//   accent          – tile / CTA color
//   category        – 'light'    : daytime driving, dark text on light base
//                     'dark'     : overnight driving, light text on dark base
//                     'adaptive' : flips automatically between light & dark
//                                  based on the local hour
//   posterColorDark – only on adaptive themes; used when it's after dark
//
// Optional per-theme backdrop tuning (when `poster` is set):
//   posterImageOpacity – photo visibility before the wash (0–1)
//   posterWashOpacity  – color overlay strength on top of the photo (0–1)

export const MANIFESTO_THEMES = [
  // ─── Light Mode Themes (Daytime Driving) ────────────────────────────────
  {
    id: "phineas-ferb",
    name: "Phineas and Ferb",
    category: "light",
    posterColor: "#06b6d4", // Aqua / Teal
    accent: "#facc15", // Jake Yellow
    tagline: "Hey Ferb, I know what we're gonna do today.",
    poster: null,
  },
  {
    id: "legally-blonde",
    name: "Legally Blonde",
    category: "light",
    posterColor: "#f9a8d4", // Pastel Pink
    accent: "#db2777", // Elle's Hot Pink (legible, unmistakably her)
    tagline: "What, like it's hard?",
    poster: null,
  },
  {
    id: "clueless",
    name: "Clueless",
    category: "light",
    // Lilac–sky wash over the still (binder purple + Cher’s shirt blue)
    posterColor: "#a5b4fc",
    accent: "#fbcfe8", // Feather Pink
    tagline: "As if!",
    poster: require("../../assets/manifesto-clueless.png"),
    posterImageOpacity: 0.5,
    posterWashOpacity: 0.42,
  },
  {
    id: "princess-diaries",
    name: "The Princess Diaries",
    category: "light",
    posterColor: "#bfdbfe", // Powder Blue
    accent: "#d4af37", // Tiara Gold
    tagline: "Courage is not the absence of fear.",
    poster: null,
  },
  {
    id: "la-la-land-sunset",
    name: "La La Land · Sunset",
    category: "light",
    posterColor: "#fecaca", // Pastel Peach
    accent: "#c4b5fd", // Pastel Lavender
    tagline: "Here's to the ones who dream.",
    poster: null,
  },

  // ─── Dark Mode Themes (Overnight Driving) ───────────────────────────────
  {
    id: "harry-potter-hufflepuff",
    name: "Harry Potter · Hufflepuff",
    category: "dark",
    posterColor: "#18181b", // Hufflepuff Black
    accent: "#facc15", // Hufflepuff Yellow
    tagline: "True and unafraid of toil.",
    poster: null,
  },
  {
    id: "percy-jackson",
    name: "Percy Jackson",
    category: "dark",
    posterColor: "#134e4a", // Deep Sea Teal
    accent: "#3b82f6", // Electric Blue
    tagline: "Swords, sandals, and open road.",
    poster: null,
  },
  {
    id: "adam-project",
    name: "The Adam Project",
    category: "dark",
    posterColor: "#172554", // Midnight Navy
    accent: "#22d3ee", // Electric Cyan (lightning through time)
    tagline: "Lightning crackling between decades.",
    poster: null,
  },
  {
    id: "red-notice",
    name: "Red Notice",
    category: "dark",
    posterColor: "#7f1d1d", // Crimson Red
    accent: "#eab308", // Gold Leaf
    tagline: "The biggest heist is on the highway.",
    poster: null,
  },
  {
    id: "devil-wears-prada",
    name: "The Devil Wears Prada",
    category: "dark",
    posterColor: "#0a0a0a", // Runway Black
    accent: "#dc2626", // Signature Red
    tagline: "Florals? For spring? Groundbreaking.",
    poster: null,
  },

  // ─── Interchangeable Themes (Adaptive Logic) ────────────────────────────
  {
    id: "ratatouille",
    name: "Ratatouille",
    category: "adaptive",
    posterColor: "#fef3c7", // Cream White (day)
    posterColorDark: "#475569", // Slate Gray (night)
    accent: "#b91c1c", // Chef's reds
    tagline: "Anyone can drive.",
    poster: null,
  },
  {
    id: "ten-things",
    name: "10 Things I Hate About You",
    category: "adaptive",
    posterColor: "#c4b5fd", // Lilac (day)
    posterColorDark: "#312e81", // Indigo (night)
    accent: "#ec4899", // Romance pink
    tagline: "I hate the way I don't hate you.",
    poster: null,
  },
  {
    id: "how-to-lose-a-guy",
    name: "How to Lose a Guy in 10 Days",
    category: "adaptive",
    posterColor: "#f8fafc", // Silk White (day)
    posterColorDark: "#0f172a", // Evening Navy (night)
    accent: "#fde68a", // Diamond-yellow sparkle
    tagline: "Frost yourself.",
    poster: null,
  },
  {
    id: "willy-wonka",
    name: "Charlie & The Chocolate Factory",
    category: "adaptive",
    posterColor: "#7c3aed", // Wonka Purple (day)
    posterColorDark: "#4a2c1a", // Chocolate Brown (night)
    accent: "#eab308", // Golden ticket
    tagline: "We are the music makers, and we are the dreamers of dreams.",
    poster: null,
  },
];

// Quick perceived-luminance check: returns '#0f172a' (slate-900) for light
// colors and '#ffffff' for dark ones. Use for any text painted on top of a
// theme-supplied color (CTA tiles, selected pills, etc.) so we don't end up
// with white-on-pastel or black-on-navy.
export const textOnColor = (hex) => {
  if (!hex || typeof hex !== "string") return "#ffffff";
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#ffffff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0f172a" : "#ffffff";
};

// Lookup: how does a theme actually *look* right now?
// Used by screens to decide whether the base surface should be light or dark,
// and which poster color to paint behind the UI.
export const resolveThemeAppearance = (theme, hour) => {
  if (!theme) {
    return { base: "light", posterColor: null, accent: null };
  }

  if (theme.category === "light") {
    return {
      base: "light",
      posterColor: theme.posterColor,
      accent: theme.accent,
    };
  }

  if (theme.category === "dark") {
    return {
      base: "dark",
      posterColor: theme.posterColor,
      accent: theme.accent,
    };
  }

  // Adaptive: 6 AM – 6:59 PM is "day", everything else is "night".
  const h = typeof hour === "number" ? hour : new Date().getHours();
  const isDay = h >= 6 && h < 19;
  return {
    base: isDay ? "light" : "dark",
    posterColor: isDay ? theme.posterColor : theme.posterColorDark,
    accent: theme.accent,
  };
};

/**
 * One-shot bundle of class strings + colors that every themed screen can
 * consume to render consistent headers, cards, inputs, pills, and text.
 *
 * Pass `null` / `undefined` to get the plain light-mode defaults used when
 * Manifesto Mode is disabled — so this helper is safe to wire through
 * every screen without branching at every callsite.
 */
export const getThemeSurfaces = (theme) => {
  const appearance = theme ? resolveThemeAppearance(theme) : null;
  const isDark = appearance?.base === "dark";
  const accent = appearance?.accent ?? "#0f172a";
  const posterColor = appearance?.posterColor ?? null;
  const posterImage = theme?.poster ?? null;
  const hasPosterImage = !!posterImage;
  const posterOpacity =
    theme?.posterWashOpacity ?? (isDark ? 0.28 : hasPosterImage ? 0.32 : 0.22);
  const posterImageOpacity = hasPosterImage
    ? theme?.posterImageOpacity ?? 0.5
    : 0;

  if (!theme) {
    return {
      theme: null,
      isThemed: false,
      isDark: false,
      accent: "#0f172a",
      posterColor: null,
      posterImage: null,
      posterOpacity: 0,
      posterImageOpacity: 0,
      rootBg: "bg-white",
      headerBorder: "border-b border-slate-100",
      titleText: "text-slate-900",
      mutedText: "text-slate-500",
      subtleText: "text-slate-400",
      cardBg: "bg-slate-50 border border-slate-200",
      subCardBg: "bg-white",
      pillBg: "bg-slate-100",
      pillText: "text-slate-700",
      inputBg: "bg-slate-50 border border-slate-200 text-slate-900",
      placeholderColor: "#94a3b8",
      secondaryBtnBg: "bg-slate-100",
      secondaryBtnText: "text-slate-900",
      dividerColor: "#e2e8f0",
    };
  }

  return {
    theme,
    isThemed: true,
    isDark,
    accent,
    posterColor,
    posterImage,
    posterOpacity,
    posterImageOpacity,
    rootBg: isDark ? "bg-black" : "bg-white",
    headerBorder: isDark
      ? "border-b border-white/10"
      : "border-b border-slate-200/60",
    titleText: isDark ? "text-white" : "text-slate-900",
    mutedText: isDark ? "text-slate-300" : "text-slate-600",
    subtleText: isDark ? "text-slate-400" : "text-slate-500",
    cardBg: isDark
      ? "bg-white/10 border border-white/15"
      : "bg-white/70 border border-slate-200",
    subCardBg: isDark ? "bg-white/5" : "bg-white/80",
    pillBg: isDark ? "bg-white/15" : "bg-slate-100",
    pillText: isDark ? "text-white" : "text-slate-700",
    inputBg: isDark
      ? "bg-white/10 border border-white/20 text-white"
      : "bg-white/80 border border-slate-200 text-slate-900",
    placeholderColor: isDark ? "#94a3b8" : "#94a3b8",
    secondaryBtnBg: isDark ? "bg-white/15" : "bg-slate-100",
    secondaryBtnText: isDark ? "text-white" : "text-slate-900",
    dividerColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
  };
};

// Convenience: themes grouped the same way we show them in the picker.
export const THEME_GROUPS = [
  {
    id: "light",
    label: "Daytime Driving",
    themes: MANIFESTO_THEMES.filter((t) => t.category === "light"),
  },
  {
    id: "dark",
    label: "Overnight Driving",
    themes: MANIFESTO_THEMES.filter((t) => t.category === "dark"),
  },
  {
    id: "adaptive",
    label: "Adaptive · Shifts Day → Night",
    themes: MANIFESTO_THEMES.filter((t) => t.category === "adaptive"),
  },
];

export const getNextTheme = (current) => {
  if (!current) return MANIFESTO_THEMES[0];
  const idx = MANIFESTO_THEMES.findIndex((t) => t.id === current.id);
  const next = (idx + 1) % MANIFESTO_THEMES.length;
  return MANIFESTO_THEMES[next];
};
