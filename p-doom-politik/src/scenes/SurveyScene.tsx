import React, { useMemo } from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Beat, CountUp, Kicker, Letters, Marker, settle, Sfx, useProgress, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const TOTAL = 2778;
const COLS = 86;
const STEP = 20;
const FIELD_X = 100;
const FIELD_Y = 300;

const dotPath = (indices: readonly number[]): string =>
  indices
    .map((i) => {
      const x = FIELD_X + (i % COLS) * STEP;
      const y = FIELD_Y + Math.floor(i / COLS) * STEP;
      return `M ${x - 6} ${y} a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`;
    })
    .join(" ");

const Plane: React.FC<{ readonly color: string; readonly size?: number }> = ({ color, size = 150 }) => (
  <svg width={size} height={size * 0.45} viewBox="0 0 200 90" style={{ overflow: "visible" }}>
    <path d="M 20 52 Q 20 36 46 36 L 150 36 Q 186 38 194 52 Q 186 64 150 64 L 46 64 Q 20 66 20 52 Z" fill={color} />
    <path d="M 26 40 L 6 8 L 30 8 L 58 38 Z" fill={color} />
    <path d="M 84 56 L 60 88 L 86 88 L 128 58 Z" fill={color} opacity={0.85} />
    <path d="M 160 42 Q 176 43 184 50 L 158 50 Z" fill={COLORS.bg} opacity={0.6} />
    {[70, 90, 110, 130].map((x) => (
      <rect key={x} x={x} y={43} width={9} height={7} rx={2} fill={COLORS.bg} opacity={0.5} />
    ))}
  </svg>
);

/**
 * Umfrage: 2.778 Forschende als Punktefeld, Median 5 %,
 * übersetzt in ein Bild: eines von zwanzig Flugzeugen.
 */
export const SurveyScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s1 = cue(cues, "s1");
  const s2 = cue(cues, "s2");
  const s3 = cue(cues, "s3");

  const countAt = wordAt(s1, "fast") - 4;
  const fiveAt = wordAt(s1, "fünf");
  const crashAt = wordAt(s3, "Absturzquote");
  const nobodyAt = wordAt(s3, "niemand");

  const cam = useCam([
    { at: 0, x: 0, y: 0, zoom: 1.03 },
    { at: fiveAt, x: 0, y: 0, zoom: 1 },
    { at: s2.from - 10, x: 0, y: 0, zoom: 1.04 },
    { at: s2.from + 14, x: 0, y: 1080, zoom: 1 },
    { at: durationInFrames, x: 60, y: 1080, zoom: 1.06 },
  ]);

  const { grey, red } = useMemo(() => {
    const all = Array.from({ length: TOTAL }).map((_, i) => i);
    const ranked = [...all].sort((a, b) => random(`pick-${a}`) - random(`pick-${b}`));
    const redSet = new Set(ranked.slice(0, Math.round(TOTAL * 0.05)));
    return {
      grey: dotPath(all.filter((i) => !redSet.has(i))),
      red: dotPath(all.filter((i) => redSet.has(i))),
    };
  }, []);

  const sweep = useProgress(s1.from, countAt + 30);
  const five = useSpringAt(fiveAt, SPRINGS.smooth);
  const fall = Math.max(0, frame - crashAt);

  return (
    <Stage seed="survey" cam={cam} sky={{ top: "#080C22", bottom: "#141B45", glow: COLORS.violet, glowAt: [55, 40], stars: 50 }}>
      <Layer depth={1}>
        {/* Punktefeld */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <clipPath id="survey-sweep">
              <rect x={0} y={0} width={1920 * sweep} height={1080} />
            </clipPath>
          </defs>
          <g clipPath="url(#survey-sweep)">
            <path d={grey} fill={COLORS.inkSoft} opacity={interpolate(five, [0, 1], [0.6, 0.2])} />
            <path d={red} fill={five > 0.05 ? COLORS.red : COLORS.inkSoft} opacity={interpolate(five, [0, 1], [0.6, 1])} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 100, top: 70 }}>
          <Beat at={countAt} enter="left" style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
            <span style={{ fontFamily: FONT.display, fontSize: 170, lineHeight: 1, color: COLORS.ink }}>
              <CountUp at={countAt} duration={30} to={TOTAL} />
            </span>
            <Kicker color={COLORS.inkSoft}>KI-Forschende befragt</Kicker>
          </Beat>
        </div>
        <Beat at={fiveAt - 2} enter="fade" style={{ position: "absolute", left: 0, top: 0 }}>
          <Glow x={1330} y={640} r={520} color="#050817" opacity={1} />
        </Beat>
        <div style={{ position: "absolute", left: 1010, top: 380, width: 660, textAlign: "center" }}>
          <Marker at={wordAt(s1, "Mittel")} bg={COLORS.ink} size={50}>
            Im Mittel
          </Marker>
          <Letters text="5 %" at={fiveAt} size={420} color={COLORS.red} glow={COLORS.red} style={{ display: "inline-block", marginTop: 10 }} />
        </div>
        <Beat at={fiveAt + 10} enter="fade" style={{ position: "absolute", left: 104, top: 1000 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: COLORS.inkMuted }}>
            UMFRAGE VON AI IMPACTS, 2023 · MEDIAN DER ANTWORTEN · ROT = 5 % DER PUNKTE
          </div>
        </Beat>

        {/* Zweites Bild: zwanzig Flugzeuge */}
        <div style={{ position: "absolute", left: 0, top: 1080, width: 1920, height: 1080 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 120 + i * 105 + random(`cloud-y-${i}`) * 40;
            const x = ((random(`cloud-x-${i}`) * 2600 - frame * (6 + (i % 3) * 3)) % 2600 + 2600) % 2600 - 340;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 220 + (i % 4) * 90,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.ink,
                  opacity: 0.1,
                }}
              />
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center" }}>
            <Letters text="Eins zu zwanzig" at={wordAt(s2, "eins") - 2} size={170} style={{ display: "inline-block" }} />
          </div>
          {Array.from({ length: 20 }).map((_, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const p = settle(frame - (s2.from + 6 + col * 2 + row * 3), fps, 10);
            const doomed = i === 13;
            const hit = doomed && frame >= crashAt;
            const x = 120 + col * 172 - (1 - p) * 700;
            const y = 420 + row * 190 + Math.sin(frame / 12 + i * 1.3) * 8;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x + (hit ? fall * 1.6 : 0),
                  top: y + (hit ? fall * fall * 0.11 : 0),
                  opacity: Math.min(1, p * 1.5),
                  rotate: hit ? `${Math.min(38, fall * 1.3)}deg` : "0deg",
                }}
              >
                {hit
                  ? Array.from({ length: 7 }).map((__, k) => (
                      <div
                        key={k}
                        style={{
                          position: "absolute",
                          left: -30 - k * 34,
                          top: 4 - k * 6,
                          width: 30 + k * 10,
                          height: 30 + k * 10,
                          borderRadius: "50%",
                          backgroundColor: "#3A4066",
                          opacity: Math.max(0, Math.min(0.7, (fall - k * 2) / 10)) * (1 - k / 9),
                        }}
                      />
                    ))
                  : null}
                <Plane color={hit ? COLORS.red : COLORS.ink} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center" }}>
            <Marker at={nobodyAt} bg={COLORS.red} color={COLORS.ink} size={76}>
              Würde niemand einsteigen
            </Marker>
          </div>
        </div>
      </Layer>

      <Sfx name="swell" at={0} volume={0.22} />
      <Sfx name="counter" at={countAt} />
      <Sfx name="impact" at={fiveAt} />
      <Sfx name="whoosh-long" at={s2.from - 12} />
      <Sfx name="stamp" at={wordAt(s2, "eins") - 2} />
      <Sfx name="alarm" at={crashAt} />
      <Sfx name="drop" at={crashAt + 6} volume={0.3} />
      <Sfx name="stamp" at={nobodyAt} />
    </Stage>
  );
};
