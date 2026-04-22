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
// If you later drop real poster images into mobile-app/assets, add a
// `poster: require('../../assets/xyz.png')` field and the Image layer in the
// screens will pick it up automatically.

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
    accent: "#f8fafc", // Soft White
    tagline: "What, like it's hard?",
    poster: null,
  },
  {
    id: "clueless",
    name: "Clueless",
    category: "light",
    posterColor: "#fde047", // Yellow Plaid
    accent: "#fbcfe8", // Feather Pink
    tagline: "As if!",
    poster: null,
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
    id: "devil-wears-prada",
    name: "The Devil Wears Prada",
    category: "light",
    posterColor: "#9ca3af", // Stark Grey
    accent: "#0ea5e9", // Cerulean Blue
    tagline: "Florals? For spring? Groundbreaking.",
    poster: null,
  },

  // ─── Dark Mode Themes (Overnight Driving) ───────────────────────────────
  {
    id: "harry-potter-slytherin",
    name: "Harry Potter · Slytherin",
    category: "dark",
    posterColor: "#064e3b", // Deep Emerald
    accent: "#22c55e", // Venom Green
    tagline: "Cunning folk use any means…",
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
    accent: "#f8fafc", // Starfield White
    tagline: "Future me, past me, road me.",
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
    id: "la-la-land-sunset",
    name: "La La Land · Sunset",
    category: "dark",
    posterColor: "#f97316", // Peach / Coral
    accent: "#8b5cf6", // Twilight Purple
    tagline: "Here's to the ones who dream.",
    poster: null,
  },

  // ─── Interchangeable Themes (Adaptive Logic) ────────────────────────────
  {
    id: "spongebob",
    name: "SpongeBob SquarePants",
    category: "adaptive",
    posterColor: "#fde68a", // Sandy Yellow (day)
    posterColorDark: "#1e3a8a", // Deep Sea Blue (night)
    accent: "#ef4444", // SpongeBob tie red
    tagline: "I'm ready! I'm ready! I'm ready!",
    poster: null,
  },
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
