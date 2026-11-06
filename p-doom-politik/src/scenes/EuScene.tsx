import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../components/Background";
import { Cross, Gavel, Star } from "../components/Icons";
import { Beat, CountUp, Headline, Kicker, Sfx, Tag, useShake, useSpringAt } from "../components/kinetic";
import { MetricCard } from "../components/MetricCard";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const TIERS = [
  { label: "Verboten", color: COLORS.red, width: 380 },
  { label: "Hohes Risiko", color: COLORS.orange, width: 580 },
  { label: "Begrenztes Risiko", color: COLORS.yellow, width: 780 },
  { label: "Minimales Risiko", color: COLORS.green, width: 980 },
] as const;

/**
 * Regulierung: EU-Sternenkreis, "Ja.", AI Act seit August 2024,
 * Risikopyramide und Strafrahmen.
 */
export const EuScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r1 = cue(cues, "r1");
  const r2 = cue(cues, "r2");
  const r3 = cue(cues, "r3");
  const r4 = cue(cues, "r4");

  const jaAt = wordAt(r1, "Ja");
  const augustAt = wordAt(r2, "August");
  const actAt = wordAt(r2, "KI-Verordnung");
  const forbiddenAt = wordAt(r3, "verboten");
  const highAt = wordAt(r3, "Hochrisiko-Systeme");
  const fineAt = wordAt(r4, "fünfunddreißig");
  const gavelAt = wordAt(r4, "Strafe");

  const discIn = useSpringAt(r1.from - 4, SPRINGS.smooth);
  const toSide = useSpringAt(r2.from, SPRINGS.smooth);
  const pyramidOut = useSpringAt(r4.from - 2, SPRINGS.smooth);
  const forbidden = useSpringAt(forbiddenAt, SPRINGS.pop);
  const high = useSpringAt(highAt, SPRINGS.pop);
  const shake = useShake(forbiddenAt, 10);
  const gavelShake = useShake(gavelAt, 12);

  return (
    <SceneShell seed="eu" glow={COLORS.euBlue} bg="#0A1430">
      <AbsoluteFill style={{ translate: gavelShake }}>
        {/* Sternenkreis */}
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 540,
            translate: `${interpolate(toSide, [0, 1], [0, -560])}px 0px`,
            scale: String(interpolate(toSide, [0, 1], [1, 0.52])),
          }}
        >
          <svg width={760} height={760} viewBox="-380 -380 760 760" style={{ position: "absolute", left: -380, top: -380, overflow: "visible" }}>
            <circle r={330} fill={COLORS.euBlue} opacity={discIn} />
          </svg>
          {Array.from({ length: 12 }).map((_, i) => {
            const s = spring({ frame: frame - (r1.from - 4 + i * 2), fps, config: SPRINGS.punch });
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const tx = Math.cos(a) * 250;
            const ty = Math.sin(a) * 250;
            const sx = (random(`star-x-${i}`) - 0.5) * 1800;
            const sy = (random(`star-y-${i}`) - 0.5) * 1000;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: interpolate(s, [0, 1], [sx, tx]) - 30,
                  top: interpolate(s, [0, 1], [sy, ty]) - 30,
                  opacity: Math.min(1, s * 2),
                  rotate: `${(1 - s) * 180}deg`,
                }}
              >
                <Star size={60} />
              </div>
            );
          })}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              translate: "-50% -50%",
              opacity: 1 - toSide,
            }}
          >
            <Beat at={jaAt} enter="slam">
              <Headline size={250}>Ja.</Headline>
            </Beat>
          </div>
        </div>

        {/* AI Act seit August 2024 */}
        <AbsoluteFill style={{ left: 760, justifyContent: "center" }}>
          <Beat at={augustAt} out={r3.from - 2} exit="up">
            <Tag bg={COLORS.yellow} size={44}>
              Seit August 2024
            </Tag>
          </Beat>
          <Beat at={actAt} out={r3.from - 2} enter="slam" exit="up" style={{ marginTop: 20 }}>
            <Headline size={240}>EU AI Act</Headline>
          </Beat>
          <Beat at={actAt + 8} out={r3.from - 2} exit="up" style={{ marginTop: 10 }}>
            <Kicker>Europas KI-Verordnung</Kicker>
          </Beat>
        </AbsoluteFill>

        {/* Risikopyramide */}
        <div
          style={{
            position: "absolute",
            left: 1180,
            top: 250,
            translate: "-50% 0px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: 1 - pyramidOut,
            scale: String(1 - pyramidOut * 0.15),
          }}
        >
          <Beat at={r3.from} out={r4.from - 2} style={{ marginBottom: 14 }}>
            <Kicker color={COLORS.inkSoft}>KI nach Risiko sortiert</Kicker>
          </Beat>
          <div style={{ translate: shake, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {TIERS.map((tier, i) => {
              const at = r3.from + (TIERS.length - 1 - i) * 5 + 4;
              const isForbidden = i === 0;
              const isHigh = i === 1;
              const pulse = isForbidden ? forbidden : isHigh ? high : 0;
              return (
                <Beat key={tier.label} at={at} enter="drop">
                  <div
                    style={{
                      position: "relative",
                      width: tier.width,
                      height: 112,
                      borderRadius: 18,
                      backgroundColor: tier.color,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      scale: String(1 + pulse * 0.06 * (1 - Math.min(1, (frame - at) / 200))),
                      boxShadow: pulse > 0 ? `0 0 ${60 * pulse}px ${tier.color}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONT.display,
                        fontSize: 60,
                        textTransform: "uppercase",
                        color: COLORS.bg,
                      }}
                    >
                      {tier.label}
                    </span>
                    {isForbidden ? (
                      <div
                        style={{
                          position: "absolute",
                          right: -46,
                          top: 16,
                          opacity: Math.min(1, forbidden * 1.5),
                          scale: String(forbidden),
                        }}
                      >
                        <Cross size={80} />
                      </div>
                    ) : null}
                    {isHigh ? (
                      <div
                        style={{
                          position: "absolute",
                          left: tier.width + 22,
                          opacity: Math.min(1, high * 1.5),
                          translate: `${(1 - high) * 40}px 0px`,
                        }}
                      >
                        <Tag bg={COLORS.ink} size={25}>
                          Strenge Auflagen
                        </Tag>
                      </div>
                    ) : null}
                  </div>
                </Beat>
              );
            })}
          </div>
        </div>

        {/* Strafe */}
        <AbsoluteFill style={{ left: 760, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <MetricCard
              at={fineAt}
              kicker="Strafe bis zu"
              color={COLORS.yellow}
              valueSize={190}
              value={<CountUp at={fineAt} duration={34} to={35000000} suffix=" €" />}
              label="oder 7 % des weltweiten Jahresumsatzes"
            />
          </div>
        </AbsoluteFill>
        <Beat at={gavelAt - 2} enter="drop" style={{ position: "absolute", left: 1600, top: 170 }}>
          <Gavel size={220} />
        </Beat>
      </AbsoluteFill>

      <Sfx name="whoosh" at={r1.from - 6} />
      <Sfx name="ding" at={jaAt} />
      <Sfx name="whoosh-soft" at={r2.from} />
      <Sfx name="stamp" at={actAt} />
      {TIERS.map((tier, i) => (
        <Sfx key={tier.label} name="pop-low" at={r3.from + (TIERS.length - 1 - i) * 5 + 4} volume={0.3} />
      ))}
      <Sfx name="stamp" at={forbiddenAt} />
      <Sfx name="pop" at={highAt} />
      <Sfx name="counter" at={fineAt} />
      <Sfx name="impact" at={gavelAt} volume={0.4} />
    </SceneShell>
  );
};
