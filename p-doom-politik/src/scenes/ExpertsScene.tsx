import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Bust } from "../art/People";
import { Beat, CountUp, Headline, Letters, Sfx, useShake, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

/* Die Risiko-Landschaft: 0 % links, 100 % rechts, 50 Pixel pro Prozentpunkt */
const X0 = 300;
const PX = 50;
const GROUND = 880;
const xOf = (pct: number) => X0 + pct * PX;

const ridge = (seed: string, from: number, to: number, base: number, height: number, step: number): string => {
  const pts: string[] = [`M ${from} ${base + 400}`, `L ${from} ${base}`];
  for (let x = from; x <= to; x += step) {
    const h = height * (0.35 + 0.65 * random(`${seed}-${x}`));
    pts.push(`L ${x + step / 2} ${base - h}`, `L ${x + step} ${base - height * 0.15 * random(`${seed}-v-${x}`)}`);
  }
  pts.push(`L ${to + step} ${base + 400} Z`);
  return pts.join(" ");
};

const FAR_RIDGE = ridge("far", -1200, 5000, 760, 300, 260);
const NEAR_RIDGE = ridge("near", -1400, 7400, 900, 170, 190);

type Expert = {
  readonly cueId: string;
  readonly name: string;
  readonly role: string;
  readonly pct: number;
  readonly color: string;
  readonly nameWord: string;
  readonly valueWord: string;
  /** Textblock links oder rechts der Figur */
  readonly side: "left" | "right";
};

const EXPERTS: readonly Expert[] = [
  { cueId: "e2", name: "Yann LeCun", role: "einer der Väter moderner KI", pct: 1, color: COLORS.green, nameWord: "Yann", valueWord: "unter", side: "left" },
  { cueId: "e3", name: "Geoffrey Hinton", role: "Nobelpreisträger", pct: 15, color: COLORS.yellow, nameWord: "Geoffrey", valueWord: "zehn", side: "right" },
  { cueId: "e4", name: "Eliezer Yudkowsky", role: "KI-Sicherheitsforscher", pct: 95, color: COLORS.red, nameWord: "Eliezer", valueWord: "über", side: "left" },
];

/**
 * Expertenstreit als Kamerafahrt über eine Risiko-Landschaft:
 * von der ruhigen Küste bei unter 1 % bis ins Gewitter bei über 90 %.
 */
export const ExpertsScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const e1 = cue(cues, "e1");
  const e5 = cue(cues, "e5");

  const t = EXPERTS.map((ex) => {
    const c = cue(cues, ex.cueId);
    return { ...ex, cue: c, nameAt: wordAt(c, ex.nameWord), valueAt: wordAt(c, ex.valueWord), x: xOf(ex.pct) };
  });

  const WIDE = { x: 1530, y: -330, zoom: 0.305 };
  const cam = useCam([
    { at: 0, ...WIDE },
    { at: t[0].cue.from - 4, ...WIDE },
    { at: t[0].cue.from + 26, x: -960, y: 0, zoom: 1 },
    { at: t[1].cue.from - 8, x: -940, y: 0, zoom: 1.03 },
    { at: t[1].cue.from + 22, x: 520, y: 0, zoom: 1 },
    { at: t[2].cue.from - 2, x: 560, y: 0, zoom: 1.03 },
    { at: t[2].cue.from + 44, x: 3540, y: 0, zoom: 1 },
    { at: e5.from - 6, x: 3560, y: 0, zoom: 1.04 },
    { at: e5.from + 30, ...WIDE },
    { at: durationInFrames, x: 1530, y: -330, zoom: 0.315 },
  ]);

  const shake = useShake(t[2].valueAt, 16);
  const wide = useSpringAt(e5.from + 6, SPRINGS.smooth);
  const band = useSpringAt(t[1].valueAt, SPRINGS.smooth);
  // Blitze im Gewitter rechts
  const flash = frame > t[2].cue.from + 30 && random(`flash-${Math.floor(frame / 3)}`) > 0.86 ? 1 : 0;

  return (
    <Stage seed="experts" cam={cam} sky={{ top: "#070B1E", bottom: "#111A3A", glow: COLORS.blue, glowAt: [30, 30], stars: 90 }}>
      {/* Himmel: von ruhig nach bedrohlich */}
      <Layer depth={0.25}>
        <div
          style={{
            position: "absolute",
            left: -900,
            top: -1500,
            width: 4800,
            height: 3600,
            background: "linear-gradient(90deg, #0B3B4D 0%, #14355F 28%, #2A235C 55%, #4A1638 78%, #5C0F1C 100%)",
            opacity: 0.85,
          }}
        />
        <Glow x={-100} y={420} r={620} color="#7FE3C8" opacity={0.5} />
        <Glow x={3000} y={380} r={760} color={COLORS.red} opacity={0.45 + flash * 0.4} />
      </Layer>
      <Layer depth={0.5}>
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
          <path d={FAR_RIDGE} fill="#060A1C" opacity={0.55} />
        </svg>
      </Layer>
      <Layer depth={0.75}>
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
          {/* Gewitterwolken */}
          {[3700, 4050, 4420, 4800].map((x, i) => (
            <ellipse key={x} cx={x} cy={150 + (i % 2) * 70} rx={420} ry={120} fill="#150812" opacity={0.75} />
          ))}
          <polyline
            points="4330,230 4280,400 4350,400 4290,600"
            fill="none"
            stroke="#FFE9E0"
            strokeWidth={10}
            strokeLinejoin="round"
            opacity={flash}
          />
        </svg>
      </Layer>

      <Layer depth={1}>
        <AbsoluteFill style={{ translate: shake }}>
          <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
            <defs>
              <linearGradient id="risk-band" x1="0" x2="1">
                <stop offset="0%" stopColor={COLORS.green} />
                <stop offset="30%" stopColor={COLORS.yellow} />
                <stop offset="65%" stopColor={COLORS.orange} />
                <stop offset="100%" stopColor={COLORS.red} />
              </linearGradient>
            </defs>
            <path d={NEAR_RIDGE} fill="#04060F" />
            <rect x={-2400} y={GROUND} width={10400} height={2600} fill="#04060F" />
            {/* Skala */}
            <rect x={X0} y={GROUND - 14} width={100 * PX} height={28} rx={14} fill="url(#risk-band)" />
            {Array.from({ length: 21 }).map((_, i) => (
              <g key={i}>
                <line x1={xOf(i * 5)} y1={GROUND + 14} x2={xOf(i * 5)} y2={GROUND + (i % 2 === 0 ? 50 : 34)} stroke={COLORS.inkSoft} strokeWidth={i % 2 === 0 ? 6 : 3} />
                {i % 2 === 0 ? (
                  <text x={xOf(i * 5)} y={GROUND + 104} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={44} fill={COLORS.inkMuted}>
                    {i * 5} %
                  </text>
                ) : null}
              </g>
            ))}
            {/* Hintons Spanne 10–20 % */}
            <rect x={xOf(10)} y={GROUND - 30} width={10 * PX} height={60} rx={30} fill="none" stroke={COLORS.ink} strokeWidth={8} opacity={band} />
            {/* große Endmarken für die Totale */}
            <g opacity={wide}>
              <text x={X0} y={GROUND + 290} textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={170} fill={COLORS.green}>
                0 %
              </text>
              <text x={xOf(100)} y={GROUND + 290} textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={170} fill={COLORS.red}>
                100 %
              </text>
            </g>
          </svg>

          {t.map((ex, i) => {
            const blockW = 860;
            const left = ex.side === "left" ? ex.x - 190 - blockW : ex.x + 190;
            return (
              <React.Fragment key={ex.name}>
                {/* Figur auf Sockel */}
                <Beat at={ex.nameAt - 4} enter="pop" style={{ position: "absolute", left: ex.x - 140, top: GROUND - 14 - 60 - 322 }}>
                  <Glow x={140} y={170} r={300} color={ex.color} opacity={0.45} />
                  <Bust size={280} accent={ex.color} glasses={i === 1} />
                  <div style={{ width: 200, height: 60, margin: "0 auto", borderRadius: "10px 10px 0 0", backgroundColor: ex.color, opacity: 0.9 }} />
                </Beat>
                {/* Name, Rolle, Wert */}
                <div style={{ position: "absolute", left, top: 190, width: blockW, textAlign: ex.side === "left" ? "right" : "left" }}>
                  <Beat at={ex.nameAt} enter={ex.side === "left" ? "right" : "left"}>
                    <Headline size={ex.name.length > 15 ? 112 : 126} style={{ display: "inline-block" }}>
                      {ex.name}
                    </Headline>
                    <div style={{ marginTop: 8, fontFamily: FONT.sans, fontWeight: 800, fontSize: 42, color: COLORS.inkSoft }}>{ex.role}</div>
                  </Beat>
                  <Beat at={ex.valueAt} enter="slam" style={{ marginTop: 18 }}>
                    <div
                      style={{
                        fontFamily: FONT.display,
                        fontSize: 290,
                        lineHeight: 0.95,
                        color: ex.color,
                        whiteSpace: "nowrap",
                        textShadow: `0 0 90px ${ex.color}77`,
                      }}
                    >
                      {i === 0 ? (
                        "< 1 %"
                      ) : i === 1 ? (
                        <>
                          <CountUp at={ex.valueAt} duration={16} to={10} />–<CountUp at={ex.valueAt} duration={20} to={20} /> %
                        </>
                      ) : (
                        <>
                          {"> "}
                          <CountUp at={ex.valueAt} duration={22} to={90} /> %
                        </>
                      )}
                    </div>
                  </Beat>
                </div>
              </React.Fragment>
            );
          })}
        </AbsoluteFill>
      </Layer>

      {/* Überschriften außerhalb der Welt */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Letters text="Uneinig." at={wordAt(e1, "einig") - 4} out={t[0].cue.from + 4} size={300} glow={COLORS.blue} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 96 }}>
        <Letters text="Dieselbe Technik." at={e5.from + 12} size={130} />
        <div style={{ opacity: interpolate(frame, [e5.from, e5.from + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Letters text="Völlig andere Prognosen." at={wordAt(e5, "Völlig") + 10} size={130} color={COLORS.yellow} style={{ marginTop: 8 }} />
        </div>
      </AbsoluteFill>

      <Sfx name="stamp" at={wordAt(e1, "einig") - 4} />
      <Sfx name="whoosh-long" at={t[0].cue.from - 6} />
      {t.map((ex, i) => (
        <React.Fragment key={ex.name}>
          <Sfx name="pop" at={ex.nameAt - 4} />
          <Sfx name={i === 2 ? "impact" : "stamp"} at={ex.valueAt} />
        </React.Fragment>
      ))}
      <Sfx name="whoosh-soft" at={t[1].cue.from - 8} />
      <Sfx name="whoosh-long" at={t[2].cue.from} volume={0.4} />
      <Sfx name="riser" at={t[2].valueAt - 76} volume={0.22} />
      <Sfx name="whoosh-long" at={e5.from - 4} />
      <Sfx name="stamp" at={e5.from + 12} />
      <Sfx name="stamp" at={wordAt(e5, "Völlig") + 10} />
    </Stage>
  );
};
