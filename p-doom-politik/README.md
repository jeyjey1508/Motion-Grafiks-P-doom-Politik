# P(doom): Die Überlebenswahrscheinlichkeit im KI-Zeitalter

Remotion-Projekt für eine eigenständige Kurz-Doku (ca. 4:28 min, 1920 × 1080, 30 FPS): deutsches Voiceover, Doku-Musikbett, Soundeffekte, Kamerafahrten durch illustrierte Szenen und zwei Slots für eigene Interviews.

## Schnellstart

```console
npm install
npm start          # Remotion Studio (Vorschau) auf http://localhost:3000
npm run render     # rendert out/p-doom.mp4
```

Alle Audiodateien liegen fertig im Repo. Neu erzeugen muss man sie nur, wenn sich Text oder Klang ändern sollen.

## Dramaturgie

| # | Szene | Bildidee | Datei in `src/scenes/` |
|---|---|---|---|
| 1 | Einstieg | Erde aus dem All, der Satz von Mai 2023, Unterschriftenwand, Titel | `OpenScene.tsx` |
| 2 | Begriff | Kamerafahrt: Formel, Auslöschung oder Kontrollverlust, Bauchgefühl in Prozent | `DefineScene.tsx` |
| 3 | Expertenstreit | Fahrt über eine Risiko-Landschaft von 0 % bis 100 % (LeCun, Hinton, Yudkowsky) | `ExpertsScene.tsx` |
| 4 | Umfrage | 2.778 Punkte, Median 5 %, eines von zwanzig Flugzeugen | `SurveyScene.tsx` |
| – | Interview 1 | Teaser, 15 s Interview mit Bauchbinde | `TeaserScene.tsx`, `components/InterviewBlock.tsx` |
| 5 | Alignment | auseinanderlaufende Ziele, trainiertes Netz, Blackbox | `BlackboxScene.tsx` |
| 6 | Gedankenexperiment | Kaffee-Roboter vor dem Aus-Schalter, instrumentelle Konvergenz | `CoffeeScene.tsx` |
| 7 | Täuschung | Labor: beobachtet angepasst, unbeobachtet anders | `LabScene.tsx` |
| 8 | Regulierung | Europa auf dem Globus, AI Act, Risikopyramide mit Beispielen, Strafrahmen | `EuScene.tsx` |
| 9 | Geopolitik | Weltkarte: Rechenzentren, Chip-Lieferkette, Export-Stopp | `MapScene.tsx` |
| 10 | Wettrüsten | Waage mit Getriebe und Risiko-Anzeige, Gefangenendilemma | `DilemmaScene.tsx` |
| – | Interview 2 | Teaser, 15 s Interview mit Bauchbinde | wie oben |
| 11 | Auswege | Reise bei Tagesanbruch: Testen, Verträge, Chips, Weltbehörde | `SolutionsScene.tsx` |
| 12 | Schlussgedanke | Erdhorizont, Sonnenaufgang: „Es ist eine Entscheidung.“ | `ClosingScene.tsx` |

Im Studio gibt es neben dem Hauptfilm `PDoom` jede Szene einzeln im Ordner „Szenen“ (ohne Ton), zum schnellen Prüfen.

## Wie das Timing entsteht

- Der Sprechertext steht in `scripts/voiceover-script.json`.
- `scripts/generate_voiceover.py` spricht jede Zeile mit edge-tts ein und schreibt Längen und Wort-Zeitstempel nach `src/generated/voiceover.json`.
- `src/timeline.ts` berechnet daraus alle Szenenlängen. In den Szenen hängen Bild-Beats und Soundeffekte an gesprochenen Wörtern (`wordAt(cue, "Wort")`).

Text ändern heißt also: JSON anpassen, `npm run voiceover` ausführen, fertig.

## Interviews einfügen

```
public/interviews/experte1.mp4
public/interviews/experte2.mp4
```

Fehlt eine Datei, zeigt der Slot einen Platzhalter mit Countdown. Liegt ein Interview vor, wird die Musik in diesem Slot stummgeschaltet. Name, Funktion, P(doom)-Wert der Bauchbinde und ein Startversatz (`trimBeforeSeconds`) stehen in `src/Root.tsx` bzw. im Props-Panel des Studios.

Weitere Props: `untertitel` (Sprechertext einblenden) und `musikLautstaerke` (0 bis 1).

## Stimme

- Stimme: `de-DE-FlorianMultilingualNeural`, Tempo `+8%` (Microsoft Edge TTS über `edge-tts`).
- Die mehrsprachige Stimme spricht englische Begriffe von selbst richtig aus. Im Skript steht deshalb „P-Doom“, „Alignment“ und „AI Act“; die Schreibweise „Pi-Doom“ würde als „Pai-Doom“ gesprochen.
- `caption` im Skript enthält die korrekte Schreibweise für Untertitel, z. B. „P(doom)“.

```console
pip install edge-tts
npm run voiceover                                  # nur geänderte Zeilen
python3 scripts/generate_voiceover.py --force      # alles neu, z. B. nach Stimmwechsel
```

Bitte vor einer Veröffentlichung die Nutzungsbedingungen des TTS-Dienstes prüfen.

## Musik und Soundeffekte

`scripts/generate_sfx.py` synthetisiert alles selbst, es gibt keine Fremdlizenzen:

- `public/audio/bg-music.mp3`: Doku-Musikbett in d-Moll (Drone, Puls, Klaviermotiv, Streicherfläche, Hall), das sich zum Schlussgedanken nach F-Dur auflöst.
- `public/audio/sfx/*.wav`: 19 Effekte (Whooshes, Impact, Drop, Stempel, Zähler, Riser, Swell, Glocken, Glitch, Relais, Alarm, Stift, Herzschlag).

```console
pip install numpy scipy
python3 scripts/generate_sfx.py --length 280 --outro-at 240
```

`--outro-at` ist die Sekunde, ab der die Harmonie auflöst; bei geänderter Filmlänge auf den Beginn der Schluss-Szene setzen. Die Musik wird unter Sprache automatisch abgesenkt (`src/components/AudioMix.tsx`).

## Weltkarte

`npm run worldmap` erzeugt `src/generated/world.json` aus Natural-Earth-Daten (npm-Paket `world-atlas`). Der Globus in `src/art/Globe.tsx` projiziert dieselben Daten pro Frame orthografisch.

## Inhaltliche Quellen

- **Statement on AI Risk**, Center for AI Safety, 30. Mai 2023: „Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war.“ Unterzeichnet von Hunderten Forschenden sowie den Chefs von OpenAI, Google DeepMind und Anthropic. Im Film sinngemäß übersetzt.
- **Geoffrey Hinton** (Nobelpreis für Physik 2024): 10–20 % (BBC Radio 4, Dezember 2024).
- **Eliezer Yudkowsky**: hält das Aussterben für den wahrscheinlichsten Ausgang (TIME, März 2023), nennt Werte deutlich über 90 %.
- **Yann LeCun** (Turing-Preis 2018): hält existenzielle KI-Risiken für stark übertrieben; im Film vereinfacht als „unter 1 %“.
- **Umfrage**: AI Impacts, „Thousands of AI Authors on the Future of AI“ (Befragung 2023, 2.778 Teilnehmende): Median 5 % für extrem schlechte Ausgänge wie das Aussterben der Menschheit.
- **Täuschung im Training**: Greenblatt et al., „Alignment faking in large language models“ (Anthropic/Redwood Research, Dezember 2024).
- **Instrumentelle Konvergenz / Kaffee-Beispiel**: nach Stuart Russell („You can't fetch the coffee if you're dead“).
- **EU AI Act**, Verordnung (EU) 2024/1689: in Kraft seit 1. August 2024; Bußgelder bis 35 Mio. € oder 7 % des weltweiten Jahresumsatzes (Art. 99). Beispiele der Risikostufen: Social Scoring (verboten), KI in der Personalauswahl (hohes Risiko), Chatbots (Transparenzpflichten), Spamfilter (minimal).
- **Chips**: Entwurf u. a. in Kalifornien, Fertigung in Taiwan, Lithografie-Maschinen aus den Niederlanden; US-Exportkontrollen für Hochleistungs-Chips nach China seit Oktober 2022.
- **Bletchley-Erklärung**, November 2023: 28 Staaten und die EU, darunter USA und China.
- P(doom)-Werte sind persönliche Schätzungen, keine Messwerte.

## Design und Skills

- Gestaltungsregeln: [`MOTION.md`](MOTION.md). Bausteine: `src/stage/Stage.tsx` (Kamera, Parallax, Himmel), `src/components/kinetic.tsx` (Typografie, SFX), `src/transitions.tsx` (Kamera-Übergänge), `src/art/` (Globus, Figuren).
- `.claude/skills/`: Skills aus [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) (MIT) und die offiziellen Remotion-Skills.
- Schriften Anton, Inter, JetBrains Mono liegen unter `public/fonts/` (SIL Open Font License).

## Lizenz

Remotion ist für Einzelpersonen und Teams bis 3 Personen kostenlos. Für größere Organisationen gelten [eigene Bedingungen](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
