import { loadFont } from "@remotion/fonts";
import { spring, staticFile, type SpringConfig } from "remotion";

/**
 * Design-Tokens für das gesamte Video.
 * Dark Mode, eine warme Akzentfarbe (Risiko) plus zwei kühle Nebenfarben.
 * Die drei Datenfarben wurden mit dem dataviz-Validator auf #141923
 * geprüft (Helligkeitsband, Farbenblindheit, Kontrast: alle bestanden).
 */

/*
 * Schriften liegen lokal in public/fonts/ (SIL Open Font License),
 * damit Vorschau und Rendering auch ohne Internet im Schulnetz funktionieren.
 * Beide Dateien sind variable Fonts und decken alle Schriftstärken ab.
 */
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
  sans: "Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

export const COLORS = {
  ground: "#0B0E14",
  surface: "#141923",
  surfaceRaised: "#1A2030",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.16)",
  ink: "#F2F4F8",
  inkSecondary: "#B4BCCB",
  inkMuted: "#7D879A",
  /** Risiko / P(doom) */
  accent: "#E0602E",
  accentSoft: "rgba(224, 96, 46, 0.16)",
  /** Information / neutral */
  info: "#3987E5",
  infoSoft: "rgba(57, 135, 229, 0.16)",
  /** Sicherheit / Kooperation */
  safe: "#199E70",
  safeSoft: "rgba(25, 158, 112, 0.16)",
} as const;

export const SHADOW = {
  card: [
    "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    "0 2px 6px rgba(0, 0, 0, 0.30)",
    "0 18px 40px rgba(0, 0, 0, 0.38)",
    "0 40px 90px rgba(0, 0, 0, 0.30)",
  ].join(", "),
  soft: "0 10px 30px rgba(0, 0, 0, 0.35)",
} as const;

export const RADIUS = {
  card: 28,
  pill: 999,
} as const;

/** Sichere Ränder für 1920 x 1080. */
export const SAFE = {
  x: 120,
  y: 100,
} as const;

/** Typografie-Skala für 1920 x 1080 (Unterricht / Beamer). */
export const TYPE = {
  hero: 168,
  headline: 92,
  title: 60,
  body: 40,
  label: 34,
  meta: 28,
} as const;

/**
 * Feder-Presets. Hohe Dämpfung = kein Nachwippen, ruhige Bewegung.
 * `settle` erlaubt eine kaum sichtbare Nachfederung für Hero-Elemente.
 */
export const SPRINGS = {
  smooth: { damping: 200, stiffness: 90, mass: 1 },
  settle: { damping: 28, stiffness: 110, mass: 1 },
} as const satisfies Record<string, Partial<SpringConfig>>;

/** Hilfsfunktion: Feder 0 → 1, startet bei `delay` (in Frames). */
export const springIn = ({
  frame,
  fps,
  delay = 0,
  config = SPRINGS.smooth,
  durationInFrames,
}: {
  frame: number;
  fps: number;
  delay?: number;
  config?: Partial<SpringConfig>;
  durationInFrames?: number;
}): number =>
  spring({
    frame: frame - delay,
    fps,
    config,
    durationInFrames,
  });
