import React from "react";
import { Composition } from "remotion";
import { PDoomVideo } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PDoom"
        component={PDoomVideo}
        durationInFrames={1950}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          interview1: {
            filename: "experte1.mp4",
            name: "Name Expert:in 1",
            role: "Funktion · Institution",
            pDoom: "XX %",
            question: "Wie realistisch ist ein Kontrollverlust über KI?",
            trimBeforeSeconds: 0,
          },
          interview2: {
            filename: "experte2.mp4",
            name: "Name Expert:in 2",
            role: "Funktion · Institution",
            pDoom: "XX %",
            question: "Was kann die Politik gegen das Risiko tun?",
            trimBeforeSeconds: 0,
          },
        }}
      />
    </>
  );
};
