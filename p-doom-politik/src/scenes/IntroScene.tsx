import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MetricCard } from "../components/MetricCard";
import { SceneFrame } from "../components/SceneFrame";
import { COLORS, FONT, RADIUS, TYPE, SPRINGS, springIn } from "../theme";

/**
 * Intro: Titel, Definition und ein animierter Zähler, der die Spannweite
 * der Expertenschätzungen aufspannt (von unter 1 % bis über 90 %).
 */
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroIn = springIn({ frame, fps, delay: 0, config: SPRINGS.settle });
  const subIn = springIn({ frame, fps, delay: 10 });

  // Zähler: beide Werte starten bei 50 und laufen auseinander.
  const spread = springIn({
    frame,
    fps,
    delay: 54,
    durationInFrames: 50,
  });
  const low = Math.round(interpolate(spread, [0, 1], [50, 1]));
  const high = Math.round(interpolate(spread, [0, 1], [50, 90]));

  return (
    <SceneFrame>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          fontFamily: FONT.sans,
        }}
      >
        <div
          style={{
            fontSize: TYPE.meta,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.accent,
            opacity: subIn,
          }}
        >
          Politik & Künstliche Intelligenz
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: TYPE.hero,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: COLORS.ink,
            opacity: heroIn,
            translate: `0px ${interpolate(heroIn, [0, 1], [50, 0])}px`,
          }}
        >
          P(<span style={{ color: COLORS.accent }}>doom</span>)
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 52,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: COLORS.inkSecondary,
            opacity: subIn,
            translate: `0px ${interpolate(subIn, [0, 1], [20, 0])}px`,
          }}
        >
          Die Überlebenswahrscheinlichkeit im KI-Zeitalter
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 40,
            alignItems: "stretch",
          }}
        >
          <MetricCard
            kicker="Definition"
            value="Wie wahrscheinlich ist eine KI-Katastrophe?"
            description="P(doom) ist die persönliche Schätzung, dass fortgeschrittene KI die Menschheit auslöscht oder dauerhaft entmachtet."
            valueSize={52}
            delay={26}
            width={900}
          />
          <MetricCard
            kicker="Spannweite der Schätzungen"
            accent={COLORS.info}
            delay={40}
            width={740}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                fontFamily: FONT.mono,
                fontWeight: 700,
                fontSize: 104,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                color: COLORS.ink,
              }}
            >
              <span>
                <span style={{ fontSize: 64, color: COLORS.inkSecondary }}>
                  &lt;
                </span>
                {low}
                <span style={{ fontSize: 56 }}> %</span>
              </span>
              <span>
                <span style={{ fontSize: 64, color: COLORS.inkSecondary }}>
                  &gt;
                </span>
                {high}
                <span style={{ fontSize: 56 }}> %</span>
              </span>
            </div>
            {/* Skala 0–100 % mit aufspannendem Bereich */}
            <div
              style={{
                position: "relative",
                marginTop: 34,
                height: 20,
                borderRadius: RADIUS.pill,
                backgroundColor: COLORS.surfaceRaised,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -1,
                  bottom: -1,
                  left: `${low}%`,
                  width: `${Math.max(high - low, 0.5)}%`,
                  borderRadius: RADIUS.pill,
                  backgroundColor: COLORS.info,
                }}
              />
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONT.mono,
                fontSize: 26,
                color: COLORS.inkMuted,
              }}
            >
              <span>0 %</span>
              <span>50 %</span>
              <span>100 %</span>
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: TYPE.meta,
                color: COLORS.inkSecondary,
              }}
            >
              So weit liegen führende Forscher auseinander.
            </div>
          </MetricCard>
        </div>
      </div>
    </SceneFrame>
  );
};
