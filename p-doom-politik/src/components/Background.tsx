import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

/**
 * Ruhiger, dunkler Hintergrund: feines Raster, ein sehr langsam
 * wandernder Lichtschein und eine Vignette. Läuft über das ganze Video.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground }}>
      <AbsoluteFill
        style={{
          backgroundImage: [
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "80px 80px",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${interpolate(
            frame,
            [0, durationInFrames],
            [30, 70],
          )}% ${interpolate(frame, [0, durationInFrames], [35, 55])}%, rgba(224, 96, 46, 0.10), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(1200px 900px at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
