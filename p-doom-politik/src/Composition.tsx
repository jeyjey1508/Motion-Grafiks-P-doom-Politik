import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import React from "react";
import { AbsoluteFill, Easing, Sequence } from "remotion";
import { MusicBed, Subtitles, TransitionWhooshes, VoiceoverTrack } from "./components/AudioMix";
import { InterviewBlock } from "./components/InterviewBlock";
import { LowerThird } from "./components/LowerThird";
import { BlackboxScene } from "./scenes/BlackboxScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { CoffeeScene } from "./scenes/CoffeeScene";
import { DefineScene } from "./scenes/DefineScene";
import { DilemmaScene } from "./scenes/DilemmaScene";
import { EuScene } from "./scenes/EuScene";
import { ExpertsScene } from "./scenes/ExpertsScene";
import { LabScene } from "./scenes/LabScene";
import { MapScene } from "./scenes/MapScene";
import { OpenScene } from "./scenes/OpenScene";
import { SolutionsScene } from "./scenes/SolutionsScene";
import { SurveyScene } from "./scenes/SurveyScene";
import { TeaserScene } from "./scenes/TeaserScene";
import { COLORS } from "./theme";
import { SCENES, TRANSITION_FRAMES } from "./timeline";
import { dip, pan, pull, push } from "./transitions";

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
  easing: Easing.bezier(0.6, 0, 0.3, 1),
});

const S = TransitionSeries.Sequence;
const T = TransitionSeries.Transition;

/**
 * Hauptfilm. Szenenlängen kommen aus src/timeline.ts und richten sich nach
 * dem Voiceover; die Übergänge sind Kamerabewegungen (src/transitions.tsx).
 */
export const PDoomVideo: React.FC<PDoomVideoProps> = ({ interview1, interview2, untertitel, musikLautstaerke }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TransitionSeries name="Szenen">
        <S name="1 Einstieg" durationInFrames={SCENES.open.durationInFrames}>
          <OpenScene cues={SCENES.open.cues} />
        </S>
        <T presentation={push()} timing={timing} />
        <S name="2 Begriff" durationInFrames={SCENES.define.durationInFrames}>
          <DefineScene cues={SCENES.define.cues} />
        </S>
        <T presentation={pan(1)} timing={timing} />
        <S name="3 Expertenstreit" durationInFrames={SCENES.experts.durationInFrames}>
          <ExpertsScene cues={SCENES.experts.cues} />
        </S>
        <T presentation={push()} timing={timing} />
        <S name="4 Umfrage" durationInFrames={SCENES.survey.durationInFrames}>
          <SurveyScene cues={SCENES.survey.cues} />
        </S>
        <T presentation={dip()} timing={timing} />
        <S name="Teaser Interview 1" durationInFrames={SCENES.teaser1.durationInFrames}>
          <TeaserScene
            cues={SCENES.teaser1.cues}
            cueId="t1"
            lines={[
              { text: "Wie real", spoken: "Wie" },
              { text: "ist die Gefahr?", spoken: "Gefahr", color: COLORS.yellow },
            ]}
            cardWord="nachgefragt"
            label="Interview 1"
            name={interview1.name}
            role={interview1.role}
          />
        </S>
        <T presentation={fade()} timing={timing} />
        <S name="Interview 1" durationInFrames={SCENES.interview1.durationInFrames}>
          <InterviewBlock filename={interview1.filename} label="Interview 1" trimBeforeSeconds={interview1.trimBeforeSeconds}>
            <Sequence name="Bauchbinde 1" from={30} durationInFrames={180}>
              <LowerThird name={interview1.name} role={interview1.role} pDoom={interview1.pDoom} />
            </Sequence>
          </InterviewBlock>
        </S>
        <T presentation={fade()} timing={timing} />
        <S name="5 Blackbox" durationInFrames={SCENES.blackbox.durationInFrames}>
          <BlackboxScene cues={SCENES.blackbox.cues} />
        </S>
        <T presentation={pan(1)} timing={timing} />
        <S name="6 Kaffee-Roboter" durationInFrames={SCENES.coffee.durationInFrames}>
          <CoffeeScene cues={SCENES.coffee.cues} />
        </S>
        <T presentation={push()} timing={timing} />
        <S name="7 Labor" durationInFrames={SCENES.lab.durationInFrames}>
          <LabScene cues={SCENES.lab.cues} />
        </S>
        <T presentation={dip()} timing={timing} />
        <S name="8 EU AI Act" durationInFrames={SCENES.eu.durationInFrames}>
          <EuScene cues={SCENES.eu.cues} />
        </S>
        <T presentation={push()} timing={timing} />
        <S name="9 Weltkarte" durationInFrames={SCENES.map.durationInFrames}>
          <MapScene cues={SCENES.map.cues} />
        </S>
        <T presentation={push()} timing={timing} />
        <S name="10 Wettrüsten" durationInFrames={SCENES.dilemma.durationInFrames}>
          <DilemmaScene cues={SCENES.dilemma.cues} />
        </S>
        <T presentation={dip()} timing={timing} />
        <S name="Teaser Interview 2" durationInFrames={SCENES.teaser2.durationInFrames}>
          <TeaserScene
            cues={SCENES.teaser2.cues}
            cueId="t2"
            lines={[
              { text: "Lässt sich das", spoken: "Lässt" },
              { text: "Rennen bremsen?", spoken: "Rennen", color: COLORS.yellow },
            ]}
            cardWord="zweite"
            label="Interview 2"
            name={interview2.name}
            role={interview2.role}
          />
        </S>
        <T presentation={fade()} timing={timing} />
        <S name="Interview 2" durationInFrames={SCENES.interview2.durationInFrames}>
          <InterviewBlock filename={interview2.filename} label="Interview 2" trimBeforeSeconds={interview2.trimBeforeSeconds}>
            <Sequence name="Bauchbinde 2" from={30} durationInFrames={180}>
              <LowerThird name={interview2.name} role={interview2.role} pDoom={interview2.pDoom} />
            </Sequence>
          </InterviewBlock>
        </S>
        <T presentation={fade()} timing={timing} />
        <S name="11 Auswege" durationInFrames={SCENES.solutions.durationInFrames}>
          <SolutionsScene cues={SCENES.solutions.cues} />
        </S>
        <T presentation={pull()} timing={timing} />
        <S name="12 Schlussgedanke" durationInFrames={SCENES.closing.durationInFrames}>
          <ClosingScene cues={SCENES.closing.cues} />
        </S>
      </TransitionSeries>

      <VoiceoverTrack />
      <TransitionWhooshes />
      <MusicBed interview1File={interview1.filename} interview2File={interview2.filename} volume={musikLautstaerke} />
      {untertitel ? <Subtitles /> : null}
    </AbsoluteFill>
  );
};
