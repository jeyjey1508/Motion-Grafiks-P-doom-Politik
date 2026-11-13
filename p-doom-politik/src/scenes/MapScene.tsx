import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Beat, Headline, Kicker, Letters, Marker, settle, Sfx, Tag, useProgress, useShake, useSpringAt } from "../components/kinetic";
import world from "../generated/world.json";
import { Layer, Stage, useCam } from "../stage/Stage";
import { COLORS, SPRINGS } from "../theme";
import { cue, wordAt, type Cues } from "../timeline";

const TOP = 60;
const P = world.places as unknown as Record<string, [number, number]>;
const USA_SITES = ["usa1", "usa2", "usa3", "usa4", "usa5", "usa6"];
const CHINA_SITES = ["china1", "china2", "china3", "china4", "china5"];

const arc = (a: [number, number], b: [number, number], lift: number): string => {
  const mx = (a[0] + b[0]) / 2;
  const my = Math.min(a[1], b[1]) - lift;
  return `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
};

const ARC_DESIGN = arc(P.california, P.taiwan, 330);
const ARC_MACHINES = arc(P.netherlands, P.taiwan, 190);
const ARC_EXPORT = arc(P.california, P.chinaCenter, 420);

/** Pulsierender Knoten (Rechenzentrum oder Standort). */
const Pulse: React.FC<{ readonly x: number; readonly y: number; readonly color: string; readonly size?: number; readonly phase?: number; readonly show: number }> = ({
  x,
  y,
  color,
  size = 1,
  phase = 0,
  show,
}) => {
  const frame = useCurrentFrame();
  const t = ((frame + phase) % 44) / 44;
  return (
    <g opacity={Math.min(1, show * 1.5)}>
      <circle cx={x} cy={y} r={(8 + t * 30) * size} fill="none" stroke={color} strokeWidth={3 * size} opacity={1 - t} />
      <circle cx={x} cy={y} r={9 * size * show} fill={color} />
      <circle cx={x} cy={y} r={4 * size} fill={COLORS.ink} />
    </g>
  );
};

/**
 * Geopolitik auf der Weltkarte: Ein Gesetz endet an der Grenze, die
 * Rechenzentren stehen in den USA und China, die Chip-Lieferkette läuft
 * über Kalifornien, Taiwan und die Niederlande, und Exportkontrollen
 * machen daraus Machtpolitik.
 */
export const MapScene: React.FC<{ readonly cues: Cues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const m1 = cue(cues, "m1");
  const m2 = cue(cues, "m2");
  const m3 = cue(cues, "m3");
  const m4 = cue(cues, "m4");
  const m5 = cue(cues, "m5");

  const lawAt = wordAt(m1, "Gesetz");
  const borderAt = wordAt(m1, "Grenze");
  const outAt = wordAt(m1, "mächtigste") - 8;
  const notAt = wordAt(m1, "nicht");
  const centersAt = wordAt(m2, "Rechenzentren");
  const usaAt = wordAt(m2, "USA");
  const chinaAt = wordAt(m2, "China");
  const chipsAt = wordAt(m3, "Hochleistungs-Chips");
  const caAt = wordAt(m3, "Kalifornien");
  const twAt = wordAt(m3, "Taiwan");
  const nlAt = wordAt(m3, "Niederlanden");
  const blockAt = wordAt(m4, "blockieren");
  const exportAt = wordAt(m4, "Export");
  const techAt = wordAt(m5, "Technik");
  const powerAt = wordAt(m5, "Machtpolitik");

  const cam = useCam(
    [
      { at: 0, x: 30, y: -250, zoom: 3.3 },
      { at: outAt, x: 40, y: -240, zoom: 3.0 },
      { at: outAt + 44, x: 0, y: 0, zoom: 1 },
      { at: m2.from, x: 0, y: 0, zoom: 1.02 },
      { at: m3.from - 6, x: 0, y: -10, zoom: 1.06 },
      { at: m4.from - 10, x: 0, y: -20, zoom: 1.08 },
      { at: m4.from + 26, x: 330, y: -150, zoom: 1.75 },
      { at: m5.from - 8, x: 340, y: -150, zoom: 1.8 },
      { at: m5.from + 30, x: 0, y: 0, zoom: 1.04 },
      { at: durationInFrames, x: 0, y: 0, zoom: 1.1 },
    ],
    0.5,
  );

  const euFocus = 1 - useSpringAt(outAt + 20, SPRINGS.smooth);
  const borderDraw = useProgress(lawAt, borderAt + 10);
  const usaOn = useSpringAt(usaAt - 4, SPRINGS.smooth);
  const chinaOn = useSpringAt(chinaAt - 4, SPRINGS.smooth);
  const designArc = useProgress(twAt - 14, twAt + 8);
  const machineArc = useProgress(nlAt - 4, nlAt + 20);
  const exportArc = useProgress(exportAt - 6, exportAt + 22);
  const blocked = useSpringAt(blockAt, SPRINGS.pop);
  const shake = useShake(blockAt, 8);
  const dim = useSpringAt(m5.from, SPRINGS.smooth);
  const powerShake = useShake(powerAt, 14);
  const flow = (frame * 0.012) % 1;

  // Punkt auf einer quadratischen Bézierkurve
  const along = (a: [number, number], b: [number, number], lift: number, t: number): [number, number] => {
    const cx = (a[0] + b[0]) / 2;
    const cy = Math.min(a[1], b[1]) - lift;
    const u = 1 - t;
    return [u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]];
  };
  const barrier = along(P.california, P.chinaCenter, 420, 0.86);

  return (
    <Stage seed="map" cam={cam} sky={{ top: "#050915", bottom: "#0B1330", glow: COLORS.blue, glowAt: [50, 40], stars: 40 }}>
      <Layer depth={1}>
        <AbsoluteFill style={{ translate: shake }}>
          <svg width={1920} height={960} viewBox="0 0 1920 960" style={{ position: "absolute", left: 0, top: TOP, overflow: "visible" }}>
            <path d={world.outline} fill="#0A1230" stroke="#1D2A66" strokeWidth={2} />
            <path d={world.graticule} fill="none" stroke="#FFFFFF" strokeOpacity={0.05} strokeWidth={1} />
            <path d={world.land} fill="#1B2757" stroke="#3B4FA6" strokeWidth={1} />

            {/* EU: leuchtet, die Grenze zeichnet sich */}
            <path d={world.regions.eu} fill={COLORS.euBlue} opacity={0.35 + euFocus * 0.65} />
            <path
              d={world.regions.eu}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={1.6}
              strokeDasharray="5 4"
              strokeDashoffset={-frame * 0.3}
              opacity={borderDraw * euFocus}
            />

            {/* USA und China */}
            <path d={world.regions.usa} fill={COLORS.blue} opacity={usaOn * 0.85} />
            <path d={world.regions.china} fill={COLORS.red} opacity={chinaOn * 0.85} />
            <path d={world.regions.china} fill="none" stroke={COLORS.ink} strokeWidth={3} opacity={blocked * (0.5 + 0.5 * Math.sin(frame / 4))} />
            <path d={world.regions.taiwan} fill={COLORS.yellow} stroke={COLORS.yellow} strokeWidth={3} opacity={settle(frame - twAt, fps)} />
            <path d={world.regions.netherlands} fill={COLORS.green} stroke={COLORS.green} strokeWidth={3} opacity={settle(frame - nlAt, fps)} />

            {/* Rechenzentren */}
            {USA_SITES.map((k, i) => (
              <Pulse key={k} x={P[k][0]} y={P[k][1]} color={COLORS.ink} phase={i * 9} show={settle(frame - (centersAt + i * 3), fps)} />
            ))}
            {CHINA_SITES.map((k, i) => (
              <Pulse key={k} x={P[k][0]} y={P[k][1]} color={COLORS.ink} phase={i * 11 + 5} show={settle(frame - (centersAt + 8 + i * 3), fps)} />
            ))}

            {/* Lieferkette der Chips */}
            <path d={ARC_DESIGN} fill="none" stroke={COLORS.yellow} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - designArc} opacity={0.9} />
            <path d={ARC_MACHINES} fill="none" stroke={COLORS.green} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - machineArc} opacity={0.9} />
            {designArc >= 1 ? (
              <path d={ARC_DESIGN} fill="none" stroke={COLORS.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="0.05 1" strokeDashoffset={-flow} />
            ) : null}
            {machineArc >= 1 ? (
              <path d={ARC_MACHINES} fill="none" stroke={COLORS.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="0.06 1" strokeDashoffset={-((flow + 0.4) % 1)} />
            ) : null}
            <Pulse x={P.california[0]} y={P.california[1]} color={COLORS.yellow} size={1.5} show={settle(frame - caAt, fps)} />
            <Pulse x={P.taiwan[0]} y={P.taiwan[1]} color={COLORS.yellow} size={1.5} phase={14} show={settle(frame - twAt, fps)} />
            <Pulse x={P.netherlands[0]} y={P.netherlands[1]} color={COLORS.green} size={1.5} phase={25} show={settle(frame - nlAt, fps)} />

            {/* Exportkontrolle: der Weg nach China ist gesperrt */}
            <path
              d={ARC_EXPORT}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.02 0.015"
              strokeDashoffset={-frame * 0.002}
              opacity={exportArc}
              clipPath="url(#export-clip)"
            />
            <defs>
              <clipPath id="export-clip">
                <rect x={0} y={-200} width={interpolate(exportArc, [0, 1], [P.california[0], barrier[0]])} height={1300} />
              </clipPath>
            </defs>
            <g transform={`translate(${barrier[0]} ${barrier[1]})`} opacity={Math.min(1, blocked * 1.5)}>
              <circle r={26 * blocked} fill={COLORS.red} stroke={COLORS.ink} strokeWidth={4} />
              <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke={COLORS.ink} strokeWidth={7} strokeLinecap="round" />
            </g>
          </svg>

          {/* Beschriftungen auf der Karte */}
          <Beat at={usaAt - 2} enter="drop" style={{ position: "absolute", left: P.usaCenter[0] - 200, top: TOP + 130, width: 400, textAlign: "center" }}>
            <Headline size={120} color={COLORS.blue} style={{ textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
              USA
            </Headline>
          </Beat>
          <Beat at={chinaAt - 2} enter="drop" style={{ position: "absolute", left: P.chinaCenter[0] - 200, top: TOP + 76, width: 400, textAlign: "center" }}>
            <Headline size={120} color={COLORS.red} style={{ textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>
              China
            </Headline>
          </Beat>
          <Beat at={caAt} out={m5.from - 4} enter="pop" style={{ position: "absolute", left: P.california[0] - 250, top: TOP + P.california[1] + 34 }}>
            <Tag bg={COLORS.yellow} size={30}>
              Entwurf · Kalifornien
            </Tag>
          </Beat>
          <Beat at={twAt} out={m4.from + 10} enter="pop" style={{ position: "absolute", left: P.taiwan[0] - 310, top: TOP + P.taiwan[1] + 36 }}>
            <Tag bg={COLORS.yellow} size={30}>
              Fertigung · Taiwan
            </Tag>
          </Beat>
          <Beat at={nlAt} out={m5.from - 4} enter="pop" style={{ position: "absolute", left: P.netherlands[0] - 190, top: TOP + P.netherlands[1] - 84 }}>
            <Tag bg={COLORS.green} size={30}>
              Maschinen · Niederlande
            </Tag>
          </Beat>
        </AbsoluteFill>
      </Layer>

      {/* Schrift außerhalb der Karte */}
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 90px 120px" }}>
        <Letters text="Ein Gesetz" at={lawAt - 2} out={outAt - 2} size={150} style={{ textShadow: "0 8px 40px rgba(0,0,0,0.9)" }} />
        <Letters text="endet an der Grenze." at={borderAt - 8} out={outAt - 2} size={150} color={COLORS.yellow} style={{ textShadow: "0 8px 40px rgba(0,0,0,0.9)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 }}>
        <Beat at={notAt - 2} out={m2.from + 8} enter="slam" exit="down">
          <Marker at={notAt - 2} bg={COLORS.ink} size={84}>
            Nicht in Europa
          </Marker>
        </Beat>
        <Beat at={centersAt - 2} out={m3.from - 4} exit="down" style={{ position: "absolute", bottom: 60 }}>
          <Marker at={centersAt - 2} size={84}>
            Rechenzentren
          </Marker>
        </Beat>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 60px 110px" }}>
        <Beat at={m3.from + 2} out={m4.from - 4} exit="down">
          <Kicker color={COLORS.yellow}>Der Rohstoff</Kicker>
        </Beat>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Beat at={chipsAt - 2} out={m4.from - 4} enter="pop" exit="down">
            <svg width={130} height={130} viewBox="-65 -65 130 130">
              {[-36, -12, 12, 36].map((o) => (
                <g key={o} stroke={COLORS.yellow} strokeWidth={7} strokeLinecap="round">
                  <line x1={o} y1={-62} x2={o} y2={-44} />
                  <line x1={o} y1={44} x2={o} y2={62} />
                  <line x1={-62} y1={o} x2={-44} y2={o} />
                  <line x1={44} y1={o} x2={62} y2={o} />
                </g>
              ))}
              <rect x={-46} y={-46} width={92} height={92} rx={14} fill={COLORS.yellow} />
              <rect x={-22} y={-22} width={44} height={44} rx={6} fill={COLORS.bg} />
            </svg>
          </Beat>
          <Letters text="Chips" at={chipsAt} out={m4.from - 4} size={200} style={{ textShadow: "0 8px 40px rgba(0,0,0,0.9)" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 70px 110px" }}>
        <Beat at={wordAt(m4, "2022") - 2} out={m5.from - 4} enter="left" exit="down">
          <Tag bg={COLORS.ink} size={40}>
            Seit 2022
          </Tag>
        </Beat>
        <Letters text="Export-Stopp" at={blockAt} out={m5.from - 4} size={190} color={COLORS.red} glow={COLORS.red} style={{ marginTop: 14 }} />
      </AbsoluteFill>

      {/* m5: aus Technik wird Machtpolitik */}
      <AbsoluteFill style={{ backgroundColor: "#03050E", opacity: dim * 0.72 }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: powerShake }}>
        <Letters text="Technik" at={techAt - 2} out={powerAt - 6} size={260} color={COLORS.inkSoft} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", translate: powerShake }}>
        <Letters text="Machtpolitik" at={powerAt - 2} size={270} color={COLORS.red} glow={COLORS.red} />
      </AbsoluteFill>

      <Sfx name="stamp" at={lawAt - 2} />
      <Sfx name="stamp" at={borderAt - 8} />
      <Sfx name="whoosh-long" at={outAt - 4} />
      <Sfx name="pop" at={notAt - 2} />
      <Sfx name="counter" at={centersAt} volume={0.2} />
      <Sfx name="pop" at={usaAt - 2} />
      <Sfx name="pop-low" at={chinaAt - 2} />
      <Sfx name="stamp" at={chipsAt} />
      <Sfx name="click" at={caAt} />
      <Sfx name="whoosh-soft" at={twAt - 14} />
      <Sfx name="click" at={twAt} />
      <Sfx name="whoosh-soft" at={nlAt - 4} />
      <Sfx name="click" at={nlAt} />
      <Sfx name="whoosh-long" at={m4.from - 6} />
      <Sfx name="alarm" at={blockAt} />
      <Sfx name="impact" at={blockAt + 2} volume={0.3} />
      <Sfx name="whoosh-long" at={m5.from - 6} />
      <Sfx name="swell" at={powerAt - 60} volume={0.25} />
      <Sfx name="impact" at={powerAt - 2} volume={0.45} />
    </Stage>
  );
};
