#!/usr/bin/env python3
"""Synthetisiert Soundeffekte und das Doku-Musikbett (keine Fremdlizenzen).

Aufruf (im Projektordner):
    pip install numpy scipy
    python3 scripts/generate_sfx.py [--length 280] [--outro-at 250]

Ergebnis:
    public/audio/sfx/*.wav       Effekte (Whoosh, Impact, Pop, Riser, ...)
    public/audio/bg-music.mp3    Musikbett: Drone, Puls, Klaviermotiv, Streicherfläche

--length    Länge der Musik in Sekunden (mindestens Videolänge)
--outro-at  Ab dieser Sekunde löst sich die Harmonie auf (Schlussgedanke)

Alles ist deterministisch (fester Zufalls-Seed).
"""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "public" / "audio" / "sfx"
MUSIC = ROOT / "public" / "audio" / "bg-music.mp3"
SR = 44100
RNG = np.random.default_rng(2026)


# ---------------------------------------------------------------- helpers ---


def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def noise(seconds: float) -> np.ndarray:
    return RNG.standard_normal(int(seconds * SR))


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, [lo, hi], btype="bandpass", fs=SR, output="sos"), x, axis=0)


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, cutoff, btype="lowpass", fs=SR, output="sos"), x, axis=0)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, cutoff, btype="highpass", fs=SR, output="sos"), x, axis=0)


def chirp(f0: float, f1: float, seconds: float, curve: float = 3.0) -> np.ndarray:
    t = t_axis(seconds)
    freq = f1 + (f0 - f1) * np.exp(-curve * t / seconds)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def sweep_filter(x: np.ndarray, centers: np.ndarray, q: float = 1.2) -> np.ndarray:
    """Zeitvariabler Bandpass: Mischung vorgefilterter Bänder entlang `centers`."""
    bands = np.geomspace(120, 7000, 16)
    filtered = np.stack(
        [bandpass(x, max(30, fc - fc / q / 2), min(SR / 2 - 100, fc + fc / q / 2)) for fc in bands]
    )
    pos = np.interp(np.log(centers), np.log(bands), np.arange(len(bands)))
    lo = np.floor(pos).astype(int).clip(0, len(bands) - 2)
    frac = pos - lo
    idx = np.arange(x.size)
    return filtered[lo, idx] * (1 - frac) + filtered[lo + 1, idx] * frac


def env(n: int, attack: float, release: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.clip(t / max(attack, 1e-4), 0, 1) * np.exp(-np.maximum(t - attack, 0) / max(release, 1e-4))


def stereo(x: np.ndarray, pan: np.ndarray | float = 0.0) -> np.ndarray:
    if x.ndim == 2:
        return x
    pan = np.asarray(pan)
    return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], axis=1)


def make_ir(seconds: float, brightness: float = 5000) -> np.ndarray:
    """Hall-Impulsantwort: abklingendes, dekorreliertes Stereo-Rauschen."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    rng = np.random.default_rng(11)
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (seconds / 5))[:, None]
    ir = lowpass(ir, brightness)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir**2, axis=0, keepdims=True))


IR_SHORT = make_ir(1.1, 6000)
IR_LONG = make_ir(3.2, 3800)


def reverb(x: np.ndarray, ir: np.ndarray, wet: float, tail: float = 0.0) -> np.ndarray:
    """Faltungshall. `tail` verlängert das Signal um Sekunden, damit der Hall ausklingt."""
    x = stereo(x)
    if tail > 0:
        x = np.concatenate([x, np.zeros((int(tail * SR), 2))])
    wet_sig = np.stack(
        [fftconvolve(x[:, c], ir[:, c])[: x.shape[0]] for c in range(2)], axis=1
    )
    return x * (1 - wet * 0.3) + wet_sig * wet


def normalize(x: np.ndarray, peak: float) -> np.ndarray:
    m = np.max(np.abs(x))
    return x if m == 0 else x / m * peak


def write_wav(name: str, x: np.ndarray, peak: float = 0.85) -> None:
    x = normalize(stereo(x), peak)
    n = int(SR * 0.004)
    ramp = np.linspace(0, 1, n)[:, None]
    x[:n] *= ramp
    x[-n:] *= ramp[::-1]
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    wavfile.write(SFX_DIR / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"  sfx  {name:12s} {x.shape[0] / SR:.2f} s")


# -------------------------------------------------------------------- sfx ---


def whoosh(seconds: float, peak_at: float, f_lo: float, f_hi: float, air: float = 0.12) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / n
    e = np.where(t < peak_at, (t / peak_at) ** 2.4, np.exp(-(t - peak_at) * 8))
    centers = np.where(
        t < peak_at,
        f_lo * (f_hi / f_lo) ** (t / peak_at),
        f_hi * (f_lo * 1.5 / f_hi) ** ((t - peak_at) / (1 - peak_at)),
    )
    body = sweep_filter(noise(seconds), centers) * e
    hiss = highpass(noise(seconds), 4500) * e * air
    return reverb(stereo(body + hiss, np.interp(t, [0, 1], [-0.8, 0.8])), IR_SHORT, 0.18, 0.3)


def pop(f0: float, f1: float) -> np.ndarray:
    tone = chirp(f0, f1, 0.14, curve=6)
    click = highpass(noise(0.14), 2500) * env(tone.size, 0.0005, 0.004) * 0.25
    return reverb(tone * env(tone.size, 0.002, 0.035) + click, IR_SHORT, 0.08, 0.15)


def impact() -> np.ndarray:
    seconds = 1.6
    n = int(seconds * SR)
    boom = chirp(130, 34, seconds, curve=8) * env(n, 0.003, 0.5)
    sub = np.sin(2 * np.pi * 40 * t_axis(seconds)) * env(n, 0.01, 0.8) * 0.6
    crack = lowpass(noise(seconds), 2200) * env(n, 0.001, 0.035) * 0.8
    return reverb(np.tanh((boom + sub + crack) * 1.7), IR_LONG, 0.22, 1.2)


def sub_drop() -> np.ndarray:
    seconds = 2.2
    n = int(seconds * SR)
    tone = chirp(95, 28, seconds, curve=2.2) * env(n, 0.02, 0.9)
    rumble = lowpass(noise(seconds), 160) * env(n, 0.05, 0.7) * 0.5
    return reverb(np.tanh((tone + rumble) * 1.5), IR_LONG, 0.15, 0.8)


def stamp() -> np.ndarray:
    n = int(0.45 * SR)
    thump = chirp(170, 65, 0.45, curve=9) * env(n, 0.001, 0.09)
    knock = bandpass(noise(0.45), 250, 1500) * env(n, 0.001, 0.022) * 1.2
    return reverb(np.tanh((thump + knock) * 1.4), IR_SHORT, 0.12, 0.25)


def click() -> np.ndarray:
    n = int(0.06 * SR)
    body = np.sin(2 * np.pi * 1900 * t_axis(0.06)) * env(n, 0.0004, 0.008)
    tick = highpass(noise(0.06), 3500) * env(n, 0.0003, 0.003) * 0.6
    return body + tick


def counter_roll() -> np.ndarray:
    seconds = 1.4
    out = np.zeros(int(seconds * SR))
    tick = click()[: int(0.03 * SR)]
    pos, gap = 0.0, 0.03
    while pos < seconds - 0.05:
        i = int(pos * SR)
        out[i : i + tick.size] += tick * (0.5 + 0.5 * (1 - pos / seconds))
        pos += gap
        gap *= 1.045
    return out


def riser(seconds: float = 2.4) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / n
    body = sweep_filter(noise(seconds), 300 * (5500 / 300) ** (t**1.5), q=2.0) * t**2.4
    tone = np.sin(2 * np.pi * np.cumsum(170 * (6**t)) / SR) * t**3 * 0.22
    return reverb(stereo(body + tone, np.sin(t * 7) * 0.4), IR_SHORT, 0.15, 0.2)


def swell() -> np.ndarray:
    """Weiches Anschwellen (wie ein rückwärts gespieltes Becken)."""
    seconds = 1.8
    n = int(seconds * SR)
    t = np.arange(n) / n
    body = bandpass(noise(seconds), 900, 9000) * t**3.2
    shimmer = sum(np.sin(2 * np.pi * f * t_axis(seconds)) for f in (880, 1320, 1760)) * t**4 * 0.08
    return reverb(stereo(body * 0.6 + shimmer, 0.0), IR_LONG, 0.3, 0.9)


def bell(freqs: list[float], decay: float = 1.0) -> np.ndarray:
    seconds = 2.0
    t = t_axis(seconds)
    out = np.zeros(t.size)
    for i, f in enumerate(freqs):
        start = int(i * 0.09 * SR)
        tt = t[: t.size - start]
        note = sum(
            a * np.sin(2 * np.pi * f * h * tt) * env(tt.size, 0.002, decay / h)
            for h, a in ((1, 1.0), (2.01, 0.35), (3.02, 0.18), (4.2, 0.08))
        )
        out[start:] += note
    return reverb(out, IR_LONG, 0.3, 1.2)


def glitch() -> np.ndarray:
    n = int(0.55 * SR)
    out = np.zeros(n)
    rng = np.random.default_rng(7)
    pos = 0
    while pos < n:
        length = int(rng.uniform(0.012, 0.06) * SR)
        f = rng.choice([180, 360, 720, 1440, 2880])
        seg = np.round(np.sign(np.sin(2 * np.pi * f * np.arange(length) / SR)) * 4) / 4
        seg = seg * rng.uniform(0.3, 1.0) if rng.random() > 0.3 else np.zeros(length)
        out[pos : pos + length] = seg[: n - pos]
        pos += length
    return reverb(lowpass(out, 6000) * env(n, 0.002, 0.28), IR_SHORT, 0.1, 0.2)


def clunk() -> np.ndarray:
    """Mechanischer Schalter / Relais."""
    n = int(0.3 * SR)
    a = bandpass(noise(0.3), 300, 2400) * env(n, 0.0005, 0.018)
    b = np.roll(bandpass(noise(0.3), 150, 900) * env(n, 0.0005, 0.03), int(0.05 * SR)) * 0.8
    thud = chirp(110, 60, 0.3, curve=8) * env(n, 0.001, 0.06) * 0.8
    return reverb(a + b + thud, IR_SHORT, 0.2, 0.35)


def alarm() -> np.ndarray:
    """Zwei tiefe Warntöne (gesperrt / blockiert)."""
    seconds = 0.7
    t = t_axis(seconds)
    out = np.zeros(t.size)
    for start in (0.0, 0.3):
        i = int(start * SR)
        n = int(0.22 * SR)
        tone = np.sign(np.sin(2 * np.pi * 196 * t[:n])) * 0.5 + np.sin(2 * np.pi * 196 * t[:n])
        out[i : i + n] += lowpass(tone, 1400) * env(n, 0.004, 0.12)
    return reverb(out, IR_SHORT, 0.15, 0.3)


def scribble() -> np.ndarray:
    """Stift auf Papier: viele kurze Striche."""
    seconds = 1.3
    n = int(seconds * SR)
    body = bandpass(noise(seconds), 1800, 7500)
    t = np.arange(n) / SR
    strokes = 0.35 + 0.65 * np.abs(np.sin(2 * np.pi * 7.5 * t + np.sin(2 * np.pi * 1.3 * t) * 2))
    gate = np.clip(np.sin(2 * np.pi * 2.1 * t) + 0.75, 0, 1)
    return stereo(body * strokes * gate * env(n, 0.03, 1.2), np.sin(2 * np.pi * 0.9 * t) * 0.5)


def heartbeat() -> np.ndarray:
    seconds = 1.0
    out = np.zeros(int(seconds * SR))
    for start, amp in ((0.0, 1.0), (0.22, 0.7)):
        i = int(start * SR)
        n = int(0.25 * SR)
        out[i : i + n] += chirp(75, 42, 0.25, curve=6) * env(n, 0.004, 0.07) * amp
    return reverb(np.tanh(out * 1.6), IR_SHORT, 0.1, 0.2)


# ------------------------------------------------------------------ music ---


def note_freq(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def soft_saw(freq: float, t: np.ndarray, harmonics: int, bright: float) -> np.ndarray:
    out = np.zeros_like(t)
    for h in range(1, harmonics + 1):
        if freq * h > 9000:
            break
        out += np.sin(2 * np.pi * freq * h * t) / h * np.exp(-h / bright)
    return out


def add(buf: np.ndarray, start: float, sig: np.ndarray, gain_l: float, gain_r: float) -> None:
    i = int(start * SR)
    if i < 0:
        sig = sig[-i:]
        i = 0
    if i >= buf.shape[0]:
        return
    n = min(sig.size, buf.shape[0] - i)
    buf[i : i + n, 0] += sig[:n] * gain_l
    buf[i : i + n, 1] += sig[:n] * gain_r


def music(seconds: float, outro_at: float) -> np.ndarray:
    bpm = 96
    beat = 60 / bpm
    bar = beat * 4
    n = int(seconds * SR)
    dry = np.zeros((n, 2))  # Puls, Bass, Schlagwerk
    wet = np.zeros((n, 2))  # Fläche, Klavier (viel Hall)

    # Harmonie: je zwei Takte. Hauptteil in d-Moll, Schluss löst nach F-Dur auf.
    main = [[38, 50, 53, 57, 62], [34, 46, 50, 53, 58], [31, 43, 46, 50, 55], [33, 45, 49, 52, 57]]
    outro = [[41, 53, 57, 60, 65], [36, 48, 52, 55, 60], [38, 50, 53, 57, 62], [34, 46, 50, 53, 58]]
    chord_len = bar * 2
    section_len = chord_len * 4  # 20 s
    motif = [0, 2, 3, 2, 4, 3]  # Indizes in die Akkordtöne
    piano_rhythm = [0.0, 1.5, 3.0, 4.0, 5.5, 7.0]  # in Schlägen über 2 Takte

    c = 0
    while c * chord_len < seconds:
        start = c * chord_len
        in_outro = start >= outro_at - 0.01
        notes = (outro if in_outro else main)[c % 4]
        section = int(start // section_len) % 4  # 0 ruhig, 1 Puls, 2 voll, 3 Atempause
        energy = 0.55 if in_outro else (0.35, 0.7, 1.0, 0.45)[section]

        # Streicherfläche
        length = chord_len + 1.6
        tt = t_axis(length)
        e = np.clip(tt / 1.4, 0, 1) * np.clip((length - tt) / 1.6, 0, 1)
        bright = (2.0 if not in_outro else 3.0) + 0.6 * np.sin(start / 17)
        for i, m in enumerate(notes[1:]):
            f = note_freq(m + (12 if i >= 2 else 0))
            sig = (soft_saw(f * 1.002, tt, 8, bright) + soft_saw(f * 0.998, tt, 8, bright)) * e
            add(wet, start - 0.5, sig, 0.030 * (1.0 if i % 2 else 0.7), 0.030 * (0.7 if i % 2 else 1.0))

        # Tiefer Drone auf dem Grundton
        td = t_axis(chord_len + 0.4)
        ed = np.clip(td / 0.6, 0, 1) * np.clip((chord_len + 0.4 - td) / 0.6, 0, 1)
        root = note_freq(notes[0])
        drone = (np.sin(2 * np.pi * root * td) + 0.3 * np.sin(4 * np.pi * root * td)) * ed
        drone *= 1 + 0.12 * np.sin(2 * np.pi * 0.21 * td)
        add(dry, start - 0.2, drone, 0.20, 0.20)

        # Puls-Ostinato (Achtel, gedämpft) ab Abschnitt 1
        if energy >= 0.6 and not in_outro:
            for k in range(16):
                pos = start + k * beat / 2
                f = note_freq(notes[1] if k % 4 != 3 else notes[2])
                tp = t_axis(0.16)
                accent = 1.0 if k % 4 == 0 else 0.6
                pl = soft_saw(f, tp, 6, 1.6) * env(tp.size, 0.003, 0.045) * accent
                add(dry, pos, pl, 0.085 * energy, 0.085 * energy)

        # Klaviermotiv: wenige Töne, weit im Raum
        if section != 1 or in_outro:
            for k, b in enumerate(piano_rhythm):
                if (c + k) % 3 == 2 and not in_outro:
                    continue
                m = notes[1 + motif[(k + c) % len(motif)] % 4] + 12 + (12 if in_outro and k % 2 else 0)
                f = note_freq(m)
                tp = t_axis(2.6)
                tone = sum(
                    a * np.sin(2 * np.pi * f * h * tp) * env(tp.size, 0.004, 1.1 / h)
                    for h, a in ((1, 1.0), (2, 0.4), (3, 0.16), (4, 0.07))
                )
                pan = 0.35 * np.sin(k * 1.9 + c)
                add(wet, start + b * beat, tone, 0.060 * (1 - pan), 0.060 * (1 + pan))

        # Schlagwerk: weiche Kick auf 1 und 3, Ticken auf Sechzehnteln
        if energy >= 0.95:
            kick = chirp(110, 44, 0.4, curve=9) * env(int(0.4 * SR), 0.003, 0.13)
            for b in range(8):
                if b % 2 == 0:
                    add(dry, start + b * beat, kick, 0.26, 0.26)
        if energy >= 0.6 and not in_outro:
            tick = highpass(noise(0.03), 6000) * env(int(0.03 * SR), 0.0004, 0.006)
            for k in range(32):
                amp = 0.030 if k % 4 else 0.055
                add(dry, start + k * beat / 4, tick, amp * energy, amp * energy * 1.2)

        # Übergang in neue Abschnitte: tiefer Schlag
        if c % 4 == 0 and c > 0:
            add(dry, start, impact()[:, 0], 0.12, 0.12)
        c += 1

    mix = dry + reverb(wet, IR_LONG, 0.55)
    mix = np.tanh(mix * 1.15)
    t = np.arange(n) / SR
    fade = np.clip(t / 2.5, 0, 1) * np.clip((seconds - t) / 6.0, 0, 1)
    return normalize(mix * fade[:, None], 0.8)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--length", type=float, default=280.0)
    parser.add_argument("--outro-at", type=float, default=250.0)
    args = parser.parse_args()

    print("Erzeuge Soundeffekte ...")
    write_wav("whoosh", whoosh(0.8, 0.55, 240, 3600))
    write_wav("whoosh-soft", whoosh(0.55, 0.6, 200, 1800), peak=0.7)
    write_wav("whoosh-long", whoosh(1.5, 0.6, 160, 2600, air=0.2), peak=0.75)
    write_wav("pop", pop(1100, 420))
    write_wav("pop-low", pop(620, 240))
    write_wav("impact", impact())
    write_wav("drop", sub_drop())
    write_wav("stamp", stamp())
    write_wav("click", click(), peak=0.6)
    write_wav("counter", counter_roll(), peak=0.6)
    write_wav("riser", riser(), peak=0.75)
    write_wav("swell", swell(), peak=0.7)
    write_wav("ding", bell([880.0, 1318.5]), peak=0.7)
    write_wav("chime", bell([587.3, 880.0, 1174.7, 1760.0], decay=1.3), peak=0.7)
    write_wav("glitch", glitch(), peak=0.6)
    write_wav("clunk", clunk(), peak=0.75)
    write_wav("alarm", alarm(), peak=0.6)
    write_wav("scribble", scribble(), peak=0.5)
    write_wav("heartbeat", heartbeat(), peak=0.8)

    print(f"Erzeuge Musik ({args.length:.0f} s, Auflösung ab {args.outro_at:.0f} s) ...")
    MUSIC.parent.mkdir(parents=True, exist_ok=True)
    tmp = MUSIC.with_suffix(".wav")
    wavfile.write(tmp, SR, (music(args.length, args.outro_at) * 32767).astype(np.int16))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "160k", str(MUSIC)],
        check=True,
    )
    tmp.unlink()
    print(f"  music {MUSIC.name}")


if __name__ == "__main__":
    main()
