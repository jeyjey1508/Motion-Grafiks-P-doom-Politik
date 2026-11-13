import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe } from "../art/Globe";
import { Beat, Headline, Kicker, Letters, Sfx, useProgress, useShake, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const GUESSES = [
  { word: "Ein", text: "1 %", color: COLORS.green, x: 330 },
  { word: "Zwanzig", text: "20 %", color: COLORS.yellow, x: 960 },
  { word: "Neunzig", text: "90 %", color: COLORS.red, x: 1590 },
] as const;

/**
 * Schlussgedanke über dem Erdhorizont: Niemand kennt die Zahl, aber sie ist
 * kein Naturgesetz. Zum Sonnenaufgang das letzte Wort: Entscheidung.
 */
export const ClosingScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const z1 = cue(cues, "z1");
  const z2 = cue(cues, "z2");
  const z3 = cue(cues, "z3");
  const z4 = cue(cues, "z4");
  const z5 = cue(cues, "z5");

  const lawAt = wordAt(z3, "kein");
  const rockAt = wordAt(z3, "Asteroid");
  const buildAt = wordAt(z4, "bauen");
  const rulesAt = wordAt(z4, "Regeln");
  const pAt = wordAt(z5, "P");
  const noAt = wordAt(z5, "keine");
  const itAt = wordAt(z5, "Es");
  const decideAt = wordAt(z5, "Entscheidung");

  const cam = useCam([
    { at: 0, x: 0, y: 70, zoom: 1.14 },
    { at: z2.from, x: 0, y: 30, zoom: 1.06 },
    { at: z4.from, x: 0, y: 0, zoom: 1.02 },
    { at: decideAt, x: 0, y: 0, zoom: 1 },
    { at: durationInFrames, x: 0, y: -30, zoom: 1.1 },
  ]);

  const sunrise = interpolate(frame, [0, z4.from, decideAt, durationInFrames], [0.12, 0.4, 0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lights = useSpringAt(buildAt - 6, SPRINGS.smooth, 60);
  const rock = useProgress(rockAt - 6, rockAt + 46);
  const rockGone = useSpringAt(rockAt + 34, SPRINGS.smooth, 14);
  const flare = useSpringAt(decideAt, SPRINGS.smooth, 40);
  const shake = useShake(decideAt, 14);
  const fadeOut = interpolate(frame, [durationInFrames - 34, durationInFrames - 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const EY = 1360;
  const ER = 780;

  return (
    <Stage seed="closing" cam={cam} sky={{ top: "#02040C", bottom: "#0A1230", glow: "#FFB36B", glowAt: [50, 62], stars: 150 }}>
      <Layer depth={0.5}>
        {/* Sonnenaufgang hinter dem Horizont */}
        <Glow x={960} y={620} r={420 + sunrise * 620} color="#FFC27A" opacity={0.35 + sunrise * 0.55} />
        <Glow x={960} y={610} r={130 + sunrise * 150} color="#FFFFFF" opacity={sunrise} />
        <div
          style={{
            position: "absolute",
            left: 960 - 1200,
            top: 596,
            width: 2400,
            height: 6,
            background: "linear-gradient(90deg, transparent, #FFFFFF, transparent)",
            opacity: flare * 0.9,
            scale: `${0.3 + flare * 0.7} 1`,
          }}
        />
        <Globe
          id="closing-globe"
          size={ER * 2}
          lon={8 + frame * 0.04}
          lat={44}
          lights={0.25 + lights * 0.75}
          night={0.92 - sunrise * 0.3}
          atmosphere="#8EC8FF"
          style={{ position: "absolute", left: 960 - ER - ER * 0.44, top: EY - ER - ER * 0.44 }}
        />
        {/* Asteroid, der vorbeizieht und verblasst */}
        <svg
          width={420}
          height={200}
          viewBox="0 0 420 200"
          style={{
            position: "absolute",
            left: interpolate(rock, [0, 1], [2050, 1180]),
            top: interpolate(rock, [0, 1], [-160, 330]),
            rotate: "-29deg",
            opacity: (rock > 0 ? 1 : 0) * (1 - rockGone),
            overflow: "visible",
          }}
        >
          <defs>
            <linearGradient id="rock-trail" x1="0" x2="1">
              <stop offset="0%" stopColor="#FFB36B" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#FF4B3E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M 70 60 L 420 20 L 420 180 L 70 140 Z" fill="url(#rock-trail)" />
          <path d="M 20 100 L 44 50 L 96 34 L 140 64 L 150 120 L 110 164 L 54 160 Z" fill="#6B5A52" />
          <circle cx={70} cy={90} r={14} fill="#4E413B" />
          <circle cx={108} cy={126} r={9} fill="#4E413B" />
        </svg>
      </Layer>

      <Layer depth={0.1}>
        <AbsoluteFill style={{ translate: shake }}>
          {/* z1: die Schätzungen */}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
            <Beat at={z1.from} out={z2.from - 2} exit="up">
              <Headline size={84} color={COLORS.inkSoft}>
                Wie hoch ist P(<span style={{ color: COLORS.red }}>doom</span>) wirklich?
              </Headline>
            </Beat>
          </AbsoluteFill>
          {GUESSES.map((g, i) => (
            <Beat
              key={g.text}
              at={wordAt(z1, g.word) - 2}
              out={z2.from - 2 + i * 2}
              enter="pop"
              exit="shrink"
              style={{ position: "absolute", left: g.x - 300, top: 250 + Math.sin(frame / 22 + i * 2) * 10, width: 600, textAlign: "center" }}
            >
              <div style={{ fontFamily: FONT.display, fontSize: 240, lineHeight: 1, color: g.color, textShadow: `0 0 70px ${g.color}88` }}>{g.text}</div>
            </Beat>
          ))}

          {/* z2 */}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
            <Letters text="Niemand weiß es." at={z2.from} out={z3.from - 2} size={230} />
          </AbsoluteFill>

          {/* z3 */}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
            <Beat at={z3.from + 2} out={z4.from - 2} exit="up">
              <Kicker color={COLORS.yellow}>Aber diese Zahl ist</Kicker>
            </Beat>
            <Letters text="Kein Naturgesetz." at={lawAt - 2} out={z4.from - 2} size={210} style={{ marginTop: 14 }} />
          </AbsoluteFill>

          {/* z4 */}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
            <Beat at={z4.from + 2} out={z5.from - 2} exit="up">
              <Kicker color={COLORS.inkSoft}>Sie hängt davon ab,</Kicker>
            </Beat>
            <Letters text="was wir bauen." at={buildAt - 6} out={z5.from - 2} size={200} color={COLORS.yellow} glow={COLORS.yellow} style={{ marginTop: 14 }} />
            <Letters text="Und welche Regeln wir uns geben." at={rulesAt - 6} out={z5.from - 2} size={112} style={{ marginTop: 22 }} />
          </AbsoluteFill>

          {/* z5: keine Vorhersage */}
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
            <Letters text="P(doom)" at={pAt - 2} out={itAt - 4} size={300} accent={{ start: 2, end: 6, color: COLORS.red }} />
            <Letters text="ist keine Vorhersage." at={noAt - 4} out={itAt - 4} size={130} color={COLORS.inkSoft} style={{ marginTop: 10 }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
            <Beat at={itAt - 2}>
              <Headline size={96} color={COLORS.inkSoft}>
                Es ist eine
              </Headline>
            </Beat>
            <Letters text="Entscheidung." at={decideAt - 2} size={280} stagger={2} glow="#FFC27A" style={{ marginTop: 14 }} />
          </AbsoluteFill>
        </AbsoluteFill>
      </Layer>

      <AbsoluteFill style={{ backgroundColor: "#000000", opacity: fadeOut }} />

      <Sfx name="swell" at={0} />
      {GUESSES.map((g, i) => (
        <Sfx key={g.text} name={i === 2 ? "pop-low" : "pop"} at={wordAt(z1, g.word) - 2} />
      ))}
      <Sfx name="drop" at={z2.from} />
      <Sfx name="heartbeat" at={z2.from + 36} volume={0.35} />
      <Sfx name="stamp" at={lawAt - 2} />
      <Sfx name="whoosh-long" at={rockAt - 6} />
      <Sfx name="whoosh-soft" at={rockAt + 30} />
      <Sfx name="chime" at={buildAt - 6} volume={0.3} />
      <Sfx name="click" at={rulesAt - 6} />
      <Sfx name="stamp" at={pAt - 2} />
      <Sfx name="swell" at={decideAt - 70} volume={0.4} />
      <Sfx name="riser" at={decideAt - 76} volume={0.2} />
      <Sfx name="impact" at={decideAt - 2} volume={0.5} />
      <Sfx name="chime" at={decideAt + 4} volume={0.34} />
    </Stage>
  );
};
