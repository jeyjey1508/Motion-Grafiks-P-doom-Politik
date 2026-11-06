import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneFrame } from "../components/SceneFrame";
import { COLORS, FONT, RADIUS, SHADOW, TYPE, springIn } from "../theme";

export const DEFAULT_QUESTIONS: readonly string[] = [
  "Würdet ihr in ein Flugzeug steigen, das mit 10 % Wahrscheinlichkeit abstürzt? Was folgt daraus für KI?",
  "Wer sollte über mächtige KI entscheiden: Unternehmen, Staaten oder internationale Gremien?",
  "Kann der EU AI Act wirken, wenn die USA und China um die Wette rennen?",
];

/**
 * Outro mit Diskussionsfragen für die Klasse.
 */
export const OutroScene: React.FC<{
  readonly questions?: readonly string[];
}> = ({ questions = DEFAULT_QUESTIONS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const closingIn = springIn({ frame, fps, delay: 18 + questions.length * 12 + 10 });

  return (
    <SceneFrame kicker="Zum Weiterdenken" title="Diskutiert in der Klasse">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          fontFamily: FONT.sans,
        }}
      >
        {questions.map((question, i) => {
          const enter = springIn({ frame, fps, delay: 14 + i * 12 });
          return (
            <div
              key={question}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                padding: "30px 44px",
                borderRadius: RADIUS.card,
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                boxShadow: SHADOW.card,
                opacity: enter,
                translate: `${interpolate(enter, [0, 1], [-48, 0])}px 0px`,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  flexShrink: 0,
                  borderRadius: RADIUS.pill,
                  backgroundColor: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT.mono,
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.ground,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontSize: 44,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  color: COLORS.ink,
                }}
              >
                {question}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: TYPE.label,
          color: COLORS.inkSecondary,
          opacity: closingIn,
          translate: `0px ${interpolate(closingIn, [0, 1], [12, 0])}px`,
        }}
      >
        P(doom) ist keine Messgröße, sondern eine Einschätzung. Begründet eure
        eigene.
      </div>
    </SceneFrame>
  );
};
