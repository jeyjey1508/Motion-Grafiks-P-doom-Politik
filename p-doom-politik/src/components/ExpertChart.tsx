import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";
import { SceneShell } from "./Background";
import { Beat, CountUp, Headline, Kicker, Sfx, useProgress, useShake, useSpringAt } from "./kinetic";
import { MetricCard } from "./MetricCard";

/* Geometrie des Risiko-Tachos */
const CX = 560;
const CY = 790;
const R = 420;
const STROKE = 62;

const polar = (value: number, radius: number) => {
  const theta = Math.PI - (value / 100) * Math.PI;
  return { x: CX + radius * Math.cos(theta), y: CY - radius * Math.sin(theta) };
};

const arcPath = (from: number, to: number, radius: number) => {
  const a = polar(from, radius);
  const b = polar(to, radius);
  const large = to - from > 50 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${large} 1 ${b.x} ${b.y}`;
};

const ZONES = [
  { from: 0, to: 25, color: COLORS.green },
  { from: 25, to: 50, color: COLORS.yellow },
  { from: 50, to: 75, color: COLORS.orange },
  { from: 75, to: 100, color: COLORS.red },
];

type Expert = {
  readonly cueId: string;
  readonly name: string;
  readonly role: string;
  readonly nameWord: string;
  readonly valueWord: string;
  /** Zeigerposition (Prozent) */
  readonly needle: number;
  readonly marker: number;
  readonly color: string;
};

const EXPERTS: readonly Expert[] = [
  {
    cueId: "e2",
    name: "Yann LeCun",
    role: "Turing-Preisträger",
    nameWord: "Yann",
    valueWord: "unter",
    needle: 1.5,
    marker: 1,
    color: COLORS.green,
  },
  {
    cueId: "e3",
    name: "Geoffrey Hinton",
    role: "Nobelpreisträger",
    nameWord: "Geoffrey",
    valueWord: "zehn",
    needle: 15,
    marker: 15,
    color: COLORS.yellow,
  },
  {
    cueId: "e4",
    name: "Eliezer Yudkowsky",
    role: "KI-Sicherheitsforscher",
    nameWord: "Eliezer",
    valueWord: "über",
    needle: 95,
    marker: 95,
    color: COLORS.red,
  },
];

/**
 * Expertenstreit als Risiko-Tacho: Der Zeiger schlägt bei jeder genannten
 * Schätzung aus, rechts erscheinen Name und Zahl.
 */
export const ExpertChart: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const e1 = cue(cues, "e1");
  const e5 = cue(cues, "e5");
  const streitAt = wordAt(e1, "Streit");

  const timings = EXPERTS.map((ex) => {
    const c = cue(cues, ex.cueId);
    return { ...ex, cue: c, nameAt: wordAt(c, ex.nameWord), valueAt: wordAt(c, ex.valueWord) };
  });

  // Zeiger: Summe von Federn zu jedem neuen Zielwert
  const arcDraw = useProgress(2, 28);
  let needle = 50 * spring({ frame: frame - (e1.from + 4), fps, config: SPRINGS.needle });
  let previous = 50;
  for (const t of timings) {
    needle += (t.needle - previous) * spring({ frame: frame - t.valueAt, fps, config: SPRINGS.needle });
    previous = t.needle;
  }
  // nervöses Zittern, solange die Frage offen ist
  if (frame < timings[0].valueAt) {
    needle += Math.sin(frame / 2.3) * 3;
  }
  const needleOpacity = interpolate(frame, [e5.from, e5.from + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tip = polar(Math.max(0, Math.min(100, needle)), R - 80);
  const shake = useShake(timings[2].valueAt, 16);
  const hintonBand = useSpringAt(timings[1].valueAt, SPRINGS.smooth);
  const summary = useSpringAt(e5.from, SPRINGS.smooth);

  return (
    <SceneShell seed="experts" glow={COLORS.orange} bg="#0E1124">
      <AbsoluteFill style={{ translate: shake }}>
        {/* Tacho */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={arcPath(0, 100, R)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE + 22} />
          {ZONES.map((z, i) => {
            const len = (Math.PI * R * (z.to - z.from)) / 100;
            const local = interpolate(arcDraw, [i / 4, (i + 1) / 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <path
                key={z.from}
                d={arcPath(z.from + 0.4, z.to - 0.4, R)}
                fill="none"
                stroke={z.color}
                strokeWidth={STROKE}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - local)}
              />
            );
          })}
          {/* Hinton: Spanne 10–20 % */}
          <path
            d={arcPath(10, 20, R)}
            fill="none"
            stroke={COLORS.ink}
            strokeWidth={STROKE + 22}
            opacity={hintonBand * 0.35}
          />
          {[0, 25, 50, 75, 100].map((v) => {
            const p = polar(v, R + STROKE / 2 + 44);
            return (
              <text
                key={v}
                x={p.x}
                y={p.y + 12}
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontWeight={800}
                fontSize={32}
                fill={COLORS.inkMuted}
                opacity={arcDraw}
              >
                {v} %
              </text>
            );
          })}
          {/* Markierungen der Experten */}
          {timings.map((t) => {
            const s = spring({ frame: frame - t.valueAt - 6, fps, config: SPRINGS.pop });
            const p = polar(t.marker, R);
            const label = polar(t.marker, R - STROKE / 2 - 70);
            return (
              <g key={t.name} opacity={Math.min(1, s * 1.5)}>
                <circle cx={p.x} cy={p.y} r={20 * s} fill={COLORS.ink} stroke={COLORS.bg} strokeWidth={6} />
                <text
                  x={label.x}
                  y={label.y + 12}
                  textAnchor={t.marker < 40 ? "start" : t.marker > 60 ? "end" : "middle"}
                  fontFamily="Inter, sans-serif"
                  fontWeight={900}
                  fontSize={30 + summary * 6}
                  fill={COLORS.ink}
                  opacity={0.55 + summary * 0.45}
                >
                  {t.name.split(" ").slice(-1)[0]}
                </text>
              </g>
            );
          })}
          {/* Zeiger */}
          <g opacity={needleOpacity}>
            <line
              x1={CX}
              y1={CY}
              x2={tip.x}
              y2={tip.y}
              stroke={COLORS.ink}
              strokeWidth={16}
              strokeLinecap="round"
            />
            <circle cx={CX} cy={CY} r={38} fill={COLORS.ink} />
            <circle cx={CX} cy={CY} r={15} fill={COLORS.bg} />
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            left: CX,
            top: CY + 70,
            translate: "-50% 0px",
            opacity: arcDraw,
          }}
        >
          <Kicker color={COLORS.inkSoft}>Risiko-Tacho · P(doom)</Kicker>
        </div>

        {/* Rechte Seite */}
        <div style={{ position: "absolute", left: 1140, top: 250, width: 720 }}>
          <Beat at={e1.from} out={timings[0].cue.from - 2} exit="up">
            <Headline size={150}>Wie hoch?</Headline>
          </Beat>
          <Beat
            at={streitAt}
            out={timings[0].cue.from - 2}
            enter="slam"
            exit="up"
            style={{ marginTop: 10 }}
          >
            <Headline size={200} color={COLORS.red}>
              Streit!
            </Headline>
          </Beat>
        </div>

        {timings.map((t, i) => {
          const next = timings[i + 1]?.cue.from ?? e5.from;
          return (
            <div key={t.name} style={{ position: "absolute", left: 1140, top: 230, width: 740 }}>
              <Beat at={t.nameAt} out={next - 2} enter="right" exit="up">
                <Headline size={t.name.length > 15 ? 96 : 110}>{t.name}</Headline>
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: FONT.sans,
                    fontWeight: 800,
                    fontSize: 38,
                    color: COLORS.inkSoft,
                  }}
                >
                  {t.role}
                </div>
              </Beat>
              <MetricCard
                at={t.valueAt}
                out={next - 2}
                exit="up"
                color={t.color}
                valueSize={190}
                style={{ marginTop: 34 }}
                value={
                  i === 0 ? (
                    "< 1 %"
                  ) : i === 1 ? (
                    <>
                      <CountUp at={t.valueAt} duration={18} to={10} />–
                      <CountUp at={t.valueAt} duration={22} to={20} /> %
                    </>
                  ) : (
                    <>
                      {"> "}
                      <CountUp at={t.valueAt} duration={24} to={90} /> %
                    </>
                  )
                }
              />
            </div>
          );
        })}

        <div style={{ position: "absolute", left: 1140, top: 230, width: 740 }}>
          <Beat at={e5.from} enter="slam">
            <Headline size={120}>Gleiche</Headline>
            <Headline size={120}>Technik.</Headline>
          </Beat>
          <Beat at={wordAt(e5, "Völlig")} enter="slam" style={{ marginTop: 18 }}>
            <Headline size={120} color={COLORS.yellow}>
              Völlig andere
            </Headline>
            <Headline size={120} color={COLORS.yellow}>
              Prognosen.
            </Headline>
          </Beat>
        </div>
      </AbsoluteFill>

      <Sfx name="stamp" at={streitAt} />
      {timings.map((t, i) => (
        <React.Fragment key={t.name}>
          <Sfx name="whoosh-soft" at={t.nameAt - 4} />
          <Sfx name={i === 2 ? "impact" : "counter"} at={t.valueAt} volume={i === 2 ? 0.45 : undefined} />
        </React.Fragment>
      ))}
      <Sfx name="pop" at={e5.from} />
      <Sfx name="pop" at={wordAt(e5, "Völlig")} />
    </SceneShell>
  );
};
