import { Video } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Easing,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT, SHADOW } from "../theme";
import { SceneShell } from "./Background";
import { Beat, Headline, Tag } from "./kinetic";

export type InterviewBlockProps = {
  /** Dateiname im Ordner public/interviews/, z. B. "experte1.mp4" */
  readonly filename: string;
  /** Kurzer Titel, z. B. "Interview 1" */
  readonly label: string;
  /** Sekunden, die am Anfang des Videos übersprungen werden */
  readonly trimBeforeSeconds?: number;
  /** Lautstärke 0 bis 1 */
  readonly volume?: number;
  /** Bauchbinde und andere Overlays */
  readonly children?: React.ReactNode;
};

const FADE = 10;

/** Liegt die Interview-Datei in public/interviews/? */
export const interviewExists = (filename: string): boolean =>
  getStaticFiles().some((file) => file.name === `interviews/${filename}`);

/**
 * Spielt `public/interviews/<filename>` ab. Fehlt die Datei noch, zeigt der
 * Block einen Platzhalter mit Countdown bis zum Ende des Interview-Slots.
 * Sobald die Datei im Ordner liegt, erkennt Remotion Studio sie automatisch.
 */
export const InterviewBlock: React.FC<InterviewBlockProps> = ({
  filename,
  label,
  trimBeforeSeconds = 0,
  volume = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const path = `interviews/${filename}`;

  if (!interviewExists(filename)) {
    return (
      <InterviewPlaceholder path={path} label={label}>
        {children}
      </InterviewPlaceholder>
    );
  }

  const fade = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: FONT.sans }}>
      <Video
        src={staticFile(path)}
        trimBefore={Math.round(trimBeforeSeconds * fps)}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
        volume={fade * volume}
      />
      {/* Verlauf unten, damit die Bauchbinde auf jedem Bild lesbar bleibt */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(11,15,30,0.7) 0%, rgba(11,15,30,0) 38%)",
        }}
      />
      <div style={{ position: "absolute", top: 60, left: 110 }}>
        <Tag bg={COLORS.yellow} size={30}>
          {label}
        </Tag>
      </div>
      {children}
    </AbsoluteFill>
  );
};

const InterviewPlaceholder: React.FC<{
  readonly path: string;
  readonly label: string;
  readonly children?: React.ReactNode;
}> = ({ path, label, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const remaining = Math.ceil(Math.max(0, durationInFrames - frame) / fps);
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });

  const size = 360;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <SceneShell seed={`placeholder-${label}`} glow={COLORS.violet} bg="#110E26" push={0}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 90,
          paddingBottom: 170,
        }}
      >
        <Beat at={2} enter="pop">
          <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
              <circle cx={size / 2} cy={size / 2} r={radius} fill={COLORS.panel} stroke={COLORS.line} strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={COLORS.red}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * progress}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: FONT.display,
                fontSize: 170,
                color: COLORS.ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {remaining}
            </div>
          </div>
        </Beat>
        <div>
          <Beat at={6}>
            <Tag bg={COLORS.yellow} size={34}>
              {label}
            </Tag>
          </Beat>
          <Beat at={10} enter="slam" style={{ marginTop: 16 }}>
            <Headline size={150}>Video folgt</Headline>
          </Beat>
          <Beat at={16} style={{ marginTop: 22 }}>
            <div
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 12,
                backgroundColor: COLORS.panel,
                boxShadow: SHADOW.card,
                fontFamily: FONT.mono,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.inkSoft,
              }}
            >
              public/{path}
            </div>
          </Beat>
        </div>
      </AbsoluteFill>
      {children}
    </SceneShell>
  );
};
