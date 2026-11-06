import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/Background";
import { BrokenChain, Dice, Earth } from "../components/Icons";
import { Beat, Headline, Kicker, Sfx, useProgress, useShake, useSpringAt } from "../components/kinetic";
import { COLORS, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

/**
 * Definition: P = Wahrscheinlichkeit, doom = Untergang,
 * gemeint: Kontrollverlust oder Aussterben.
 */
export const DefinitionScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const d1 = cue(cues, "d1");
  const d2 = cue(cues, "d2");
  const d3 = cue(cues, "d3");
  const d4 = cue(cues, "d4");

  const probAt = wordAt(d1, "Wahrscheinlichkeit");
  const doomAt = wordAt(d2, "Untergang");
  const controlAt = wordAt(d3, "Kontrolle");
  const extinctAt = wordAt(d4, "überlebt");

  const pFocus = useSpringAt(d1.from, SPRINGS.smooth);
  const doomFocus = useSpringAt(d2.from, SPRINGS.smooth);
  const crack = useProgress(doomAt, doomAt + 14);
  const chain = useSpringAt(controlAt, SPRINGS.pop);
  const shake = useShake(extinctAt, 10);

  // Wer gerade erklärt wird, ist hell; der andere Teil tritt zurück
  const pOpacity = interpolate(doomFocus, [0, 1], [1, 0.35]);
  const doomOpacity = interpolate(pFocus - doomFocus, [0, 1], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const phaseOut = d3.from - 2;

  return (
    <SceneShell seed="definition" glow={COLORS.yellow} bg="#0D1226">
      {/* Phase 1: die Formel */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          flexDirection: "row",
          gap: 70,
          paddingTop: 180,
        }}
      >
        <Beat at={0} out={phaseOut} enter="fade" exit="up" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ opacity: frame < d2.from ? 1 : pOpacity }}>
            <Headline size={290} color={COLORS.yellow} style={{ scale: String(1 + pFocus * 0.06) }}>
              P
            </Headline>
          </div>
          <Beat at={probAt} out={phaseOut} enter="pop" style={{ marginTop: 34 }}>
            <Dice size={120} />
          </Beat>
          <Beat at={probAt + 3} out={phaseOut} style={{ marginTop: 18 }}>
            <Headline size={86} color={COLORS.yellow}>
              Wahrscheinlichkeit
            </Headline>
          </Beat>
        </Beat>
        <Beat at={0} out={phaseOut} enter="fade" exit="up" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ opacity: doomOpacity }}>
            <Headline size={290} color={COLORS.red} style={{ scale: String(1 + doomFocus * 0.06) }}>
              (doom)
            </Headline>
          </div>
          <Beat at={doomAt - 4} out={phaseOut} enter="pop" style={{ marginTop: 34 }}>
            <Earth size={120} crack={crack} />
          </Beat>
          <Beat at={doomAt} out={phaseOut} style={{ marginTop: 18 }}>
            <Headline size={86} color={COLORS.red}>
              Untergang
            </Headline>
          </Beat>
        </Beat>
      </AbsoluteFill>
      <Sfx name="pop" at={probAt} />
      <Sfx name="pop-low" at={doomAt} />
      <Sfx name="whoosh-soft" at={phaseOut - 4} />

      {/* Phase 2: was gemeint ist */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 22,
          translate: shake,
        }}
      >
        <Beat at={d3.from}>
          <Kicker>Gemeint ist</Kicker>
        </Beat>
        <Beat at={controlAt} enter="slam" style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <BrokenChain size={190} split={chain} />
          <Headline size={170} color={COLORS.orange}>
            Kontrollverlust
          </Headline>
        </Beat>
        <Beat at={d4.from} style={{ marginTop: 10 }}>
          <Kicker color={COLORS.inkMuted}>oder</Kicker>
        </Beat>
        <Beat at={extinctAt} enter="slam">
          <Headline size={170} color={COLORS.red}>
            Aussterben
          </Headline>
        </Beat>
      </AbsoluteFill>
      <Sfx name="stamp" at={controlAt} />
      <Sfx name="impact" at={extinctAt} volume={0.4} />
    </SceneShell>
  );
};
