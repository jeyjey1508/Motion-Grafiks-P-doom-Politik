# CLAUDE.md

Bevor du etwas gestaltest oder animierst, lies `MOTION.md` vollständig. Farben, Schrift, Timing und Federwerte kommen aus dieser Datei bzw. aus `src/theme.ts`.

- Animationen nur über `useCurrentFrame()`, `interpolate()` und `spring()`, keine CSS-Animationen.
- Grafiken und Infokarten bleiben 5 bis 6 Sekunden sichtbar.
- Keine Zahlen erfinden. Werte auf dem Bildschirm stammen aus dem Szenenplan oder vom Nutzer.
- Nach Änderungen: `npx tsc --noEmit` und `npx eslint src`.
