import manifest from "./generated/voiceover.json";

/**
 * Zeitplan des Videos, berechnet aus den Längen des Voiceovers.
 * Ändert sich der Sprechertext (scripts/voiceover-script.json) und wird
 * scripts/generate_voiceover.py neu ausgeführt, passen sich alle Szenen an.
 */

export const FPS = 30;
/** Länge jedes Szenenübergangs (Überlappung zweier Szenen) */
export const TRANSITION_FRAMES = 16;
/** Feste Länge eines Interview-Slots (15 s) */
export const INTERVIEW_FRAMES = 15 * FPS;

/** Vorlauf bis zur ersten Sprachzeile einer Szene */
const LEAD_IN = 12;
/** Standardpause nach jeder Sprachzeile */
const GAP = 7;
/** Standard-Nachlauf nach der letzten Zeile einer Szene */
const TAIL = 26;
/** edge-tts-Wortmarken liegen ca. 0,1 s vor dem hörbaren Wort */
const WORD_OFFSET_SECONDS = 0.1;

/** Individuelle Pausen nach bestimmten Zeilen (in Frames) für Bild-Pointen */
const PAUSE_AFTER: Record<string, number> = {
  h3: 22,
  h4: 6,
  d2: 14,
  e1: 10,
  e2: 14,
  e3: 14,
  e4: 22,
  a1: 12,
  a3: 14,
  a4: 12,
  r1: 14,
  r3: 12,
  g2: 10,
  g4: 10,
  g5: 18,
  o1: 16,
  o2: 14,
};

/** Individueller Nachlauf pro Szene (in Frames) */
const TAIL_FOR: Partial<Record<SceneId, number>> = {
  hook: 34,
  experts: 40,
  alignment: 34,
  eu: 36,
  race: 40,
  outro: 96,
};

export type SceneId =
  | "hook"
  | "definition"
  | "experts"
  | "teaser1"
  | "interview1"
  | "alignment"
  | "teaser2"
  | "interview2"
  | "eu"
  | "race"
  | "outro";

export const SCENE_ORDER: readonly SceneId[] = [
  "hook",
  "definition",
  "experts",
  "teaser1",
  "interview1",
  "alignment",
  "teaser2",
  "interview2",
  "eu",
  "race",
  "outro",
];

export type Word = {
  readonly text: string;
  /** Frame relativ zum Szenenbeginn */
  readonly at: number;
};

export type Cue = {
  readonly id: string;
  /** Start der Sprache, Frame relativ zum Szenenbeginn */
  readonly from: number;
  readonly durationInFrames: number;
  /** Datei in public/ */
  readonly file: string;
  /** Frames, die am Dateianfang übersprungen werden (Stille) */
  readonly trimBefore: number;
  readonly caption: string;
  readonly words: readonly Word[];
};

export type Cues = Readonly<Record<string, Cue>>;

export type SceneTiming = {
  readonly id: SceneId;
  /** globaler Startframe (Übergänge eingerechnet) */
  readonly from: number;
  readonly durationInFrames: number;
  readonly cues: Cues;
};

type ManifestLine = {
  id: string;
  file: string;
  start: number;
  end: number;
  seconds: number;
  caption: string;
  words: { text: string; start: number; end: number }[];
};

const manifestScenes = manifest.scenes as { id: string; lines: ManifestLine[] }[];

const buildScene = (id: SceneId): Omit<SceneTiming, "from"> => {
  if (id === "interview1" || id === "interview2") {
    return { id, durationInFrames: INTERVIEW_FRAMES, cues: {} };
  }
  const scene = manifestScenes.find((s) => s.id === id);
  if (!scene) {
    throw new Error(
      `Szene "${id}" fehlt in src/generated/voiceover.json. Bitte scripts/generate_voiceover.py ausführen.`,
    );
  }
  const cues: Record<string, Cue> = {};
  let cursor = LEAD_IN;
  for (const line of scene.lines) {
    const durationInFrames = Math.ceil(line.seconds * FPS);
    const from = cursor;
    cues[line.id] = {
      id: line.id,
      from,
      durationInFrames,
      file: line.file,
      trimBefore: Math.floor(line.start * FPS),
      caption: line.caption,
      words: line.words.map((w) => ({
        text: w.text,
        at: Math.max(
          from,
          from + Math.round((w.start + WORD_OFFSET_SECONDS - line.start) * FPS),
        ),
      })),
    };
    cursor = from + durationInFrames + (PAUSE_AFTER[line.id] ?? GAP);
  }
  const lastId = scene.lines[scene.lines.length - 1].id;
  const lastPause = PAUSE_AFTER[lastId] ?? GAP;
  const durationInFrames = cursor - lastPause + (TAIL_FOR[id] ?? TAIL);
  return { id, durationInFrames, cues };
};

const built = SCENE_ORDER.map(buildScene);

export const SCENES: Readonly<Record<SceneId, SceneTiming>> = (() => {
  const out = {} as Record<SceneId, SceneTiming>;
  let cursor = 0;
  built.forEach((scene, i) => {
    const from = i === 0 ? 0 : cursor - TRANSITION_FRAMES;
    out[scene.id] = { ...scene, from };
    cursor = from + scene.durationInFrames;
  });
  return out;
})();

const last = SCENES[SCENE_ORDER[SCENE_ORDER.length - 1]];
export const TOTAL_FRAMES = last.from + last.durationInFrames;

/** Holt eine Sprachzeile; wirft einen klaren Fehler, wenn sie fehlt. */
export const cue = (cues: Cues, id: string): Cue => {
  const found = cues[id];
  if (!found) {
    throw new Error(`Sprachzeile "${id}" fehlt im Voiceover-Manifest.`);
  }
  return found;
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}-]/gu, "");

/**
 * Frame (relativ zur Szene), an dem ein Wort gesprochen wird.
 * Fallback: Beginn der Zeile.
 */
export const wordAt = (c: Cue, word: string, occurrence = 0): number => {
  const target = normalize(word);
  const hits = c.words.filter((w) => normalize(w.text).startsWith(target));
  return hits[occurrence]?.at ?? hits[0]?.at ?? c.from;
};

/** Ende einer Sprachzeile (Frame relativ zur Szene). */
export const endOf = (c: Cue): number => c.from + c.durationInFrames;
