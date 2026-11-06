import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { cue, endOf, wordAt, type Cues } from "../timeline";
import { SceneShell } from "./Background";
import { Checkmark, Rocket, Star } from "./Icons";
import { Beat, Headline, Sfx, useProgress, useShake, useSpringAt } from "./kinetic";

type CellId = "tl" | "tr" | "bl" | "br";

const CELLS: readonly { id: CellId; row: 0 | 1; col: 0 | 1; text: string }[] = [
  { id: "tl", row: 0, col: 0, text: "Alle sicherer" },
  { id: "tr", row: 0, col: 1, text: "USA fällt zurück" },
  { id: "bl", row: 1, col: 0, text: "China fällt zurück" },
  { id: "br", row: 1, col: 1, text: "Risiko für alle" },
];

const CELL_W = 450;
const CELL_H = 190;
const GAP = 16;
const ROW_HEAD_W = 280;
const GRID_X = (1920 - (ROW_HEAD_W + 2 * CELL_W + GAP)) / 2;
const GRID_Y = 360;

/** Halbe Bildschirmseite mit Farbe und Geschwindigkeitslinien. */
const Half: React.FC<{
  readonly side: "left" | "right";
  readonly color: string;
  readonly enter: number;
  readonly dim: number;
  readonly speed: number;
}> = ({ side, color, enter, dim, speed }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 960,
        left: side === "left" ? 0 : 960,
        backgroundColor: `${color}2E`,
        translate: `${(1 - enter) * (side === "left" ? -960 : 960)}px 0px`,
        opacity: 1 - dim * 0.75,
        overflow: "hidden",
      }}
    >
      <svg width={960} height={1080}>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 40 + ((i * 137) % 900);
          const y = ((frame * 28 + i * 211) % 1400) - 300;
          return (
            <line
              key={i}
              x1={x}
              y1={y}
              x2={x}
              y2={y + 160}
              stroke={COLORS.ink}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.18 * speed}
            />
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Geopolitik: USA vs. China im Wettrennen, Gefangenendilemma als
 * 2×2-Matrix, zum Schluss die Gegenüberstellung Regeln vs. Wettrennen.
 */
export const SplitScreen: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const g1 = cue(cues, "g1");
  const g2 = cue(cues, "g2");
  const g3 = cue(cues, "g3");
  const g4 = cue(cues, "g4");
  const g5 = cue(cues, "g5");
  const g6 = cue(cues, "g6");

  const usaAt = wordAt(g1, "USA");
  const chinaAt = wordAt(g1, "China");
  const raceAt = wordAt(g2, "Wettrennen");
  const dilemmaAt = wordAt(g3, "Gefangenendilemma");
  const safeAt = wordAt(g4, "sicherer");
  const behindAt = wordAt(g5, "zurück");
  const bothAt = wordAt(g5, "rasen");
  const rulesAt = wordAt(g6, "Regeln");
  const versusAt = wordAt(g6, "Wettrennen");
  const whoAt = wordAt(g6, "Wer");

  const leftIn = useSpringAt(usaAt - 4, SPRINGS.punch);
  const rightIn = useSpringAt(chinaAt - 4, SPRINGS.punch);
  const phase2In = useSpringAt(g3.from - 4, SPRINGS.smooth);
  const phase3 = useSpringAt(g6.from - 4, SPRINGS.smooth);
  const phase2 = phase2In - phase3;
  const versusIn = useSpringAt(versusAt, SPRINGS.pop);
  const race = useProgress(g2.from, endOf(g2) + 30);
  const racing = interpolate(frame, [g2.from, g2.from + 10, g3.from, g3.from + 10], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const marker = spring({ frame: frame - bothAt, fps, config: SPRINGS.punch });
  const shake = useShake(bothAt + 6, 14);

  const highlight = (id: CellId): { bg: string; fg: string; glow: number } => {
    if (id === "tl" && frame >= safeAt && frame < bothAt) {
      return { bg: COLORS.green, fg: COLORS.bg, glow: 1 };
    }
    if ((id === "tr" || id === "bl") && frame >= behindAt && frame < bothAt) {
      return { bg: COLORS.orange, fg: COLORS.bg, glow: 0.6 };
    }
    if (id === "br" && frame >= bothAt + 6) {
      return { bg: COLORS.red, fg: COLORS.ink, glow: 1 };
    }
    return { bg: COLORS.panel, fg: COLORS.inkSoft, glow: 0 };
  };

  const cellX = (col: number) => GRID_X + ROW_HEAD_W + col * (CELL_W + GAP);
  const cellY = (row: number) => GRID_Y + row * (CELL_H + GAP);
  const markerX = interpolate(marker, [0, 1], [cellX(0), cellX(1)]) + CELL_W / 2;
  const markerY = interpolate(marker, [0, 1], [cellY(0), cellY(1)]) + CELL_H / 2;
  const markerIn = useSpringAt(safeAt, SPRINGS.pop);

  // Phase 1: Raketen
  const rocketY = (offset: number) =>
    640 - race * 300 + Math.sin(frame / 9 + offset) * 26 * racing;

  return (
    <SceneShell seed="race" glow={COLORS.red} bg="#140D1E" push={0.02}>
      <AbsoluteFill style={{ translate: shake }}>
        <Half side="left" color={phase3 > 0.5 ? COLORS.euBlue : COLORS.blue} enter={leftIn} dim={phase2} speed={racing} />
        <Half side="right" color={COLORS.red} enter={rightIn} dim={phase2} speed={racing + phase3} />

        {/* Phase 1: USA vs. China */}
        <div style={{ opacity: 1 - Math.max(phase2, phase3) }}>
          <Beat at={usaAt} enter="drop" style={{ position: "absolute", left: 0, width: 960, top: 90, textAlign: "center" }}>
            <Headline size={210} color={COLORS.blue}>
              USA
            </Headline>
          </Beat>
          <Beat at={chinaAt} enter="drop" style={{ position: "absolute", left: 960, width: 960, top: 90, textAlign: "center" }}>
            <Headline size={210} color={COLORS.red}>
              China
            </Headline>
          </Beat>
          <div style={{ position: "absolute", left: 480 - 85, top: rocketY(0), opacity: leftIn, rotate: `${Math.sin(frame / 7) * 3 * racing}deg` }}>
            <Rocket size={170} color={COLORS.blue} flame={0.5 + 0.5 * Math.sin(frame * 1.7)} />
          </div>
          <div style={{ position: "absolute", left: 1440 - 85, top: rocketY(Math.PI), opacity: rightIn, rotate: `${Math.sin(frame / 7 + 1) * 3 * racing}deg` }}>
            <Rocket size={170} color={COLORS.red} flame={0.5 + 0.5 * Math.sin(frame * 1.9 + 1)} />
          </div>
          <Beat at={raceAt} enter="slam" style={{ position: "absolute", left: 0, right: 0, top: 840, textAlign: "center" }}>
            <Headline size={180} style={{ textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
              Wettrennen
            </Headline>
          </Beat>
        </div>

        {/* VS-Badge */}
        <div
          style={{
            position: "absolute",
            left: 960 - 75,
            top: 540 - 75,
            width: 150,
            height: 150,
            borderRadius: 999,
            backgroundColor: COLORS.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT.display,
            fontSize: 74,
            color: COLORS.bg,
            boxShadow: SHADOW.card,
            scale: String(Math.min(leftIn, rightIn) * (1 - phase2)),
          }}
        >
          VS
        </div>

        {/* Phase 2: Gefangenendilemma */}
        <div style={{ opacity: phase2 }}>
          <Beat at={dilemmaAt} enter="slam" style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
            <Headline size={130} color={COLORS.yellow}>
              Gefangenendilemma
            </Headline>
          </Beat>
          {[0, 1].map((col) => (
            <Beat
              key={`col-${col}`}
              at={dilemmaAt + 4 + col * 3}
              style={{ position: "absolute", left: cellX(col), top: GRID_Y - 66, width: CELL_W, textAlign: "center" }}
            >
              <HeaderLabel country="China" action={col === 0 ? "bremst" : "rast"} color={COLORS.red} />
            </Beat>
          ))}
          {[0, 1].map((row) => (
            <Beat
              key={`row-${row}`}
              at={dilemmaAt + 4 + row * 3}
              style={{
                position: "absolute",
                left: GRID_X,
                top: cellY(row),
                width: ROW_HEAD_W - 20,
                height: CELL_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <HeaderLabel country="USA" action={row === 0 ? "bremst" : "rast"} color={COLORS.blue} />
            </Beat>
          ))}
          {CELLS.map((c, i) => {
            const h = highlight(c.id);
            return (
              <Beat
                key={c.id}
                at={dilemmaAt + 8 + i * 3}
                enter="pop"
                style={{ position: "absolute", left: cellX(c.col), top: cellY(c.row) }}
              >
                <div
                  style={{
                    width: CELL_W,
                    height: CELL_H,
                    borderRadius: 26,
                    backgroundColor: h.bg,
                    boxShadow: h.glow > 0 ? SHADOW.glow(h.bg, h.glow) : SHADOW.card,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontFamily: FONT.display,
                    fontSize: 64,
                    lineHeight: 1,
                    textTransform: "uppercase",
                    color: h.fg,
                    padding: "0 30px",
                  }}
                >
                  {c.text}
                </div>
              </Beat>
            );
          })}
          {/* Spielstein: wandert vom Ideal ins Gleichgewicht */}
          <div
            style={{
              position: "absolute",
              left: markerX - CELL_W / 2 - 40,
              top: markerY - CELL_H / 2 - 40,
              scale: String(markerIn),
            }}
          >
            {frame < bothAt ? (
              <Checkmark size={80} />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 999,
                  backgroundColor: COLORS.ink,
                  border: `10px solid ${COLORS.red}`,
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
          <div
            style={{
              position: "absolute",
              left: cellX(1) + CELL_W - 70,
              top: cellY(1) - 36,
              opacity: frame >= bothAt + 6 ? 1 : 0,
              scale: String(spring({ frame: frame - bothAt - 6, fps, config: SPRINGS.pop })),
              rotate: "8deg",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 18px",
                borderRadius: 10,
                backgroundColor: COLORS.ink,
                color: COLORS.red,
                fontFamily: FONT.sans,
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: "0.08em",
              }}
            >
              GLEICHGEWICHT
            </span>
          </div>
        </div>

        {/* Phase 3: Regeln vs. Wettrennen */}
        <div style={{ opacity: phase3 }}>
          <Beat at={rulesAt} enter="slam" style={{ position: "absolute", left: 0, width: 960, top: 300, textAlign: "center" }}>
            <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 20px" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return (
                  <div
                    key={i}
                    style={{ position: "absolute", left: 100 + Math.cos(a) * 80 - 15, top: 100 + Math.sin(a) * 80 - 15 }}
                  >
                    <Star size={30} />
                  </div>
                );
              })}
            </div>
            <Headline size={150}>Regeln</Headline>
          </Beat>
          <Beat at={versusAt} enter="slam" style={{ position: "absolute", left: 960, width: 960, top: 300, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20, height: 200, alignItems: "flex-end" }}>
              <Rocket size={110} color={COLORS.blue} flame={0.5 + 0.5 * Math.sin(frame)} />
              <Rocket size={110} color={COLORS.red} flame={0.5 + 0.5 * Math.sin(frame + 2)} />
            </div>
            <Headline size={150}>Wettrennen</Headline>
          </Beat>
          <Beat at={whoAt} enter="rise" style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center" }}>
            <Headline size={120} color={COLORS.yellow}>
              Wer setzt sich durch?
            </Headline>
          </Beat>
          <div
            style={{
              position: "absolute",
              left: 960 - 70,
              top: 470,
              width: 140,
              height: 140,
              borderRadius: 999,
              backgroundColor: COLORS.ink,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.display,
              fontSize: 66,
              color: COLORS.bg,
              scale: String(versusIn),
            }}
          >
            VS
          </div>
        </div>
      </AbsoluteFill>

      <Sfx name="whoosh" at={usaAt - 6} />
      <Sfx name="whoosh" at={chinaAt - 6} />
      <Sfx name="riser" at={g2.from - 8} volume={0.25} />
      <Sfx name="stamp" at={raceAt} />
      <Sfx name="whoosh-soft" at={g3.from - 4} />
      <Sfx name="stamp" at={dilemmaAt} />
      <Sfx name="ding" at={safeAt} volume={0.28} />
      <Sfx name="pop-low" at={behindAt} />
      <Sfx name="whoosh-soft" at={bothAt} />
      <Sfx name="impact" at={bothAt + 6} volume={0.32} />
      <Sfx name="whoosh" at={g6.from - 6} />
      <Sfx name="stamp" at={rulesAt} />
      <Sfx name="stamp" at={versusAt} />
      <Sfx name="pop" at={whoAt} />
    </SceneShell>
  );
};

const HeaderLabel: React.FC<{
  readonly country: string;
  readonly action: string;
  readonly color: string;
}> = ({ country, action, color }) => (
  <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 34, letterSpacing: "0.04em", textTransform: "uppercase" }}>
    <span style={{ color }}>{country}</span> <span style={{ color: COLORS.inkSoft }}>{action}</span>
  </div>
);
