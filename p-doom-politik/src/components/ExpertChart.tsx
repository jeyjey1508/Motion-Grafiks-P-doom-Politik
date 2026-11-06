import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, RADIUS, TYPE, springIn } from "../theme";
import { SceneFrame } from "./SceneFrame";

export type ExpertPosition = {
  readonly name: string;
  readonly note: string;
  /** Untere Grenze der Aussage in Prozent */
  readonly min: number;
  /** Obere Grenze der Aussage in Prozent */
  readonly max: number;
  /** "above" = mehr als min, "range" = min bis max, "below" = weniger als max */
  readonly kind: "above" | "range" | "below";
};

export const DEFAULT_EXPERTS: readonly ExpertPosition[] = [
  {
    name: "Eliezer Yudkowsky",
    note: "KI-Sicherheitsforscher, MIRI",
    min: 90,
    max: 100,
    kind: "above",
  },
  {
    name: "Geoffrey Hinton / Sam Altman",
    note: "Nobelpreisträger · CEO von OpenAI",
    min: 10,
    max: 20,
    kind: "range",
  },
  {
    name: "Yann LeCun",
    note: "Turing-Preisträger, KI-Pionier",
    min: 0,
    max: 1,
    kind: "below",
  },
];

type Props = {
  readonly items?: readonly ExpertPosition[];
  readonly kicker?: string;
  readonly title?: string;
  readonly footnote?: string;
};

const LABEL_COL = 520;
const PLOT_W = 960;
const BAR_H = 48;
const ROW_H = 172;
const TICKS = [0, 25, 50, 75, 100];

const formatLabel = (item: ExpertPosition, progress: number): string => {
  if (item.kind === "above") {
    return `> ${Math.round(item.min * progress)} %`;
  }
  if (item.kind === "range") {
    return `${Math.round(item.min * progress)}–${Math.round(item.max * progress)} %`;
  }
  return `< ${item.max} %`;
};

/**
 * Horizontales Balkendiagramm der Expertenpositionen.
 * Eine Messgröße (P(doom)) → eine Farbe. Der schraffierte Abschnitt zeigt
 * die Spannweite bzw. die offene Grenze einer Aussage.
 */
export const ExpertChart: React.FC<Props> = ({
  items = DEFAULT_EXPERTS,
  kicker = "Expertenskala",
  title = "Wie hoch schätzen führende KI-Köpfe P(doom)?",
  footnote = "Vereinfachte Darstellung öffentlicher Aussagen (2023–2025). Persönliche Schätzungen, nicht direkt vergleichbar.",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const axisIn = springIn({ frame, fps, delay: 6 });
  const keyIn = springIn({ frame, fps, delay: 70 });

  const x = (value: number) => (value / 100) * PLOT_W;

  return (
    <SceneFrame kicker={kicker} title={title}>
      <div
        style={{
          position: "relative",
          marginTop: 24,
          fontFamily: FONT.sans,
        }}
      >
        {/* Raster und Achse */}
        <div
          style={{
            position: "absolute",
            left: LABEL_COL,
            top: 0,
            width: PLOT_W,
            height: ROW_H * items.length,
            opacity: axisIn,
          }}
        >
          {TICKS.map((tick) => (
            <div
              key={tick}
              style={{
                position: "absolute",
                left: x(tick),
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor:
                  tick === 0 ? COLORS.borderStrong : COLORS.border,
              }}
            />
          ))}
          {TICKS.map((tick) => (
            <div
              key={`label-${tick}`}
              style={{
                position: "absolute",
                left: x(tick),
                top: ROW_H * items.length + 16,
                translate: "-50% 0px",
                fontFamily: FONT.mono,
                fontSize: TYPE.meta,
                color: COLORS.inkMuted,
                whiteSpace: "nowrap",
              }}
            >
              {tick} %
            </div>
          ))}
        </div>

        {items.map((item, i) => {
          const delay = 18 + i * 12;
          const grow = springIn({ frame, fps, delay });
          const labelIn = springIn({ frame, fps, delay: delay + 6 });
          const solidEnd = item.kind === "below" ? 0 : item.min;
          const hatchStart = item.kind === "below" ? 0 : item.min;
          const hatchEnd = item.max;

          return (
            <div
              key={item.name}
              style={{
                position: "relative",
                height: ROW_H,
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Name und Funktion */}
              <div
                style={{
                  width: LABEL_COL - 40,
                  opacity: labelIn,
                  translate: `${interpolate(labelIn, [0, 1], [-24, 0])}px 0px`,
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                    color: COLORS.ink,
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: TYPE.meta,
                    color: COLORS.inkSecondary,
                  }}
                >
                  {item.note}
                </div>
              </div>

              {/* Balken */}
              <div
                style={{
                  position: "absolute",
                  left: LABEL_COL,
                  top: (ROW_H - BAR_H) / 2,
                  width: PLOT_W,
                  height: BAR_H,
                }}
              >
                {solidEnd > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: BAR_H,
                      width: x(solidEnd) * grow,
                      backgroundColor: COLORS.accent,
                      borderRadius:
                        hatchEnd > solidEnd ? 0 : `0 6px 6px 0`,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: "absolute",
                    left: x(hatchStart) * grow + (solidEnd > 0 ? 2 : 0),
                    top: 0,
                    height: BAR_H,
                    width: Math.max(
                      0,
                      x(hatchEnd - hatchStart) * grow - (solidEnd > 0 ? 2 : 0),
                    ),
                    minWidth: item.kind === "below" ? 6 * grow : undefined,
                    borderRadius: "0 6px 6px 0",
                    backgroundColor: COLORS.accentSoft,
                    backgroundImage: `repeating-linear-gradient(135deg, ${COLORS.accent} 0px, ${COLORS.accent} 4px, transparent 4px, transparent 12px)`,
                    // Schraffur wandert langsam: hält die Standphase lebendig
                    backgroundPosition: `${frame * 0.4}px 0px`,
                    boxShadow: `inset 0 0 0 2px ${COLORS.accent}`,
                    opacity: interpolate(grow, [0, 0.4, 1], [0, 0.6, 1]),
                  }}
                />
                {/* Wert an der Balkenspitze */}
                <div
                  style={{
                    position: "absolute",
                    left:
                      Math.max(x(hatchEnd) * grow, item.kind === "below" ? 6 : 0) +
                      24,
                    top: "50%",
                    translate: "0px -50%",
                    fontFamily: FONT.mono,
                    fontSize: 52,
                    fontWeight: 700,
                    color: COLORS.ink,
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    opacity: labelIn,
                  }}
                >
                  {formatLabel(item, grow)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Legende für die Schraffur und Quellenhinweis */}
        <div
          style={{
            marginTop: 72,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 40,
            rowGap: 14,
            opacity: keyIn,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 44,
                height: 22,
                borderRadius: RADIUS.pill,
                backgroundColor: COLORS.accentSoft,
                backgroundImage: `repeating-linear-gradient(135deg, ${COLORS.accent} 0px, ${COLORS.accent} 4px, transparent 4px, transparent 12px)`,
                boxShadow: `inset 0 0 0 2px ${COLORS.accent}`,
              }}
            />
            <span style={{ fontSize: TYPE.meta, color: COLORS.inkSecondary }}>
              Spannweite / offene Grenze
            </span>
          </div>
          <span style={{ fontSize: TYPE.meta, color: COLORS.inkMuted }}>
            {footnote}
          </span>
        </div>
      </div>
    </SceneFrame>
  );
};
