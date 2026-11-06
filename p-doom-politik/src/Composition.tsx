import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, Easing, Sequence } from "remotion";
import { AlignmentFlow } from "./components/AlignmentFlow";
import { MusicBed, Subtitles, TransitionWhooshes, VoiceoverTrack } from "./components/AudioMix";
import { ExpertChart } from "./components/ExpertChart";
import { InterviewBlock } from "./components/InterviewBlock";
import { LowerThird } from "./components/LowerThird";
import { SplitScreen } from "./components/SplitScreen";
import { DefinitionScene } from "./scenes/DefinitionScene";
import { EuScene } from "./scenes/EuScene";
import { HookScene } from "./scenes/HookScene";
import { OutroScene } from "./scenes/OutroScene";
import { TeaserScene } from "./scenes/TeaserScene";
import { COLORS } from "./theme";
import { SCENES, TRANSITION_FRAMES } from "./timeline";

export type InterviewConfig = {
  /** Dateiname in public/interviews/ */
  readonly filename: string;
  readonly name: string;
  readonly role: string;
  /** Getippter Wert in der Bauchbinde, z. B. "10–20 %" */
  readonly pDoom: string;
  /** Sekunden, die am Anfang der Videodatei übersprungen werden */
  readonly trimBeforeSeconds: number;
};

export type PDoomVideoProps = {
  readonly interview1: InterviewConfig;
  readonly interview2: InterviewConfig;
  /** Sprechertext als Untertitel einblenden */
  readonly untertitel: boolean;
  /** Lautstärke der Hintergrundmusik (0 bis 1, Standard 1) */
  readonly musikLautstaerke: number;
};

const timing = linearTiming({
  durationInFrames: TRANSITION_FRAMES,
  easing: Easing.bezier(0.65, 0, 0.35, 1),
});

// Generisch typisierte Präsentationen für TransitionSeries
const t = (p: TransitionPresentation<Record<string, unknown>>) => p;

/**
 * Hauptkomposition. Szenenlängen kommen aus src/timeline.ts und richten
 * sich nach dem Voiceover (scripts/generate_voiceover.py).
 */
export const PDoomVideo: React.FC<PDoomVideoProps> = ({
  interview1,
  interview2,
  untertitel,
  musikLautstaerke,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries name="Szenen">
        <TransitionSeries.Sequence name="Hook" durationInFrames={SCENES.hook.durationInFrames}>
          <HookScene cues={SCENES.hook.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(slide({ direction: "from-bottom" }))} timing={timing} />

        <TransitionSeries.Sequence name="Definition" durationInFrames={SCENES.definition.durationInFrames}>
          <DefinitionScene cues={SCENES.definition.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(slide({ direction: "from-right" }))} timing={timing} />

        <TransitionSeries.Sequence name="Expertenstreit" durationInFrames={SCENES.experts.durationInFrames}>
          <ExpertChart cues={SCENES.experts.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(wipe({ direction: "from-right" }))} timing={timing} />

        <TransitionSeries.Sequence name="Teaser Interview 1" durationInFrames={SCENES.teaser1.durationInFrames}>
          <TeaserScene
            cues={SCENES.teaser1.cues}
            cueId="t1"
            words={[
              { text: "Wer", spoken: "Wer" },
              { text: "hat", spoken: "hat" },
              { text: "recht?", spoken: "recht", color: COLORS.yellow },
            ]}
            cardWord="nachgefragt"
            label="Interview 1"
            name={interview1.name}
            role={interview1.role}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(fade())} timing={timing} />

        <TransitionSeries.Sequence name="Interview 1" durationInFrames={SCENES.interview1.durationInFrames}>
          <InterviewBlock
            filename={interview1.filename}
            label="Interview 1"
            trimBeforeSeconds={interview1.trimBeforeSeconds}
          >
            <Sequence name="Bauchbinde 1" from={30} durationInFrames={180}>
              <LowerThird name={interview1.name} role={interview1.role} pDoom={interview1.pDoom} />
            </Sequence>
          </InterviewBlock>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(slide({ direction: "from-right" }))} timing={timing} />

        <TransitionSeries.Sequence name="Kontrollproblem" durationInFrames={SCENES.alignment.durationInFrames}>
          <AlignmentFlow cues={SCENES.alignment.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(wipe({ direction: "from-bottom-right" }))} timing={timing} />

        <TransitionSeries.Sequence name="Teaser Interview 2" durationInFrames={SCENES.teaser2.durationInFrames}>
          <TeaserScene
            cues={SCENES.teaser2.cues}
            cueId="t2"
            words={[
              { text: "Kann", spoken: "Kann" },
              { text: "Politik", spoken: "Politik", color: COLORS.yellow },
              { text: "bremsen?", spoken: "bremsen" },
            ]}
            cardWord="Interview"
            label="Interview 2"
            name={interview2.name}
            role={interview2.role}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(fade())} timing={timing} />

        <TransitionSeries.Sequence name="Interview 2" durationInFrames={SCENES.interview2.durationInFrames}>
          <InterviewBlock
            filename={interview2.filename}
            label="Interview 2"
            trimBeforeSeconds={interview2.trimBeforeSeconds}
          >
            <Sequence name="Bauchbinde 2" from={30} durationInFrames={180}>
              <LowerThird name={interview2.name} role={interview2.role} pDoom={interview2.pDoom} />
            </Sequence>
          </InterviewBlock>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(slide({ direction: "from-right" }))} timing={timing} />

        <TransitionSeries.Sequence name="Regulierung" durationInFrames={SCENES.eu.durationInFrames}>
          <EuScene cues={SCENES.eu.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(slide({ direction: "from-bottom" }))} timing={timing} />

        <TransitionSeries.Sequence name="Wettrennen" durationInFrames={SCENES.race.durationInFrames}>
          <SplitScreen cues={SCENES.race.cues} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t(wipe({ direction: "from-left" }))} timing={timing} />

        <TransitionSeries.Sequence name="Outro" durationInFrames={SCENES.outro.durationInFrames}>
          <OutroScene cues={SCENES.outro.cues} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <VoiceoverTrack />
      <TransitionWhooshes />
      <MusicBed
        interview1File={interview1.filename}
        interview2File={interview2.filename}
        volume={musikLautstaerke}
      />
      {untertitel ? <Subtitles /> : null}
    </AbsoluteFill>
  );
};
