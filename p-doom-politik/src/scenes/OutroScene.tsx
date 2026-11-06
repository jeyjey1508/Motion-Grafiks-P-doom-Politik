import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "../components/Background";
import { Building, Globe, Pillars } from "../components/Icons";
import { Beat, Headline, Kicker, Sfx, SlotNumber } from "../components/kinetic";
import { COLORS, FONT, SHADOW } from "../theme";
import { cue, endOf, wordAt, type Cues } from "../timeline";

const OPTIONS = [
  { word: "Konzerne", label: "Konzerne", color: COLORS.violet, Icon: Building },
  { word: "Staaten", label: "Staaten", color: COLORS.blue, Icon: Pillars },
  { word: "alle", label: "Alle gemeinsam", color: COLORS.green, Icon: Globe },
] as const;

/**
 * Outro: Frage an die Klasse, drei Entscheider, Aufruf zur Diskussion.
 */
export const OutroScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const o1 = cue(cues, "o1");
  const o2 = cue(cues, "o2");
  const o3 = cue(cues, "o3");

  const yourAt = wordAt(o1, "euer");
  const decideAt = wordAt(o2, "entscheiden");
  const discussAt = wordAt(o3, "Diskutiert");

  return (
    <SceneShell seed="outro" glow={COLORS.yellow} bg="#0F1026">
      {/* Phase 1: Euer P(doom)? */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10 }}>
        <Beat at={o1.from} out={o2.from - 2} exit="up">
          <Kicker color={COLORS.yellow}>Und jetzt ihr</Kicker>
        </Beat>
        <Beat at={yourAt} out={o2.from - 2} enter="slam" exit="up">
          <Headline size={190}>
            Euer P(<span style={{ color: COLORS.red }}>doom</span>)?
          </Headline>
        </Beat>
        <Beat at={yourAt + 6} out={o2.from - 2} enter="pop" exit="up">
          <div style={{ fontFamily: FONT.display, fontSize: 250, lineHeight: 1, color: COLORS.yellow }}>
            <SlotNumber stopAt={endOf(o1) + 4} final="??" seed="outro" /> %
          </div>
        </Beat>
      </AbsoluteFill>

      {/* Phase 2: Wer entscheidet? */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
        <Beat at={decideAt} out={o3.from - 2} enter="slam" exit="up">
          <Headline size={170}>Wer entscheidet?</Headline>
        </Beat>
        <div style={{ display: "flex", gap: 44, marginTop: 70 }}>
          {OPTIONS.map(({ word, label, color, Icon }) => (
            <Beat key={label} at={wordAt(o2, word)} out={o3.from - 2} enter="pop" exit="shrink">
              <div
                style={{
                  width: 440,
                  height: 380,
                  borderRadius: 36,
                  backgroundColor: COLORS.panel,
                  boxShadow: SHADOW.card,
                  borderTop: `10px solid ${color}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 26,
                }}
              >
                <Icon size={150} color={color} />
                <Headline size={label.length > 10 ? 70 : 84}>{label}</Headline>
              </div>
            </Beat>
          ))}
        </div>
      </AbsoluteFill>

      {/* Phase 3: Diskutiert! */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 34 }}>
        <Beat at={discussAt} enter="slam">
          <Headline size={280} color={COLORS.yellow}>
            Diskutiert!
          </Headline>
        </Beat>
        <Beat at={wordAt(o3, "Klasse")}>
          <Kicker>In der Klasse</Kicker>
        </Beat>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
        <Beat at={endOf(o3) + 20} enter="fade">
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, color: COLORS.inkMuted, letterSpacing: "0.08em" }}>
            P(DOOM) · POLITIK &amp; KÜNSTLICHE INTELLIGENZ
          </div>
        </Beat>
      </AbsoluteFill>

      <Sfx name="whoosh-soft" at={o1.from} />
      <Sfx name="stamp" at={yourAt} />
      <Sfx name="counter" at={yourAt + 6} />
      <Sfx name="stamp" at={decideAt} />
      {OPTIONS.map(({ word, label }) => (
        <Sfx key={label} name="pop" at={wordAt(o2, word)} />
      ))}
      <Sfx name="impact" at={discussAt} volume={0.4} />
      <Sfx name="ding" at={discussAt + 4} />
    </SceneShell>
  );
};
