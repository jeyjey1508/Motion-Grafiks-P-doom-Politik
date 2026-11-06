# CLAUDE.md

Bevor du etwas gestaltest oder animierst, lies `MOTION.md` vollständig. Farben, Schrift, Timing und Federwerte kommen aus dieser Datei bzw. aus `src/theme.ts`.

- Das Voiceover bestimmt das Timing: Sprechertext in `scripts/voiceover-script.json`, danach `python3 scripts/generate_voiceover.py`. Keine festen Frame-Zahlen für Szenen in `Composition.tsx`.
- Bild-Beats über `cue()` und `wordAt()` aus `src/timeline.ts` an gesprochene Wörter koppeln.
- Animationen nur über `useCurrentFrame()`, `interpolate()` und `spring()`, keine CSS-Animationen.
- Keine Zahlen erfinden. Werte auf dem Bildschirm sind im README belegt oder kommen vom Nutzer.
- Nach Änderungen: `npx tsc --noEmit` und `npx eslint src`.
