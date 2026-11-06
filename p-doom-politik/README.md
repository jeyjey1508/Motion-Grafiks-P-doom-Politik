# P(doom): Die Überlebenswahrscheinlichkeit im KI-Zeitalter

Remotion-Projekt für ein 65-sekündiges Unterrichtsvideo (1920 × 1080, 30 FPS) zum Thema P(doom), mit zwei Interview-Slots, Infografiken und Diskussionsfragen für die Klasse.

## Schnellstart

```console
npm install
npm start          # Remotion Studio (Vorschau) auf http://localhost:3000
npm run render     # rendert out/p-doom.mp4
```

## Interviews einfügen

Legt eure Videos hier ab:

```
public/interviews/experte1.mp4
public/interviews/experte2.mp4
```

Solange eine Datei fehlt, zeigt der Interview-Slot eine Platzhalter-Box mit Countdown. Das Studio erkennt neue Dateien automatisch. Jeder Slot ist 15 Sekunden lang; längere Videos werden abgeschnitten.

Name, Funktion, P(doom)-Wert der Bauchbinde, Leitfrage der Teaser-Card und ein optionaler Startversatz (`trimBeforeSeconds`) stehen als `defaultProps` in `src/Root.tsx` und lassen sich auch im Studio über das Props-Panel ändern.

## Szenenablauf

| Frames | Dauer | Szene | Datei |
|---|---|---|---|
| 0–150 | 5 s | Intro, Definition, Zähler | `src/scenes/IntroScene.tsx` |
| 150–330 | 6 s | Expertenskala | `src/components/ExpertChart.tsx` |
| 330–420 | 3 s | Teaser Interview 1 | `src/scenes/TeaserScene.tsx` |
| 420–870 | 15 s | Interview 1 mit Bauchbinde | `src/components/InterviewBlock.tsx`, `LowerThird.tsx` |
| 870–1050 | 6 s | Alignment-Schaubild | `src/components/AlignmentFlow.tsx` |
| 1050–1140 | 3 s | Teaser Interview 2 | `src/scenes/TeaserScene.tsx` |
| 1140–1590 | 15 s | Interview 2 mit Bauchbinde | `src/components/InterviewBlock.tsx`, `LowerThird.tsx` |
| 1590–1770 | 6 s | EU AI Act vs. Gefangenendilemma | `src/components/SplitScreen.tsx` |
| 1770–1950 | 6 s | Outro mit Diskussionsfragen | `src/scenes/OutroScene.tsx` |

Die Zeitleiste steht in `src/Composition.tsx`.

## Komponenten

- `LowerThird`: Bauchbinde mit Name, Funktion und getipptem P(doom)-Wert.
- `InterviewBlock`: spielt `public/interviews/<datei>.mp4` ab, sonst Platzhalter mit Countdown.
- `MetricCard`: modulare Infobox (Kicker, Kernaussage, Erläuterung, optionaler Inhalt).
- `ExpertChart`: horizontales Balkendiagramm (Yudkowsky > 90 %, Hinton/Altman 10–20 %, LeCun < 1 %). Schraffur = Spannweite bzw. offene Grenze.
- `AlignmentFlow`: Ziel → Instrumentelle Konvergenz → Täuschung.
- `SplitScreen`: Risikopyramide des EU AI Act vs. 2 × 2-Matrix USA/China.
- `SceneFrame`, `Background`: gemeinsamer Rahmen und Hintergrund.

Design-Regeln (Farben, Schrift, Federn, Timing) stehen in [`MOTION.md`](MOTION.md) und als Code in `src/theme.ts`.

## Skills

- `.claude/skills/` enthält ausgewählte Skills aus [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) (MIT-Lizenz, siehe `LICENSE` in jedem Ordner) sowie die offiziellen Remotion-Skills (`npx remotion skills add`, Dateien in `.agents/skills/`).

## Schriften

Inter und JetBrains Mono liegen unter `public/fonts/` (SIL Open Font License, Lizenztexte daneben). Dadurch funktionieren Vorschau und Rendering auch ohne Internetzugang.

## Lizenz

Remotion ist für Einzelpersonen und Teams bis 3 Personen kostenlos. Für größere Organisationen gelten [eigene Bedingungen](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
