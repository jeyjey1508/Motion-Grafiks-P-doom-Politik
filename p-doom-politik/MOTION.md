# MOTION.md: P(doom) Erklär-Clip

Wird von den Skills in `.claude/skills/` vor jeder Animation gelesen. Alle Werte stehen als Code in `src/theme.ts` und `src/components/kinetic.tsx`.

## 1. Look

Flacher, satter Erklär-Clip auf dunklem Nachtblau. Wenig Text, große Schlagworte, einfache Vektor-Metaphern (Roboter, Tacho, Raketen, Sternenkreis, Pyramide).

| Rolle | Hex | Verwendung |
|---|---|---|
| bg | `#0B0F1E` | Grundfläche (jede Szene hat eine eigene Abwandlung) |
| panel | `#1B2244` | Karten, Zellen |
| ink / inkSoft / inkMuted | `#FFFFFF` / `#C9CEE6` / `#7F87A8` | Text |
| red | `#FF4B3E` | Untergang, Risiko, Täuschung |
| orange | `#FF8A3D` | Kontrollverlust, Warnung |
| yellow | `#FFD23F` | Hervorhebung, Zahlen, Fragen |
| green | `#2EE59D` | Entwarnung, Sicherheit |
| blue | `#3D8BFF` | KI/Roboter, USA |
| violet | `#8F6BFF` | Interviews, Konzerne |
| euBlue | `#1F4BD8` | EU |

## 2. Schrift

- **Anton** (Großbuchstaben) für Schlagworte, 100 bis 330 px.
- **Inter** 800/900 für Dachzeilen und Labels, mindestens 30 px.
- **JetBrains Mono** nur für Dateipfade.
- Ein Bild, eine Botschaft: höchstens ein Schlagwort plus eine Dachzeile gleichzeitig im Fokus.

## 3. Timing

- Das Voiceover bestimmt das Tempo. Szenenlängen werden aus den Audiolängen berechnet (`src/timeline.ts`).
- Bild-Beats landen auf dem gesprochenen Wort (`wordAt(cue, "Wort")`).
- Übergänge: 16 Frames (Slide, Wipe, Fade in Interviews), jeweils mit Whoosh.
- Gezielte Pausen nach Pointen über `PAUSE_AFTER` in `src/timeline.ts`.

## 4. Bewegung

- `Beat` mit Auftritten `slam` (Schlagwort), `rise`, `pop` (Icons), `left/right/drop`.
- Federn: `punch` (damping 22) für Schlagworte, `pop` (damping 14) für Icons, `smooth` (damping 200) für ruhige Wege, `needle` für den Tacho.
- Aufprall-Wackler (`useShake`) nur bei echten Pointen (Titel, > 90 %, „verboten“, „rasen beide“).
- Szenen zoomen langsam (`push` 2 bis 4 %), Hintergrundpunkte treiben nach oben.
- Zahlen zählen hoch (`CountUp`) oder rotieren (`SlotNumber`).

## 5. Ton

| Spur | Pegel |
|---|---|
| Voiceover | 1,0 |
| Musik | 0,20, unter Sprache 0,07; in Interviews mit Video 0 |
| SFX | 0,25 bis 0,5 (siehe `SFX_VOLUME` in `kinetic.tsx`) |

## 6. Niemals

1. Zahlen erfinden oder runden, die nicht belegt sind (Quellen im README).
2. Fließtext oder Fußnoten ins Bild setzen; Erklärungen trägt die Stimme.
3. CSS-Animationen oder `transition` (rendern in Remotion nicht korrekt).
4. Echte Logos oder Flaggen nachzeichnen; Länder werden über Farbe und Schrift markiert.
5. Mehr als eine Pointe gleichzeitig animieren.
