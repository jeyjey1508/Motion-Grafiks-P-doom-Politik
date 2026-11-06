# MOTION.md: P(doom) Unterrichtsvideo

Wird von den Skills in `.claude/skills/` (z. B. `motion-effects`, `animated-chart`) vor jeder Animation gelesen. Alle Werte stehen als Code in `src/theme.ts`.

## 1. Farben (Dark Mode)

| Rolle | Hex | Verwendung |
|---|---|---|
| ground | `#0B0E14` | Hintergrund |
| surface | `#141923` | Karten, Infoboxen |
| surfaceRaised | `#1A2030` | Zellen, Code-Chips |
| ink | `#F2F4F8` | Haupttext |
| inkSecondary | `#B4BCCB` | Erläuterungen |
| inkMuted | `#7D879A` | Achsen, Quellen |
| accent | `#E0602E` | Risiko, P(doom), Fokus |
| info | `#3987E5` | neutrale Information |
| safe | `#199E70` | Sicherheit, Kooperation |

Die drei Datenfarben (accent, info, safe) sind mit dem dataviz-Validator auf `#141923` geprüft: Helligkeitsband, Farbenblindheit (alle Paare) und Kontrast bestanden. Gelb neben Orange vermeiden (fällt bei Farbenblindheit durch).

## 2. Schrift

- Inter (variabel, lokal in `public/fonts/`) für alle Texte.
- JetBrains Mono für Zahlen, Zähler und getippte Werte.
- Größen bei 1920 × 1080: Hero 168 px, Headline 92 px, Titel 60 px, Fließtext 40 px, Labels mindestens 34 px, Meta/Quellen 28 px.

## 3. Timing

- 30 FPS. Grafiken und Infokarten bleiben 5 bis 6 Sekunden sichtbar, Teaser 3 Sekunden.
- Szenen blenden über 12 Frames weich ein und aus.
- Elemente innerhalb einer Szene starten gestaffelt (6 bis 12 Frames Abstand), nie alle gleichzeitig.
- Die Bauchbinde steht 6 Sekunden (Frame 30 bis 210 des Interviews).

## 4. Bewegung

- Federn mit hoher Dämpfung: `{ damping: 200, stiffness: 90 }` als Standard, kein Nachwippen.
- Nur Hero-Elemente (Titel, Play-Symbol) dürfen minimal nachfedern: `{ damping: 28, stiffness: 110 }`.
- Ein- und Ausgänge über `translate`, `opacity` und leichtes `scale` (0,96 → 1).
- Pfeile und Linien werden gezeichnet, nicht eingeblendet.
- In der Standphase bleibt etwas Kleines lebendig (wandernde Schraffur, pulsierendes Gleichgewicht, blinkender Cursor).

## 5. Oberfläche

- Karten: Radius 28 px, 1 px Rand `rgba(255,255,255,0.08)`, mehrschichtiger weicher Schatten, Akzentkante links oder oben.
- Feines 80-px-Raster und Vignette im Hintergrund, ein sehr langsam wandernder warmer Lichtschein.

## 6. Niemals

1. Zahlen erfinden oder runden, die nicht im Faktenplan stehen.
2. Federn mit sichtbarem Nachwippen für Text oder Diagramme.
3. CSS-Animationen oder `transition` (rendern in Remotion nicht korrekt).
4. Text in Datenfarbe einfärben (Werte und Labels bleiben in ink-Tönen).
5. Mehr als eine Botschaft gleichzeitig in den Fokus stellen.
