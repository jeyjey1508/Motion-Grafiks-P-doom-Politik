import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Beat, Headline, Kicker, Letters, settle, Sfx, Tag, useShake } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { Checkmark } from "../components/Icons";
import { COLORS, SHADOW } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const PIVOT = { x: 960, y: 350 };
const ARM = 520;
const CHAIN = 190;
const PAN_W = 380;

const gearPath = (r: number, teeth: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rr = i % 4 < 2 ? r : r * 0.84;
    pts.push(`${i === 0 ? "M" : "L"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
};

const BIG_GEAR = gearPath(170, 14);
const SMALL_GEAR = gearPath(86, 7);

type Step = { readonly at: number; readonly side: "L" | "R"; readonly delta: number };

/**
 * Wettrüsten als Maschine: Jede Seite legt Gewichte auf ihre Waagschale,
 * jedes Gewicht dreht das Getriebe weiter und treibt das Risiko nach oben.
 */
export const DilemmaScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const g1 = cue(cues, "g1");
  const g2 = cue(cues, "g2");
  const g3 = cue(cues, "g3");
  const g4 = cue(cues, "g4");

  const raceAt = wordAt(g1, "Wettrüsten");
  const brakeAt = wordAt(g2, "bremsen");
  const saferAt = wordAt(g2, "sicherer");
  const aloneAt = wordAt(g3, "allein");
  const behindAt = wordAt(g3, "zurück");
  const gasAt = wordAt(g3, "jeder");
  const dilemmaAt = wordAt(g4, "Gefangenendilemma");
  const reasonAt = wordAt(g4, "vernünftig");
  const loseAt = wordAt(g4, "verlieren");

  // Drehbuch der Gewichte
  const steps: Step[] = [
    { at: g1.from + 14, side: "L", delta: 1 },
    { at: g1.from + 30, side: "R", delta: 1 },
    { at: raceAt + 8, side: "L", delta: 1 },
    { at: raceAt + 22, side: "R", delta: 1 },
    { at: brakeAt - 2, side: "L", delta: -2 },
    { at: brakeAt + 4, side: "R", delta: -2 },
    { at: aloneAt, side: "R", delta: 2 },
    { at: gasAt, side: "L", delta: 2 },
    { at: gasAt + 10, side: "R", delta: 1 },
    { at: gasAt + 20, side: "L", delta: 1 },
    { at: reasonAt, side: "L", delta: 1 },
    { at: reasonAt + 10, side: "R", delta: 1 },
    { at: loseAt - 6, side: "L", delta: 1 },
    { at: loseAt - 2, side: "R", delta: 1 },
  ];
  const count = (side: "L" | "R") =>
    steps.filter((s) => s.side === side).reduce((sum, s) => sum + s.delta * settle(frame - s.at, fps, 16), 0);
  const nL = count("L");
  const nR = count("R");
  const turned = steps.filter((s) => s.delta > 0).reduce((sum, s) => sum + s.delta * settle(frame - s.at, fps, 9), 0);

  const theta = Math.max(-15, Math.min(15, (nR - nL) * 7));
  const rad = (theta * Math.PI) / 180;
  const left = { x: PIVOT.x - ARM * Math.cos(rad), y: PIVOT.y - ARM * Math.sin(rad) };
  const right = { x: PIVOT.x + ARM * Math.cos(rad), y: PIVOT.y + ARM * Math.sin(rad) };
  const risk = Math.max(0.04, Math.min(1, (nL + nR) / 10));
  const riskColor = risk < 0.3 ? COLORS.green : risk < 0.6 ? COLORS.yellow : risk < 0.85 ? COLORS.orange : COLORS.red;

  const cam = useCam([
    { at: 0, x: 0, y: 30, zoom: 1.1 },
    { at: raceAt + 20, x: 0, y: 0, zoom: 1 },
    { at: g3.from, x: 0, y: 0, zoom: 1.02 },
    { at: g4.from, x: 0, y: 0, zoom: 1.04 },
    { at: durationInFrames, x: 0, y: 10, zoom: 1.1 },
  ]);
  const shake = useShake(loseAt, 16);
  const alarm = frame >= loseAt ? 0.5 + 0.5 * Math.sin(frame / 3) : 0;

  const renderPan = (at: { x: number; y: number }, n: number, color: string, label: string) => (
    <>
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <line x1={at.x} y1={at.y} x2={at.x - PAN_W / 2 + 20} y2={at.y + CHAIN} stroke={COLORS.inkSoft} strokeWidth={5} />
        <line x1={at.x} y1={at.y} x2={at.x + PAN_W / 2 - 20} y2={at.y + CHAIN} stroke={COLORS.inkSoft} strokeWidth={5} />
        <path
          d={`M ${at.x - PAN_W / 2} ${at.y + CHAIN} h ${PAN_W} q -20 60 -90 60 h ${-(PAN_W - 180)} q -70 0 -90 -60 Z`}
          fill={color}
        />
        <circle cx={at.x} cy={at.y} r={16} fill={COLORS.ink} />
      </svg>
      {/* Gewichte: Chip-Blöcke */}
      {Array.from({ length: 6 }).map((_, k) => {
        const v = Math.max(0, Math.min(1, n - k));
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: at.x - 70 + (k % 2 === 0 ? -6 : 6),
              top: at.y + CHAIN - 54 - k * 52 - (1 - v) * 120,
              width: 140,
              height: 46,
              borderRadius: 10,
              backgroundColor: COLORS.ink,
              border: `5px solid ${color}`,
              boxSizing: "border-box",
              opacity: v,
              boxShadow: SHADOW.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 22, height: 14, borderRadius: 3, backgroundColor: color }} />
            ))}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: at.x - 200, top: at.y + CHAIN + 76, width: 400, textAlign: "center" }}>
        <Headline size={96} color={color}>
          {label}
        </Headline>
      </div>
    </>
  );

  return (
    <Stage seed="dilemma" cam={cam} sky={{ top: "#0C0818", bottom: "#1C0F2A", glow: riskColor, glowAt: [50, 60], dust: 18 }}>
      <Layer depth={0.6}>
        <Glow x={960} y={700} r={760} color={riskColor} opacity={0.35 + alarm * 0.25} />
        {/* Getriebe im Hintergrund */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
          <g transform={`translate(700 800) rotate(${turned * 38})`}>
            <path d={BIG_GEAR} fill="#2A2350" stroke={COLORS.blue} strokeWidth={5} />
            <circle r={54} fill="#120B22" stroke={COLORS.blue} strokeWidth={5} />
          </g>
          <g transform={`translate(960 800) rotate(${-turned * 76 + 12})`}>
            <path d={SMALL_GEAR} fill="#2A2350" stroke={COLORS.inkSoft} strokeWidth={5} />
            <circle r={26} fill="#120B22" stroke={COLORS.inkSoft} strokeWidth={5} />
          </g>
          <g transform={`translate(1220 800) rotate(${turned * 38 + 8})`}>
            <path d={BIG_GEAR} fill="#2A2350" stroke={COLORS.red} strokeWidth={5} />
            <circle r={54} fill="#120B22" stroke={COLORS.red} strokeWidth={5} />
          </g>
        </svg>
      </Layer>

      <Layer depth={1}>
        <AbsoluteFill style={{ translate: shake }}>
          {/* Ständer und Balken */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <rect x={PIVOT.x - 16} y={PIVOT.y} width={32} height={600} fill={COLORS.inkSoft} />
            <path d={`M ${PIVOT.x - 150} 960 h 300 l -40 -40 h -220 Z`} fill={COLORS.inkSoft} />
            <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke={COLORS.ink} strokeWidth={22} strokeLinecap="round" />
            <circle cx={PIVOT.x} cy={PIVOT.y} r={36} fill={COLORS.yellow} stroke={COLORS.bg} strokeWidth={8} />
          </svg>
          {renderPan(left, nL, COLORS.blue, "USA")}
          {renderPan(right, nR, COLORS.red, "China")}

          {/* Risiko-Anzeige */}
          <div style={{ position: "absolute", left: 1690, top: 250, width: 110, textAlign: "center" }}>
            <Kicker color={riskColor} style={{ fontSize: 28, letterSpacing: "0.1em" }}>
              Risiko
            </Kicker>
            <div
              style={{
                position: "relative",
                margin: "14px auto 0",
                width: 64,
                height: 560,
                borderRadius: 32,
                backgroundColor: "#0A0614",
                border: `4px solid ${COLORS.line}`,
                overflow: "hidden",
                boxShadow: alarm > 0 ? SHADOW.glow(COLORS.red, 0.6 + alarm) : "none",
              }}
            >
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${risk * 100}%`, backgroundColor: riskColor }} />
            </div>
          </div>

          {/* Wer allein bremst … */}
          <Beat at={behindAt - 4} out={gasAt + 4} enter="pop" exit="up" style={{ position: "absolute", left: PIVOT.x - ARM - 230, top: left.y + CHAIN + 186, width: 460, textAlign: "center" }}>
            <Tag bg={COLORS.orange} size={50}>
              Fällt zurück
            </Tag>
          </Beat>
          {(["L", "R"] as const).map((side) => (
            <Beat
              key={side}
              at={reasonAt - 2 + (side === "R" ? 6 : 0)}
              out={loseAt - 4}
              enter="pop"
              exit="up"
              style={{ position: "absolute", left: (side === "L" ? PIVOT.x - ARM : PIVOT.x + ARM) - 230, top: (side === "L" ? left.y : right.y) + CHAIN + 186, width: 460, textAlign: "center" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
                <Tag bg={COLORS.green} size={44}>
                  Vernünftig
                </Tag>
                <Checkmark size={70} />
              </div>
            </Beat>
          ))}
        </AbsoluteFill>
      </Layer>

      {/* Überschriften */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 44 }}>
        <Letters text="Wettrüsten" at={raceAt - 2} out={g2.from - 2} size={170} glow={COLORS.red} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 44 }}>
        <Letters text="Alle sicherer" at={saferAt - 2} out={g3.from + 4} size={170} color={COLORS.green} glow={COLORS.green} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 44 }}>
        <Letters text="Also gibt jeder Gas" at={gasAt - 2} out={g4.from - 2} size={150} color={COLORS.orange} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 44 }}>
        <Letters text="Gefangenendilemma" at={dilemmaAt - 2} out={loseAt - 6} size={170} color={COLORS.yellow} glow={COLORS.yellow} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 44 }}>
        <Letters text="Am Ende verlieren alle." at={loseAt - 2} size={170} color={COLORS.red} glow={COLORS.red} />
      </AbsoluteFill>

      <Sfx name="whoosh" at={0} />
      {steps.map((s, i) => (
        <Sfx key={i} name={s.delta > 0 ? "clunk" : "whoosh-soft"} at={s.at} volume={s.delta > 0 ? 0.3 : 0.26} />
      ))}
      <Sfx name="stamp" at={raceAt - 2} />
      <Sfx name="chime" at={saferAt - 2} volume={0.26} />
      <Sfx name="pop-low" at={behindAt - 4} />
      <Sfx name="riser" at={gasAt - 10} volume={0.24} />
      <Sfx name="stamp" at={gasAt - 2} />
      <Sfx name="impact" at={dilemmaAt - 2} volume={0.3} />
      <Sfx name="pop" at={reasonAt - 2} />
      <Sfx name="pop" at={reasonAt + 4} />
      <Sfx name="alarm" at={loseAt} />
      <Sfx name="drop" at={loseAt - 2} volume={0.45} />
    </Stage>
  );
};
