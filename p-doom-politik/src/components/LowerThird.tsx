import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { Sfx, useSpringAt } from "./kinetic";

export type LowerThirdProps = {
  readonly name: string;
  readonly role: string;
  /** Wird Zeichen für Zeichen getippt, z. B. "10–20 %" */
  readonly pDoom: string;
  /** Frames pro getipptem Zeichen */
  readonly typeSpeed?: number;
};

/** Balken, der von links aufgezogen wird (Masken-Reveal). */
const Bar: React.FC<{
  readonly progress: number;
  readonly bg: string;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ progress, bg, children, style }) => (
  <div
    style={{
      display: "inline-block",
      clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
      backgroundColor: bg,
      boxShadow: SHADOW.card,
      ...style,
    }}
  >
    <div style={{ translate: `${(progress - 1) * 40}px 0px` }}>{children}</div>
  </div>
);

/**
 * Bauchbinde: Name, Funktion und ein getippter P(doom)-Wert in drei
 * Farbbalken. Ein- und Ausfahrt richten sich nach der umgebenden Sequenz.
 */
export const LowerThird: React.FC<LowerThirdProps> = ({ name, role, pDoom, typeSpeed = 3 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const exitAt = durationInFrames - 16;
  const exit = interpolate(frame, [exitAt, exitAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameIn = useSpringAt(0, SPRINGS.smooth, 18) - exit;
  const roleIn = useSpringAt(6, SPRINGS.smooth, 18) - exit;
  const badgeIn = useSpringAt(12, SPRINGS.smooth, 18) - exit;

  const typeStart = 24;
  const typed = frame < typeStart ? "" : pDoom.slice(0, Math.floor((frame - typeStart) / typeSpeed) + 1);
  const typingDone = typed.length >= pDoom.length;
  const cursorOn = !typingDone || Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        bottom: 100,
        display: "flex",
        alignItems: "flex-end",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
        <Bar progress={Math.max(0, nameIn)} bg={COLORS.ink} style={{ padding: "14px 30px 10px" }}>
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 72,
              lineHeight: 1,
              textTransform: "uppercase",
              color: COLORS.bg,
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
        </Bar>
        <Bar progress={Math.max(0, roleIn)} bg={COLORS.panel} style={{ padding: "12px 30px" }}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: 34,
              fontWeight: 800,
              color: COLORS.inkSoft,
              whiteSpace: "nowrap",
            }}
          >
            {role}
          </div>
        </Bar>
      </div>
      <Bar progress={Math.max(0, badgeIn)} bg={COLORS.red} style={{ padding: "14px 30px 16px" }}>
        <div
          style={{
            fontFamily: FONT.sans,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: COLORS.ink,
          }}
        >
          P(doom)
        </div>
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 84,
            lineHeight: 1,
            color: COLORS.ink,
            whiteSpace: "pre",
            minWidth: `${(pDoom.length + 1) * 0.5}em`,
          }}
        >
          {typed}
          <span style={{ opacity: cursorOn ? 1 : 0 }}>|</span>
        </div>
      </Bar>
      <Sfx name="whoosh-soft" at={0} />
      <Sfx name="pop" at={typeStart} volume={0.25} />
    </div>
  );
};
