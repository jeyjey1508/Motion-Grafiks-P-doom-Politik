import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../theme";
import {
  SCENE_ORDER,
  SCENES,
  TOTAL_FRAMES,
  TRANSITION_FRAMES,
  type SceneId,
} from "../timeline";
import { interviewExists } from "./InterviewBlock";

/** Alle Sprachzeilen mit globalen Zeiten. */
const VO_LINES = SCENE_ORDER.flatMap((id) => {
  const scene = SCENES[id];
  return Object.values(scene.cues).map((c) => ({
    key: `${id}-${c.id}`,
    from: scene.from + c.from,
    to: scene.from + c.from + c.durationInFrames,
    file: c.file,
    trimBefore: c.trimBefore,
    durationInFrames: c.durationInFrames,
    caption: c.caption,
  }));
});

/** Voiceover-Spur: jede Zeile als eigener Clip auf der Zeitleiste. */
export const VoiceoverTrack: React.FC = () => (
  <>
    {VO_LINES.map((line) => (
      <Sequence
        key={line.key}
        name={`VO ${line.key}`}
        from={line.from}
        durationInFrames={line.durationInFrames + 4}
        layout="none"
      >
        <Audio src={staticFile(line.file)} trimBefore={line.trimBefore} />
      </Sequence>
    ))}
  </>
);

const MUSIC_BASE = 0.2;
const MUSIC_DUCKED = 0.07;
const DUCK_RAMP = 8;

/** 0 = keine Sprache, 1 = Sprache läuft (mit weichen Rampen). */
const duckAmount = (frame: number): number => {
  let amount = 0;
  for (const line of VO_LINES) {
    if (frame >= line.from - DUCK_RAMP && frame <= line.to + DUCK_RAMP) {
      const fadeIn = interpolate(frame, [line.from - DUCK_RAMP, line.from], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const fadeOut = interpolate(frame, [line.to, line.to + DUCK_RAMP], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      amount = Math.max(amount, Math.min(fadeIn, fadeOut));
    }
  }
  return amount;
};

/** Faktor für Interview-Slots: echte Interviews stummschalten die Musik. */
const interviewFactor = (
  frame: number,
  slots: readonly { id: SceneId; hasVideo: boolean }[],
): number => {
  let factor = 1;
  for (const slot of slots) {
    const scene = SCENES[slot.id];
    const start = scene.from + TRANSITION_FRAMES / 2;
    const end = scene.from + scene.durationInFrames - TRANSITION_FRAMES / 2;
    const target = slot.hasVideo ? 0 : 0.7;
    const inside = interpolate(frame, [start - 12, start, end, end + 12], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    factor = Math.min(factor, 1 - inside * (1 - target));
  }
  return factor;
};

/** Hintergrundmusik mit automatischem Ducking unter Sprache und Interviews. */
export const MusicBed: React.FC<{
  readonly interview1File: string;
  readonly interview2File: string;
  readonly volume?: number;
}> = ({ interview1File, interview2File, volume = 1 }) => {
  const frame = useCurrentFrame();
  const slots = [
    { id: "interview1" as const, hasVideo: interviewExists(interview1File) },
    { id: "interview2" as const, hasVideo: interviewExists(interview2File) },
  ];
  const duck = duckAmount(frame);
  const level = MUSIC_BASE * (1 - duck) + MUSIC_DUCKED * duck;
  const fades = interpolate(
    frame,
    [0, 20, TOTAL_FRAMES - 80, TOTAL_FRAMES],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <Audio
      name="Musik"
      src={staticFile("audio/music/bed.mp3")}
      loop
      volume={level * interviewFactor(frame, slots) * fades * volume}
    />
  );
};

/** Whoosh auf jedem Szenenwechsel. */
export const TransitionWhooshes: React.FC = () => (
  <>
    {SCENE_ORDER.slice(1).map((id) => (
      <Sequence
        key={id}
        name={`Übergang ${id}`}
        from={Math.max(0, SCENES[id].from - 3)}
        durationInFrames={24}
        layout="none"
      >
        <Audio src={staticFile("audio/sfx/whoosh.wav")} volume={0.28} />
      </Sequence>
    ))}
  </>
);

/** Optionale Untertitel (Sprechertext) für Barrierefreiheit im Unterricht. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const active = VO_LINES.find((l) => frame >= l.from - 2 && frame <= l.to + 6);
  if (!active) {
    return null;
  }
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 36 }}>
      <div
        style={{
          maxWidth: 1500,
          padding: "12px 26px",
          borderRadius: 14,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          fontFamily: FONT.sans,
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.3,
          color: COLORS.ink,
          textAlign: "center",
        }}
      >
        {active.caption}
      </div>
    </AbsoluteFill>
  );
};
