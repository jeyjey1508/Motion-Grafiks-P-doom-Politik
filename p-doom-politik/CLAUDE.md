# CLAUDE.md

Bevor du etwas gestaltest oder animierst, lies `MOTION.md` vollständig.

- Das Voiceover bestimmt das Timing: Sprechertext in `scripts/voiceover-script.json`, danach `python3 scripts/generate_voiceover.py`. Keine festen Frame-Zahlen für Szenenlängen.
- Bild-Beats über `cue()` und `wordAt()` aus `src/timeline.ts` an gesprochene Wörter koppeln.
- Szenen bauen auf `Stage`, `Layer` und `useCam` (`src/stage/Stage.tsx`); Typografie über `Letters`, `Marker`, `Beat` (`src/components/kinetic.tsx`).
- Animationen nur über `useCurrentFrame()`, `interpolate()` und `spring()`, keine CSS-Animationen.
- Keine Zahlen erfinden. Werte auf dem Bildschirm sind im README belegt oder kommen vom Nutzer.
- Nach Änderungen: `npx tsc --noEmit`, `npx eslint src` und Standbilder der betroffenen Szene auf Überlappungen prüfen (jede Szene ist im Studio einzeln registriert).
