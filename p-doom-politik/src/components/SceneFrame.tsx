import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SAFE, TYPE, springIn } from "../theme";

type Props = {
  readonly children: React.ReactNode;
  /** Kleine Überzeile oben links, z. B. "Teil 2 · Expertenskala" */
  readonly kicker?: string;
  /** Szenentitel */
  readonly title?: string;
  /** Ein- und Ausblendung in Frames */
  readonly fade?: number;
};

/**
 * Gemeinsamer Rahmen jeder Szene: sicherer Rand, optionaler Titel und
 * eine ruhige Ein-/Ausblendung, damit die Szenen weich ineinander übergehen.
 */
export const SceneFrame: React.FC<Props> = ({
  children,
  kicker,
  title,
  fade = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, fade, durationInFrames - fade, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.33, 0, 0.2, 1),
    },
  );

  const titleIn = springIn({ frame, fps, delay: 2 });

  return (
    <AbsoluteFill
      style={{
        opacity,
        padding: `${SAFE.y}px ${SAFE.x}px`,
        fontFamily: FONT.sans,
        color: COLORS.ink,
      }}
    >
      {kicker || title ? (
        <div
          style={{
            opacity: titleIn,
            translate: `0px ${interpolate(titleIn, [0, 1], [24, 0])}px`,
            marginBottom: 48,
          }}
        >
          {kicker ? (
            <div
              style={{
                fontSize: TYPE.meta,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.accent,
                marginBottom: 14,
              }}
            >
              {kicker}
            </div>
          ) : null}
          {title ? (
            <div
              style={{
                fontSize: TYPE.title,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {title}
            </div>
          ) : null}
        </div>
      ) : null}
      <div style={{ position: "relative", flex: 1 }}>{children}</div>
    </AbsoluteFill>
  );
};
