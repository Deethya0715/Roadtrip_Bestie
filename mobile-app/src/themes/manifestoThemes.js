// Curated list of movie "vibes" for Manifesto Mode.
// Keep `poster` optional — if you add real image assets later, point it at a
// require('...') so the conditional <Image> in App/PassengerHome picks it up.
export const MANIFESTO_THEMES = [
  {
    id: "mean-girls",
    name: "Mean Girls",
    accent: "#ec4899",
    tagline: "On Wednesdays we drive pink.",
    poster: null,
  },
  {
    id: "fast-furious",
    name: "Fast & Furious",
    accent: "#ef4444",
    tagline: "Family. Quarter mile at a time.",
    poster: null,
  },
  {
    id: "barbie",
    name: "Barbie",
    accent: "#f472b6",
    tagline: "Hi Barbie — let's cruise.",
    poster: null,
  },
  {
    id: "matrix",
    name: "The Matrix",
    accent: "#22c55e",
    tagline: "Red pill, blue pill, or road trip?",
    poster: null,
  },
  {
    id: "la-la-land",
    name: "La La Land",
    accent: "#60a5fa",
    tagline: "City of stars, open road.",
    poster: null,
  },
];

export const getNextTheme = (current) => {
  if (!current) return MANIFESTO_THEMES[0];
  const idx = MANIFESTO_THEMES.findIndex((t) => t.id === current.id);
  const next = (idx + 1) % MANIFESTO_THEMES.length;
  return MANIFESTO_THEMES[next];
};
