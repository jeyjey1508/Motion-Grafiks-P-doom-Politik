#!/usr/bin/env node
/**
 * Erzeugt die Weltkarten-Geometrie für die Chip-Szene.
 *
 * Aufruf (im Projektordner):  node scripts/generate_worldmap.mjs
 * Ergebnis:                    src/generated/world.json
 *
 * Datenquelle: Natural Earth 1:110m über das npm-Paket "world-atlas"
 * (Public Domain / ISC). Projektion: Natural Earth, eingepasst in 1920 x 960.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature, merge } from "topojson-client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const topo = JSON.parse(
  readFileSync(resolve(root, "node_modules/world-atlas/countries-110m.json"), "utf8"),
);

const WIDTH = 1920;
const HEIGHT = 960;
const ANTARCTICA = "010";
const EU27 = [
  "040", "056", "100", "191", "196", "203", "208", "233", "246", "250", "276", "300", "348", "372",
  "380", "428", "440", "442", "470", "528", "616", "620", "642", "703", "705", "724", "752",
];

const geoms = topo.objects.countries.geometries;
const byId = (ids) => geoms.filter((g) => ids.includes(g.id));

const land = merge(topo, geoms.filter((g) => g.id !== ANTARCTICA));
const projection = geoNaturalEarth1().fitExtent(
  [
    [20, 20],
    [WIDTH - 20, HEIGHT - 20],
  ],
  land,
);
const path = geoPath(projection).digits(1);

/** Nur die Teile eines Landes, die in einem Längen-/Breitenfenster liegen (z. B. ohne Überseegebiete). */
const within = (geometry, [lonMin, lonMax, latMin, latMax]) => {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const kept = polygons.filter((polygon) => {
    const [lon, lat] = polygon[0][0];
    return lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax;
  });
  return { type: "MultiPolygon", coordinates: kept };
};

const eu = within(merge(topo, byId(EU27)), [-12, 35, 34, 72]);
const usa = within(feature(topo, byId(["840"])[0]).geometry, [-130, -60, 24, 50]);
const china = feature(topo, byId(["156"])[0]).geometry;
const taiwan = feature(topo, byId(["158"])[0]).geometry;
const netherlands = within(feature(topo, byId(["528"])[0]).geometry, [0, 10, 50, 54]);

const places = {
  brussels: [4.35, 50.85],
  california: [-121.95, 37.35],
  netherlands: [5.4, 51.42],
  taiwan: [120.97, 24.8],
  // Rechenzentrums-Regionen (symbolisch, nicht standortgenau)
  usa1: [-77.5, 39.0],
  usa2: [-99.7, 32.4],
  usa3: [-93.6, 41.6],
  usa4: [-121.2, 45.6],
  usa5: [-112.1, 33.4],
  usa6: [-83.0, 40.0],
  china1: [116.4, 39.9],
  china2: [114.1, 22.6],
  china3: [106.7, 26.6],
  china4: [121.4, 31.2],
  china5: [111.7, 40.8],
  chinaCenter: [104.0, 35.5],
  usaCenter: [-98.5, 39.5],
};

const round = ([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10];

const out = {
  width: WIDTH,
  height: HEIGHT,
  land: path(land),
  graticule: path(geoGraticule10()),
  outline: path({ type: "Sphere" }),
  regions: {
    eu: path(eu),
    usa: path(usa),
    china: path(china),
    taiwan: path(taiwan),
    netherlands: path(netherlands),
  },
  places: Object.fromEntries(
    Object.entries(places).map(([name, lonLat]) => [name, round(projection(lonLat))]),
  ),
};

const target = resolve(root, "src/generated/world.json");
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(out) + "\n");
console.log(
  `world.json geschrieben (${(JSON.stringify(out).length / 1024).toFixed(0)} KB), Orte:`,
  out.places,
);
