import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Beat, DrawLine, Headline, Kicker, Letters, Marker, Sfx, useProgress, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

/* Neuronales Netz in Welt-Koordinaten */
const LAYERS = [4, 6, 6, 3];
const NET_X = [2960, 3190, 3420, 3650];
const NET_CY = 530;
const nodeY = (layer: number, i: number) => NET_CY + (i - (LAYERS[layer] - 1) / 2) * 96;

const NODES = LAYERS.flatMap((count, l) => Array.from({ length: count }).map((_, i) => ({ l, i, x: NET_X[l], y: nodeY(l, i) })));
const EDGES = LAYERS.slice(0, -1).flatMap((count, l) =>
  Array.from({ length: count }).flatMap((_, a) =>
    Array.from({ length: LAYERS[l + 1] }).map((__, b) => ({
      key: `${l}-${a}-${b}`,
      x1: NET_X[l],
      y1: nodeY(l, a),
      x2: NET_X[l + 1],
      y2: nodeY(l + 1, b),
    })),
  ),
);

const BOX = { x: 2850, y: 170, w: 910, h: 720 };

/**
 * Das Alignment-Problem: zwei Ziele, die auseinanderlaufen, ein trainiertes
 * Netz, das niemand lesen kann, und die offene Frage, was es will.
 */
export const BlackboxScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b1 = cue(cues, "b1");
  const b2 = cue(cues, "b2");
  const b3 = cue(cues, "b3");
  const b4 = cue(cues, "b4");

  const alignAt = wordAt(b1, "Alignment-Problem");
  const notAt = wordAt(b2, "nicht");
  const trainAt = wordAt(b2, "trainiert");
  const dataAt = wordAt(b2, "Milliarden");
  const readAt = wordAt(b3, "lesen");
  const boxAt = wordAt(b3, "Blackbox");
  const wantAt = wordAt(b4, "wirklich");

  const cam = useCam([
    { at: 0, x: 0, y: 0, zoom: 1.04 },
    { at: b2.from - 14, x: 40, y: 0, zoom: 1 },
    { at: b2.from + 14, x: 1920, y: 0, zoom: 1 },
    { at: b3.from - 6, x: 1960, y: 0, zoom: 1.04 },
    { at: b3.from + 30, x: 2340, y: 10, zoom: 0.92 },
    { at: b4.from - 8, x: 2340, y: 10, zoom: 0.96 },
    { at: b4.from + 24, x: 2860, y: 0, zoom: 0.84 },
    { at: durationInFrames, x: 2880, y: 0, zoom: 0.87 },
  ]);

  const drift = useSpringAt(alignAt, SPRINGS.smooth, 50);
  const angle = drift * 13;
  const netOn = useSpringAt(trainAt, SPRINGS.smooth);
  const boxIn = useSpringAt(b3.from + 8, SPRINGS.smooth, 40);
  const lens = useProgress(readAt - 20, readAt + 34);
  const fork = useProgress(b4.from + 6, b4.from + 40);
  const codeStrike = useProgress(notAt, notAt + 8);
  const codeOut = useSpringAt(b3.from, SPRINGS.smooth);

  return (
    <Stage seed="blackbox" cam={cam} sky={{ top: "#060B1F", bottom: "#0D1A3D", glow: COLORS.blue, glowAt: [45, 45], stars: 70, dust: 14 }}>
      <Layer depth={0.4}>
        <Glow x={900} y={520} r={640} color={COLORS.blue} opacity={0.35} />
        <Glow x={2100} y={520} r={700} color={COLORS.violet} opacity={0.4} />
      </Layer>

      <Layer depth={1}>
        {/* Bild A: zwei Ziele laufen auseinander */}
        <div style={{ position: "absolute", left: 150, top: 110 }}>
          <Beat at={b1.from} exit="up">
            <Kicker color={COLORS.yellow}>Woher kommt die Sorge?</Kicker>
          </Beat>
          <Letters text="Alignment" at={alignAt} size={250} color={COLORS.blue} glow={COLORS.blue} style={{ marginTop: 10 }} />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <DrawLine from={b1.from + 6} to={b1.from + 40} x1={170} y1={640} x2={1640} y2={640} color={COLORS.ink} width={14} />
          <g transform={`rotate(${angle} 170 640)`}>
            <DrawLine from={b1.from + 12} to={b1.from + 46} x1={170} y1={640} x2={1640} y2={640} color={COLORS.blue} width={14} />
            <path d="M 1640 640 l -40 -26 l 0 52 Z" fill={COLORS.blue} opacity={frame > b1.from + 44 ? 1 : 0} />
          </g>
          <path d="M 1640 640 l -40 -26 l 0 52 Z" fill={COLORS.ink} opacity={frame > b1.from + 38 ? 1 : 0} />
        </svg>
        <Beat at={b1.from + 30} style={{ position: "absolute", left: 1210, top: 540 }}>
          <Headline size={70}>Unsere Ziele</Headline>
        </Beat>
        <Beat at={alignAt + 20} style={{ position: "absolute", left: 1150, top: 660 + angle * 22 }}>
          <Headline size={70} color={COLORS.blue}>
            Ziele der KI
          </Headline>
        </Beat>

        {/* Bild B: programmiert vs. trainiert */}
        <div style={{ position: "absolute", left: 2040, top: 300, opacity: 1 - codeOut }}>
          <Beat at={b2.from + 4} enter="left">
            <div
              style={{
                position: "relative",
                width: 600,
                height: 440,
                borderRadius: 26,
                backgroundColor: "#0A1030",
                border: `3px solid ${COLORS.line}`,
                boxShadow: SHADOW.card,
                padding: "56px 40px",
                boxSizing: "border-box",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ position: "absolute", left: 30 + i * 30, top: 22, width: 16, height: 16, borderRadius: 8, backgroundColor: [COLORS.red, COLORS.yellow, COLORS.green][i] }} />
              ))}
              {[420, 300, 360, 220, 400, 260, 330].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: w,
                    height: 22,
                    borderRadius: 11,
                    marginTop: 22,
                    marginLeft: i % 3 === 1 ? 40 : i % 3 === 2 ? 80 : 0,
                    backgroundColor: [COLORS.violet, COLORS.blue, COLORS.green, COLORS.orange][i % 4],
                    opacity: 0.65,
                  }}
                />
              ))}
              <svg width={600} height={440} style={{ position: "absolute", left: 0, top: 0 }}>
                <line x1={40} y1={40} x2={40 + 520 * codeStrike} y2={40 + 360 * codeStrike} stroke={COLORS.red} strokeWidth={20} strokeLinecap="round" />
                <line x1={560} y1={40} x2={560 - 520 * codeStrike} y2={40 + 360 * codeStrike} stroke={COLORS.red} strokeWidth={20} strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ marginTop: 26, textAlign: "center" }}>
              <Headline size={76} color={COLORS.inkMuted}>
                Programmiert
              </Headline>
            </div>
          </Beat>
        </div>

        {/* Neuronales Netz */}
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible", opacity: Math.min(1, netOn * 1.3) }}>
          {EDGES.map((e, i) => (
            <line
              key={e.key}
              {...{ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 }}
              stroke={COLORS.blue}
              strokeWidth={2.5}
              opacity={0.12 + 0.4 * Math.max(0, Math.sin(frame / 9 + i * 0.9))}
            />
          ))}
          {NODES.map((n) => (
            <g key={`${n.l}-${n.i}`}>
              <circle cx={n.x} cy={n.y} r={30} fill={COLORS.blue} opacity={0.22 + 0.2 * Math.sin(frame / 11 + n.l + n.i)} />
              <circle cx={n.x} cy={n.y} r={19} fill={n.l === 3 ? COLORS.yellow : COLORS.ink} />
            </g>
          ))}
          {/* Datenstrom: Milliarden Beispiele */}
          {frame >= dataAt
            ? Array.from({ length: 28 }).map((_, i) => {
                const t = ((frame - dataAt) * 0.035 + random(`data-${i}`)) % 1;
                const target = nodeY(0, i % 4);
                const startY = NET_CY + (random(`data-y-${i}`) - 0.5) * 700;
                return (
                  <circle
                    key={i}
                    cx={2700 + t * 250}
                    cy={startY + (target - startY) * t}
                    r={7}
                    fill={COLORS.yellow}
                    opacity={Math.sin(t * Math.PI) * (1 - boxIn)}
                  />
                );
              })
            : null}
        </svg>
        <div style={{ position: "absolute", left: 2850, top: 60, width: 910, textAlign: "center", opacity: 1 - codeOut }}>
          <Marker at={trainAt} size={84}>
            Trainiert
          </Marker>
        </div>
        <Beat at={dataAt} out={b3.from - 2} style={{ position: "absolute", left: 2850, top: 930, width: 910, textAlign: "center" }}>
          <Kicker color={COLORS.yellow}>mit Milliarden von Beispielen</Kicker>
        </Beat>

        {/* Bild C: die Blackbox schließt sich */}
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
          <g opacity={boxIn}>
            <path d={`M ${BOX.x} ${BOX.y} l 70 -60 h ${BOX.w} l -70 60 Z`} fill="#1A2147" />
            <path d={`M ${BOX.x + BOX.w} ${BOX.y} l 70 -60 v ${BOX.h} l -70 60 Z`} fill="#0A0E24" />
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="#0F1433" opacity={0.93} />
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill="none" stroke={COLORS.blue} strokeOpacity={0.5} strokeWidth={4} />
          </g>
          {/* Lupe: sieht nur Gewirr */}
          <g
            opacity={lens > 0 && lens < 1 ? 1 : 0}
            transform={`translate(${BOX.x + 120 + lens * 620} ${BOX.y + 250 + Math.sin(lens * Math.PI * 2) * 120})`}
          >
            <circle r={110} fill="#172056" stroke={COLORS.ink} strokeWidth={12} />
            <path d="M -70 -20 q 30 -60 60 0 t 60 10 M -60 40 q 40 40 70 -10 t 50 -30" fill="none" stroke={COLORS.blue} strokeWidth={7} strokeLinecap="round" />
            <line x1={80} y1={80} x2={170} y2={170} stroke={COLORS.ink} strokeWidth={22} strokeLinecap="round" />
          </g>
          {/* Ausgang: was will sie? */}
          <g opacity={fork > 0 ? 1 : 0}>
            <DrawLine from={b4.from + 6} to={b4.from + 20} x1={BOX.x + BOX.w + 80} y1={NET_CY} x2={4130} y2={NET_CY} color={COLORS.ink} width={12} />
            <DrawLine from={b4.from + 20} to={b4.from + 36} x1={4130} y1={NET_CY} x2={4400} y2={330} color={COLORS.green} width={12} />
            <DrawLine from={b4.from + 20} to={b4.from + 36} x1={4130} y1={NET_CY} x2={4400} y2={730} color={COLORS.red} width={12} />
            <circle
              cx={4130 + 135 * (0.5 + 0.5 * Math.sin(frame / 6))}
              cy={NET_CY + (Math.floor(frame / 38) % 2 === 0 ? -1 : 1) * 100 * (0.5 + 0.5 * Math.sin(frame / 6))}
              r={16}
              fill={COLORS.ink}
              opacity={fork >= 1 ? 1 : 0}
            />
          </g>
        </svg>
        <div style={{ position: "absolute", left: BOX.x, top: BOX.y + 250, width: BOX.w, textAlign: "center" }}>
          <Letters text="Blackbox" at={boxAt} size={210} glow={COLORS.blue} style={{ display: "inline-block" }} />
        </div>
        <Beat at={b4.from + 34} enter="pop" style={{ position: "absolute", left: 4410, top: 240, display: "flex", alignItems: "center", gap: 24 }}>
          <svg width={150} height={150} viewBox="-75 -75 150 150">
            <circle r={72} fill={COLORS.green} />
            <circle r={48} fill={COLORS.bg} />
            <circle r={24} fill={COLORS.green} />
          </svg>
          <Headline size={72} color={COLORS.green}>
            Was wir
            <br />
            wollen
          </Headline>
        </Beat>
        <Beat at={wantAt} enter="pop" style={{ position: "absolute", left: 4410, top: 650, display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: COLORS.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.display,
              fontSize: 110,
              color: COLORS.ink,
            }}
          >
            ?
          </div>
          <Headline size={72} color={COLORS.red}>
            Etwas
            <br />
            anderes
          </Headline>
        </Beat>
      </Layer>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
        <Letters text="Was will sie wirklich?" at={b4.from + 2} size={120} />
      </AbsoluteFill>

      <Sfx name="swell" at={0} volume={0.22} />
      <Sfx name="stamp" at={alignAt} />
      <Sfx name="whoosh-soft" at={alignAt + 12} />
      <Sfx name="whoosh-long" at={b2.from - 14} />
      <Sfx name="stamp" at={notAt + 2} />
      <Sfx name="chime" at={trainAt} volume={0.22} />
      <Sfx name="counter" at={dataAt} volume={0.2} />
      <Sfx name="whoosh-long" at={b3.from} />
      <Sfx name="clunk" at={b3.from + 34} />
      <Sfx name="drop" at={boxAt} />
      <Sfx name="whoosh" at={b4.from - 6} />
      <Sfx name="pop" at={b4.from + 34} />
      <Sfx name="pop-low" at={wantAt} />
    </Stage>
  );
};
