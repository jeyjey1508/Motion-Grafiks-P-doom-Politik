import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe } from "../art/Globe";
import {
  Beat,
  Headline,
  Kicker,
  Letters,
  Marker,
  Sfx,
  SlotNumber,
  useProgress,
  useShake,
  useSpringAt,
} from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

/** Handschriftliche Unterschrift, die sich selbst schreibt. */
const Signature: React.FC<{ readonly seed: string; readonly at: number; readonly color?: string }> = ({
  seed,
  at,
  color = COLORS.inkSoft,
}) => {
  const p = useProgress(at, at + 16);
  const points = Array.from({ length: 7 }).map((_, i) => ({
    x: 6 + i * 21 + (random(`${seed}-x-${i}`) - 0.5) * 10,
    y: 26 + (random(`${seed}-y-${i}`) - 0.5) * (i === 0 ? 44 : 30),
  }));
  const d = points
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      return `C ${prev.x + 12} ${prev.y - 26}, ${pt.x - 12} ${pt.y + 26}, ${pt.x} ${pt.y}`;
    })
    .join(" ");
  return (
    <svg width={150} height={64} viewBox="0 0 150 64">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={3.2}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
      <line x1={4} y1={54} x2={146} y2={54} stroke={COLORS.line} strokeWidth={2} opacity={p > 0 ? 1 : 0} />
    </svg>
  );
};

const Virus: React.FC = () => (
  <svg width={64} height={64} viewBox="-32 -32 64 64">
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return (
        <g key={i}>
          <line x1={Math.cos(a) * 14} y1={Math.sin(a) * 14} x2={Math.cos(a) * 26} y2={Math.sin(a) * 26} stroke={COLORS.green} strokeWidth={4} />
          <circle cx={Math.cos(a) * 27} cy={Math.sin(a) * 27} r={4} fill={COLORS.green} />
        </g>
      );
    })}
    <circle r={16} fill={COLORS.green} />
    <circle cx={-5} cy={-4} r={4} fill={COLORS.bg} opacity={0.5} />
    <circle cx={6} cy={5} r={3} fill={COLORS.bg} opacity={0.5} />
  </svg>
);

const Nuclear: React.FC = () => (
  <svg width={64} height={64} viewBox="-32 -32 64 64">
    <circle r={30} fill={COLORS.yellow} />
    {[0, 120, 240].map((deg) => (
      <path key={deg} d="M 0 0 L -13 -22.5 A 26 26 0 0 1 13 -22.5 Z" fill={COLORS.bg} transform={`rotate(${deg})`} />
    ))}
    <circle r={8} fill={COLORS.yellow} />
    <circle r={5} fill={COLORS.bg} />
  </svg>
);

/**
 * Kalter Einstieg: die Erde, ein Satz, Hunderte Unterschriften,
 * die Frage nach der Zahl, Titel.
 */
export const OpenScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o1 = cue(cues, "o1");
  const o2 = cue(cues, "o2");
  const o3 = cue(cues, "o3");
  const o4 = cue(cues, "o4");
  const o5 = cue(cues, "o5");

  const wipeAt = wordAt(o2, "auslöscht");
  const signAt = wordAt(o3, "Unterschrieben");
  const chiefsAt = wordAt(o3, "Chefs");
  const numberAt = wordAt(o4, "Zahl") - 4;
  const titleAt = o5.from;

  const cam = useCam([
    { at: 0, x: 380, y: 150, zoom: 1.4 },
    { at: o2.from - 6, x: 0, y: 0, zoom: 1 },
    { at: o3.from - 10, x: 0, y: 0, zoom: 1.02 },
    { at: o3.from + 30, x: -60, y: 0, zoom: 1.05 },
    { at: o4.from - 6, x: -60, y: 0, zoom: 1.05 },
    { at: o4.from + 34, x: 220, y: 60, zoom: 1.15 },
    { at: titleAt - 8, x: 220, y: 60, zoom: 1.2 },
    { at: titleAt + 14, x: 120, y: 40, zoom: 1.0 },
    { at: durationInFrames, x: 120, y: 40, zoom: 1.07 },
  ]);

  const danger = useSpringAt(wipeAt, SPRINGS.smooth) - useSpringAt(o3.from, SPRINGS.smooth);
  const lightsOut = useSpringAt(wipeAt + 4, SPRINGS.smooth) - useSpringAt(o4.from, SPRINGS.smooth);
  const orbit = useProgress(wordAt(o1, "geht") - 4, o2.from + 20);
  const earthDim = useSpringAt(o4.from, SPRINGS.smooth);
  const shake = useShake(titleAt, 20);
  const wipeShake = useShake(wipeAt + 8, 8);
  const flare = useSpringAt(titleAt, SPRINGS.smooth, 26);

  const EX = 1560;
  const EY = 760;
  const ER = 450;

  return (
    <Stage
      seed="open"
      cam={cam}
      sky={{ top: "#03050F", bottom: "#0A1030", glow: danger > 0.3 ? COLORS.red : COLORS.blue, glowAt: [78, 70], stars: 120 }}
    >
      {/* Erde */}
      <Layer depth={0.55}>
        <div style={{ opacity: 1 - earthDim * 0.55 }}>
          <Glow x={EX} y={EY} r={ER * 1.9} color={danger > 0.3 ? COLORS.red : COLORS.blue} opacity={0.5} />
          <Globe
            id="open-globe"
            size={ER * 2}
            lon={-40 + frame * 0.09}
            lat={24}
            lights={0.9 * (1 - lightsOut)}
            danger={Math.max(0, danger)}
            style={{ position: "absolute", left: EX - ER - ER * 0.44, top: EY - ER - ER * 0.44 }}
          />
          {/* Signal, das um die Welt läuft */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <ellipse
              cx={EX}
              cy={EY}
              rx={ER * 1.32}
              ry={ER * 0.42}
              transform={`rotate(-18 ${EX} ${EY})`}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.16 1"
              strokeDashoffset={-orbit * 1.1}
              opacity={orbit > 0 && orbit < 1 ? 0.9 : 0}
            />
          </svg>
        </div>
      </Layer>

      <Layer depth={0.1}>
        <AbsoluteFill style={{ translate: wipeShake }}>
          {/* o1: Datum und "Ein Satz" */}
          <div style={{ position: "absolute", left: 130, top: 170 }}>
            <Marker at={wordAt(o1, "Mai")} out={o2.from - 6} bg={COLORS.ink} size={56}>
              Mai 2023
            </Marker>
            <Letters text="Ein Satz" at={wordAt(o1, "Satz") - 3} out={o2.from - 6} size={250} style={{ marginTop: 40 }} />
            <Letters
              text="geht um die Welt"
              at={wordAt(o1, "geht")}
              out={o2.from - 6}
              size={112}
              color={COLORS.yellow}
              style={{ marginTop: 14 }}
            />
          </div>

          {/* o2: der Satz */}
          <div style={{ position: "absolute", left: 130, top: 150 }}>
            <Marker at={wordAt(o2, "Risiko")} out={o3.from - 6} bg={COLORS.ink} size={52}>
              Das Risiko, dass KI
            </Marker>
            <Letters text="die Menschheit" at={wordAt(o2, "Menschheit") - 2} out={o3.from - 6} size={150} style={{ marginTop: 30 }} />
            <Letters
              text="auslöscht"
              at={wipeAt}
              out={o3.from - 6}
              size={236}
              color={COLORS.red}
              glow={COLORS.red}
              style={{ marginTop: 6 }}
            />
            <div style={{ marginTop: 44 }}>
              <Marker at={wordAt(o2, "globale")} out={o3.from - 6} size={92}>
                Globale Priorität
              </Marker>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 44, alignItems: "center" }}>
              <Beat at={wordAt(o2, "Pandemien")} out={o3.from - 6} enter="pop" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Virus />
                <Headline size={64} color={COLORS.inkSoft}>
                  Pandemien
                </Headline>
              </Beat>
              <Beat at={wordAt(o2, "Atomkrieg")} out={o3.from - 6} enter="pop" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Nuclear />
                <Headline size={64} color={COLORS.inkSoft}>
                  Atomkrieg
                </Headline>
              </Beat>
            </div>
          </div>
          <Beat at={o2.from + 24} out={o3.from - 6} enter="fade" style={{ position: "absolute", left: 134, top: 992 }}>
            <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: COLORS.inkMuted }}>
              STATEMENT ON AI RISK · CENTER FOR AI SAFETY · 30. MAI 2023 · SINNGEMÄSS
            </div>
          </Beat>

          {/* o3: Unterschriften */}
          <div style={{ position: "absolute", left: 130, top: 120, width: 1000 }}>
            <Beat at={signAt} out={o4.from - 6} exit="up">
              <Kicker color={COLORS.yellow}>Unterschrieben von</Kicker>
            </Beat>
            <Letters text="Hunderten" at={wordAt(o3, "Hunderten") - 2} out={o4.from - 6} size={210} style={{ marginTop: 10 }} />
            <Beat at={wordAt(o3, "KI-Forschern")} out={o4.from - 6} exit="up" style={{ marginTop: 6 }}>
              <Headline size={84} color={COLORS.inkSoft}>
                KI-Forschenden
              </Headline>
            </Beat>
            <Beat at={signAt} out={o4.from - 6} enter="fade" style={{ marginTop: 34 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 150px)", gap: "10px 16px" }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <Signature key={i} seed={`sig-${i}`} at={signAt + 4 + i * 2} />
                ))}
              </div>
            </Beat>
            <div style={{ display: "flex", gap: 16, marginTop: 30, alignItems: "center" }}>
              <Beat at={chiefsAt} out={o4.from - 6} exit="up">
                <Kicker>und den Chefs von</Kicker>
              </Beat>
              {["OpenAI", "Google DeepMind", "Anthropic"].map((name, i) => (
                <Marker key={name} at={chiefsAt + 8 + i * 6} out={o4.from - 6} bg={COLORS.red} color={COLORS.ink} size={44}>
                  {name}
                </Marker>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Layer>

      {/* o4: die Zahl */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
        <Letters text="Wie groß ist die Gefahr?" at={o4.from} out={titleAt - 4} size={124} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 120 }}>
        <Beat at={numberAt} out={titleAt - 3} enter="pop" exit="shrink">
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 480,
              lineHeight: 1,
              color: COLORS.ink,
              display: "flex",
              alignItems: "baseline",
              gap: 26,
              textShadow: `0 0 120px ${COLORS.red}88`,
            }}
          >
            <SlotNumber stopAt={titleAt - 3} final="??" seed="open" />
            <span style={{ fontSize: 280, color: COLORS.red }}>%</span>
          </div>
        </Beat>
      </AbsoluteFill>

      {/* o5: Titel */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", translate: shake }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 500,
            height: 8,
            background: `linear-gradient(90deg, transparent, ${COLORS.ink}, transparent)`,
            opacity: interpolate(flare, [0, 0.3, 1], [0, 1, 0]),
            scale: `${interpolate(flare, [0, 1], [0.2, 1.4])} 1`,
          }}
        />
        <Letters text="P(doom)" at={titleAt} size={360} stagger={1.8} glow={COLORS.red} accent={{ start: 2, end: 6, color: COLORS.red }} />
        <Beat at={titleAt + 16} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: FONT.sans, fontSize: 50, fontWeight: 800, color: COLORS.inkSoft }}>
            Die Überlebenswahrscheinlichkeit im KI-Zeitalter
          </div>
        </Beat>
      </AbsoluteFill>

      <Sfx name="swell" at={0} />
      <Sfx name="pop" at={wordAt(o1, "Mai")} />
      <Sfx name="whoosh-long" at={wordAt(o1, "geht") - 6} />
      <Sfx name="click" at={wordAt(o2, "Risiko")} />
      <Sfx name="drop" at={wipeAt} />
      <Sfx name="stamp" at={wordAt(o2, "globale")} />
      <Sfx name="pop" at={wordAt(o2, "Pandemien")} />
      <Sfx name="pop-low" at={wordAt(o2, "Atomkrieg")} />
      <Sfx name="scribble" at={signAt + 2} />
      <Sfx name="scribble" at={signAt + 30} volume={0.25} />
      <Sfx name="stamp" at={wordAt(o3, "Hunderten")} />
      <Sfx name="click" at={chiefsAt + 8} />
      <Sfx name="click" at={chiefsAt + 14} />
      <Sfx name="click" at={chiefsAt + 20} />
      <Sfx name="whoosh" at={o4.from - 6} />
      <Sfx name="counter" at={numberAt} />
      <Sfx name="riser" at={titleAt - 72} />
      <Sfx name="impact" at={titleAt} volume={0.5} />
    </Stage>
  );
};
