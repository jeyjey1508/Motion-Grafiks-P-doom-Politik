#!/usr/bin/env python3
"""Erzeugt das Voiceover mit edge-tts und schreibt ein Manifest mit den Längen.

Aufruf (im Projektordner):
    pip install edge-tts
    python3 scripts/generate_voiceover.py           # nur geänderte Zeilen neu erzeugen
    python3 scripts/generate_voiceover.py --force   # alles neu erzeugen

Ergebnis:
    public/audio/vo/<szene>-<zeile>.mp3
    src/generated/voiceover.json   (wird von src/timeline.ts gelesen; die
                                    Szenenlängen passen sich daran an)

Hinter einem HTTPS-Proxy wird HTTPS_PROXY automatisch verwendet.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "voiceover-script.json"
OUT_DIR = ROOT / "public" / "audio" / "vo"
MANIFEST = ROOT / "src" / "generated" / "voiceover.json"


def duration_seconds(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    return round(float(result.stdout.strip()), 3)


def speech_bounds(path: Path, total: float) -> tuple[float, float]:
    """Findet Beginn und Ende der Sprache (Stille am Rand wird abgeschnitten)."""
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(path),
            "-af",
            "silencedetect=noise=-45dB:d=0.08",
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    starts, ends = [], []
    for row in result.stderr.splitlines():
        if "silence_start:" in row:
            starts.append(float(row.split("silence_start:")[1].split()[0]))
        if "silence_end:" in row:
            ends.append(float(row.split("silence_end:")[1].split()[0]))
    speech_start, speech_end = 0.0, total
    if starts and starts[0] <= 0.01 and ends:
        speech_start = max(0.0, ends[0] - 0.04)
    if starts and (len(ends) < len(starts) or ends[-1] >= total - 0.02):
        speech_end = min(total, starts[-1] + 0.12)
    if speech_end <= speech_start:
        return 0.0, total
    return round(speech_start, 3), round(speech_end, 3)


def line_hash(voice: str, rate: str, pitch: str, text: str) -> str:
    return hashlib.sha1(f"{voice}|{rate}|{pitch}|{text}".encode("utf-8")).hexdigest()[:12]


async def synthesize(text: str, voice: str, rate: str, pitch: str, target: Path) -> list[dict]:
    """Erzeugt die MP3 und liefert Wort-Zeitstempel (Sekunden ab Dateibeginn)."""
    import edge_tts  # noqa: PLC0415 (nur nötig, wenn wirklich erzeugt wird)

    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    communicate = edge_tts.Communicate(
        text, voice, rate=rate, pitch=pitch, proxy=proxy, boundary="WordBoundary"
    )
    tmp = target.with_suffix(".tmp.mp3")
    words: list[dict] = []
    with tmp.open("wb") as handle:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                handle.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / 10_000_000
                words.append(
                    {
                        "text": chunk["text"],
                        "start": round(start, 3),
                        "end": round(start + chunk["duration"] / 10_000_000, 3),
                    }
                )
    if tmp.stat().st_size == 0:
        tmp.unlink()
        raise RuntimeError(f"edge-tts lieferte keine Audiodaten für: {text!r}")
    tmp.replace(target)
    return words


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="alle Zeilen neu erzeugen")
    args = parser.parse_args()

    script = json.loads(SCRIPT.read_text(encoding="utf-8"))
    voice, rate, pitch = script["voice"], script.get("rate", "+0%"), script.get("pitch", "+0Hz")

    previous: dict[str, dict] = {}
    if MANIFEST.exists() and not args.force:
        old = json.loads(MANIFEST.read_text(encoding="utf-8"))
        for scene in old.get("scenes", []):
            for line in scene["lines"]:
                previous[f"{scene['id']}-{line['id']}"] = line

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)

    manifest = {"voice": voice, "rate": rate, "scenes": []}
    for scene in script["scenes"]:
        lines_out = []
        for line in scene["lines"]:
            key = f"{scene['id']}-{line['id']}"
            target = OUT_DIR / f"{key}.mp3"
            h = line_hash(voice, rate, pitch, line["text"])
            cached = previous.get(key, {})
            if args.force or cached.get("hash") != h or not target.exists() or "words" not in cached:
                print(f"  TTS  {key}: {line['text']}")
                words = await synthesize(line["text"], voice, rate, pitch, target)
            else:
                print(f"  ok   {key}")
                words = cached["words"]
            total = duration_seconds(target)
            start, end = speech_bounds(target, total)
            lines_out.append(
                {
                    "id": line["id"],
                    "file": f"audio/vo/{key}.mp3",
                    "fileSeconds": total,
                    # Sprache beginnt bei `start` und endet bei `end` (Sekunden in der Datei)
                    "start": start,
                    "end": end,
                    "seconds": round(end - start, 3),
                    "caption": line.get("caption", line["text"]),
                    "words": words,
                    "hash": h,
                }
            )
        manifest["scenes"].append({"id": scene["id"], "lines": lines_out})

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(l["seconds"] for s in manifest["scenes"] for l in s["lines"])
    print(f"Manifest geschrieben: {MANIFEST.relative_to(ROOT)} ({total:.1f} s Sprache)")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
