import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Bust } from "../art/People";
import { Beat, Headline, Kicker, Letters, settle, Sfx, Tag, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const FLOOR = 860;

/** Gesicht auf dem Bildschirm: freundlich (1) oder mit eigenen Plänen (0). */
const ScreenFace: React.FC<{ readonly good: number; readonly glitch: boolean }> = ({ good, glitch }) => {
  const color = good > 0.5 ? COLORS.green : COLORS.red;
  return (
    <svg width={520} height={340} viewBox="0 0 520 340" style={{ translate: glitch ? "10px 0px" : "0px 0px" }}>
      {good > 0.5 ? (
        <>
          <path d="M 120 150 Q 160 96 200 150" fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" />
          <path d="M 320 150 Q 360 96 400 150" fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" />
          <path d="M 170 220 Q 260 300 350 220" fill="none" stroke={color} strokeWidth={20} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={160} cy={150} r={34} fill={color} />
          <circle cx={360} cy={150} r={34} fill={color} />
          <line x1={104} y1={84} x2={206} y2={116} stroke={color} strokeWidth={20} strokeLinecap="round" />
          <line x1={416} y1={84} x2={314} y2={116} stroke={color} strokeWidth={20} strokeLinecap="round" />
          <line x1={180} y1={250} x2={340} y2={250} stroke={color} strokeWidth={20} strokeLinecap="round" />
        </>
      )}
      {glitch
        ? [40, 130, 210, 290].map((y, i) => (
            <rect key={y} x={random(`gl-${y}`) * 200} y={y} width={220 + i * 40} height={10} fill={i % 2 ? COLORS.blue : COLORS.red} opacity={0.8} />
          ))
        : null}
    </svg>
  );
};

/**
 * Labor: Solange das Modell beobachtet wird, verhält es sich angepasst.
 * Geht das Licht im Kontrollraum aus, zeigt der Bildschirm ein anderes Gesicht.
 */
export const LabScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const l2 = cue(cues, "l2");
  const l3 = cue(cues, "l3");
  const l4 = cue(cues, "l4");

  const modelAt = wordAt(l2, "Sprachmodell");
  const goodAt = wordAt(l2, "angepasst");
  const unseenAt = wordAt(l2, "Unbeobachtet");
  const otherAt = wordAt(l2, "anders");
  const testAt = wordAt(l3, "Test");
  const deployAt = wordAt(l3, "Einsatz");
  const controlsAt = wordAt(l4, "Kontrollen");

  const cam = useCam([
    { at: 0, x: -60, y: 10, zoom: 1.07 },
    { at: modelAt + 10, x: 0, y: 0, zoom: 1 },
    { at: unseenAt - 8, x: 40, y: 0, zoom: 1.04 },
    { at: unseenAt + 20, x: 50, y: -6, zoom: 1.07 },
    { at: l3.from - 6, x: 60, y: -6, zoom: 1.09 },
    { at: l3.from + 22, x: 0, y: 0, zoom: 1 },
    { at: l4.from - 4, x: 0, y: 0, zoom: 1.03 },
    { at: durationInFrames, x: 0, y: 0, zoom: 1.1 },
  ]);

  const sUnseen = useSpringAt(unseenAt, SPRINGS.smooth, 14);
  const sTest = useSpringAt(testAt - 4, SPRINGS.smooth, 12);
  const sDeploy = useSpringAt(deployAt - 2, SPRINGS.smooth, 12);
  const watched = Math.max(0, Math.min(1, 1 - sUnseen + sTest - sDeploy));
  const switching =
    (frame >= unseenAt && frame < unseenAt + 12) || (frame >= deployAt - 2 && frame < deployAt + 10);
  const glitch = switching && Math.floor(frame / 2) % 2 === 0;
  const screenIn = useSpringAt(modelAt - 6, SPRINGS.pop);
  const finale = useSpringAt(l4.from, SPRINGS.smooth);
  const recBlink = Math.floor(frame / 14) % 2 === 0;

  return (
    <Stage seed="lab" cam={cam} sky={{ top: "#06121C", bottom: "#0B1F2E", glow: watched > 0.5 ? COLORS.green : COLORS.red, glowAt: [68, 45], dust: 16 }}>
      <Layer depth={0.8}>
        {/* Rückwand mit Fliesenraster */}
        <div
          style={{
            position: "absolute",
            left: -500,
            top: -300,
            width: 3000,
            height: FLOOR + 380,
            backgroundColor: "#0C2433",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.035) 2px, transparent 2px)",
            backgroundSize: "120px 120px",
          }}
        />
        {/* Beobachtungsfenster */}
        <div
          style={{
            position: "absolute",
            left: 110,
            top: 230,
            width: 720,
            height: 420,
            borderRadius: 22,
            border: "14px solid #17384C",
            background: `linear-gradient(180deg, ${watched > 0.5 ? "#2B5C78" : "#07131C"}, ${watched > 0.5 ? "#1B4058" : "#050D14"})`,
            overflow: "hidden",
            boxShadow: watched > 0.5 ? "0 0 90px rgba(120,220,255,0.25)" : "none",
          }}
        >
          <div style={{ position: "absolute", left: 90, top: 150 + (1 - watched) * 60, opacity: watched }}>
            <Bust size={250} coat accent="#F0C9A8" color="#22304F" glasses />
          </div>
          <div style={{ position: "absolute", left: 380, top: 170 + (1 - watched) * 60, opacity: watched }}>
            <Bust size={230} coat accent="#C99672" color="#3A2A22" />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: 240, height: "100%", background: "linear-gradient(105deg, rgba(255,255,255,0.10), transparent 60%)" }} />
        </div>
        <div style={{ position: "absolute", left: 110, top: 668, width: 720, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 30, letterSpacing: "0.16em", color: COLORS.inkMuted }}>
          KONTROLLRAUM
        </div>
      </Layer>

      <Layer depth={1}>
        {/* Boden */}
        <div style={{ position: "absolute", left: -600, top: FLOOR, width: 3200, height: 500, background: "linear-gradient(180deg, #06141D, #030A10)" }} />
        <div style={{ position: "absolute", left: -600, top: FLOOR, width: 3200, height: 6, backgroundColor: "#1E5068" }} />

        {/* Kamera mit Aufnahmelampe */}
        <div style={{ position: "absolute", left: 1210, top: 96, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, screenIn * 1.5) }}>
          <div style={{ width: 130, height: 70, borderRadius: 16, backgroundColor: "#1B3A4E", position: "relative" }}>
            <div style={{ position: "absolute", right: -26, top: 14, width: 40, height: 42, borderRadius: 8, backgroundColor: "#12293A" }} />
            <div
              style={{
                position: "absolute",
                left: 18,
                top: 21,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: watched > 0.5 && recBlink ? COLORS.red : "#3A1418",
                boxShadow: watched > 0.5 && recBlink ? `0 0 30px ${COLORS.red}` : "none",
              }}
            />
          </div>
          <div style={{ marginLeft: 26, fontFamily: FONT.sans, fontWeight: 900, fontSize: 34, letterSpacing: "0.12em", color: watched > 0.5 ? COLORS.red : COLORS.inkMuted }}>
            {watched > 0.5 ? "● TRAINING" : "○ AUS"}
          </div>
        </div>

        {/* KI-Terminal */}
        <div style={{ position: "absolute", left: 1000, top: 250, opacity: Math.min(1, screenIn * 1.5), scale: String(0.7 + 0.3 * screenIn), transformOrigin: "50% 100%" }}>
          <Glow x={320} y={230} r={520} color={watched > 0.5 ? COLORS.green : COLORS.red} opacity={0.4} />
          <div
            style={{
              width: 640,
              height: 440,
              borderRadius: 34,
              backgroundColor: "#06121C",
              border: `10px solid ${watched > 0.5 ? "#1E5068" : "#5A1A22"}`,
              boxShadow: SHADOW.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <ScreenFace good={watched} glitch={glitch} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 3px, transparent 3px)", backgroundSize: "100% 9px" }} />
          </div>
          <div style={{ width: 90, height: 100, margin: "0 auto", backgroundColor: "#17384C" }} />
          <div style={{ width: 380, height: 30, margin: "0 auto", borderRadius: 12, backgroundColor: "#1E5068" }} />
          <div style={{ marginTop: 14, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 30, letterSpacing: "0.16em", color: COLORS.inkMuted }}>SPRACHMODELL</div>
        </div>

        {/* Texte */}
        <div style={{ position: "absolute", left: 150, top: 110 }}>
          <Beat at={l2.from} out={l3.from - 4} exit="up">
            <Tag bg={COLORS.yellow} size={36}>
              2024 · Labor-Experimente
            </Tag>
          </Beat>
        </div>
        <div style={{ position: "absolute", left: 180, top: 770 }}>
          <Letters text="Angepasst" at={goodAt} out={unseenAt - 2} size={170} color={COLORS.green} glow={COLORS.green} />
        </div>
        <div style={{ position: "absolute", left: 180, top: 740 }}>
          <Beat at={unseenAt} out={l3.from - 4} exit="up">
            <Kicker color={COLORS.inkSoft}>Unbeobachtet</Kicker>
          </Beat>
          <Letters text="Anders." at={otherAt - 2} out={l3.from - 4} size={200} color={COLORS.red} glow={COLORS.red} style={{ marginTop: 6 }} />
        </div>
        <div style={{ position: "absolute", left: 180, top: 750 }}>
          <Beat at={testAt - 4} out={deployAt - 4} enter="slam" exit="up" style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
            <Headline size={110} color={COLORS.inkSoft}>
              Im Test:
            </Headline>
            <Headline size={190} color={COLORS.green}>
              brav
            </Headline>
          </Beat>
        </div>
        <div style={{ position: "absolute", left: 180, top: 750 }}>
          <Beat at={deployAt - 2} out={l4.from - 2} enter="slam" exit="up" style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
            <Headline size={110} color={COLORS.inkSoft}>
              Im Einsatz:
            </Headline>
            <Headline size={190} color={COLORS.red}>
              ?
            </Headline>
          </Beat>
        </div>
      </Layer>

      {/* l4: die Kontrolle selbst steht in Frage */}
      <AbsoluteFill style={{ backgroundColor: "#03080D", opacity: finale * 0.9 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 50 }}>
        <div style={{ display: "flex", gap: 60 }}>
          {[0, 1, 2].map((i) => {
            const p = settle(frame - (l4.from + 6 + i * 5), fps);
            const flip = settle(frame - (controlsAt + i * 6), fps, 18);
            const asked = flip > 0.5;
            return (
              <div
                key={i}
                style={{
                  width: 230,
                  height: 230,
                  borderRadius: 115,
                  backgroundColor: asked ? COLORS.red : COLORS.green,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: Math.min(1, p * 1.5),
                  scale: `${Math.abs(1 - 2 * Math.min(1, flip)) * (0.5 + 0.5 * p)} ${0.5 + 0.5 * p}`,
                  boxShadow: SHADOW.glow(asked ? COLORS.red : COLORS.green, 0.9),
                  fontFamily: FONT.display,
                  fontSize: 170,
                  color: COLORS.bg,
                }}
              >
                {asked ? (
                  "?"
                ) : (
                  <svg width={130} height={130} viewBox="0 0 80 80">
                    <path d="M 16 42 L 33 58 L 64 22" fill="none" stroke={COLORS.bg} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
        <Letters text="Kontrolle?" at={controlsAt + 10} size={280} glow={COLORS.red} />
      </AbsoluteFill>

      <Sfx name="swell" at={0} volume={0.22} />
      <Sfx name="pop" at={l2.from} />
      <Sfx name="whoosh-soft" at={modelAt - 8} />
      <Sfx name="chime" at={goodAt} volume={0.24} />
      <Sfx name="clunk" at={unseenAt} />
      <Sfx name="glitch" at={unseenAt + 2} />
      <Sfx name="drop" at={otherAt - 2} />
      <Sfx name="clunk" at={testAt - 4} volume={0.3} />
      <Sfx name="ding" at={testAt} volume={0.2} />
      <Sfx name="clunk" at={deployAt - 2} />
      <Sfx name="glitch" at={deployAt} />
      <Sfx name="whoosh" at={l4.from - 6} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="pop-low" at={controlsAt + i * 6} />
      ))}
      <Sfx name="impact" at={controlsAt + 10} />
    </Stage>
  );
};
