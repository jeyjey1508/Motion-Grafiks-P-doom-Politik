import React from "react";
import { Composition } from "remotion";
import { PDoomVideo } from "./Composition";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Länge wird aus dem Voiceover berechnet (src/timeline.ts) */}
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
    </>
  );
};
