import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/Background";
import {
  Beat,
  DrawLine,
  Headline,
  Kicker,
  Sfx,
  SlotNumber,
  useShake,
} from "../components/kinetic";
import { COLORS, FONT } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

/**
 * Hook: Frage, Science-Fiction-Einwand, rotierende Zahl, Titel P(doom).
 */
export const HookScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const h1 = cue(cues, "h1");
  const h2 = cue(cues, "h2");
  const h3 = cue(cues, "h3");
  const h4 = cue(cues, "h4");

  const kiAt = wordAt(h1, "künstliche");
  const endAt = wordAt(h1, "Menschheit");
  const strikeAt = h3.from + 2;
  const numberAt = wordAt(h3, "Zahl") - 4;
  const titleAt = wordAt(h4, "Pi");

  const shake = useShake(titleAt, 18);
  const shakeEnd = useShake(wordAt(h1, "auslöscht"), 8);

  // Hintergrundzahl: erst als Textur, dann als Hauptdarsteller
  const bigNumberOpacity = interpolate(
    frame,
    [h1.from, h1.from + 10, numberAt, numberAt + 8, titleAt - 2, titleAt + 6],
    [0, 0.07, 0.07, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const bigNumberScale = interpolate(frame, [numberAt, numberAt + 12], [1.25, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell seed="hook" glow={COLORS.red}>
      {/* Rotierende Prozentzahl */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: bigNumberOpacity,
          scale: String(bigNumberScale),
        }}
      >
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 520,
            lineHeight: 1,
            color: frame >= numberAt ? COLORS.ink : COLORS.inkSoft,
            display: "flex",
            alignItems: "baseline",
            gap: 30,
          }}
        >
          <SlotNumber stopAt={h4.from} final="??" seed="hook" />
          <span style={{ fontSize: 300, color: COLORS.red }}>%</span>
        </div>
      </AbsoluteFill>

      {/* Phase A: Die Frage */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 26,
          translate: shakeEnd,
        }}
      >
        <Beat at={h1.from} out={h2.from - 2} exit="up">
          <Kicker>Wie wahrscheinlich ist es …</Kicker>
        </Beat>
        <Beat at={kiAt} out={h2.from - 2} enter="slam" exit="up">
          <Headline size={260} color={COLORS.yellow}>
            KI
          </Headline>
        </Beat>
        <Beat at={endAt} out={h2.from - 2} enter="slam" exit="up">
          <Headline size={150}>das Ende der Menschheit?</Headline>
        </Beat>
      </AbsoluteFill>
      <Sfx name="pop" at={kiAt} />
      <Sfx name="stamp" at={endAt} />

      {/* Phase B/C: Science-Fiction? – durchgestrichen */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Beat at={h2.from} out={numberAt - 4} enter="slam" exit="shrink">
          <div style={{ position: "relative", rotate: "-4deg" }}>
            <Headline
              size={210}
              color="transparent"
              style={{ WebkitTextStroke: `5px ${COLORS.yellow}` }}
            >
              Science-Fiction?
            </Headline>
            <svg
              width={1500}
              height={240}
              viewBox="0 0 1500 240"
              style={{ position: "absolute", left: "50%", top: "50%", translate: "-50% -50%" }}
            >
              <DrawLine
                from={strikeAt}
                to={strikeAt + 8}
                x1={20}
                y1={150}
                x2={1480}
                y2={90}
                color={COLORS.red}
                width={26}
              />
            </svg>
          </div>
        </Beat>
      </AbsoluteFill>
      <Sfx name="pop-low" at={h2.from} />
      <Sfx name="stamp" at={strikeAt + 4} />

      {/* Phase C: Kicker über der Zahl */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
        <Beat at={numberAt} out={titleAt - 4}>
          <Kicker color={COLORS.yellow}>Forscher nennen eine Zahl</Kicker>
        </Beat>
      </AbsoluteFill>
      <Sfx name="counter" at={numberAt} />
      <Sfx name="riser" at={titleAt - 66} />

      {/* Phase D: Titel */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 34,
          translate: shake,
        }}
      >
        <Beat at={titleAt} enter="slam">
          <Headline size={330}>
            P(<span style={{ color: COLORS.red }}>doom</span>)
          </Headline>
        </Beat>
        <Beat at={titleAt + 12}>
          <div
            style={{
              fontFamily: FONT.sans,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.inkSoft,
              letterSpacing: "-0.01em",
            }}
          >
            Die Überlebenswahrscheinlichkeit im KI-Zeitalter
          </div>
        </Beat>
      </AbsoluteFill>
      <Sfx name="impact" at={titleAt} />
    </SceneShell>
  );
};
