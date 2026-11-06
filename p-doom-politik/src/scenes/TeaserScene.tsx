import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "../components/Background";
import { Beat, Headline, Sfx, Tag } from "../components/kinetic";
import { COLORS, FONT, SHADOW } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

export type TeaserWord = {
  /** Angezeigtes Wort */
  readonly text: string;
  /** Gesprochenes Wort, auf das es synchron erscheint */
  readonly spoken: string;
  readonly color?: string;
};

export type TeaserSceneProps = {
  readonly cues: Cues;
  readonly cueId: string;
  readonly words: readonly TeaserWord[];
  /** Gesprochenes Wort, bei dem die Interview-Karte erscheint */
  readonly cardWord: string;
  readonly label: string;
  readonly name: string;
  readonly role: string;
};

/**
 * Teaser vor einem Interview: Wort-für-Wort-Frage, dann die Karte mit
 * Name und Funktion.
 */
export const TeaserScene: React.FC<TeaserSceneProps> = ({
  cues,
  cueId,
  words,
  cardWord,
  label,
  name,
  role,
}) => {
  const c = cue(cues, cueId);
  const cardAt = wordAt(c, cardWord);

  return (
    <SceneShell seed={cueId} glow={COLORS.violet} bg="#110E26">
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 70,
          paddingBottom: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: 48,
            maxWidth: 1700,
          }}
        >
          {words.map((w) => (
            <Beat key={w.text} at={wordAt(c, w.spoken)} enter="slam">
              <Headline size={200} color={w.color ?? COLORS.ink}>
                {w.text}
              </Headline>
            </Beat>
          ))}
        </div>

        <Beat at={cardAt} enter="rise">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 44,
              padding: "36px 60px 36px 40px",
              borderRadius: 40,
              backgroundColor: COLORS.panel,
              boxShadow: SHADOW.card,
              border: `2px solid ${COLORS.line}`,
            }}
          >
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 999,
                backgroundColor: COLORS.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: SHADOW.glow(COLORS.red, 0.7),
                flexShrink: 0,
              }}
            >
              <svg width={64} height={64} viewBox="0 0 64 64">
                <path d="M 20 12 L 54 32 L 20 52 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth={6} strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <Tag bg={COLORS.yellow} size={30}>
                {label}
              </Tag>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: FONT.display,
                  fontSize: 92,
                  lineHeight: 1,
                  textTransform: "uppercase",
                  color: COLORS.ink,
                }}
              >
                {name}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontFamily: FONT.sans,
                  fontWeight: 800,
                  fontSize: 36,
                  color: COLORS.inkSoft,
                }}
              >
                {role}
              </div>
            </div>
          </div>
        </Beat>
      </AbsoluteFill>
      {words.map((w) => (
        <Sfx key={w.text} name="pop" at={wordAt(c, w.spoken)} volume={0.32} />
      ))}
      <Sfx name="whoosh-soft" at={cardAt - 3} />
    </SceneShell>
  );
};
