import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe } from "../art/Globe";
import { Cross, Gavel, Star } from "../components/Icons";
import { Beat, CountUp, Headline, Kicker, Letters, Marker, settle, Sfx, Tag, useShake, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const W = 1920;

/* Risikopyramide: vier Stufen, von oben (verboten) nach unten (minimal) */
const PYR = { cx: W + 1000, top: 250, tierH: 150, gap: 12, slope: 0.78 };
const TIERS = [
  { label: "Verboten", color: COLORS.red, example: "Social Scoring" },
  { label: "Hohes Risiko", color: COLORS.orange, example: "Bewerber-Auswahl" },
  { label: "Begrenztes Risiko", color: COLORS.yellow, example: "Chatbots" },
  { label: "Minimales Risiko", color: COLORS.green, example: "Spamfilter" },
] as const;

const tierGeom = (i: number) => {
  const y0 = PYR.top + i * (PYR.tierH + PYR.gap);
  const y1 = y0 + PYR.tierH;
  const half0 = 70 + (y0 - PYR.top) * PYR.slope;
  const half1 = 70 + (y1 - PYR.top) * PYR.slope;
  return { y0, y1, half0, half1 };
};

/**
 * Regulierung: Europa auf dem Globus, der AI Act, die Risikopyramide mit
 * Beispielen und der Strafrahmen.
 */
export const EuScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const r1 = cue(cues, "r1");
  const r2 = cue(cues, "r2");
  const r3 = cue(cues, "r3");
  const r4 = cue(cues, "r4");

  const europeAt = wordAt(r1, "Europa");
  const actAt = wordAt(r2, "AI");
  const riskAt = wordAt(r3, "Risiko");
  const forbiddenAt = wordAt(r3, "verboten");
  const highAt = wordAt(r3, "Hochrisiko-Systeme");
  const fineAt = wordAt(r4, "35");
  const sevenAt = wordAt(r4, "sieben");

  const cam = useCam([
    { at: 0, x: 60, y: 0, zoom: 1.08 },
    { at: europeAt + 10, x: 0, y: 0, zoom: 1 },
    { at: r2.from, x: 0, y: 0, zoom: 1.02 },
    { at: r3.from - 14, x: -20, y: 0, zoom: 1.05 },
    { at: r3.from + 14, x: W, y: 0, zoom: 1 },
    { at: r4.from - 14, x: W + 20, y: 0, zoom: 1.04 },
    { at: r4.from + 14, x: W * 2, y: 0, zoom: 1 },
    { at: durationInFrames, x: W * 2, y: 0, zoom: 1.06 },
  ]);

  const ring = useSpringAt(europeAt - 6, SPRINGS.smooth);
  const forbidden = useSpringAt(forbiddenAt, SPRINGS.pop);
  const high = useSpringAt(highAt, SPRINGS.pop);
  const pyrShake = useShake(forbiddenAt, 10);
  const gavelShake = useShake(fineAt + 2, 12);
  const gavelHit = useSpringAt(fineAt - 4, SPRINGS.punch);

  const GX = 1420;
  const GY = 560;

  return (
    <Stage seed="eu" cam={cam} sky={{ top: "#060D2E", bottom: "#0F1F5C", glow: COLORS.euBlue, glowAt: [60, 45], stars: 80, dust: 14 }}>
      <Layer depth={0.5}>
        <Glow x={GX - 200} y={GY} r={760} color={COLORS.euBlue} opacity={0.6} />
        <Glow x={1500} y={520} r={800} color={COLORS.orange} opacity={0.14} />
        <Glow x={2600} y={500} r={800} color={COLORS.yellow} opacity={0.16} />
      </Layer>

      <Layer depth={1}>
        {/* Europa auf dem Globus, umkreist vom Sternenkranz */}
        <Globe id="eu-globe" size={620} lon={12 + Math.sin(frame / 80) * 4} lat={49} lights={0.9} night={0.55} atmosphere="#6F9BFF" style={{ position: "absolute", left: GX - 310 - 136, top: GY - 310 - 136 }} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 + frame / 160;
          const p = settle(frame - (europeAt - 6 + i * 1.5), fps);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: GX + Math.cos(a) * 410 * (0.4 + 0.6 * ring) - 27,
                top: GY + Math.sin(a) * 410 * (0.4 + 0.6 * ring) - 27,
                opacity: Math.min(1, p * 1.5),
                scale: String(p),
              }}
            >
              <Star size={54} />
            </div>
          );
        })}
      </Layer>

      <Layer depth={1}>
        {/* Bild A: Politik reagiert, AI Act */}
        <div style={{ position: "absolute", left: 130, top: 250 }}>
          <Letters text="Die Politik" at={wordAt(r1, "Politik") - 3} out={r2.from - 4} size={170} />
          <Letters text="reagiert." at={wordAt(r1, "reagiert")} out={r2.from - 4} size={170} color={COLORS.yellow} />
          <div style={{ marginTop: 30 }}>
            <Marker at={europeAt} out={r2.from - 4} bg={COLORS.ink} size={56}>
              Am weitesten geht Europa
            </Marker>
          </div>
        </div>
        <div style={{ position: "absolute", left: 130, top: 190 }}>
          <Beat at={wordAt(r2, "August") - 2} enter="left">
            <Tag bg={COLORS.yellow} size={46}>
              Seit August 2024
            </Tag>
          </Beat>
          <Letters text="AI Act" at={actAt} size={300} glow={COLORS.euBlue} style={{ marginTop: 16 }} />
          <div style={{ marginTop: 20 }}>
            <Marker at={wordAt(r2, "erste")} bg={COLORS.ink} size={50}>
              Erstes umfassendes KI-Gesetz der Welt
            </Marker>
          </div>
        </div>

        {/* Bild B: Risikopyramide */}
        <div style={{ position: "absolute", left: W + 110, top: 120 }}>
          <Beat at={r3.from + 6}>
            <Kicker color={COLORS.yellow}>KI, sortiert nach</Kicker>
          </Beat>
          <Letters text="Risiko" at={riskAt - 2} size={230} style={{ marginTop: 6 }} />
        </div>
        <AbsoluteFill style={{ translate: pyrShake }}>
          <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
            {TIERS.map((tier, i) => {
              const g = tierGeom(i);
              const p = settle(frame - (r3.from + 10 + (3 - i) * 5), fps);
              const pulse = i === 0 ? forbidden : i === 1 ? high : 0;
              return (
                <g key={tier.label} opacity={Math.min(1, p * 1.5)} transform={`translate(0 ${(1 - p) * -90})`}>
                  <path
                    d={`M ${PYR.cx - g.half0} ${g.y0} L ${PYR.cx + g.half0} ${g.y0} L ${PYR.cx + g.half1} ${g.y1} L ${PYR.cx - g.half1} ${g.y1} Z`}
                    fill={tier.color}
                    stroke={COLORS.ink}
                    strokeWidth={pulse * 8}
                  />
                  <path
                    d={`M ${PYR.cx - g.half0} ${g.y0} L ${PYR.cx + g.half0} ${g.y0} L ${PYR.cx + g.half0 + 16} ${g.y0 + 22} L ${PYR.cx - g.half0 - 16} ${g.y0 + 22} Z`}
                    fill="#FFFFFF"
                    opacity={0.16}
                  />
                </g>
              );
            })}
          </svg>
          {TIERS.map((tier, i) => {
            const g = tierGeom(i);
            const p = settle(frame - (r3.from + 14 + (3 - i) * 5), fps);
            const chipAt = i === 0 ? forbiddenAt - 6 : i === 1 ? highAt - 6 : r3.from + 40 + i * 6;
            const chip = settle(frame - chipAt, fps);
            const cy = (g.y0 + g.y1) / 2;
            return (
              <React.Fragment key={tier.label}>
                <div
                  style={{
                    position: "absolute",
                    left: PYR.cx - 300,
                    top: cy - 34,
                    width: 600,
                    textAlign: "center",
                    opacity: Math.min(1, p * 1.5),
                    fontFamily: FONT.display,
                    fontSize: i === 0 ? 44 : 58,
                    lineHeight: 1,
                    textTransform: "uppercase",
                    color: COLORS.bg,
                    paddingTop: i === 0 ? 20 : 4,
                  }}
                >
                  {tier.label}
                </div>
                {/* Beispiel rechts neben der Stufe */}
                <div
                  style={{
                    position: "absolute",
                    left: PYR.cx + g.half1 + 34 + (1 - chip) * 60,
                    top: cy - 32,
                    opacity: Math.min(1, chip * 1.5),
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div style={{ width: 34, height: 6, backgroundColor: tier.color }} />
                  <span
                    style={{
                      padding: "10px 20px",
                      borderRadius: 14,
                      backgroundColor: COLORS.panel,
                      border: `3px solid ${tier.color}`,
                      fontFamily: FONT.sans,
                      fontWeight: 900,
                      fontSize: 32,
                      color: COLORS.ink,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tier.example}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: PYR.cx + 190, top: PYR.top - 46, opacity: Math.min(1, forbidden * 1.5), scale: String(forbidden) }}>
            <Cross size={96} />
          </div>
          <div style={{ position: "absolute", left: W + 110, top: 470, width: PYR.cx - tierGeom(1).half0 - 40 - (W + 110), textAlign: "right" }}>
            <Marker at={wordAt(r3, "strenge")} bg={COLORS.ink} size={50}>
              Strenge Auflagen
            </Marker>
          </div>
        </AbsoluteFill>

        {/* Bild C: Strafrahmen */}
        <AbsoluteFill style={{ left: W * 2, width: W, translate: gavelShake }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
            <Beat at={r4.from + 6} enter="drop">
              <Tag bg={COLORS.red} color={COLORS.ink} size={48}>
                Strafe bis zu
              </Tag>
            </Beat>
            <Beat at={fineAt - 2} enter="slam" style={{ marginTop: 20 }}>
              <div style={{ fontFamily: FONT.display, fontSize: 260, lineHeight: 1, color: COLORS.yellow, textShadow: `0 0 90px ${COLORS.yellow}66`, whiteSpace: "nowrap" }}>
                <CountUp at={fineAt - 2} duration={34} to={35000000} suffix=" €" />
              </div>
            </Beat>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", alignItems: "center", gap: 50 }}>
            <Beat at={wordAt(r4, "Oder")} enter="pop">
              <Headline size={110} color={COLORS.inkMuted}>
                oder
              </Headline>
            </Beat>
            <Letters text="7 %" at={sevenAt} size={330} glow={COLORS.yellow} />
            <Beat at={wordAt(r4, "weltweiten")} enter="right">
              <Headline size={96} color={COLORS.inkSoft}>
                des weltweiten
                <br />
                Umsatzes
              </Headline>
            </Beat>
          </div>
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 600,
              opacity: Math.min(1, gavelHit * 2),
              rotate: `${(1 - gavelHit) * -50}deg`,
              transformOrigin: "80% 90%",
              filter: "drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.5))",
            }}
          >
            <Gavel size={240} />
          </div>
        </AbsoluteFill>
      </Layer>

      <Sfx name="swell" at={0} volume={0.22} />
      <Sfx name="stamp" at={wordAt(r1, "Politik") - 3} />
      <Sfx name="chime" at={europeAt - 4} volume={0.26} />
      <Sfx name="whoosh-soft" at={r2.from - 4} />
      <Sfx name="pop" at={wordAt(r2, "August") - 2} />
      <Sfx name="impact" at={actAt} volume={0.32} />
      <Sfx name="whoosh-long" at={r3.from - 14} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="pop-low" at={r3.from + 10 + i * 5} volume={0.28} />
      ))}
      <Sfx name="stamp" at={riskAt - 2} />
      <Sfx name="alarm" at={forbiddenAt} volume={0.22} />
      <Sfx name="stamp" at={forbiddenAt + 2} />
      <Sfx name="pop" at={highAt} />
      <Sfx name="click" at={wordAt(r3, "strenge")} />
      <Sfx name="whoosh-long" at={r4.from - 14} />
      <Sfx name="counter" at={fineAt - 2} />
      <Sfx name="impact" at={fineAt + 2} volume={0.3} />
      <Sfx name="stamp" at={sevenAt} />
    </Stage>
  );
};
