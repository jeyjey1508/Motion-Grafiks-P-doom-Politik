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
import { COLORS, FONT, RADIUS, SHADOW, TYPE, springIn } from "../theme";

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

const FADE = 12;

/**
 * Spielt `public/interviews/<filename>` ab. Fehlt die Datei noch, zeigt der
 * Block eine Platzhalter-Box mit Countdown bis zum Ende des Interview-Slots.
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
  const hasVideo = getStaticFiles().some((file) => file.name === path);

  const opacity = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ opacity, fontFamily: FONT.sans }}>
      {hasVideo ? (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
          <Video
            src={staticFile(path)}
            trimBefore={Math.round(trimBeforeSeconds * fps)}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
            volume={
              interpolate(
                frame,
                [0, FADE, durationInFrames - FADE, durationInFrames],
                [0, 1, 1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ) * volume
            }
          />
          {/* Verlauf unten, damit die Bauchbinde auf jedem Bild lesbar bleibt */}
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to top, rgba(11,14,20,0.75) 0%, rgba(11,14,20,0) 40%)",
            }}
          />
        </AbsoluteFill>
      ) : (
        <InterviewPlaceholder path={path} label={label} />
      )}
      <InterviewTag label={label} />
      {children}
    </AbsoluteFill>
  );
};

const InterviewTag: React.FC<{ readonly label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springIn({ frame, fps, delay: 4 });

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 120,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 24px",
        borderRadius: RADIUS.pill,
        backgroundColor: "rgba(20, 25, 35, 0.85)",
        border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOW.soft,
        fontSize: TYPE.meta,
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: COLORS.ink,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [-16, 0])}px`,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: RADIUS.pill,
          backgroundColor: COLORS.accent,
        }}
      />
      {label}
    </div>
  );
};

const InterviewPlaceholder: React.FC<{
  readonly path: string;
  readonly label: string;
}> = ({ path, label }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = springIn({ frame, fps, delay: 2 });

  const remainingFrames = Math.max(0, durationInFrames - frame);
  const remainingSeconds = Math.ceil(remainingFrames / fps);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const countdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const ringSize = 260;
  const stroke = 10;
  const radius = (ringSize - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        // Platz oben für das Label, unten für die Bauchbinde
        paddingTop: 80,
        paddingBottom: 230,
      }}
    >
      <div
        style={{
          width: 1360,
          height: 640,
          boxSizing: "border-box",
          borderRadius: 36,
          backgroundColor: "rgba(20, 25, 35, 0.92)",
          border: `3px dashed ${COLORS.borderStrong}`,
          boxShadow: SHADOW.card,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 40,
          color: COLORS.ink,
          opacity: enter,
          scale: String(interpolate(enter, [0, 1], [0.96, 1])),
        }}
      >
        <div style={{ position: "relative", width: ringSize, height: ringSize }}>
          <svg
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            style={{ position: "absolute", inset: 0, rotate: "-90deg" }}
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={COLORS.border}
              strokeWidth={stroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={COLORS.accent}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={interpolate(
                progress,
                [0, 1],
                [0, circumference],
                { easing: Easing.linear },
              )}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 72,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {countdown}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: COLORS.inkSecondary,
                marginTop: 4,
              }}
            >
              Restzeit
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: TYPE.title,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {label}: Video folgt
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: TYPE.label,
              color: COLORS.inkSecondary,
            }}
          >
            Datei hier ablegen:{" "}
            <span
              style={{
                fontFamily: FONT.mono,
                color: COLORS.ink,
                backgroundColor: COLORS.surfaceRaised,
                padding: "4px 14px",
                borderRadius: 10,
              }}
            >
              public/{path}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
