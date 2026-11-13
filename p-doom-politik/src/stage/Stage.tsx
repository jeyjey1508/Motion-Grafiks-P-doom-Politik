import React, { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT } from "../theme";

/* ------------------------------------------------------------------ Kamera */

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

export type CamKey = {
  /** Frame relativ zur Szene */
  readonly at: number;
  /** Versatz der Bildmitte in Welt-Pixeln */
  readonly x?: number;
  readonly y?: number;
  readonly zoom?: number;
};

const EASE = Easing.bezier(0.45, 0, 0.15, 1);

/**
 * Kamerafahrt aus Keyframes. Zwischen zwei Keyframes wird weich
 * interpoliert; ein leichtes Atmen hält auch Standbilder lebendig.
 */
export const useCam = (keys: readonly CamKey[], breathe = 1): Cam => {
  const frame = useCurrentFrame();
  const sorted = [...keys].sort((a, b) => a.at - b.at);
  const full = sorted.map((k, i) => {
    const prev = sorted.slice(0, i + 1).reverse();
    return {
      at: k.at,
      x: prev.find((p) => p.x !== undefined)?.x ?? 0,
      y: prev.find((p) => p.y !== undefined)?.y ?? 0,
      zoom: prev.find((p) => p.zoom !== undefined)?.zoom ?? 1,
    };
  });
  let cam: Cam = full[0] ?? { x: 0, y: 0, zoom: 1 };
  for (let i = 0; i < full.length - 1; i++) {
    const a = full[i];
    const b = full[i + 1];
    if (frame >= a.at) {
      const t = interpolate(frame, [a.at, Math.max(a.at + 1, b.at)], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE,
      });
      cam = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        // Zoom multiplikativ interpolieren, damit Fahrten gleichmäßig wirken
        zoom: a.zoom * (b.zoom / a.zoom) ** t,
      };
    }
  }
  return {
    x: cam.x + Math.sin(frame / 70) * 5 * breathe,
    y: cam.y + Math.cos(frame / 90) * 4 * breathe,
    zoom: cam.zoom * (1 + Math.sin(frame / 110) * 0.004 * breathe),
  };
};

const CamContext = createContext<Cam>({ x: 0, y: 0, zoom: 1 });

/**
 * Ebene in der Welt. `depth` 1 folgt der Kamera voll, kleinere Werte liegen
 * weiter hinten (Parallax), größere im Vordergrund.
 */
export const Layer: React.FC<{
  readonly depth?: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ depth = 1, children, style }) => {
  const cam = useContext(CamContext);
  const zoom = 1 + (cam.zoom - 1) * depth;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "960px 540px",
        transform: `scale(${zoom}) translate(${-cam.x * depth}px, ${-cam.y * depth}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- Hintergrund */

export type Sky = {
  readonly top: string;
  readonly bottom: string;
  /** Farbe des großen Lichtscheins */
  readonly glow: string;
  /** Position des Lichtscheins in Prozent */
  readonly glowAt?: readonly [number, number];
  readonly stars?: number;
  /** Staub im Vordergrund */
  readonly dust?: number;
};

const Stars: React.FC<{ readonly seed: string; readonly count: number }> = ({ seed, count }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={2400} height={1400} style={{ position: "absolute", left: -240, top: -160 }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`${seed}-sx-${i}`) * 2400;
        const y = random(`${seed}-sy-${i}`) * 1400;
        const r = 0.8 + random(`${seed}-sr-${i}`) * 2.2;
        const tw = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(frame / (14 + (i % 9) * 3) + i * 2.1));
        return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={tw} />;
      })}
    </svg>
  );
};

const Dust: React.FC<{ readonly seed: string; readonly count: number }> = ({ seed, count }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const speed = 0.3 + random(`${seed}-ds-${i}`) * 0.7;
        const x = (random(`${seed}-dx-${i}`) * 2200 + frame * speed * 0.6) % 2200 - 140;
        const y0 = random(`${seed}-dy-${i}`) * 1080;
        const y = (((y0 - frame * speed) % 1180) + 1180) % 1180 - 50;
        const r = 2 + random(`${seed}-dr-${i}`) * 5;
        return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.05 + random(`${seed}-do-${i}`) * 0.1} />;
      })}
    </svg>
  );
};

/**
 * Bühne einer Szene: Himmel mit Verlauf, Lichtschein, Sterne (weit hinten),
 * Welt-Ebenen mit Parallax, Staub im Vordergrund und Vignette.
 */
export const Stage: React.FC<{
  readonly seed: string;
  readonly cam: Cam;
  readonly sky: Sky;
  readonly children: React.ReactNode;
}> = ({ seed, cam, sky, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [gx, gy] = sky.glowAt ?? [50, 42];
  const drift = interpolate(frame, [0, durationInFrames], [-3, 3]);

  return (
    <CamContext.Provider value={cam}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.bottom} 100%)`,
          overflow: "hidden",
          fontFamily: FONT.sans,
        }}
      >
        {sky.stars ? (
          <Layer depth={0.08}>
            <Stars seed={seed} count={sky.stars} />
          </Layer>
        ) : null}
        <Layer depth={0.15}>
          <AbsoluteFill
            style={{
              background: `radial-gradient(1200px 900px at ${gx + drift}% ${gy}%, ${sky.glow}40, transparent 70%)`,
            }}
          />
        </Layer>
        {children}
        {sky.dust ? (
          <Layer depth={1.5}>
            <Dust seed={seed} count={sky.dust} />
          </Layer>
        ) : null}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(1400px 950px at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>
    </CamContext.Provider>
  );
};

/** Weicher Lichtfleck (billig zu rendern: radialer Verlauf statt Blur). */
export const Glow: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly color: string;
  readonly opacity?: number;
}> = ({ x, y, r, color, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}AA 0%, ${color}33 35%, transparent 70%)`,
      opacity,
      pointerEvents: "none",
    }}
  />
);
