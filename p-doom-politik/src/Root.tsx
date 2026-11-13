import React from "react";
import { Composition, Folder } from "remotion";
import { DefineScene } from "./scenes/DefineScene";
import { ExpertsScene } from "./scenes/ExpertsScene";
import { OpenScene } from "./scenes/OpenScene";
import { SurveyScene } from "./scenes/SurveyScene";
import { FPS, SCENES, type Cues, type SceneId } from "./timeline";

const SCENE_COMPS: readonly { id: string; scene: SceneId; component: React.FC<{ cues: Cues }> }[] = [
  { id: "Open", scene: "open", component: OpenScene },
  { id: "Define", scene: "define", component: DefineScene },
  { id: "Experts", scene: "experts", component: ExpertsScene },
  { id: "Survey", scene: "survey", component: SurveyScene },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
