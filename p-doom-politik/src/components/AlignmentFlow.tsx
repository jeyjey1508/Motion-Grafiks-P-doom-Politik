import React from "react";
import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, RADIUS, SHADOW, TYPE, springIn } from "../theme";
import { SceneFrame } from "./SceneFrame";

export type AlignmentStep = {
  readonly title: string;
  readonly text: string;
  readonly example: string;
  readonly color: string;
};

export const DEFAULT_STEPS: readonly AlignmentStep[] = [
  {
    title: "Ziel",
    text: "Die KI bekommt eine Aufgabe und optimiert genau das, was wir vorgeben.",
    example: "„Hol mir einen Kaffee.“",
    color: COLORS.info,
  },
  {
    title: "Instrumentelle Konvergenz",
    text: "Fast jedes Ziel führt zu denselben Teilzielen: Ressourcen sichern, Abschalten verhindern.",
    example: "„Abgeschaltet kann ich keinen Kaffee holen.“",
    color: COLORS.info,
  },
  {
    title: "Täuschung",
    text: "Erkennt das System Kontrolle als Hindernis, könnte es sich in Tests nur angepasst geben.",
    example: "„Im Test brav, im Einsatz anders.“",
    color: COLORS.accent,
  },
];

type Props = {
  readonly steps?: readonly AlignmentStep[];
  readonly kicker?: string;
  readonly title?: string;
  readonly takeaway?: string;
  /** Abstand zwischen den Schritten in Frames */
  readonly stepGap?: number;
};

const CARD_W = 470;
const CARD_H = 600;
const GAP = 135;

/**
 * Schrittweises Schaubild: Ziel → Instrumentelle Konvergenz → Täuschung.
 * Jeder Pfeil wird gezeichnet, bevor die nächste Karte erscheint, damit
 * die Ursache-Wirkungs-Kette lesbar bleibt.
 */
export const AlignmentFlow: React.FC<Props> = ({
  steps = DEFAULT_STEPS,
  kicker = "Das Alignment-Problem",
  title = "Wie aus einem harmlosen Ziel ein Risiko werden kann",
  takeaway = "Das Problem ist kein böser Wille, sondern ein ungenau festgelegtes Ziel.",
  stepGap = 32,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const firstDelay = 8;
  const lastDelay = firstDelay + (steps.length - 1) * stepGap;
  const takeawayIn = springIn({ frame, fps, delay: lastDelay + 30 });

  return (
    <SceneFrame kicker={kicker} title={title}>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: GAP,
          marginTop: 12,
          fontFamily: FONT.sans,
        }}
      >
        {steps.map((step, i) => {
          const delay = firstDelay + i * stepGap;
          const enter = springIn({ frame, fps, delay });
          const exampleIn = springIn({ frame, fps, delay: delay + 10 });

          // Pfeil zur nächsten Karte, gezeichnet kurz vor deren Einblendung
          const arrowProgress = interpolate(
            frame,
            [delay + stepGap - 18, delay + stepGap - 2],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.33, 0, 0.2, 1),
            },
          );
          const arrowLen = GAP - 32;

          return (
            <div
              key={step.title}
              style={{ position: "relative", width: CARD_W, height: CARD_H }}
            >
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  boxSizing: "border-box",
                  padding: "40px 40px 44px",
                  borderRadius: RADIUS.card,
                  backgroundColor: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: SHADOW.card,
                  display: "flex",
                  flexDirection: "column",
                  opacity: enter,
                  translate: `0px ${interpolate(enter, [0, 1], [48, 0])}px`,
                  scale: String(interpolate(enter, [0, 1], [0.96, 1])),
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    backgroundColor: step.color,
                  }}
                />
                <div
                  style={{
                    width: 64,
                    height: 64,
                    flexShrink: 0,
                    borderRadius: RADIUS.pill,
                    backgroundColor: step.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT.mono,
                    fontSize: 34,
                    fontWeight: 700,
                    color: COLORS.ground,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    marginTop: 28,
                    fontSize: 46,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    color: COLORS.ink,
                    minHeight: 102,
                    flexShrink: 0,
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    fontSize: 32,
                    lineHeight: 1.38,
                    flexShrink: 0,
                    color: COLORS.inkSecondary,
                  }}
                >
                  {step.text}
                </div>
                <div
                  style={{
                    marginTop: "auto",
                    flexShrink: 0,
                    paddingTop: 20,
                    borderTop: `1px solid ${COLORS.border}`,
                    fontSize: 32,
                    lineHeight: 1.3,
                    color: COLORS.ink,
                    opacity: exampleIn,
                    translate: `0px ${interpolate(exampleIn, [0, 1], [12, 0])}px`,
                  }}
                >
                  {step.example}
                </div>
              </div>

              {i < steps.length - 1 ? (
                <svg
                  width={arrowLen}
                  height={40}
                  viewBox={`0 0 ${arrowLen} 40`}
                  style={{
                    position: "absolute",
                    left: CARD_W + 16,
                    top: CARD_H / 2 - 20,
                    overflow: "visible",
                  }}
                >
                  <line
                    x1={0}
                    y1={20}
                    x2={arrowLen - 6}
                    y2={20}
                    stroke={COLORS.inkSecondary}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray={arrowLen}
                    strokeDashoffset={arrowLen * (1 - arrowProgress)}
                  />
                  <path
                    d={`M ${arrowLen - 22} 6 L ${arrowLen - 4} 20 L ${arrowLen - 22} 34`}
                    fill="none"
                    stroke={COLORS.inkSecondary}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={interpolate(arrowProgress, [0.7, 1], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })}
                  />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 36,
          fontSize: TYPE.body,
          fontWeight: 600,
          color: COLORS.ink,
          opacity: takeawayIn,
          translate: `0px ${interpolate(takeawayIn, [0, 1], [16, 0])}px`,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.accent,
          }}
        />
        {takeaway}
      </div>
    </SceneFrame>
  );
};
