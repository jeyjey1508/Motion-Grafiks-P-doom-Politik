import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, endOf, wordAt, type Cues } from "../timeline";
import { SceneShell } from "./Background";
import { Clipboard, CoffeeCup, Lock, PowerButton, Robot, Target, type RobotMood } from "./Icons";
import { Beat, Headline, Kicker, Sfx, Tag, useSpringAt } from "./kinetic";

const STEPS = [
  { n: 1, label: "Ziel", color: COLORS.orange },
  { n: 2, label: "Instrumentelle Konvergenz", color: COLORS.yellow },
  { n: 3, label: "Täuschung", color: COLORS.red },
] as const;

/**
 * Kontrollproblem als Bildgeschichte: Ein Roboter soll Kaffee holen,
 * verhindert sein Abschalten und verstellt sich im Test.
 * Ziel → Instrumentelle Konvergenz → Täuschung.
 */
export const AlignmentFlow: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const a1 = cue(cues, "a1");
  const a2 = cue(cues, "a2");
  const a3 = cue(cues, "a3");
  const a4 = cue(cues, "a4");
  const a5 = cue(cues, "a5");

  const alignAt = wordAt(a1, "Elainment");
  const goalsAt = wordAt(a1, "Ziele");
  const coffeeAt = wordAt(a2, "Kaffee");
  const offAt = wordAt(a3, "Abgeschaltet");
  const alsoAt = wordAt(a3, "Also");
  const blockAt = wordAt(a3, "verhindern");
  const convAt = wordAt(a4, "instrumentelle");
  const testAt = wordAt(a5, "getestet");
  const fakeAt = wordAt(a5, "verstellen");

  const robotIn = useSpringAt(a1.from - 6, SPRINGS.pop);
  const arrow = useSpringAt(goalsAt, SPRINGS.punch);
  const arm = useSpringAt(blockAt - 4, SPRINGS.punch);
  const lockIn = useSpringAt(blockAt + 2, SPRINGS.pop);
  const shadowIn = useSpringAt(fakeAt, SPRINGS.smooth);

  const activeStep = frame >= fakeAt - 6 ? 3 : frame >= alsoAt ? 2 : frame >= a2.from ? 1 : 0;

  let mood: RobotMood = "neutral";
  if (frame >= a2.from) mood = "happy";
  if (frame >= alsoAt) mood = "focused";
  if (frame >= testAt) mood = "happy";

  const blink = Math.max(0, 1 - Math.abs(((frame + 20) % 95) - 3) / 3);
  const bob = Math.sin(frame / 14) * 6;
  // Glitch: das "wahre Gesicht" flackert kurz durch
  const glitch = frame >= fakeAt && frame < fakeAt + 14 && Math.floor(frame / 2) % 2 === 0;

  return (
    <SceneShell seed="alignment" glow={COLORS.blue} bg="#0A1324">
      {/* Schrittleiste */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
        }}
      >
        {STEPS.map((s) => {
          const active = activeStep >= s.n;
          return (
            <Beat key={s.n} at={a1.from + s.n * 3} enter="drop">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 26px",
                  borderRadius: 999,
                  backgroundColor: active ? s.color : COLORS.panel,
                  color: active ? COLORS.bg : COLORS.inkMuted,
                  fontFamily: FONT.sans,
                  fontWeight: 900,
                  fontSize: 30,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  scale: activeStep === s.n ? "1.08" : "1",
                }}
              >
                {s.n}. {s.label}
              </span>
            </Beat>
          );
        })}
      </div>

      {/* Roboter mit Schatten-Ich */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 330,
          opacity: Math.min(1, robotIn * 1.5),
          scale: String(interpolate(robotIn, [0, 1], [0.6, 1])),
          translate: `0px ${bob}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 70,
            top: -14,
            opacity: shadowIn * 0.9,
            translate: glitch ? "14px 0px" : "0px 0px",
          }}
        >
          <Robot size={430} mood="evil" color="#5A1A2B" />
        </div>
        <div style={{ position: "relative" }}>
          <Robot
            size={430}
            mood={glitch ? "evil" : mood}
            arm={arm}
            blink={blink}
            color={COLORS.blue}
          />
        </div>
      </div>

      {/* Requisiten */}
      <Beat at={coffeeAt} out={offAt} enter="pop" exit="shrink" style={{ position: "absolute", left: 640, top: 600 }}>
        <CoffeeCup size={170} steam={frame / 6} />
      </Beat>
      <Beat at={offAt} out={convAt - 4} enter="pop" exit="shrink" style={{ position: "absolute", left: 760, top: 560 }}>
        <div style={{ position: "relative" }}>
          <PowerButton size={190} />
          <div
            style={{
              position: "absolute",
              right: -30,
              top: -30,
              opacity: Math.min(1, lockIn * 1.5),
              scale: String(lockIn),
            }}
          >
            <Lock size={110} />
          </div>
        </div>
      </Beat>
      <Beat at={testAt} enter="pop" style={{ position: "absolute", left: 790, top: 470 }}>
        <Clipboard size={180} checks={frame >= testAt + 10 ? 3 : frame >= testAt + 5 ? 2 : 1} />
      </Beat>

      {/* Rechte Seite: Schlagworte */}
      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={alignAt} out={a2.from - 2} enter="slam" exit="up">
          <Headline size={190} color={COLORS.blue}>
            Alignment
          </Headline>
        </Beat>
        <Beat at={goalsAt - 6} out={a2.from - 2} exit="up" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 30 }}>
          <Target size={150} arrow={arrow} />
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 52, lineHeight: 1.15, color: COLORS.ink }}>
            Verfolgt die KI
            <br />
            <span style={{ color: COLORS.yellow }}>unsere</span> Ziele?
          </div>
        </Beat>
      </AbsoluteFill>

      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={a2.from + 4} out={offAt - 2} exit="up">
          <Tag bg={COLORS.orange} size={38}>
            Ziel
          </Tag>
        </Beat>
        <Beat at={wordAt(a2, "Hol")} out={offAt - 2} enter="slam" exit="up" style={{ marginTop: 18 }}>
          <Headline size={190} color={COLORS.orange}>
            Hol Kaffee
          </Headline>
        </Beat>
      </AbsoluteFill>

      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={offAt} out={alsoAt - 2} enter="slam" exit="up">
          <Headline size={150}>Aus =</Headline>
          <Headline size={150} color={COLORS.orange}>
            kein Kaffee
          </Headline>
        </Beat>
      </AbsoluteFill>
      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={alsoAt} out={a4.from - 2} enter="rise" exit="up">
          <Kicker>Also</Kicker>
        </Beat>
        <Beat at={blockAt} out={a4.from - 2} enter="slam" exit="up" style={{ marginTop: 14 }}>
          <Headline size={150} color={COLORS.red}>
            Abschalten
          </Headline>
          <Headline size={150} color={COLORS.red}>
            verhindern!
          </Headline>
        </Beat>
      </AbsoluteFill>

      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={a4.from} out={a5.from - 2} exit="up">
          <Kicker>Forscher nennen das</Kicker>
        </Beat>
        <Beat at={convAt} out={a5.from - 2} enter="slam" exit="up" style={{ marginTop: 14 }}>
          <Headline size={128} color={COLORS.yellow}>
            Instrumentelle
          </Headline>
          <Headline size={128} color={COLORS.yellow}>
            Konvergenz
          </Headline>
        </Beat>
        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          {["Ressourcen", "Selbsterhalt", "Einfluss"].map((w, i) => (
            <Beat key={w} at={endOf(a4) - 6 + i * 5} out={a5.from - 2} enter="pop" exit="up">
              <Tag bg={COLORS.panel} color={COLORS.ink} size={34}>
                {w}
              </Tag>
            </Beat>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ left: 1060, right: 80, justifyContent: "center", paddingTop: 60 }}>
        <Beat at={testAt} exit="up">
          <Kicker>Im Test: brav</Kicker>
        </Beat>
        <Beat at={fakeAt} enter="slam" style={{ marginTop: 30 }}>
          <Headline
            size={165}
            color={COLORS.red}
            style={{ translate: glitch ? "-10px 0px" : "0px 0px", textShadow: glitch ? `8px 0 ${COLORS.blue}` : "none" }}
          >
            Täuschung
          </Headline>
        </Beat>
      </AbsoluteFill>

      <Sfx name="pop" at={a1.from - 6} />
      <Sfx name="stamp" at={alignAt} />
      <Sfx name="whoosh-soft" at={goalsAt - 4} />
      <Sfx name="pop" at={coffeeAt} />
      <Sfx name="pop-low" at={offAt} />
      <Sfx name="stamp" at={blockAt + 2} />
      <Sfx name="stamp" at={convAt} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="pop" at={endOf(a4) - 6 + i * 5} volume={0.28} />
      ))}
      <Sfx name="pop" at={testAt} />
      <Sfx name="glitch" at={fakeAt} />
    </SceneShell>
  );
};
