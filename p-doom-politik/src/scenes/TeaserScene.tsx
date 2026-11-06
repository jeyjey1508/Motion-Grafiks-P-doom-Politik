import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MetricCard } from "../components/MetricCard";
import { SceneFrame } from "../components/SceneFrame";
import { COLORS, FONT, RADIUS, SHADOW, SPRINGS, TYPE, springIn } from "../theme";

export type TeaserSceneProps = {
  /** z. B. "1/2" */
  readonly counter: string;
  readonly name: string;
  readonly role: string;
  /** Leitfrage, auf die die Klasse im Interview achten soll */
  readonly question: string;
};

/**
 * Teaser-Card vor einem Interview: wer spricht, und worauf die Klasse
 * achten soll.
 */
export const TeaserScene: React.FC<TeaserSceneProps> = ({
  counter,
  name,
  role,
  question,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const playIn = springIn({ frame, fps, delay: 4, config: SPRINGS.settle });

  return (
    <SceneFrame>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          fontFamily: FONT.sans,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          {/* Play-Symbol */}
          <div
            style={{
              width: 200,
              height: 200,
              flexShrink: 0,
              borderRadius: RADIUS.pill,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.borderStrong}`,
              boxShadow: SHADOW.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: playIn,
              scale: String(interpolate(playIn, [0, 1], [0.7, 1])),
            }}
          >
            <svg width={80} height={80} viewBox="0 0 80 80">
              <path
                d="M 26 16 L 66 40 L 26 64 Z"
                fill={COLORS.accent}
                stroke={COLORS.accent}
                strokeWidth={8}
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <MetricCard
            kicker={`Gleich im Interview · ${counter}`}
            value={name}
            description={role}
            valueSize={TYPE.headline}
            delay={8}
            width={1180}
          >
            <div
              style={{
                marginTop: 30,
                paddingTop: 26,
                borderTop: `1px solid ${COLORS.border}`,
                display: "flex",
                gap: 18,
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontSize: TYPE.meta,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: COLORS.accent,
                  whiteSpace: "nowrap",
                }}
              >
                Achtet auf
              </span>
              <span
                style={{
                  fontSize: TYPE.body,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: COLORS.ink,
                }}
              >
                {question}
              </span>
            </div>
          </MetricCard>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};
