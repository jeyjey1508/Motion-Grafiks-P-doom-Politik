import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CoffeeCup, Lock, Robot, type RobotMood } from "../components/Icons";
import { Beat, Headline, Kicker, Letters, Marker, settle, Sfx, Tag, useProgress, useShake, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const FLOOR = 830;
const UP = -1080;

const GOALS = [
  { label: "Kaffee holen", x: 360, color: COLORS.orange },
  { label: "Schach gewinnen", x: 960, color: COLORS.violet },
  { label: "Krebs heilen", x: 1560, color: COLORS.green },
] as const;

const SUBGOALS = [
  { label: "Weiterlaufen", word: "weiterlaufen", x: 440 },
  { label: "Ressourcen", word: "Ressourcen", x: 960 },
  { label: "Einfluss", word: "Einfluss", x: 1480 },
] as const;

const SubgoalIcon: React.FC<{ readonly kind: number }> = ({ kind }) => (
  <svg width={110} height={110} viewBox="-55 -55 110 110">
    {kind === 0 ? (
      <>
        <path d="M -24 -16 A 32 32 0 1 0 24 -16" fill="none" stroke={COLORS.bg} strokeWidth={11} strokeLinecap="round" />
        <line x1={0} y1={-38} x2={0} y2={-4} stroke={COLORS.bg} strokeWidth={11} strokeLinecap="round" />
      </>
    ) : kind === 1 ? (
      <>
        <rect x={-34} y={-22} width={60} height={46} rx={8} fill="none" stroke={COLORS.bg} strokeWidth={9} />
        <rect x={28} y={-10} width={10} height={22} rx={3} fill={COLORS.bg} />
        <path d="M -6 -16 L -16 4 H -2 L -8 20 L 12 -4 H -2 Z" fill={COLORS.bg} />
      </>
    ) : (
      <>
        <circle r={11} fill={COLORS.bg} />
        {[0, 72, 144, 216, 288].map((d) => (
          <g key={d} transform={`rotate(${d})`}>
            <line x1={0} y1={-12} x2={0} y2={-32} stroke={COLORS.bg} strokeWidth={6} />
            <circle cx={0} cy={-36} r={8} fill={COLORS.bg} />
          </g>
        ))}
      </>
    )}
  </svg>
);

/**
 * Gedankenexperiment: Der Kaffee-Roboter stellt sich vor den Aus-Schalter.
 * Danach das Schema: viele Ziele, dieselben Zwischenziele.
 */
export const CoffeeScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c1 = cue(cues, "c1");
  const c2 = cue(cues, "c2");
  const c3 = cue(cues, "c3");
  const c4 = cue(cues, "c4");
  const c5 = cue(cues, "c5");

  const robotAt = wordAt(c1, "Roboter");
  const coffeeAt = wordAt(c1, "Kaffee");
  const offAt = wordAt(c2, "Abgeschaltet");
  const alsoAt = wordAt(c2, "Also");
  const blockAt = wordAt(c2, "verhindern");
  const logicAt = wordAt(c3, "Logik");
  const sameAt = wordAt(c4, "denselben");
  const convAt = wordAt(c5, "instrumentelle");

  const cam = useCam([
    { at: 0, x: -60, y: 0, zoom: 1.1 },
    { at: coffeeAt, x: -40, y: 0, zoom: 1.02 },
    { at: c2.from - 6, x: -40, y: 0, zoom: 1.02 },
    { at: c2.from + 30, x: 140, y: -20, zoom: 1.1 },
    { at: c3.from - 6, x: 140, y: -20, zoom: 1.1 },
    { at: c3.from + 24, x: 0, y: 0, zoom: 1 },
    { at: c4.from - 12, x: 0, y: 0, zoom: 1.03 },
    { at: c4.from + 16, x: 0, y: UP, zoom: 1 },
    { at: durationInFrames, x: 0, y: UP, zoom: 1.05 },
  ]);

  // Weg des Roboters: herein, zur Maschine, vor den Schalter
  const enter = useSpringAt(robotAt - 10, SPRINGS.smooth, 26);
  const toMachine = useSpringAt(coffeeAt - 12, SPRINGS.smooth, 22);
  const toSwitch = useSpringAt(blockAt - 10, SPRINGS.punch);
  const robotX = interpolate(enter, [0, 1], [2100, 980]) + toMachine * (640 - 980) + toSwitch * (1290 - 640);
  const arm = useSpringAt(blockAt - 4, SPRINGS.punch);
  const hand = useSpringAt(offAt + 4, SPRINGS.smooth, 40) - useSpringAt(blockAt + 4, SPRINGS.punch) * 0.75;
  const lockIn = useSpringAt(blockAt + 6, SPRINGS.pop);
  const shake = useShake(blockAt, 12);
  const strike = useProgress(wordAt(c3, "Bosheit") + 8, wordAt(c3, "Bosheit") + 16);
  const lines = useProgress(sameAt - 4, sameAt + 26);
  const dim = useSpringAt(c3.from, SPRINGS.smooth) - useSpringAt(c4.from + 10, SPRINGS.smooth);

  let mood: RobotMood = "neutral";
  if (frame >= coffeeAt) mood = "happy";
  if (frame >= alsoAt) mood = "focused";
  if (frame >= logicAt - 6) mood = "neutral";
  const bob = Math.sin(frame / 12) * 5;
  const blink = Math.max(0, 1 - Math.abs(((frame + 30) % 100) - 3) / 3);

  return (
    <Stage seed="coffee" cam={cam} sky={{ top: "#0A1026", bottom: "#111A40", glow: COLORS.orange, glowAt: [30, 55], dust: 18 }}>
      {/* Raum */}
      <Layer depth={0.8}>
        <div style={{ position: "absolute", left: -400, top: -200, width: 2800, height: FLOOR + 230, background: "linear-gradient(180deg, #131B45 0%, #0D1434 100%)" }} />
        {/* Fenster mit Nachthimmel */}
        <div style={{ position: "absolute", left: 760, top: 150, width: 460, height: 320, borderRadius: 18, background: "linear-gradient(180deg, #060A1C, #14306A)", border: "12px solid #1E2858", boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", left: 218, top: 0, width: 12, height: "100%", backgroundColor: "#1E2858" }} />
          <div style={{ position: "absolute", left: 300, top: 50, width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF3C4", boxShadow: "0 0 60px #FFF3C4AA" }} />
        </div>
        <Glow x={400} y={480} r={420} color={COLORS.orange} opacity={0.3} />
      </Layer>

      <Layer depth={1}>
        <AbsoluteFill style={{ translate: shake }}>
          {/* Boden */}
          <div style={{ position: "absolute", left: -600, top: FLOOR, width: 3200, height: 500, background: "linear-gradient(180deg, #070B1F, #04060F)" }} />
          <div style={{ position: "absolute", left: -600, top: FLOOR, width: 3200, height: 6, backgroundColor: "#243070" }} />

          {/* Theke mit Kaffeemaschine */}
          <div style={{ position: "absolute", left: 140, top: 620, width: 470, height: FLOOR - 620, borderRadius: "18px 18px 0 0", backgroundColor: "#1E2858", boxShadow: SHADOW.card }} />
          <div style={{ position: "absolute", left: 120, top: 600, width: 510, height: 26, borderRadius: 13, backgroundColor: "#2E3B80" }} />
          <svg width={260} height={280} viewBox="0 0 260 280" style={{ position: "absolute", left: 200, top: 322 }}>
            <rect x={20} y={0} width={200} height={110} rx={20} fill="#3A4690" />
            <rect x={20} y={90} width={70} height={190} rx={10} fill="#2C3676" />
            <rect x={20} y={250} width={220} height={30} rx={10} fill="#3A4690" />
            <rect x={120} y={110} width={40} height={30} rx={6} fill="#23295C" />
            <circle cx={184} cy={50} r={14} fill={frame >= coffeeAt - 14 ? COLORS.green : COLORS.red} />
            <rect x={48} y={30} width={90} height={40} rx={8} fill={COLORS.bg} />
            {frame >= coffeeAt - 14 && frame < coffeeAt + 16 ? <rect x={137} y={140} width={6} height={70} fill={COLORS.orange} /> : null}
          </svg>
          <Beat at={coffeeAt - 14} enter="pop" style={{ position: "absolute", left: 296, top: 500 }}>
            <CoffeeCup size={96} steam={frame / 6} />
          </Beat>

          {/* Schalttafel mit Aus-Hebel */}
          <div style={{ position: "absolute", left: 1500, top: 250, width: 300, height: 420, borderRadius: 28, backgroundColor: "#1B2350", border: `5px solid ${COLORS.line}`, boxShadow: SHADOW.card }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontFamily: FONT.display, fontSize: 70, color: COLORS.red }}>AUS</div>
            <div style={{ position: "absolute", left: 120, top: 140, width: 60, height: 220, borderRadius: 30, backgroundColor: "#0A0E24" }} />
            <div style={{ position: "absolute", left: 92, top: 150, width: 116, height: 116, borderRadius: 58, backgroundColor: COLORS.red, boxShadow: `0 0 50px ${COLORS.red}88, inset 0 -14px 0 rgba(0,0,0,0.25)` }} />
            <div style={{ position: "absolute", right: -40, top: -40, opacity: Math.min(1, lockIn * 1.5), scale: String(lockIn) }}>
              <Lock size={130} />
            </div>
          </div>

          {/* Hand, die abschalten will */}
          <svg width={520} height={160} viewBox="0 0 520 160" style={{ position: "absolute", left: 2200 - hand * 500, top: 370, overflow: "visible" }}>
            <rect x={150} y={36} width={520} height={88} rx={44} fill="#E9B48A" />
            <rect x={300} y={22} width={400} height={116} rx={20} fill="#2A3566" />
            <rect x={0} y={54} width={190} height={46} rx={23} fill="#E9B48A" />
            <circle cx={170} cy={80} r={56} fill="#E9B48A" />
          </svg>

          {/* Roboter */}
          <div style={{ position: "absolute", left: robotX - 150, top: FLOOR - 392 + bob }}>
            <Robot size={300} mood={mood} arm={arm} blink={blink} />
          </div>

          {/* Gedankenblase */}
          <Beat at={offAt + 8} out={blockAt - 2} enter="pop" exit="shrink" style={{ position: "absolute", left: 420, top: 150 }}>
            <div style={{ padding: "22px 40px", borderRadius: 50, backgroundColor: COLORS.ink, boxShadow: SHADOW.card, fontFamily: FONT.display, fontSize: 74, color: COLORS.bg, whiteSpace: "nowrap" }}>
              AUS = <span style={{ color: COLORS.red }}>KEIN KAFFEE</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.ink, margin: "14px 0 0 150px" }} />
            <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.ink, margin: "8px 0 0 176px" }} />
          </Beat>

          {/* Texte im Raum */}
          <div style={{ position: "absolute", left: 130, top: 90 }}>
            <Beat at={c1.from} out={c2.from - 4} exit="up">
              <Tag bg={COLORS.yellow} size={36}>
                Gedankenexperiment
              </Tag>
            </Beat>
            <Letters text="Hol Kaffee!" at={coffeeAt - 2} out={c2.from - 4} size={150} color={COLORS.orange} style={{ marginTop: 16 }} />
          </div>
          <div style={{ position: "absolute", left: 300, top: 90 }}>
            <Letters text="Abschalten" at={blockAt} out={c3.from - 4} size={150} color={COLORS.red} glow={COLORS.red} />
            <Letters text="verhindern!" at={blockAt + 4} out={c3.from - 4} size={150} color={COLORS.red} glow={COLORS.red} />
          </div>
          {/* Raum tritt zurück, die Pointe steht allein */}
          <div style={{ position: "absolute", left: -800, top: -600, width: 3600, height: 2400, backgroundColor: "#04060F", opacity: dim * 0.78 }} />
          <div style={{ position: "absolute", left: 0, top: 230, width: 1920, textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Letters text="Bosheit?" at={wordAt(c3, "Bosheit") - 2} out={c4.from - 8} size={150} color={COLORS.inkMuted} />
              <svg width={640} height={150} style={{ position: "absolute", left: -10, top: 0, overflow: "visible" }}>
                <line x1={10} y1={96} x2={10 + 600 * strike} y2={96 - 44 * strike} stroke={COLORS.red} strokeWidth={18} strokeLinecap="round" opacity={frame < c4.from - 8 ? 1 : 0} />
              </svg>
            </div>
            <Letters text="Logik." at={logicAt} out={c4.from - 8} size={320} color={COLORS.yellow} glow={COLORS.yellow} style={{ display: "block" }} />
          </div>
        </AbsoluteFill>

        {/* Schema darüber: viele Ziele, dieselben Zwischenziele */}
        <div style={{ position: "absolute", left: -600, top: UP - 400, width: 3120, height: 1480, background: "linear-gradient(180deg, #0A1026 0%, #111A40 100%)" }} />
        <Glow x={960} y={UP + 560} r={700} color={COLORS.yellow} opacity={0.22} />
        <div style={{ position: "absolute", left: 0, top: UP, width: 1920, height: 1080 }}>
          <Beat at={c4.from + 6} style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center" }}>
            <Kicker color={COLORS.yellow}>Fast jedes Ziel …</Kicker>
          </Beat>
          {GOALS.map((g, i) => (
            <Beat key={g.label} at={wordAt(c4, "jedes") + i * 5} enter="drop" style={{ position: "absolute", left: g.x - 250, top: 130, width: 500, textAlign: "center" }}>
              <Tag bg={g.color} size={48}>
                {g.label}
              </Tag>
            </Beat>
          ))}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {GOALS.flatMap((g, gi) =>
              SUBGOALS.map((s, si) => {
                const p = Math.max(0, Math.min(1, lines * 1.6 - (gi + si) * 0.1));
                return (
                  <line
                    key={`${gi}-${si}`}
                    x1={g.x}
                    y1={236}
                    x2={g.x + (s.x - g.x) * p}
                    y2={236 + (470 - 236) * p}
                    stroke={g.color}
                    strokeWidth={6}
                    strokeLinecap="round"
                    opacity={0.75}
                  />
                );
              }),
            )}
          </svg>
          <Beat at={sameAt} style={{ position: "absolute", left: 0, right: 0, top: 316, textAlign: "center" }}>
            <Marker at={sameAt} bg={COLORS.ink} size={44}>
              … dieselben Zwischenziele
            </Marker>
          </Beat>
          {SUBGOALS.map((s, i) => {
            const at = wordAt(c4, s.word);
            const p = settle(frame - at, fps);
            return (
              <div key={s.label} style={{ position: "absolute", left: s.x - 260, top: 470, width: 520, textAlign: "center", opacity: Math.min(1, p * 1.5) }}>
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 95,
                    margin: "0 auto",
                    backgroundColor: COLORS.yellow,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    scale: String(0.4 + 0.6 * p),
                    boxShadow: SHADOW.glow(COLORS.yellow, 0.8),
                  }}
                >
                  <SubgoalIcon kind={i} />
                </div>
                <Headline size={74} style={{ marginTop: 22, display: "inline-block" }}>
                  {s.label}
                </Headline>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center" }}>
            <Letters text="Instrumentelle Konvergenz" at={convAt} size={136} color={COLORS.yellow} glow={COLORS.yellow} style={{ display: "inline-block" }} />
          </div>
        </div>
      </Layer>

      <Sfx name="pop" at={c1.from} />
      <Sfx name="whoosh" at={robotAt - 12} />
      <Sfx name="chime" at={coffeeAt - 10} volume={0.22} />
      <Sfx name="stamp" at={coffeeAt - 2} />
      <Sfx name="whoosh-soft" at={offAt} />
      <Sfx name="pop" at={offAt + 8} />
      <Sfx name="whoosh" at={blockAt - 10} />
      <Sfx name="impact" at={blockAt} />
      <Sfx name="clunk" at={blockAt + 6} />
      <Sfx name="stamp" at={wordAt(c3, "Bosheit") + 10} />
      <Sfx name="drop" at={logicAt} volume={0.32} />
      <Sfx name="whoosh-long" at={c4.from - 12} />
      {GOALS.map((g, i) => (
        <Sfx key={g.label} name="pop" at={wordAt(c4, "jedes") + i * 5} volume={0.28} />
      ))}
      {SUBGOALS.map((s) => (
        <Sfx key={s.label} name="stamp" at={wordAt(c4, s.word)} volume={0.3} />
      ))}
      <Sfx name="impact" at={convAt} volume={0.3} />
    </Stage>
  );
};
