# P(doom): Die Überlebenswahrscheinlichkeit im KI-Zeitalter

Remotion-Projekt für einen rund 2,5-minütigen Erklär-Clip fürs Politik-Fach (1920 × 1080, 30 FPS): deutsches Voiceover, Soundeffekte, Hintergrundmusik, kinetische Typografie und zwei Slots für eigene Interviews.

## Schnellstart

```console
npm install
npm start          # Remotion Studio (Vorschau) auf http://localhost:3000
npm run render     # rendert out/p-doom.mp4
```

Alle Audiodateien liegen fertig im Repo. Neu erzeugen muss man sie nur, wenn sich Text oder Klang ändern sollen.

## Ablauf

| Szene | Inhalt | Datei |
|---|---|---|
| Hook | Frage, „Science-Fiction?“, rotierende Zahl, Titel | `src/scenes/HookScene.tsx` |
| Definition | P = Wahrscheinlichkeit, doom = Untergang: Kontrollverlust oder Aussterben | `src/scenes/DefinitionScene.tsx` |
| Expertenstreit | Risiko-Tacho: LeCun < 1 %, Hinton 10–20 %, Yudkowsky > 90 % | `src/components/ExpertChart.tsx` |
| Teaser 1 | „Wer hat recht?“ | `src/scenes/TeaserScene.tsx` |
| Interview 1 | 15 s, mit Bauchbinde | `src/components/InterviewBlock.tsx`, `LowerThird.tsx` |
| Kontrollproblem | Roboter-Geschichte: Ziel, Instrumentelle Konvergenz, Täuschung | `src/components/AlignmentFlow.tsx` |
| Teaser 2 | „Kann Politik bremsen?“ | `src/scenes/TeaserScene.tsx` |
| Interview 2 | 15 s, mit Bauchbinde | `src/components/InterviewBlock.tsx` |
| Regulierung | EU AI Act: seit August 2024, Risikopyramide, Strafrahmen | `src/scenes/EuScene.tsx` |
| Geopolitik | USA vs. China, Gefangenendilemma, Regeln vs. Wettrennen | `src/components/SplitScreen.tsx` |
| Outro | „Euer P(doom)?“, wer entscheidet, „Diskutiert!“ | `src/scenes/OutroScene.tsx` |

Die Szenenlängen werden **aus dem Voiceover berechnet** (`src/timeline.ts`). Bilder und Soundeffekte sind auf einzelne gesprochene Wörter synchronisiert (Wort-Zeitstempel von edge-tts).

## Interviews einfügen

```
public/interviews/experte1.mp4
public/interviews/experte2.mp4
```

Fehlt eine Datei, zeigt der Slot einen Platzhalter mit Countdown. Liegt ein Interview vor, wird die Musik in diesem Slot automatisch stummgeschaltet. Name, Funktion, P(doom)-Wert der Bauchbinde und ein Startversatz (`trimBeforeSeconds`) stehen in `src/Root.tsx` bzw. im Props-Panel des Studios.

Weitere Props:
- `untertitel`: blendet den Sprechertext als Untertitel ein (Barrierefreiheit).
- `musikLautstaerke`: 0 bis 1, Standard 1.

## Sprechertext ändern

1. Text in `scripts/voiceover-script.json` anpassen (Lautschrift für Anglizismen: „Pi-Duhm“ = P(doom), „Elainment“ = Alignment; der Untertitel steht in `caption`).
2. Neu sprechen lassen:

   ```console
   pip install edge-tts
   npm run voiceover      # nur geänderte Zeilen werden neu erzeugt
   ```

3. Fertig: Szenenlängen und Wort-Synchronisation passen sich automatisch an.

Stimme: `de-DE-ConradNeural` (Microsoft Edge TTS, über `edge-tts`). Andere Stimme, z. B. `de-DE-KillianNeural`: in `voiceover-script.json` unter `voice` eintragen und `python3 scripts/generate_voiceover.py --force` ausführen. Bitte vor einer Veröffentlichung die Nutzungsbedingungen des TTS-Dienstes prüfen.

## Soundeffekte und Musik

`scripts/generate_sfx.py` erzeugt alle Effekte (Whoosh, Pop, Impact, Stempel, Zähler, Riser, Ding, Glitch) und die Hintergrundmusik synthetisch, also ohne Fremdlizenzen:

```console
pip install numpy scipy
python3 scripts/generate_sfx.py
```

Die Musik wird unter Sprache automatisch abgesenkt (Ducking in `src/components/AudioMix.tsx`).

## Inhaltliche Quellen (Stand 2024/2025)

- **Geoffrey Hinton**: 10–20 % Wahrscheinlichkeit, dass KI innerhalb von 30 Jahren zur Auslöschung der Menschheit führt (BBC Radio 4, Dezember 2024).
- **Eliezer Yudkowsky**: hält das Aussterben der Menschheit für den wahrscheinlichsten Ausgang (Gastbeitrag in TIME, März 2023) und nennt in Interviews Werte deutlich über 90 %.
- **Yann LeCun**: hält existenzielle KI-Risiken für verschwindend gering (zahlreiche öffentliche Aussagen, 2023–2025).
- **EU AI Act** (Verordnung (EU) 2024/1689): in Kraft seit 1. August 2024; risikobasierter Ansatz; Bußgelder bis 35 Mio. € oder 7 % des weltweiten Jahresumsatzes (Art. 99).
- P(doom)-Werte sind persönliche Schätzungen, keine Messwerte.

## Skills und Design

- Design-Regeln: [`MOTION.md`](MOTION.md), Tokens in `src/theme.ts`, Typo-Bausteine in `src/components/kinetic.tsx`.
- `.claude/skills/`: ausgewählte Skills aus [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) (MIT) und die offiziellen Remotion-Skills (`.agents/skills/`).

## Schriften

Anton, Inter und JetBrains Mono liegen unter `public/fonts/` (SIL Open Font License, Lizenztexte daneben). Vorschau und Rendering funktionieren dadurch ohne Internet.

## Lizenz

Remotion ist für Einzelpersonen und Teams bis 3 Personen kostenlos. Für größere Organisationen gelten [eigene Bedingungen](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
