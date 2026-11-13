import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import type { MultiPolygon } from "geojson";
import React, { useMemo } from "react";
import { random } from "remotion";
import { merge } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopo from "world-atlas/countries-110m.json";

const topology = countriesTopo as unknown as Topology<{ countries: GeometryCollection }>;
const ANTARCTICA = "010";
const LAND: MultiPolygon = merge(
  topology,
  topology.objects.countries.geometries.filter((g) => g.id !== ANTARCTICA) as never,
);
const GRATICULE = geoGraticule10();

/** Große Städte als Lichtpunkte (Länge, Breite). */
const CITIES: readonly (readonly [number, number])[] = [
  [-74, 40.7], [-118.2, 34], [-87.6, 41.9], [-99.1, 19.4], [-46.6, -23.5], [-58.4, -34.6],
  [-0.1, 51.5], [2.3, 48.9], [13.4, 52.5], [12.5, 41.9], [-3.7, 40.4], [37.6, 55.8],
  [28.9, 41], [31.2, 30], [3.4, 6.5], [28, -26.2], [36.8, -1.3], [51.4, 35.7],
  [72.9, 19.1], [77.2, 28.6], [88.4, 22.6], [100.5, 13.8], [106.8, -6.2], [103.8, 1.4],
  [116.4, 39.9], [121.5, 31.2], [114.1, 22.4], [127, 37.6], [139.7, 35.7], [151.2, -33.9],
  [-122.4, 37.8], [-79.4, 43.7], [-95.4, 29.8], [18.1, 59.3], [4.9, 52.4], [46.7, 24.7],
  [67, 24.9], [90.4, 23.8], [120.9, 14.6], [144.9, -37.8], [-77, -12], [-70.7, -33.4],
];

export type GlobeProps = {
  /** Durchmesser in Pixeln */
  readonly size: number;
  /** Mittelpunkt der Ansicht: geografische Länge und Breite */
  readonly lon: number;
  readonly lat?: number;
  /** 0 = Stadtlichter aus, 1 = an */
  readonly lights?: number;
  /** Stärke der Nachtseite (0 bis 1) */
  readonly night?: number;
  /** Farbe des Atmosphären-Scheins */
  readonly atmosphere?: string;
  /** Rotstich (0 bis 1), z. B. für Bedrohung */
  readonly danger?: number;
  readonly id: string;
  readonly style?: React.CSSProperties;
};

/**
 * Erdkugel mit echten Kontinenten (Natural Earth, orthografische Projektion).
 * Die Drehung wird über `lon` gesteuert und pro Frame neu projiziert.
 */
export const Globe: React.FC<GlobeProps> = ({
  size,
  lon,
  lat = 18,
  lights = 0.8,
  night = 0.75,
  atmosphere = "#5FB4FF",
  danger = 0,
  id,
  style,
}) => {
  const r = size / 2;
  const pad = size * 0.22;
  const projection = useMemo(
    () =>
      geoOrthographic()
        .scale(r)
        .translate([r, r])
        .clipAngle(90)
        .rotate([-lon, -lat]),
    [r, lon, lat],
  );
  const path = useMemo(() => geoPath(projection).digits(1), [projection]);
  const land = path(LAND) ?? "";
  const graticule = path(GRATICULE) ?? "";

  const cities = CITIES.map(([cLon, cLat], i) => {
    // sichtbar nur auf der zugewandten Halbkugel
    const visible =
      Math.sin((cLat * Math.PI) / 180) * Math.sin((lat * Math.PI) / 180) +
        Math.cos((cLat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.cos(((cLon - lon) * Math.PI) / 180) >
      0.08;
    const p = projection([cLon, cLat]);
    return visible && p ? { x: p[0], y: p[1], i } : null;
  }).filter((c): c is { x: number; y: number; i: number } => c !== null);

  return (
    <svg
      width={size + pad * 2}
      height={size + pad * 2}
      viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <radialGradient id={`${id}-atmo`} cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor={atmosphere} stopOpacity={0.55} />
          <stop offset="88%" stopColor={atmosphere} stopOpacity={0.18} />
          <stop offset="100%" stopColor={atmosphere} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-ocean`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#3C8DFF" />
          <stop offset="55%" stopColor="#1B4FC4" />
          <stop offset="100%" stopColor="#0B1F66" />
        </radialGradient>
        <radialGradient id={`${id}-shade`} cx="30%" cy="26%" r="85%">
          <stop offset="35%" stopColor="#020617" stopOpacity={0} />
          <stop offset="78%" stopColor="#020617" stopOpacity={night * 0.75} />
          <stop offset="100%" stopColor="#020617" stopOpacity={night} />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx={r} cy={r} r={r} />
        </clipPath>
      </defs>
      <circle cx={r} cy={r} r={r + pad} fill={`url(#${id}-atmo)`} />
      <circle cx={r} cy={r} r={r} fill={`url(#${id}-ocean)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d={graticule} fill="none" stroke="#FFFFFF" strokeOpacity={0.08} strokeWidth={1.2} />
        <path d={land} fill="#2EC98F" />
        <path d={land} fill="#0E5E55" opacity={0.35} transform={`translate(${size * 0.004} ${size * 0.006})`} />
        <path d={land} fill="none" stroke="#B9FFE4" strokeOpacity={0.35} strokeWidth={1.4} />
        <circle cx={r} cy={r} r={r} fill={`url(#${id}-shade)`} />
        {danger > 0 ? <circle cx={r} cy={r} r={r} fill="#8E1020" opacity={danger * 0.62} /> : null}
        {cities.map((c) => {
          const flicker = 0.75 + 0.25 * random(`${id}-city-${c.i}`);
          return (
            <g key={c.i} opacity={lights * flicker}>
              <circle cx={c.x} cy={c.y} r={size * 0.012} fill="#FFD76A" opacity={0.35} />
              <circle cx={c.x} cy={c.y} r={size * 0.0045} fill="#FFF3C4" />
            </g>
          );
        })}
      </g>
      <circle cx={r} cy={r} r={r} fill="none" stroke={atmosphere} strokeOpacity={0.6} strokeWidth={size * 0.006} />
    </svg>
  );
};
