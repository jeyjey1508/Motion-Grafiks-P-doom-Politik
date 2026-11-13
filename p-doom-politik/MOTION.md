# MOTION.md: P(doom) Kurz-Doku

Gestaltungsregeln für diesen Film. Sie ersetzen die frühere, zurückhaltende Fassung: Hier wird groß, filmisch und in Bildern erzählt.

## 1. Haltung

- **Bilder statt Kästchen.** Jede Szene hat eine eigene visuelle Metapher (Globus, Risiko-Landschaft, Blackbox, Roboter, Labor, Pyramide, Weltkarte, Waage mit Getriebe, Reise in den Morgen). Keine Karten-Layouts, keine Dashboards.
- **Die Stimme erklärt, das Bild zeigt.** Auf dem Bild stehen Schlagworte, Zahlen und kurze Marker, keine Sätze.
- **Neutraler Doku-Ton.** Kein Schulbezug, keine direkte Ansprache einer Klasse. Quellen-Tags nur bei Zitaten und Umfragen, klein und am Rand.

## 2. Bühne und Kamera (`src/stage/Stage.tsx`)

- Jede Szene liegt in einer `Stage` mit Himmelsverlauf, Lichtschein, optional Sternen (weit hinten) und Staub (Vordergrund) plus Vignette.
- Inhalte liegen in `Layer`-Ebenen mit `depth`: 0,1 bis 0,3 Hintergrund, 0,5 bis 0,8 Mittelgrund, 1 Hauptebene. Unterschiedliche Tiefen ergeben Parallax.
- `useCam([...])` beschreibt die Kamerafahrt als Keyframes (`x`, `y`, `zoom`). Größere Szenen sind mehrere Bildschirme breit oder hoch; die Kamera schwenkt zwischen den Bildern, statt zu schneiden.
- Typografie, die bei Zooms nicht aus dem Bild laufen darf, liegt in einer Ebene mit `depth` um 0,1 oder außerhalb der Ebenen.

## 3. Übergänge (`src/transitions.tsx`)

`push` (Kamera fährt hindurch), `pull` (zieht heraus), `pan` (schwenkt weiter), `dip` (kurz ins Schwarz), `fade` nur an den Interviews. 18 Frames, jeweils mit langem Whoosh.

## 4. Typografie (`src/components/kinetic.tsx`)

- **Anton**, Großbuchstaben: `Letters` (Buchstaben springen einzeln herein) für das Schlagwort einer Einstellung, 130 bis 420 px.
- `Marker`: Text auf Leuchtstift-Balken für die zweite Ebene. `Kicker` und `Tag` für Dachzeilen und Etiketten.
- **Inter** 800/900 für kleine Labels, mindestens 28 px.
- Pro Einstellung ein Schlagwort im Fokus. Text und Illustration dürfen sich nicht überlagern: nach jeder Änderung Standbilder prüfen.

## 5. Farben

Dunkle, satte Himmel je Szene (Nachtblau, Petrol im Labor, EU-Blau, Violett an den Interviews, Morgenrot bei den Auswegen). Akzente: Rot `#FF4B3E` (Gefahr), Orange `#FF8A3D`, Gelb `#FFD23F` (Hervorhebung, Zahlen), Grün `#2EE59D` (Entwarnung, Lösungen), Blau `#3D8BFF` (KI, USA). Leuchten über `Glow` und `textShadow`, nicht über Blur-Filter.

## 6. Timing

- Das Voiceover bestimmt das Tempo (`src/timeline.ts`); Bild-Beats landen auf dem gesprochenen Wort.
- Federn: `punch` für Schlagworte, `pop` für Icons, `smooth` für Wege und Kamera-nahe Bewegungen. In Schleifen `settle()`.
- `useShake` nur an echten Pointen.

## 7. Ton

| Spur | Pegel |
|---|---|
| Voiceover | 1,0 |
| Musik | 0,22, unter Sprache 0,085, in Interviews mit Video 0 |
| SFX | 0,2 bis 0,5 (siehe `SFX` in `kinetic.tsx`) |

## 8. Grenzen

1. Keine erfundenen Zahlen; alles auf dem Bild ist im README belegt.
2. Keine CSS-Animationen (rendern in Remotion nicht korrekt).
3. Keine Porträt-Ähnlichkeit bei Personen, keine echten Logos oder Flaggen; Namen und Länder stehen als Schrift.
