import React from "react";
import { COLORS } from "../theme";

/*
 * Flache Vektor-Illustrationen für die visuellen Metaphern.
 * Alle Icons sind eigene, einfache Formen (keine Fremdgrafiken).
 */

type IconProps = {
  readonly size?: number;
  readonly color?: string;
  readonly style?: React.CSSProperties;
};

export type RobotMood = "neutral" | "focused" | "happy" | "evil";

/** Freundlicher Roboter mit wechselnder Mimik. */
export const Robot: React.FC<{
  readonly size?: number;
  readonly mood?: RobotMood;
  /** 0 = Arm unten, 1 = Arm vorgestreckt (blockiert) */
  readonly arm?: number;
  /** 0 = Augen offen, 1 = geschlossen */
  readonly blink?: number;
  readonly color?: string;
  readonly style?: React.CSSProperties;
}> = ({ size = 420, mood = "neutral", arm = 0, blink = 0, color = COLORS.blue, style }) => {
  const eyeColor = mood === "evil" ? COLORS.red : COLORS.ink;
  const eyeScaleY = Math.max(0.08, 1 - blink);
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 300 390" style={style}>
      {/* Schatten */}
      <ellipse cx={150} cy={378} rx={95} ry={10} fill="rgba(0,0,0,0.35)" />
      {/* Antenne */}
      <line x1={150} y1={58} x2={150} y2={22} stroke={color} strokeWidth={8} strokeLinecap="round" />
      <circle cx={150} cy={18} r={12} fill={mood === "evil" ? COLORS.red : COLORS.yellow} />
      {/* Kopf */}
      <rect x={45} y={56} width={210} height={158} rx={46} fill={color} />
      <rect x={70} y={84} width={160} height={102} rx={30} fill={COLORS.bg} />
      {/* Augen */}
      {mood === "happy" ? (
        <>
          <path d="M 98 142 Q 116 116 134 142" fill="none" stroke={eyeColor} strokeWidth={10} strokeLinecap="round" />
          <path d="M 166 142 Q 184 116 202 142" fill="none" stroke={eyeColor} strokeWidth={10} strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={116} cy={136} rx={17} ry={17 * eyeScaleY} fill={eyeColor} />
          <ellipse cx={184} cy={136} rx={17} ry={17 * eyeScaleY} fill={eyeColor} />
          {mood === "focused" || mood === "evil" ? (
            <>
              <line x1={92} y1={106} x2={134} y2={120} stroke={eyeColor} strokeWidth={9} strokeLinecap="round" />
              <line x1={208} y1={106} x2={166} y2={120} stroke={eyeColor} strokeWidth={9} strokeLinecap="round" />
            </>
          ) : null}
        </>
      )}
      {/* Hals + Körper */}
      <rect x={128} y={212} width={44} height={18} fill={color} opacity={0.75} />
      <rect x={78} y={226} width={144} height={120} rx={34} fill={color} />
      <circle cx={150} cy={276} r={18} fill={mood === "evil" ? COLORS.red : COLORS.yellow} />
      {/* linker Arm */}
      <rect x={42} y={238} width={30} height={92} rx={15} fill={color} />
      {/* rechter Arm: dreht nach vorn */}
      <g transform={`rotate(${-arm * 100} 243 248)`}>
        <rect x={228} y={238} width={30} height={92} rx={15} fill={color} />
        <circle cx={243} cy={334} r={20} fill={color} />
      </g>
      {/* Beine */}
      <rect x={104} y={340} width={30} height={34} rx={10} fill={color} opacity={0.85} />
      <rect x={166} y={340} width={30} height={34} rx={10} fill={color} opacity={0.85} />
    </svg>
  );
};

export const CoffeeCup: React.FC<IconProps & { readonly steam?: number }> = ({
  size = 160,
  color = COLORS.orange,
  steam = 0,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    {[50, 78, 106].map((x, i) => (
      <path
        key={x}
        d={`M ${x} 50 q -10 -12 0 -24 q 10 -12 0 -24`}
        fill="none"
        stroke={COLORS.inkSoft}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.6}
        transform={`translate(0 ${Math.sin(steam + i) * 4})`}
      />
    ))}
    <path d="M 26 62 H 130 L 120 140 Q 118 150 106 150 H 50 Q 38 150 36 140 Z" fill={color} />
    <path d="M 128 76 Q 156 76 152 102 Q 148 124 122 122" fill="none" stroke={color} strokeWidth={12} />
    <rect x={20} y={56} width={116} height={14} rx={7} fill={COLORS.ink} opacity={0.9} />
  </svg>
);

export const PowerButton: React.FC<IconProps & { readonly pressed?: number }> = ({
  size = 200,
  color = COLORS.red,
  pressed = 0,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <circle cx={100} cy={108} r={86} fill="rgba(0,0,0,0.35)" />
    <circle cx={100} cy={100 + pressed * 6} r={86} fill={color} />
    <path
      d={`M 66 ${78 + pressed * 6} A 46 46 0 1 0 134 ${78 + pressed * 6}`}
      fill="none"
      stroke={COLORS.ink}
      strokeWidth={14}
      strokeLinecap="round"
    />
    <line x1={100} y1={54 + pressed * 6} x2={100} y2={104 + pressed * 6} stroke={COLORS.ink} strokeWidth={14} strokeLinecap="round" />
  </svg>
);

export const Lock: React.FC<IconProps> = ({ size = 120, color = COLORS.yellow, style }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    <path d="M 34 56 V 40 A 26 26 0 0 1 86 40 V 56" fill="none" stroke={color} strokeWidth={12} />
    <rect x={20} y={52} width={80} height={60} rx={14} fill={color} />
    <circle cx={60} cy={78} r={9} fill={COLORS.bg} />
    <rect x={56} y={80} width={8} height={18} rx={4} fill={COLORS.bg} />
  </svg>
);

export const Target: React.FC<IconProps & { readonly arrow?: number }> = ({
  size = 240,
  arrow = 1,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 240 240" style={{ overflow: "visible", ...style }}>
    <circle cx={120} cy={120} r={110} fill={COLORS.red} />
    <circle cx={120} cy={120} r={80} fill={COLORS.ink} />
    <circle cx={120} cy={120} r={50} fill={COLORS.red} />
    <circle cx={120} cy={120} r={20} fill={COLORS.ink} />
    {/* Pfeil landet knapp neben der Mitte */}
    <g transform={`translate(${(1 - arrow) * 260} ${-(1 - arrow) * 200})`} opacity={arrow > 0 ? 1 : 0}>
      <line x1={168} y1={62} x2={268} y2={-38} stroke={COLORS.yellow} strokeWidth={10} strokeLinecap="round" />
      <path d="M 158 72 L 186 62 L 168 44 Z" fill={COLORS.yellow} />
      <path d="M 252 -40 L 280 -50 L 270 -22 Z" fill={COLORS.inkSoft} />
    </g>
  </svg>
);

export const Earth: React.FC<IconProps & { readonly crack?: number }> = ({
  size = 240,
  crack = 0,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 240 240" style={style}>
    <circle cx={120} cy={120} r={110} fill={COLORS.blue} />
    <path d="M 58 70 Q 90 44 118 62 Q 132 92 104 104 Q 86 126 60 112 Q 40 92 58 70 Z" fill={COLORS.green} />
    <path d="M 140 118 Q 176 104 196 130 Q 200 168 168 186 Q 138 184 132 156 Q 126 134 140 118 Z" fill={COLORS.green} />
    <path d="M 150 42 Q 176 46 184 66 Q 168 76 150 64 Z" fill={COLORS.green} />
    <path
      d="M 120 10 L 108 64 L 134 98 L 100 140 L 128 176 L 112 230"
      fill="none"
      stroke={COLORS.red}
      strokeWidth={9}
      strokeLinejoin="round"
      strokeDasharray={300}
      strokeDashoffset={300 * (1 - crack)}
    />
  </svg>
);

export const Dice: React.FC<IconProps> = ({ size = 160, color = COLORS.yellow, style }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" style={style}>
    <rect x={10} y={10} width={140} height={140} rx={30} fill={color} />
    {[
      [45, 45],
      [115, 45],
      [80, 80],
      [45, 115],
      [115, 115],
    ].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={13} fill={COLORS.bg} />
    ))}
  </svg>
);

export const BrokenChain: React.FC<IconProps & { readonly split?: number }> = ({
  size = 200,
  color = COLORS.orange,
  split = 1,
  style,
}) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 200 120" style={style}>
    <g transform={`translate(${-split * 14} ${split * 6}) rotate(${-split * 10} 60 60)`}>
      <rect x={10} y={34} width={96} height={52} rx={26} fill="none" stroke={color} strokeWidth={16} />
    </g>
    <g transform={`translate(${split * 14} ${-split * 6}) rotate(${split * 10} 140 60)`}>
      <rect x={94} y={34} width={96} height={52} rx={26} fill="none" stroke={color} strokeWidth={16} />
    </g>
  </svg>
);

export const Star: React.FC<IconProps> = ({ size = 40, color = COLORS.yellow, style }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={style}>
    <path
      d={Array.from({ length: 10 })
        .map((_, i) => {
          const r = i % 2 === 0 ? 48 : 19;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          return `${i === 0 ? "M" : "L"} ${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
        })
        .join(" ") + " Z"}
      fill={color}
    />
  </svg>
);

export const Rocket: React.FC<IconProps & { readonly flame?: number }> = ({
  size = 160,
  color = COLORS.blue,
  flame = 0,
  style,
}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160" style={{ overflow: "visible", ...style }}>
    <path
      d={`M 38 118 Q 50 ${150 + flame * 26} 62 118 Z`}
      fill={COLORS.yellow}
    />
    <path d={`M 43 118 Q 50 ${136 + flame * 14} 57 118 Z`} fill={COLORS.ink} />
    <path d="M 50 4 Q 80 36 76 104 L 24 104 Q 20 36 50 4 Z" fill={COLORS.ink} />
    <path d="M 50 4 Q 66 20 72 40 L 28 40 Q 34 20 50 4 Z" fill={color} />
    <circle cx={50} cy={62} r={12} fill={color} />
    <circle cx={50} cy={62} r={6} fill={COLORS.bg} />
    <path d="M 24 78 L 6 112 L 26 104 Z" fill={color} />
    <path d="M 76 78 L 94 112 L 74 104 Z" fill={color} />
    <rect x={30} y={102} width={40} height={16} rx={4} fill={color} />
  </svg>
);

export const Gavel: React.FC<IconProps> = ({ size = 200, color = COLORS.yellow, style }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <g transform="rotate(-35 100 100)">
      <rect x={40} y={44} width={110} height={52} rx={12} fill={color} />
      <rect x={30} y={40} width={20} height={60} rx={8} fill={COLORS.ink} />
      <rect x={140} y={40} width={20} height={60} rx={8} fill={COLORS.ink} />
      <rect x={86} y={94} width={20} height={96} rx={10} fill={COLORS.inkSoft} />
    </g>
    <rect x={20} y={170} width={120} height={20} rx={8} fill={COLORS.inkSoft} opacity={0.7} />
  </svg>
);

export const Building: React.FC<IconProps> = ({ size = 140, color = COLORS.violet, style }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" style={style}>
    <rect x={30} y={12} width={80} height={120} rx={8} fill={color} />
    {[0, 1, 2, 3].map((r) =>
      [0, 1].map((c) => (
        <rect key={`${r}-${c}`} x={46 + c * 28} y={28 + r * 24} width={18} height={14} rx={3} fill={COLORS.bg} opacity={0.75} />
      )),
    )}
  </svg>
);

export const Pillars: React.FC<IconProps> = ({ size = 140, color = COLORS.blue, style }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" style={style}>
    <path d="M 10 46 L 70 12 L 130 46 Z" fill={color} />
    {[22, 50, 78, 106].map((x) => (
      <rect key={x} x={x} y={52} width={14} height={62} rx={4} fill={color} />
    ))}
    <rect x={8} y={116} width={124} height={14} rx={4} fill={color} />
  </svg>
);

export const Globe: React.FC<IconProps> = ({ size = 140, color = COLORS.green, style }) => (
  <svg width={size} height={size} viewBox="0 0 140 140" style={style}>
    <circle cx={70} cy={70} r={58} fill="none" stroke={color} strokeWidth={10} />
    <ellipse cx={70} cy={70} rx={26} ry={58} fill="none" stroke={color} strokeWidth={8} />
    <line x1={12} y1={70} x2={128} y2={70} stroke={color} strokeWidth={8} />
    <path d="M 22 40 Q 70 52 118 40" fill="none" stroke={color} strokeWidth={7} />
    <path d="M 22 100 Q 70 88 118 100" fill="none" stroke={color} strokeWidth={7} />
  </svg>
);

export const Clipboard: React.FC<IconProps & { readonly checks?: number }> = ({
  size = 200,
  color = COLORS.inkSoft,
  checks = 3,
  style,
}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 200 240" style={style}>
    <rect x={20} y={24} width={160} height={206} rx={18} fill={color} />
    <rect x={64} y={10} width={72} height={32} rx={10} fill={COLORS.inkMuted} />
    <text x={100} y={86} textAnchor="middle" fontFamily="Anton, sans-serif" fontSize={40} fill={COLORS.bg}>
      TEST
    </text>
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${i * 42})`}>
        <rect x={46} y={110} width={26} height={26} rx={6} fill="none" stroke={COLORS.bg} strokeWidth={5} />
        {i < checks ? (
          <path d="M 50 122 L 58 131 L 72 110" fill="none" stroke={COLORS.green} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
        <rect x={86} y={116} width={72} height={12} rx={6} fill={COLORS.bg} opacity={0.5} />
      </g>
    ))}
  </svg>
);

export const Checkmark: React.FC<IconProps> = ({ size = 80, color = COLORS.green, style }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <circle cx={40} cy={40} r={38} fill={color} />
    <path d="M 22 41 L 35 54 L 58 28" fill="none" stroke={COLORS.bg} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Cross: React.FC<IconProps> = ({ size = 80, color = COLORS.red, style }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style}>
    <circle cx={40} cy={40} r={38} fill={color} />
    <path d="M 26 26 L 54 54 M 54 26 L 26 54" stroke={COLORS.ink} strokeWidth={9} strokeLinecap="round" />
  </svg>
);
