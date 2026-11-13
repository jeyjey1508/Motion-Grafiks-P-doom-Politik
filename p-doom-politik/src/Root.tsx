import React from "react";
import { Composition, Folder } from "remotion";
import { PDoomVideo } from "./Composition";
import { DefineScene } from "./scenes/DefineScene";
import { ExpertsScene } from "./scenes/ExpertsScene";
import { OpenScene } from "./scenes/OpenScene";
import { SurveyScene } from "./scenes/SurveyScene";
import { BlackboxScene } from "./scenes/BlackboxScene";
import { CoffeeScene } from "./scenes/CoffeeScene";
import { LabScene } from "./scenes/LabScene";
import { EuScene } from "./scenes/EuScene";
import { MapScene } from "./scenes/MapScene";
import { DilemmaScene } from "./scenes/DilemmaScene";
import { SolutionsScene } from "./scenes/SolutionsScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { FPS, SCENES, TOTAL_FRAMES, type Cues, type SceneId } from "./timeline";

const SCENE_COMPS: readonly { id: string; scene: SceneId; component: React.FC<{ cues: Cues }> }[] = [
  { id: "Open", scene: "open", component: OpenScene },
  { id: "Define", scene: "define", component: DefineScene },
  { id: "Experts", scene: "experts", component: ExpertsScene },
  { id: "Survey", scene: "survey", component: SurveyScene },
  { id: "Blackbox", scene: "blackbox", component: BlackboxScene },
  { id: "Coffee", scene: "coffee", component: CoffeeScene },
  { id: "Lab", scene: "lab", component: LabScene },
  { id: "Eu", scene: "eu", component: EuScene },
  { id: "Map", scene: "map", component: MapScene },
  { id: "Dilemma", scene: "dilemma", component: DilemmaScene },
  { id: "Solutions", scene: "solutions", component: SolutionsScene },
  { id: "Closing", scene: "closing", component: ClosingScene },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Hauptfilm: Länge wird aus dem Voiceover berechnet (src/timeline.ts) */}
      <Composition
        id="PDoom"
        component={PDoomVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          interview1: {
            filename: "experte1.mp4",
            name: "Name Expert:in 1",
            role: "Funktion · Institution",
            pDoom: "XX %",
            trimBeforeSeconds: 0,
          },
          interview2: {
            filename: "experte2.mp4",
            name: "Name Expert:in 2",
            role: "Funktion · Institution",
            pDoom: "XX %",
            trimBeforeSeconds: 0,
          },
          untertitel: false,
          musikLautstaerke: 1,
        }}
      />
      {/* Einzelne Szenen zum Prüfen (ohne Ton) */}
      <Folder name="Szenen">
        {SCENE_COMPS.map((s) => (
          <Composition
            key={s.id}
            id={s.id}
            component={s.component}
            durationInFrames={SCENES[s.scene].durationInFrames}
            fps={FPS}
            width={1920}
            height={1080}
            defaultProps={{ cues: SCENES[s.scene].cues }}
          />
        ))}
      </Folder>
    </>
  );
};
