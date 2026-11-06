import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT } from "../theme";

/**
 * Szenen-Hintergrund: Vollfarbe, langsam treibende Lichtpunkte, weicher
 * Lichtkegel und Vignette. Jede Szene bekommt ihren eigenen Farbton, damit
 * Übergänge als echte Bildwechsel lesbar sind.
 */
export const SceneShell: React.FC<{
  readonly seed: string;
  readonly bg?: string;
  readonly glow?: string;
  /** Kamerafahrt (Zoom) über die Szene, 0 = aus */
  readonly push?: number;
  readonly children: React.ReactNode;
}> = ({ seed, bg = COLORS.bg, glow = COLORS.blue, push = 0.04, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1 + push]);

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden", fontFamily: FONT.sans }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1100px 800px at 50% 40%, ${glow}2E, transparent 70%)`,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 46 }).map((_, i) => {
          const x = random(`${seed}-x-${i}`) * width;
          const y0 = random(`${seed}-y-${i}`) * height;
          const speed = 0.15 + random(`${seed}-s-${i}`) * 0.35;
          const y = (((y0 - frame * speed) % height) + height) % height;
          const r = 1.5 + random(`${seed}-r-${i}`) * 2.5;
          const twinkle =
            0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 18 + i * 1.7));
          return <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={twinkle} />;
        })}
      </svg>
      <AbsoluteFill style={{ scale: String(scale) }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1300px 900px at 50% 50%, transparent 60%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
