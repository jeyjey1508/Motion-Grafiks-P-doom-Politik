import React from "react";
import {
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, RADIUS, SHADOW, TYPE, springIn } from "../theme";
import { SceneFrame } from "./SceneFrame";

const PANEL_W = 790;

type Tier = {
  readonly label: string;
  readonly rule: string;
  readonly fill: string;
  readonly width: number;
};

const TIERS: readonly Tier[] = [
  {
    label: "Unannehmbar",
    rule: "verboten",
    fill: "rgba(224, 96, 46, 0.95)",
    width: 0.62,
  },
  {
    label: "Hohes Risiko",
    rule: "strenge Auflagen",
    fill: "rgba(224, 96, 46, 0.55)",
    width: 0.76,
  },
  {
    label: "Begrenztes Risiko",
    rule: "Transparenz",
    fill: "rgba(224, 96, 46, 0.30)",
    width: 0.89,
  },
  {
    label: "Minimales Risiko",
    rule: "keine Auflagen",
    fill: "rgba(255, 255, 255, 0.07)",
    width: 1,
  },
];

type Cell = {
  readonly usa: "bremst" | "rast";
  readonly china: "bremst" | "rast";
  readonly outcome: string;
  readonly tone: "safe" | "neutral" | "risk";
};

const CELLS: readonly Cell[] = [
  { usa: "bremst", china: "bremst", outcome: "Sicherer für alle", tone: "safe" },
  { usa: "bremst", china: "rast", outcome: "China im Vorteil", tone: "neutral" },
  { usa: "rast", china: "bremst", outcome: "USA im Vorteil", tone: "neutral" },
  { usa: "rast", china: "rast", outcome: "Wettlauf: höchstes Risiko", tone: "risk" },
];

const toneStyle = (tone: Cell["tone"]): React.CSSProperties => {
  if (tone === "safe") {
    return {
      backgroundColor: COLORS.safeSoft,
      border: `2px solid ${COLORS.safe}`,
    };
  }
  if (tone === "risk") {
    return {
      backgroundColor: COLORS.accentSoft,
      border: `2px solid ${COLORS.accent}`,
    };
  }
  return {
    backgroundColor: COLORS.surfaceRaised,
    border: `2px solid ${COLORS.border}`,
  };
};

const PanelHeader: React.FC<{
  readonly kicker: string;
  readonly title: string;
  readonly color: string;
}> = ({ kicker, title, color }) => (
  <div style={{ marginBottom: 28 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: TYPE.meta,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: COLORS.inkSecondary,
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: RADIUS.pill,
          backgroundColor: color,
        }}
      />
      {kicker}
    </div>
    <div
      style={{
        marginTop: 10,
        fontSize: 56,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: COLORS.ink,
      }}
    >
      {title}
    </div>
  </div>
);

/**
 * Gegenüberstellung: Regulierung (EU AI Act) vs. Gefangenendilemma
 * (USA vs. China). Links eine Risikopyramide, rechts eine 2×2-Matrix,
 * deren Gleichgewicht zum Schluss hervorgehoben wird.
 */
export const SplitScreen: React.FC<{
  readonly kicker?: string;
  readonly title?: string;
}> = ({
  kicker = "Politik & Steuerung",
  title = "Regeln setzen – oder um die Wette rennen?",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const divider = interpolate(frame, [4, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const leftIn = springIn({ frame, fps, delay: 6 });
  const rightIn = springIn({ frame, fps, delay: 14 });
  const factsIn = springIn({ frame, fps, delay: 48 });
  const equilibriumIn = springIn({ frame, fps, delay: 78 });
  const captionIn = springIn({ frame, fps, delay: 92 });

  // Ruhiges Pulsieren des Gleichgewichts in der Standphase
  const pulse =
    frame > 78 ? 0.5 + 0.5 * Math.sin(((frame - 78) / fps) * Math.PI * 1.2) : 0;

  return (
    <SceneFrame kicker={kicker} title={title}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: FONT.sans,
          position: "relative",
        }}
      >
        {/* Linke Seite: EU AI Act */}
        <div
          style={{
            width: PANEL_W,
            opacity: leftIn,
            translate: `${interpolate(leftIn, [0, 1], [-60, 0])}px 0px`,
          }}
        >
          <PanelHeader
            kicker="Regulierung"
            title="EU AI Act"
            color={COLORS.info}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map((tier, i) => {
              const tierIn = springIn({ frame, fps, delay: 20 + i * 6 });
              return (
                <div
                  key={tier.label}
                  style={{
                    width: `${tier.width * 100}%`,
                    alignSelf: "center",
                    height: 74,
                    boxSizing: "border-box",
                    padding: "0 28px",
                    borderRadius: 14,
                    backgroundColor: tier.fill,
                    border: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 32,
                    color: COLORS.ink,
                    opacity: tierIn,
                    scale: `${interpolate(tierIn, [0, 1], [0.85, 1])} 1`,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{tier.label}</span>
                  <span style={{ color: COLORS.ink, opacity: 0.85 }}>
                    {tier.rule}
                  </span>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 28,
              padding: "22px 28px",
              borderRadius: 18,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: SHADOW.soft,
              fontSize: 30,
              lineHeight: 1.4,
              color: COLORS.inkSecondary,
              opacity: factsIn,
              translate: `0px ${interpolate(factsIn, [0, 1], [14, 0])}px`,
            }}
          >
            In Kraft seit August 2024 · Strafen bis{" "}
            <span style={{ color: COLORS.ink, fontWeight: 700 }}>
              35 Mio. € oder 7 %
            </span>{" "}
            des weltweiten Jahresumsatzes
          </div>
        </div>

        {/* Trennlinie */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 2,
            translate: "-1px 0px",
            backgroundColor: COLORS.borderStrong,
            scale: `1 ${divider}`,
            transformOrigin: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            translate: "-50% -50%",
            width: 72,
            height: 72,
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.ground,
            border: `2px solid ${COLORS.borderStrong}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.inkSecondary,
            opacity: divider,
          }}
        >
          vs.
        </div>

        {/* Rechte Seite: Gefangenendilemma */}
        <div
          style={{
            width: PANEL_W,
            opacity: rightIn,
            translate: `${interpolate(rightIn, [0, 1], [60, 0])}px 0px`,
          }}
        >
          <PanelHeader
            kicker="Gefangenendilemma"
            title="USA vs. China"
            color={COLORS.accent}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "170px 1fr 1fr",
              gridTemplateRows: "48px 132px 132px",
              gap: 12,
              fontSize: 30,
              color: COLORS.ink,
            }}
          >
            <div />
            <div style={headerCell}>China bremst</div>
            <div style={headerCell}>China rast</div>
            {(["bremst", "rast"] as const).map((usa) => (
              <React.Fragment key={usa}>
                <div style={{ ...headerCell, justifyContent: "flex-start" }}>
                  USA {usa}
                </div>
                {CELLS.filter((c) => c.usa === usa).map((cell) => {
                  const idx = CELLS.indexOf(cell);
                  const cellIn = springIn({ frame, fps, delay: 30 + idx * 6 });
                  const isEquilibrium = cell.tone === "risk";
                  return (
                    <div
                      key={`${cell.usa}-${cell.china}`}
                      style={{
                        position: "relative",
                        borderRadius: 18,
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        ...toneStyle(cell.tone),
                        opacity: cellIn,
                        scale: String(interpolate(cellIn, [0, 1], [0.92, 1])),
                        boxShadow: isEquilibrium
                          ? `0 0 0 ${interpolate(
                              equilibriumIn,
                              [0, 1],
                              [0, 6 + pulse * 4],
                            )}px rgba(224, 96, 46, ${0.25 + pulse * 0.15})`
                          : undefined,
                      }}
                    >
                      {cell.outcome}
                      {isEquilibrium ? (
                        <div
                          style={{
                            position: "absolute",
                            top: -18,
                            right: 16,
                            padding: "4px 14px",
                            borderRadius: RADIUS.pill,
                            backgroundColor: COLORS.accent,
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: COLORS.ground,
                            opacity: equilibriumIn,
                            translate: `0px ${interpolate(equilibriumIn, [0, 1], [8, 0])}px`,
                          }}
                        >
                          Gleichgewicht
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div
            style={{
              marginTop: 28,
              padding: "22px 28px",
              borderRadius: 18,
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: SHADOW.soft,
              fontSize: 30,
              lineHeight: 1.4,
              color: COLORS.inkSecondary,
              opacity: captionIn,
              translate: `0px ${interpolate(captionIn, [0, 1], [14, 0])}px`,
            }}
          >
            Wer allein bremst, fürchtet zurückzufallen –{" "}
            <span style={{ color: COLORS.ink, fontWeight: 700 }}>
              also rasen beide.
            </span>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
};

const headerCell: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 26,
  fontWeight: 600,
  letterSpacing: "0.04em",
  color: COLORS.inkSecondary,
};
