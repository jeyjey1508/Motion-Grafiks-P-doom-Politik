import React from "react";
import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, RADIUS, SAFE, SHADOW, TYPE, springIn } from "../theme";

export type LowerThirdProps = {
  readonly name: string;
  readonly role: string;
  /** Wird Zeichen für Zeichen getippt, z. B. "10–20 %" */
  readonly pDoom: string;
  /** Frames pro getipptem Zeichen */
  readonly typeSpeed?: number;
};

/**
 * Bauchbinde mit Name, Funktion und getipptem P(doom)-Wert.
 * Gleitet weich von links herein und am Ende der umgebenden Sequenz
 * wieder hinaus. Die Länge der Sequenz bestimmt die Standzeit.
 */
export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  role,
  pDoom,
  typeSpeed = 3,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = springIn({ frame, fps });
  // Ausfahrt endet exakt mit der Sequenz.
  const exit = springIn({
    frame,
    fps,
    delay: durationInFrames - 20,
    durationInFrames: 20,
  });
  const presence = enter - exit;

  const roleIn = springIn({ frame, fps, delay: 6 });
  const badgeIn = springIn({ frame, fps, delay: 12 });

  const typeStart = 20;
  const typedChars = Math.max(
    0,
    Math.min(pDoom.length, Math.floor((frame - typeStart) / typeSpeed) + 1),
  );
  const typed = frame < typeStart ? "" : pDoom.slice(0, typedChars);
  const typingDone = typedChars >= pDoom.length && frame >= typeStart;
  const cursorVisible = !typingDone || Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.x,
        bottom: SAFE.y,
        display: "flex",
        alignItems: "stretch",
        fontFamily: FONT.sans,
        color: COLORS.ink,
        opacity: presence,
        translate: `${interpolate(presence, [0, 1], [-80, 0])}px 0px`,
      }}
    >
      <div
        style={{
          width: 8,
          borderRadius: RADIUS.pill,
          backgroundColor: COLORS.accent,
          marginRight: 20,
          scale: `1 ${interpolate(enter, [0, 1], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })}`,
          transformOrigin: "bottom",
        }}
      />
      <div
        style={{
          padding: "28px 40px 30px",
          borderRadius: RADIUS.card,
          backgroundColor: "rgba(20, 25, 35, 0.88)",
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOW.card,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: TYPE.label,
              fontWeight: 500,
              color: COLORS.inkSecondary,
              opacity: roleIn,
              translate: `0px ${interpolate(roleIn, [0, 1], [10, 0])}px`,
            }}
          >
            {role}
          </div>
        </div>
        <div
          style={{
            alignSelf: "stretch",
            width: 1,
            backgroundColor: COLORS.borderStrong,
            opacity: badgeIn,
          }}
        />
        <div
          style={{
            opacity: badgeIn,
            translate: `${interpolate(badgeIn, [0, 1], [20, 0])}px 0px`,
          }}
        >
          <div
            style={{
              fontSize: TYPE.meta,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: COLORS.inkSecondary,
            }}
          >
            P(doom)
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: FONT.mono,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              color: COLORS.ink,
              whiteSpace: "pre",
              // Platz für den vollständigen Wert reservieren, damit die Box
              // beim Tippen nicht wächst.
              minWidth: `${pDoom.length + 1}ch`,
            }}
          >
            {typed}
            <span
              style={{
                display: "inline-block",
                width: "0.08em",
                height: "0.9em",
                marginLeft: "0.06em",
                translate: "0px 0.12em",
                backgroundColor: COLORS.accent,
                opacity: cursorVisible ? 1 : 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
