import { loadFont } from "@remotion/fonts";
import { staticFile, type SpringConfig } from "remotion";

/*
 * Design-Tokens: Erklär-Clip-Look (flach, satt, dunkles Nachtblau).
 * Schriften liegen lokal in public/fonts/ (SIL Open Font License),
 * damit Vorschau und Rendering auch ohne Internet funktionieren.
 */
loadFont({
  family: "Anton",
  url: staticFile("fonts/Anton-Regular-latin.woff2"),
  weight: "400",
});

loadFont({
  family: "Inter",
  url: staticFile("fonts/Inter-Variable-latin.woff2"),
  weight: "100 900",
});

loadFont({
  family: "JetBrains Mono",
  url: staticFile("fonts/JetBrainsMono-Variable-latin.woff2"),
  weight: "100 800",
});

export const FONT = {
  /** Schlagworte: schmal, fett, immer in Großbuchstaben */
  display: "Anton, Impact, sans-serif",
  sans: "Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const COLORS = {
  bg: "#0B0F1E",
  bgRaised: "#141A33",
  panel: "#1B2244",
  line: "rgba(255, 255, 255, 0.12)",
  ink: "#FFFFFF",
  inkSoft: "#C9CEE6",
  inkMuted: "#7F87A8",
  /** Untergang / Risiko */
  red: "#FF4B3E",
  orange: "#FF8A3D",
  yellow: "#FFD23F",
  /** Sicherheit / Entwarnung */
  green: "#2EE59D",
  blue: "#3D8BFF",
  violet: "#8F6BFF",
  /** EU-Blau für die Regulierungs-Szene */
  euBlue: "#1F4BD8",
} as const;

export const SHADOW = {
  card: "0 30px 80px rgba(0, 0, 0, 0.45), 0 8px 20px rgba(0, 0, 0, 0.35)",
  glow: (color: string, strength = 1) =>
    `0 0 ${40 * strength}px ${color}66, 0 0 ${120 * strength}px ${color}33`,
} as const;

/**
 * Federn. `smooth` ist stark gedämpft (kein Nachwippen), `punch` landet
 * schnell mit minimalem Überschwingen, `pop` federt sichtbar, aber kurz.
 */
export const SPRINGS = {
  smooth: { damping: 200, stiffness: 120, mass: 1 },
  punch: { damping: 22, stiffness: 220, mass: 0.9 },
  pop: { damping: 14, stiffness: 200, mass: 0.8 },
  needle: { damping: 16, stiffness: 90, mass: 1.1 },
} as const satisfies Record<string, Partial<SpringConfig>>;

export const WIDTH = 1920;
export const HEIGHT = 1080;
