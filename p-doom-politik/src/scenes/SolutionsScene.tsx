import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Globe } from "../art/Globe";
import { Checkmark, Cross } from "../components/Icons";
import { Beat, CountUp, Headline, Letters, Marker, settle, Sfx, Tag, useProgress, useSpringAt } from "../components/kinetic";
import { Glow, Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, FONT, SHADOW, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const W = 1920;

const hills = (base: number, amp: number, wave: number, from: number, to: number): string => {
  const pts = [`M ${from} 1400`, `L ${from} ${base}`];
  for (let x = from; x <= to; x += 60) {
    pts.push(`L ${x} ${(base - amp * (0.5 + 0.5 * Math.sin(x / wave)) - amp * 0.35 * Math.sin(x / (wave * 0.37) + 1)).toFixed(1)}`);
  }
  pts.push(`L ${to} 1400 Z`);
  return pts.join(" ");
};
const FAR_HILLS = hills(820, 150, 420, -600, 5200);
const NEAR_HILLS = hills(930, 110, 300, -900, 7800);

/** Nummerierte Station: Ziffer im Kreis plus Schlagwort. */
const StationTitle: React.FC<{ readonly n: number; readonly text: string; readonly at: number; readonly color: string }> = ({ n, text, at, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
    <Beat at={at - 4} enter="pop">
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: 85,
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          fontSize: 130,
          color: COLORS.bg,
          boxShadow: SHADOW.glow(color, 0.8),
        }}
      >
        {n}
      </div>
    </Beat>
    <Letters text={text} at={at} size={230} />
  </div>
);

const SEATS = 28;
const RADAR = { x: W * 3 + 1290, y: 580, r: 310 };
const RADAR_CHIPS = [
  [-180, -120], [-60, -210], [110, -150], [210, -20], [150, 150], [-20, 210], [-190, 90], [-70, -30], [70, 40],
] as const;

/**
 * Auswege als Reise bei Tagesanbruch: Testen, Verträge, Chips und die Idee
 * einer Weltbehörde nach dem Vorbild der Atomenergie-Aufsicht.
 */
export const SolutionsScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const x1 = cue(cues, "x1");
  const x2 = cue(cues, "x2");
  const x3 = cue(cues, "x3");
  const x4 = cue(cues, "x4");
  const x5 = cue(cues, "x5");

  const waysAt = wordAt(x1, "Auswege");
  const threeAt = wordAt(x1, "Drei");
  const testAt = wordAt(x2, "Testen");
  const sealAt = wordAt(x2, "TÜV");
  const treatyAt = wordAt(x3, "Verträge");
  const statesAt = wordAt(x3, "28");
  const usaAt = wordAt(x3, "USA");
  const chinaAt = wordAt(x3, "China");
  const chipsAt = wordAt(x4, "Chips");
  const whereAt = wordAt(x4, "wo");
  const enforceAt = wordAt(x4, "Regeln");
  const worldAt = wordAt(x5, "Weltbehörde");
  const atomAt = wordAt(x5, "Atomenergie");

  const station = (i: number, at: number) => [
    { at: at - 16, x: W * (i - 1) + 30, y: 0, zoom: 1.04 },
    { at: at + 14, x: W * i, y: 0, zoom: 1 },
  ];
  const cam = useCam([
    { at: 0, x: 0, y: 20, zoom: 1.1 },
    { at: threeAt, x: 0, y: 0, zoom: 1 },
    ...station(1, x2.from),
    ...station(2, x3.from),
    ...station(3, x4.from),
    ...station(4, x5.from),
    { at: durationInFrames, x: W * 4, y: 0, zoom: 1.07 },
  ]);

  const dawn = interpolate(frame, [0, durationInFrames], [0, 1]);
  const seal = useSpringAt(sealAt, SPRINGS.punch);
  const sweep = ((frame - x4.from) * 5) % 360;
  const sweepStart = x4.from + 20;
  const atom = useSpringAt(worldAt - 6, SPRINGS.smooth, 30);
  const road = useProgress(0, 40);

  return (
    <Stage
      seed="solutions"
      cam={cam}
      sky={{ top: "#0A1838", bottom: "#24566E", glow: "#FFB36B", glowAt: [60, 78], stars: 40, dust: 14 }}
    >
      <Layer depth={0.12}>
        <Glow x={1250} y={900 - dawn * 260} r={520} color="#FFC98A" opacity={0.75} />
        <div style={{ position: "absolute", left: 1250 - 90, top: 900 - dawn * 260 - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: "#FFE2B0", boxShadow: "0 0 120px #FFD08A" }} />
      </Layer>
      <Layer depth={0.3}>
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
          <path d={FAR_HILLS} fill="#143A52" opacity={0.9} />
        </svg>
      </Layer>
      <Layer depth={0.6}>
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
          <path d={NEAR_HILLS} fill="#0C2738" />
        </svg>
      </Layer>

      <Layer depth={1}>
        {/* Boden und Weg */}
        <div style={{ position: "absolute", left: -1200, top: 990, width: W * 5 + 2400, height: 600, backgroundColor: "#071A26" }} />
        <div
          style={{
            position: "absolute",
            left: -200,
            top: 1016,
            width: (W * 5 + 400) * road,
            height: 10,
            backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.yellow} 0 70px, transparent 70px 130px)`,
            opacity: 0.8,
          }}
        />

        {/* Bild 0: Auswege */}
        <div style={{ position: "absolute", left: 130, top: 220 }}>
          <Letters text="Auswege" at={waysAt - 2} size={330} glow={COLORS.green} color={COLORS.green} />
        </div>
        {[1, 2, 3].map((n) => (
          <Beat key={n} at={threeAt + n * 5} enter="pop" style={{ position: "absolute", left: 1010 + n * 210, top: 640 }}>
            <div
              style={{
                width: 150,
                height: 150,
                borderRadius: 75,
                border: `8px solid ${COLORS.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT.display,
                fontSize: 100,
                color: COLORS.ink,
              }}
            >
              {n}
            </div>
          </Beat>
        ))}

        {/* Station 1: Testen */}
        <div style={{ position: "absolute", left: W, top: 0, width: W, height: 1080 }}>
          <div style={{ position: "absolute", left: 120, top: 80 }}>
            <StationTitle n={1} text="Testen" at={testAt} color={COLORS.green} />
            <div style={{ marginTop: 24 }}>
              <Marker at={wordAt(x2, "Veröffentlichung") - 6} bg={COLORS.ink} size={50}>
                … bevor veröffentlicht wird
              </Marker>
            </div>
          </div>
          {/* Förderband mit Prüf-Tor */}
          <div style={{ position: "absolute", left: 60, top: 860, width: 1800, height: 34, borderRadius: 17, backgroundColor: "#12384C", border: `4px solid ${COLORS.line}` }} />
          {Array.from({ length: 7 }).map((_, i) => {
            const x = ((frame - x2.from) * 4.2 + i * 270 + 2000) % 1890;
            const passed = x > 1000;
            const flagged = i % 4 === 2;
            const sink = flagged && passed ? Math.min(1, (x - 1000) / 420) : 0;
            const color = !passed ? "#6B7AA8" : flagged ? COLORS.red : COLORS.green;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - 60,
                  top: 740 + sink * 220,
                  width: 120,
                  height: 120,
                  borderRadius: 20,
                  backgroundColor: color,
                  opacity: (1 - sink) * interpolate(x, [0, 80, 1810, 1890], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  rotate: `${sink * 40}deg`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT.display,
                  fontSize: 58,
                  color: COLORS.bg,
                  boxShadow: SHADOW.card,
                }}
              >
                KI
                {passed ? (
                  <div style={{ position: "absolute", right: -24, top: -24 }}>{flagged ? <Cross size={58} /> : <Checkmark size={58} />}</div>
                ) : null}
              </div>
            );
          })}
          <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
            <rect x={930} y={520} width={34} height={350} rx={10} fill="#1E5068" />
            <rect x={1040} y={520} width={34} height={350} rx={10} fill="#1E5068" />
            <rect x={900} y={480} width={204} height={60} rx={18} fill="#2A6F8F" />
            <rect x={966} y={540} width={72} height={320} fill={COLORS.green} opacity={0.12 + 0.12 * Math.sin(frame / 4)} />
            <rect x={966} y={540 + ((frame * 9) % 300)} width={72} height={8} fill={COLORS.green} opacity={0.9} />
          </svg>
          <div style={{ position: "absolute", left: 1002 - 300, top: 404, width: 600, textAlign: "center" }}>
            <Marker at={wordAt(x2, "Staatliche") - 2} size={44}>
              Staatliche Prüfinstitute
            </Marker>
          </div>
          {/* Prüfsiegel */}
          <div
            style={{
              position: "absolute",
              left: 1420,
              top: 110,
              width: 340,
              height: 340,
              borderRadius: 170,
              border: `16px solid ${COLORS.green}`,
              backgroundColor: "#0C2738",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: Math.min(1, seal * 1.6),
              scale: String(interpolate(seal, [0, 1], [2.2, 1])),
              rotate: "-10deg",
              boxShadow: SHADOW.glow(COLORS.green, 0.9),
            }}
          >
            <Checkmark size={130} />
            <div style={{ fontFamily: FONT.display, fontSize: 62, color: COLORS.green, marginTop: 6 }}>GEPRÜFT</div>
          </div>
        </div>

        {/* Station 2: Verträge */}
        <div style={{ position: "absolute", left: W * 2, top: 0, width: W, height: 1080 }}>
          <div style={{ position: "absolute", left: 120, top: 80 }}>
            <StationTitle n={2} text="Verträge" at={treatyAt} color={COLORS.yellow} />
            <Beat at={wordAt(x3, "2023") - 2} enter="left" style={{ marginTop: 24 }}>
              <Tag bg={COLORS.ink} size={40}>
                Bletchley Park · 2023
              </Tag>
            </Beat>
          </div>
          {/* Runder Tisch mit 28 Plätzen */}
          <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
            <ellipse cx={1240} cy={650} rx={470} ry={230} fill="#12384C" stroke={COLORS.inkSoft} strokeWidth={6} opacity={settle(frame - (treatyAt + 6), fps)} />
            {Array.from({ length: SEATS }).map((_, i) => {
              const a = (i / SEATS) * Math.PI * 2 - Math.PI / 2;
              const p = settle(frame - (statesAt + i * 1.2), fps, 20);
              const isUsa = i === 13;
              const isChina = i === 15;
              const lit = (isUsa && frame >= usaAt) || (isChina && frame >= chinaAt);
              return (
                <circle
                  key={i}
                  cx={1240 + Math.cos(a) * 540}
                  cy={650 + Math.sin(a) * 290}
                  r={(lit ? 34 : 22) * p}
                  fill={isUsa && lit ? COLORS.blue : isChina && lit ? COLORS.red : COLORS.ink}
                  stroke={lit ? COLORS.ink : "none"}
                  strokeWidth={6}
                />
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 1240 - 300, top: 540, width: 600, textAlign: "center" }}>
            <Beat at={statesAt - 2} enter="pop">
              <div style={{ fontFamily: FONT.display, fontSize: 190, lineHeight: 0.9, color: COLORS.yellow }}>
                <CountUp at={statesAt - 2} duration={34} to={28} />
              </div>
              <Headline size={64} color={COLORS.inkSoft}>
                Staaten
              </Headline>
            </Beat>
          </div>
          <Beat at={usaAt} enter="pop" style={{ position: "absolute", left: 1240 + Math.cos((13 / 28) * Math.PI * 2 - Math.PI / 2) * 540 + 30, top: 962 }}>
            <Tag bg={COLORS.blue} color={COLORS.ink} size={40}>
              USA
            </Tag>
          </Beat>
          <Beat at={chinaAt} enter="pop" style={{ position: "absolute", left: 1240 + Math.cos((15 / 28) * Math.PI * 2 - Math.PI / 2) * 540 - 190, top: 962 }}>
            <Tag bg={COLORS.red} color={COLORS.ink} size={40}>
              China
            </Tag>
          </Beat>
          <div style={{ position: "absolute", left: 120, top: 470 }}>
            <Marker at={wordAt(x3, "Risiken") - 2} size={50}>
              Risiken gemeinsam
            </Marker>
            <div style={{ height: 12 }} />
            <Marker at={wordAt(x3, "gemeinsam")} size={50}>
              anerkannt
            </Marker>
          </div>
        </div>

        {/* Station 3: Chips */}
        <div style={{ position: "absolute", left: W * 3, top: 0, width: W, height: 1080 }}>
          <div style={{ position: "absolute", left: 120, top: 80 }}>
            <StationTitle n={3} text="Chips" at={chipsAt} color={COLORS.blue} />
          </div>
          <div style={{ position: "absolute", left: 120, top: 330 }}>
            <Marker at={whereAt - 2} bg={COLORS.ink} size={50}>
              Wo steht die Rechenleistung?
            </Marker>
          </div>
          <div style={{ position: "absolute", left: 120, top: 520 }}>
            <Letters text="Regeln" at={enforceAt - 2} size={170} color={COLORS.green} glow={COLORS.green} />
            <Letters text="durchsetzen" at={wordAt(x4, "durchsetzen") - 2} size={170} color={COLORS.green} glow={COLORS.green} />
          </div>
        </div>
        {/* Radar, das die Chips erfasst */}
        <svg width={1} height={1} style={{ position: "absolute", overflow: "visible", opacity: settle(frame - (x4.from + 8), fps) }}>
          <circle cx={RADAR.x} cy={RADAR.y} r={RADAR.r} fill="#0C2738" stroke={COLORS.blue} strokeWidth={6} />
          {[0.33, 0.66].map((k) => (
            <circle key={k} cx={RADAR.x} cy={RADAR.y} r={RADAR.r * k} fill="none" stroke={COLORS.blue} strokeOpacity={0.35} strokeWidth={3} />
          ))}
          <line x1={RADAR.x - RADAR.r} y1={RADAR.y} x2={RADAR.x + RADAR.r} y2={RADAR.y} stroke={COLORS.blue} strokeOpacity={0.3} strokeWidth={3} />
          <line x1={RADAR.x} y1={RADAR.y - RADAR.r} x2={RADAR.x} y2={RADAR.y + RADAR.r} stroke={COLORS.blue} strokeOpacity={0.3} strokeWidth={3} />
          <g transform={`rotate(${sweep} ${RADAR.x} ${RADAR.y})`}>
            <path d={`M ${RADAR.x} ${RADAR.y} L ${RADAR.x + RADAR.r} ${RADAR.y} A ${RADAR.r} ${RADAR.r} 0 0 0 ${RADAR.x + RADAR.r * Math.cos(-0.7)} ${RADAR.y + RADAR.r * Math.sin(-0.7)} Z`} fill={COLORS.blue} opacity={0.3} />
            <line x1={RADAR.x} y1={RADAR.y} x2={RADAR.x + RADAR.r} y2={RADAR.y} stroke={COLORS.ink} strokeWidth={5} />
          </g>
          {RADAR_CHIPS.map(([dx, dy], i) => {
            const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
            const foundAt = sweepStart + (angle / 360) * 72;
            const found = settle(frame - foundAt, fps, 20);
            return (
              <g key={i} transform={`translate(${RADAR.x + dx} ${RADAR.y + dy})`}>
                <rect x={-22} y={-22} width={44} height={44} rx={8} fill={found > 0.1 ? COLORS.yellow : "#35507A"} />
                <rect x={-9} y={-9} width={18} height={18} rx={3} fill={COLORS.bg} />
                <circle r={38 * found} fill="none" stroke={COLORS.yellow} strokeWidth={4} opacity={found} />
              </g>
            );
          })}
        </svg>

        {/* Station 4: Weltbehörde nach Vorbild der Atomaufsicht */}
        <div style={{ position: "absolute", left: W * 4, top: 0, width: W, height: 1080 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}>
            <Letters text="Weltbehörde?" at={worldAt - 2} size={230} style={{ display: "inline-block" }} />
          </div>
          <Glow x={960} y={680} r={520} color={COLORS.blue} opacity={0.5} />
          <Globe id="sol-globe" size={420} lon={30 + frame * 0.15} lights={0.9} night={0.5} style={{ position: "absolute", left: 960 - 210 - 92, top: 680 - 210 - 92 }} />
          <svg width={W} height={1080} style={{ position: "absolute", inset: 0 }}>
            {[0, 60, 120].map((deg, i) => (
              <g key={deg} transform={`rotate(${deg} 960 680)`}>
                <ellipse
                  cx={960}
                  cy={680}
                  rx={370}
                  ry={130}
                  fill="none"
                  stroke={COLORS.yellow}
                  strokeWidth={7}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - Math.max(0, Math.min(1, atom * 1.4 - i * 0.2))}
                  opacity={0.9}
                />
                <circle
                  cx={960 + Math.cos(frame / 14 + i * 2.1) * 370}
                  cy={680 + Math.sin(frame / 14 + i * 2.1) * 130}
                  r={15}
                  fill={COLORS.ink}
                  opacity={atom}
                />
              </g>
            ))}
          </svg>
          <div style={{ position: "absolute", left: 1400, top: 590 }}>
            <Beat at={atomAt - 6}>
              <Headline size={60} color={COLORS.inkSoft}>
                Vorbild:
              </Headline>
            </Beat>
            <div style={{ marginTop: 12 }}>
              <Marker at={atomAt - 2} size={50}>
                Atomenergie-Aufsicht
              </Marker>
            </div>
          </div>
        </div>
      </Layer>

      <Sfx name="swell" at={0} volume={0.26} />
      <Sfx name="chime" at={waysAt - 2} volume={0.3} />
      {[1, 2, 3].map((n) => (
        <Sfx key={n} name="pop" at={threeAt + n * 5} volume={0.3} />
      ))}
      <Sfx name="whoosh-long" at={x2.from - 16} />
      <Sfx name="stamp" at={testAt} />
      <Sfx name="click" at={wordAt(x2, "Staatliche") - 2} />
      <Sfx name="impact" at={sealAt} volume={0.3} />
      <Sfx name="whoosh-long" at={x3.from - 16} />
      <Sfx name="stamp" at={treatyAt} />
      <Sfx name="counter" at={statesAt - 2} />
      <Sfx name="pop" at={usaAt} />
      <Sfx name="pop-low" at={chinaAt} />
      <Sfx name="whoosh-long" at={x4.from - 16} />
      <Sfx name="stamp" at={chipsAt} />
      <Sfx name="counter" at={sweepStart} volume={0.2} />
      <Sfx name="chime" at={enforceAt - 2} volume={0.24} />
      <Sfx name="whoosh-long" at={x5.from - 16} />
      <Sfx name="swell" at={worldAt - 50} volume={0.22} />
      <Sfx name="stamp" at={worldAt - 2} />
      <Sfx name="ding" at={atomAt - 2} volume={0.24} />
    </Stage>
  );
};
