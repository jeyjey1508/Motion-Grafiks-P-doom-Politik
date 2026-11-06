import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, RADIUS, SHADOW, TYPE, springIn } from "../theme";

export type MetricCardProps = {
  /** Kleine Überzeile, z. B. "Definition" */
  readonly kicker: string;
  /** Große Kernaussage oder Zahl (optional, z. B. wenn `children` einen Zähler enthält) */
  readonly value?: string;
  /** Erläuterung unter dem Wert */
  readonly description?: string;
  /** Akzentfarbe für Kante und Kicker-Punkt */
  readonly accent?: string;
  /** Start der Einblendung in Frames, relativ zur umgebenden Sequenz */
  readonly delay?: number;
  /** Schriftgröße des Werts */
  readonly valueSize?: number;
  /** Breite der Karte in px (Standard: volle Breite) */
  readonly width?: number | string;
  readonly style?: React.CSSProperties;
  /** Optionaler Zusatzinhalt unter der Beschreibung */
  readonly children?: React.ReactNode;
};

/**
 * Modulare Infobox für Kernaussagen.
 * Steigt mit einer stark gedämpften Feder auf, ohne Nachwippen.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  kicker,
  value,
  description,
  accent = COLORS.accent,
  delay = 0,
  valueSize = TYPE.headline,
  width = "100%",
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = springIn({ frame, fps, delay });
  const detail = springIn({ frame, fps, delay: delay + 8 });

  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        position: "relative",
        padding: "44px 52px 48px",
        borderRadius: RADIUS.card,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOW.card,
        overflow: "hidden",
        fontFamily: FONT.sans,
        color: COLORS.ink,
        opacity: enter,
        translate: `0px ${interpolate(enter, [0, 1], [40, 0])}px`,
        scale: String(interpolate(enter, [0, 1], [0.97, 1])),
        ...style,
      }}
    >
      {/* Akzentkante links */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          backgroundColor: accent,
          scale: `1 ${interpolate(enter, [0, 1], [0, 1])}`,
          transformOrigin: "top",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: TYPE.meta,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: COLORS.inkSecondary,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: RADIUS.pill,
            backgroundColor: accent,
          }}
        />
        {kicker}
      </div>
      {value ? (
        <div
          style={{
            fontSize: valueSize,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          {value}
        </div>
      ) : null}
      {description ? (
        <div
          style={{
            marginTop: 22,
            fontSize: TYPE.body,
            fontWeight: 400,
            lineHeight: 1.4,
            color: COLORS.inkSecondary,
            opacity: detail,
            translate: `0px ${interpolate(detail, [0, 1], [16, 0])}px`,
          }}
        >
          {description}
        </div>
      ) : null}
      {children ? (
        <div
          style={{
            opacity: detail,
            translate: `0px ${interpolate(detail, [0, 1], [16, 0])}px`,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};
