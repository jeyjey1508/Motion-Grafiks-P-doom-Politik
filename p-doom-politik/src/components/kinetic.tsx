import { Audio } from "@remotion/media";
import React from "react";
import {
  Easing,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type SpringConfig,
} from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";

/* ------------------------------------------------------------------ Hooks */

/** Feder 0 → 1 ab Frame `at` (relativ zur aktuellen Sequenz). */
export const useSpringAt = (
  at: number,
  config: Partial<SpringConfig> = SPRINGS.punch,
  durationInFrames?: number,
): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config, durationInFrames });
};

/** Linearer Fortschritt 0 → 1 zwischen zwei Frames, weich ausgeglichen. */
export const useProgress = (
  from: number,
  to: number,
  easing: (t: number) => number = Easing.bezier(0.33, 0, 0.2, 1),
): number => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};

/** Kurzes, abklingendes Wackeln nach einem Aufprall. */
export const useShake = (at: number, intensity = 14, length = 16): string => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0 || f > length) {
    return "0px 0px";
  }
  const amp = intensity * Math.exp(-f / 4.5);
  return `${(amp * Math.sin(f * 2.3)).toFixed(2)}px ${(amp * Math.cos(f * 1.7)).toFixed(2)}px`;
};

/** Langsamer Kamera-Zoom über die ganze Szene. */
export const useCameraPush = (amount = 0.06): number => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [1, 1 + amount]);
};

/* ------------------------------------------------------------------- Beat */

export type Enter = "slam" | "rise" | "pop" | "fade" | "left" | "right" | "drop";
export type Exit = "fade" | "up" | "shrink" | "down";

const ENTER_SPRING: Record<Enter, Partial<SpringConfig>> = {
  slam: SPRINGS.punch,
  rise: SPRINGS.smooth,
  pop: SPRINGS.pop,
  fade: SPRINGS.smooth,
  left: SPRINGS.punch,
  right: SPRINGS.punch,
  drop: SPRINGS.pop,
};

/**
 * Ein Element, das zu einem Zeitpunkt auftritt (und optional wieder geht).
 * Alle Szenen bauen ihre Typografie aus diesen "Beats".
 */
export const Beat: React.FC<{
  readonly at: number;
  readonly out?: number;
  readonly enter?: Enter;
  readonly exit?: Exit;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}> = ({ at, out, enter = "rise", exit = "fade", style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: ENTER_SPRING[enter] });
  const q =
    out === undefined
      ? 0
      : interpolate(frame, [out, out + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.5, 0, 0.75, 0),
        });

  if (frame < at - 1 || q >= 1) {
    return <div style={{ ...style, opacity: 0 }}>{children}</div>;
  }

  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let rotate = 0;
  switch (enter) {
    case "slam":
      scale = interpolate(p, [0, 1], [1.8, 1]);
      rotate = interpolate(p, [0, 1], [-5, 0]);
      break;
    case "rise":
      translateY = interpolate(p, [0, 1], [70, 0]);
      break;
    case "pop":
      scale = interpolate(p, [0, 1], [0.2, 1]);
      break;
    case "left":
      translateX = interpolate(p, [0, 1], [-160, 0]);
      break;
    case "right":
      translateX = interpolate(p, [0, 1], [160, 0]);
      break;
    case "drop":
      translateY = interpolate(p, [0, 1], [-140, 0]);
      break;
    case "fade":
      break;
  }
  switch (exit) {
    case "up":
      translateY -= q * 70;
      break;
    case "down":
      translateY += q * 70;
      break;
    case "shrink":
      scale *= 1 - q * 0.25;
      break;
    case "fade":
      break;
  }

  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, p * 1.4) * (1 - q),
        translate: `${translateX}px ${translateY}px`,
        scale: String(scale),
        rotate: `${rotate}deg`,
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------ Typografie */

/** Schlagwort in der Display-Schrift. */
export const Headline: React.FC<{
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly style?: React.CSSProperties;
}> = ({ children, size = 160, color = COLORS.ink, style }) => (
  <div
    style={{
      fontFamily: FONT.display,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: "0.005em",
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Kleine Dachzeile über einem Schlagwort. */
export const Kicker: React.FC<{
  readonly children: React.ReactNode;
  readonly color?: string;
  readonly style?: React.CSSProperties;
}> = ({ children, color = COLORS.inkSoft, style }) => (
  <div
    style={{
      fontFamily: FONT.sans,
      fontSize: 34,
      fontWeight: 800,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Farbig hinterlegter Textblock (Marker-Optik). */
export const Tag: React.FC<{
  readonly children: React.ReactNode;
  readonly bg: string;
  readonly color?: string;
  readonly size?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, bg, color = COLORS.bg, size = 44, style }) => (
  <span
    style={{
      display: "inline-block",
      padding: `${size * 0.18}px ${size * 0.42}px`,
      borderRadius: size * 0.22,
      backgroundColor: bg,
      color,
      fontFamily: FONT.sans,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.1,
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/* ---------------------------------------------------------------- Zahlen */

/** Zählt eine Zahl zwischen zwei Frames hoch (deutsches Zahlenformat). */
export const CountUp: React.FC<{
  readonly at: number;
  readonly duration: number;
  readonly from?: number;
  readonly to: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly style?: React.CSSProperties;
}> = ({ at, duration, from = 0, to, prefix = "", suffix = "", style }) => {
  const frame = useCurrentFrame();
  const value = interpolate(frame, [at, at + duration], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {Math.round(value).toLocaleString("de-DE")}
      {suffix}
    </span>
  );
};

/** Einarmiger-Bandit-Zähler: wirbelnde Ziffern, bis `stopAt` erreicht ist. */
export const SlotNumber: React.FC<{
  readonly stopAt: number;
  readonly final: string;
  readonly seed: string;
  readonly digits?: number;
  readonly style?: React.CSSProperties;
}> = ({ stopAt, final, seed, digits = 2, style }) => {
  const frame = useCurrentFrame();
  if (frame >= stopAt) {
    return <span style={style}>{final}</span>;
  }
  const step = Math.floor(frame / 2);
  const value = Math.floor(random(`${seed}-${step}`) * 10 ** digits);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {String(value).padStart(digits, "0")}
    </span>
  );
};

/* ----------------------------------------------------------------- Linien */

/** Gerade Linie, die sich zwischen zwei Frames selbst zeichnet. */
export const DrawLine: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly color: string;
  readonly width?: number;
}> = ({ from, to, x1, y1, x2, y2, color, width = 12 }) => {
  const p = useProgress(from, to);
  const length = Math.hypot(x2 - x1, y2 - y1);
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={length}
      strokeDashoffset={length * (1 - p)}
    />
  );
};

/* -------------------------------------------------------------------- SFX */

export type SfxName =
  | "whoosh"
  | "whoosh-soft"
  | "pop"
  | "pop-low"
  | "impact"
  | "stamp"
  | "counter"
  | "riser"
  | "ding"
  | "glitch";

const SFX_FRAMES: Record<SfxName, number> = {
  whoosh: 24,
  "whoosh-soft": 16,
  pop: 6,
  "pop-low": 6,
  impact: 56,
  stamp: 15,
  counter: 44,
  riser: 74,
  ding: 68,
  glitch: 16,
};

const SFX_VOLUME: Record<SfxName, number> = {
  whoosh: 0.32,
  "whoosh-soft": 0.3,
  pop: 0.42,
  "pop-low": 0.45,
  impact: 0.5,
  stamp: 0.5,
  counter: 0.32,
  riser: 0.32,
  ding: 0.36,
  glitch: 0.34,
};

/** Soundeffekt ab Frame `at` (relativ zur Szene). */
export const Sfx: React.FC<{
  readonly name: SfxName;
  readonly at: number;
  readonly volume?: number;
}> = ({ name, at, volume }) => (
  <Sequence
    name={`SFX ${name}`}
    from={Math.max(0, Math.round(at))}
    durationInFrames={SFX_FRAMES[name]}
    layout="none"
  >
    <Audio
      src={staticFile(`audio/sfx/${name}.wav`)}
      volume={volume ?? SFX_VOLUME[name]}
    />
  </Sequence>
);
