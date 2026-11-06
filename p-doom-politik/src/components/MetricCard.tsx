import React from "react";
import { COLORS, FONT } from "../theme";
import { Beat, type Enter, type Exit } from "./kinetic";

export type MetricCardProps = {
  /** Auftritt (Frame relativ zur Szene) */
  readonly at: number;
  /** Abgang (optional) */
  readonly out?: number;
  readonly enter?: Enter;
  readonly exit?: Exit;
  /** Kleine Marke über der Zahl, z. B. "Strafe" */
  readonly kicker?: string;
  /** Die große Zahl oder das Schlagwort (darf eine animierte Zahl sein) */
  readonly value: React.ReactNode;
  /** Kurze Einordnung unter der Zahl */
  readonly label?: React.ReactNode;
  readonly color?: string;
  readonly valueSize?: number;
  readonly align?: "left" | "center";
  readonly style?: React.CSSProperties;
};

/**
 * Modulare Kernaussage: Marke, große Zahl, ein Satz.
 * Bewusst ohne Kartenfläche – die Typografie trägt.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  at,
  out,
  enter = "slam",
  exit = "fade",
  kicker,
  value,
  label,
  color = COLORS.yellow,
  valueSize = 220,
  align = "left",
  style,
}) => (
  <Beat
    at={at}
    out={out}
    enter={enter}
    exit={exit}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      ...style,
    }}
  >
    {kicker ? (
      <span
        style={{
          display: "inline-block",
          padding: "8px 18px",
          borderRadius: 10,
          backgroundColor: color,
          color: COLORS.bg,
          fontFamily: FONT.sans,
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {kicker}
      </span>
    ) : null}
    <div
      style={{
        fontFamily: FONT.display,
        fontSize: valueSize,
        lineHeight: 0.95,
        color,
        whiteSpace: "nowrap",
        textShadow: `0 0 60px ${color}55`,
      }}
    >
      {value}
    </div>
    {label ? (
      <div
        style={{
          marginTop: 16,
          fontFamily: FONT.sans,
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.inkSoft,
          lineHeight: 1.25,
        }}
      >
        {label}
      </div>
    ) : null}
  </Beat>
);
