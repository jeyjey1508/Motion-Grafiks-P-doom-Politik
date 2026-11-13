import React from "react";
import { COLORS } from "../theme";

/**
 * Neutrale Büste (keine Porträt-Ähnlichkeit): Kopf, Schultern, optional
 * Brille oder Laborkittel. Ursprung: Mitte unten.
 */
export const Bust: React.FC<{
  readonly size?: number;
  readonly color?: string;
  readonly accent?: string;
  readonly glasses?: boolean;
  readonly coat?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ size = 260, color = "#2A3566", accent = COLORS.inkSoft, glasses = false, coat = false, style }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={style}>
    <path d="M 14 230 Q 14 150 62 132 L 138 132 Q 186 150 186 230 Z" fill={coat ? "#E8ECFA" : color} />
    {coat ? <path d="M 100 132 L 84 230 L 116 230 Z" fill={color} /> : null}
    <rect x={82} y={104} width={36} height={40} rx={12} fill={accent} opacity={0.9} />
    <circle cx={100} cy={70} r={50} fill={accent} />
    <path d="M 50 62 Q 56 14 100 16 Q 146 14 150 62 Q 128 40 100 44 Q 70 40 50 62 Z" fill={color} />
    {glasses ? (
      <g fill="none" stroke={color} strokeWidth={5}>
        <circle cx={80} cy={76} r={13} />
        <circle cx={120} cy={76} r={13} />
        <line x1={93} y1={76} x2={107} y2={76} />
      </g>
    ) : null}
  </svg>
);

/** Würfel mit Augenzahl 1 bis 6. */
export const Die: React.FC<{ readonly size?: number; readonly value: number; readonly color?: string }> = ({
  size = 140,
  value,
  color = COLORS.yellow,
}) => {
  const pips: Record<number, readonly (readonly [number, number])[]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x={6} y={10} width={88} height={88} rx={20} fill="rgba(0,0,0,0.35)" />
      <rect x={6} y={4} width={88} height={88} rx={20} fill={color} />
      {(pips[value] ?? pips[1]).map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y - 2} r={8.5} fill={COLORS.bg} />
      ))}
    </svg>
  );
};
