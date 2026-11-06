import React from "react";
import { AbsoluteFill, Sequence, Track } from "remotion";
import { AlignmentFlow } from "./components/AlignmentFlow";
import { Background } from "./components/Background";
import { ExpertChart } from "./components/ExpertChart";
import { InterviewBlock } from "./components/InterviewBlock";
import { LowerThird } from "./components/LowerThird";
import { SplitScreen } from "./components/SplitScreen";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";
import { TeaserScene } from "./scenes/TeaserScene";

export type InterviewConfig = {
  /** Dateiname in public/interviews/ */
  readonly filename: string;
  readonly name: string;
  readonly role: string;
  /** Getippter Wert in der Bauchbinde, z. B. "10–20 %" */
  readonly pDoom: string;
  /** Leitfrage auf der Teaser-Card */
  readonly question: string;
  /** Sekunden, die am Anfang der Videodatei übersprungen werden */
  readonly trimBeforeSeconds: number;
};

export type PDoomVideoProps = {
  readonly interview1: InterviewConfig;
  readonly interview2: InterviewConfig;
};

/**
 * Hauptkomposition "P(doom) – Die Überlebenswahrscheinlichkeit im KI-Zeitalter".
 * Die Frame-Angaben entsprechen exakt dem Szenenplan.
 */
export const PDoomVideo: React.FC<PDoomVideoProps> = ({
  interview1,
  interview2,
}) => {
  return (
    <AbsoluteFill>
      <Background />

      <Track name="Szenen">
        {/* 0–150 (5 s): Intro & Definition mit Zähler */}
        <Sequence name="Intro" durationInFrames={150}>
          <IntroScene />
        </Sequence>

        {/* 150–330 (6 s): Expertenskala */}
        <Sequence name="Expertenskala" from={150} durationInFrames={180}>
          <ExpertChart />
        </Sequence>

        {/* 330–420 (3 s): Teaser Interview 1 */}
        <Sequence name="Teaser Interview 1" from={330} durationInFrames={90}>
          <TeaserScene
            counter="1/2"
            name={interview1.name}
            role={interview1.role}
            question={interview1.question}
          />
        </Sequence>

        {/* 420–870 (15 s): Interview 1 mit Bauchbinde */}
        <Sequence name="Interview 1" from={420} durationInFrames={450}>
          <InterviewBlock
            filename={interview1.filename}
            label="Interview 1"
            trimBeforeSeconds={interview1.trimBeforeSeconds}
          >
            <Sequence name="Bauchbinde 1" from={30} durationInFrames={180}>
              <LowerThird
                name={interview1.name}
                role={interview1.role}
                pDoom={interview1.pDoom}
              />
            </Sequence>
          </InterviewBlock>
        </Sequence>

        {/* 870–1050 (6 s): Alignment-Schaubild */}
        <Sequence name="Alignment" from={870} durationInFrames={180}>
          <AlignmentFlow />
        </Sequence>

        {/* 1050–1140 (3 s): Teaser Interview 2 */}
        <Sequence name="Teaser Interview 2" from={1050} durationInFrames={90}>
          <TeaserScene
            counter="2/2"
            name={interview2.name}
            role={interview2.role}
            question={interview2.question}
          />
        </Sequence>

        {/* 1140–1590 (15 s): Interview 2 mit Bauchbinde */}
        <Sequence name="Interview 2" from={1140} durationInFrames={450}>
          <InterviewBlock
            filename={interview2.filename}
            label="Interview 2"
            trimBeforeSeconds={interview2.trimBeforeSeconds}
          >
            <Sequence name="Bauchbinde 2" from={30} durationInFrames={180}>
              <LowerThird
                name={interview2.name}
                role={interview2.role}
                pDoom={interview2.pDoom}
              />
            </Sequence>
          </InterviewBlock>
        </Sequence>

        {/* 1590–1770 (6 s): Regulierung vs. Gefangenendilemma */}
        <Sequence name="SplitScreen" from={1590} durationInFrames={180}>
          <SplitScreen />
        </Sequence>

        {/* 1770–1950 (6 s): Outro mit Diskussionsfragen */}
        <Sequence name="Outro" from={1770} durationInFrames={180}>
          <OutroScene />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};
