import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Beat, Letters, Sfx, Tag } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SHADOW } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

export type TeaserLine = {
  /** Angezeigter Text */
  readonly text: string;
  /** Gesprochenes Wort, auf das die Zeile synchron erscheint */
  readonly spoken: string;
  readonly color?: string;
};

export type TeaserSceneProps = {
  readonly cues: Cues;
  readonly cueId: string;
  readonly lines: readonly TeaserLine[];
  /** Gesprochenes Wort, bei dem die Interview-Karte erscheint */
  readonly cardWord: string;
  readonly label: string;
  readonly name: string;
  readonly role: string;
};

/**
 * Teaser vor einem Interview: die Leitfrage in großen Buchstaben,
 * dann die Karte mit Name und Funktion.
 */
export const TeaserScene: React.FC<TeaserSceneProps> = ({ cues, cueId, lines, cardWord, label, name, role }) => {
  const { durationInFrames } = useVideoConfig();
  const c = cue(cues, cueId);
  const cardAt = wordAt(c, cardWord);
  const cam = useCam([
    { at: 0, x: 0, y: 0, zoom: 1.08 },
    { at: durationInFrames, x: 0, y: 20, zoom: 1 },
  ]);

  return (
    <Stage seed={cueId} cam={cam} sky={{ top: "#0C0A22", bottom: "#1A1340", glow: COLORS.violet, stars: 80, dust: 14 }}>
      <Layer depth={0.5}>
        <Glow x={960} y={420} r={700} color={COLORS.violet} opacity={0.5} />
      </Layer>
      <Layer depth={1}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
          {lines.map((line) => (
            <Letters key={line.text} text={line.text} at={wordAt(c, line.spoken) - 2} size={210} color={line.color ?? COLORS.ink} />
          ))}
          <Beat at={cardAt} enter="rise" style={{ marginTop: 70 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 44,
                padding: "34px 60px 34px 38px",
                borderRadius: 40,
                backgroundColor: COLORS.panel,
                boxShadow: SHADOW.card,
                border: `2px solid ${COLORS.line}`,
              }}
            >
              <div
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: 999,
                  backgroundColor: COLORS.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: SHADOW.glow(COLORS.red, 0.7),
                  flexShrink: 0,
                }}
              >
                <svg width={62} height={62} viewBox="0 0 64 64">
                  <path d="M 20 12 L 54 32 L 20 52 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth={6} strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <Tag bg={COLORS.yellow} size={30}>
                  {label}
                </Tag>
                <div style={{ marginTop: 14, fontFamily: FONT.display, fontSize: 90, lineHeight: 1, textTransform: "uppercase", color: COLORS.ink }}>
                  {name}
                </div>
                <div style={{ marginTop: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 36, color: COLORS.inkSoft }}>{role}</div>
              </div>
            </div>
          </Beat>
        </AbsoluteFill>
      </Layer>
      {lines.map((line) => (
        <Sfx key={line.text} name="stamp" at={wordAt(c, line.spoken) - 2} volume={0.3} />
      ))}
      <Sfx name="whoosh-soft" at={cardAt - 3} />
    </Stage>
  );
};
