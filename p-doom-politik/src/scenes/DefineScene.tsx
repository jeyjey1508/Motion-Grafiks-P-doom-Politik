import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe } from "../art/Globe";
import { Bust, Die } from "../art/People";
import { Beat, DrawLine, Headline, Kicker, Letters, Marker, settle, Sfx, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const W = 1920;
const RULER_X = 4060;
const RULER_W = 1480;
const RULER_Y = 580;

const EXPERT_MARKS = [
  { pct: 1, color: COLORS.green, x: 4330 },
  { pct: 15, color: COLORS.yellow, x: 4800 },
  { pct: 95, color: COLORS.red, x: 5270 },
] as const;

/**
 * Definition als Kamerafahrt über drei Bilder:
 * die Formel, was "doom" bedeutet, und warum die Zahl nur eine Schätzung ist.
 */
export const DefineScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const d1 = cue(cues, "d1");
  const d2 = cue(cues, "d2");
  const d3 = cue(cues, "d3");
  const d4 = cue(cues, "d4");

  const probAt = wordAt(d1, "Wahrscheinlichkeit");
  const doomAt = wordAt(d1, "Untergang");
  const wipeAt = wordAt(d2, "auslöscht");
  const controlAt = wordAt(d2, "Kontrolle");
  const takeAt = wordAt(d2, "entreißt");
  const notAt = wordAt(d3, "nicht");
  const gutAt = wordAt(d3, "Bauchgefühl");

  const cam = useCam([
    { at: 0, x: 0, y: 0, zoom: 1 },
    { at: d2.from - 14, x: 0, y: 0, zoom: 1.05 },
    { at: d2.from + 12, x: W, y: 0, zoom: 1 },
    { at: d3.from - 14, x: W, y: 0, zoom: 1.05 },
    { at: d3.from + 12, x: W * 2, y: 0, zoom: 1 },
    { at: d4.from - 4, x: W * 2, y: 0, zoom: 1 },
    { at: d4.from + 26, x: W * 2, y: 70, zoom: 1.03 },
    { at: durationInFrames, x: W * 2, y: 70, zoom: 1.08 },
  ]);

  // Würfel: taumelt, bis das Wort gefallen ist
  const dieIn = useSpringAt(probAt - 6, SPRINGS.pop);
  const dieRolling = frame < probAt + 14;
  const dieValue = dieRolling ? 1 + Math.floor(random(`die-${Math.floor(frame / 3)}`) * 6) : 5;
  const dieSpin = interpolate(frame, [probAt - 6, probAt + 14], [-270, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lightsOut = useSpringAt(wipeAt, SPRINGS.smooth);
  const knob = useSpringAt(takeAt - 6, SPRINGS.smooth, 30);
  const handleIn = useSpringAt(gutAt - 4, SPRINGS.pop);
  const expertsIn = useSpringAt(d4.from + 4, SPRINGS.smooth);
  const rulerIn = useSpringAt(d3.from + 6, SPRINGS.smooth);
  // Bauchgefühl: der Regler findet keinen festen Wert
  const wobble = 46 + Math.sin(frame / 7) * 22 + Math.sin(frame / 3.1) * 9;
  const pct = Math.round(wobble);

  return (
    <Stage seed="define" cam={cam} sky={{ top: "#0A0F2A", bottom: "#141A3F", glow: COLORS.yellow, glowAt: [40, 35], stars: 70, dust: 16 }}>
      <Layer depth={0.45}>
        <Glow x={700} y={380} r={520} color={COLORS.yellow} opacity={0.35} />
        <Glow x={2500 * 0.45 + 600} y={520} r={620} color={COLORS.red} opacity={0.28} />
        <Glow x={4800 * 0.45 + 900} y={420} r={680} color={COLORS.violet} opacity={0.3} />
      </Layer>

      <Layer depth={1}>
        {/* Bild A: die Formel */}
        <div style={{ position: "absolute", left: 260, top: 150, display: "flex", alignItems: "flex-start", gap: 26 }}>
          <Letters text="P" at={2} size={420} color={COLORS.yellow} glow={COLORS.yellow} />
          <Letters text="(doom)" at={6} size={420} color={COLORS.red} glow={COLORS.red} stagger={1.6} />
        </div>
        <div style={{ position: "absolute", left: 230, top: 640, display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ opacity: Math.min(1, dieIn * 1.5), scale: String(dieIn), rotate: `${dieSpin}deg` }}>
            <Die value={dieValue} size={130} />
          </div>
          <Marker at={probAt} size={70}>
            Wahrscheinlichkeit
          </Marker>
        </div>
        <svg width={W} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <DrawLine from={probAt - 4} to={probAt + 6} x1={370} y1={560} x2={370} y2={630} color={COLORS.yellow} width={8} />
          <DrawLine from={doomAt - 4} to={doomAt + 6} x1={1180} y1={560} x2={1180} y2={630} color={COLORS.red} width={8} />
        </svg>
        <div style={{ position: "absolute", left: 1020, top: 648, display: "flex", alignItems: "center", gap: 26 }}>
          <Marker at={doomAt} bg={COLORS.red} color={COLORS.ink} size={70}>
            Untergang
          </Marker>
        </div>

        {/* Bild B: Auslöschung oder Kontrollverlust */}
        <div style={{ position: "absolute", left: W, top: 0, width: W, height: 1080 }}>
          <Beat at={d2.from + 8} style={{ position: "absolute", left: 150, top: 110 }}>
            <Kicker color={COLORS.yellow}>Gemeint ist die Chance, dass KI …</Kicker>
          </Beat>
          <Glow x={470} y={500} r={420} color={COLORS.blue} opacity={0.4 * (1 - lightsOut)} />
          <Globe
            id="define-globe"
            size={520}
            lon={20 + frame * 0.12}
            lights={1 - lightsOut}
            danger={lightsOut * 0.9}
            night={0.75 + lightsOut * 0.2}
            style={{ position: "absolute", left: 470 - 260 - 114, top: 500 - 260 - 114 }}
          />
          <div style={{ position: "absolute", left: 110, top: 800, width: 720, textAlign: "center" }}>
            <Letters text="Auslöschung" at={wipeAt} size={132} color={COLORS.red} glow={COLORS.red} style={{ display: "inline-block" }} />
          </div>

          <Beat at={wordAt(d2, "oder")} enter="pop" style={{ position: "absolute", left: 890, top: 470 }}>
            <Headline size={90} color={COLORS.inkMuted}>
              oder
            </Headline>
          </Beat>

          {/* Schieberegler: die Kontrolle wandert vom Menschen zur KI */}
          <Beat at={controlAt - 4} enter="rise" style={{ position: "absolute", left: 1110, top: 300, width: 700 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.display, fontSize: 64 }}>
              <span style={{ color: interpolate(knob, [0, 1], [1, 0.35]) > 0.6 ? COLORS.ink : COLORS.inkMuted }}>MENSCH</span>
              <span style={{ color: knob > 0.5 ? COLORS.blue : COLORS.inkMuted }}>KI</span>
            </div>
            <div
              style={{
                position: "relative",
                marginTop: 40,
                height: 110,
                borderRadius: 55,
                backgroundColor: "#0B1030",
                border: `4px solid ${COLORS.line}`,
                boxShadow: "inset 0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  top: 8,
                  bottom: 8,
                  width: 94 + knob * 588,
                  borderRadius: 47,
                  background: `linear-gradient(90deg, ${COLORS.ink}22, ${COLORS.blue}AA)`,
                  opacity: knob,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 7,
                  left: 7 + knob * 588,
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: knob > 0.5 ? COLORS.blue : COLORS.ink,
                  boxShadow: `0 0 50px ${knob > 0.5 ? COLORS.blue : COLORS.ink}99`,
                }}
              />
            </div>
          </Beat>
          <div style={{ position: "absolute", left: 1030, top: 800, width: 860, textAlign: "center" }}>
            <Letters text="Kontrollverlust" at={controlAt} size={132} color={COLORS.orange} style={{ display: "inline-block" }} />
          </div>
        </div>

        {/* Bild C: Messung unmöglich, Bauchgefühl in Prozent */}
        <div style={{ position: "absolute", left: W * 2, top: 0, width: W, height: 1080 }}>
          <div style={{ position: "absolute", left: 220, top: 130 }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Letters text="Messbar?" at={d3.from + 2} out={gutAt - 6} size={170} />
              <svg width={720} height={170} style={{ position: "absolute", left: -10, top: 0 }}>
                {frame < gutAt + 4 ? (
                  <DrawLine from={notAt} to={notAt + 8} x1={10} y1={110} x2={700} y2={60} color={COLORS.red} width={22} />
                ) : null}
              </svg>
            </div>
          </div>
          <div style={{ position: "absolute", left: 220, top: 110 }}>
            <Beat at={gutAt - 2}>
              <Kicker color={COLORS.yellow}>Keine Messung. Sondern ein</Kicker>
            </Beat>
            <Letters text="Bauchgefühl" at={gutAt} size={190} style={{ marginTop: 8 }} />
          </div>
        </div>

        {/* Prozent-Skala mit unruhigem Regler */}
        <svg width={W * 3} height={1200} style={{ position: "absolute", left: 0, top: 0, opacity: Math.min(1, rulerIn * 1.2) }}>
          <line x1={RULER_X} y1={RULER_Y} x2={RULER_X + RULER_W} y2={RULER_Y} stroke={COLORS.ink} strokeWidth={8} strokeLinecap="round" />
          {Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1={RULER_X + (i / 20) * RULER_W}
              y1={RULER_Y - (i % 5 === 0 ? 34 : 18)}
              x2={RULER_X + (i / 20) * RULER_W}
              y2={RULER_Y}
              stroke={COLORS.ink}
              strokeWidth={i % 5 === 0 ? 6 : 3}
              opacity={i % 5 === 0 ? 1 : 0.5}
            />
          ))}
          {[0, 25, 50, 75, 100].map((v) => (
            <text key={v} x={RULER_X + (v / 100) * RULER_W} y={RULER_Y + 58} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={34} fill={COLORS.inkMuted}>
              {v} %
            </text>
          ))}
          {/* Regler */}
          <g opacity={Math.min(1, handleIn * 1.5) * (1 - expertsIn)} transform={`translate(${RULER_X + (wobble / 100) * RULER_W} ${RULER_Y})`}>
            <circle r={30 * handleIn} fill={COLORS.yellow} />
            <circle r={12} fill={COLORS.bg} />
            <text y={-56} textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={110} fill={COLORS.yellow}>
              {pct} %
            </text>
          </g>
          {/* drei Fachleute, drei Werte */}
          {EXPERT_MARKS.map((m, i) => {
            const s = settle(frame - (d4.from + 8 + i * 8), fps);
            const hx = RULER_X + (m.pct / 100) * RULER_W;
            return (
              <g key={m.pct} opacity={Math.min(1, s * 1.5)}>
                <line x1={hx} y1={RULER_Y + 8} x2={m.x} y2={780} stroke={m.color} strokeWidth={5} strokeDasharray="10 12" opacity={0.7} />
                <circle cx={hx} cy={RULER_Y} r={26 * s} fill={m.color} />
                <circle cx={hx} cy={RULER_Y} r={10} fill={COLORS.bg} />
              </g>
            );
          })}
        </svg>
        {EXPERT_MARKS.map((m, i) => {
          const s = settle(frame - (d4.from + 8 + i * 8), fps);
          return (
            <div
              key={m.pct}
              style={{
                position: "absolute",
                left: m.x - 150,
                top: 780 + (1 - s) * 260,
                opacity: Math.min(1, s * 1.4),
              }}
            >
              <Bust size={300} accent={m.color} glasses={i === 1} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: W * 2 + 224, top: 372 }}>
          <Marker at={wordAt(d4, "Systeme")} bg={COLORS.ink} size={50}>
            … derer, die die Systeme bauen
          </Marker>
        </div>
      </Layer>

      <Sfx name="impact" at={2} volume={0.25} />
      <Sfx name="counter" at={probAt - 6} volume={0.22} />
      <Sfx name="stamp" at={probAt} />
      <Sfx name="stamp" at={doomAt} />
      <Sfx name="whoosh-long" at={d2.from - 16} />
      <Sfx name="drop" at={wipeAt} volume={0.32} />
      <Sfx name="pop" at={wordAt(d2, "oder")} />
      <Sfx name="clunk" at={takeAt} />
      <Sfx name="stamp" at={controlAt} />
      <Sfx name="whoosh-long" at={d3.from - 16} />
      <Sfx name="stamp" at={notAt + 2} />
      <Sfx name="pop" at={gutAt} />
      <Sfx name="counter" at={gutAt + 4} volume={0.2} />
      {EXPERT_MARKS.map((m, i) => (
        <Sfx key={m.pct} name="pop" at={d4.from + 8 + i * 8} volume={0.3} />
      ))}
    </Stage>
  );
};
