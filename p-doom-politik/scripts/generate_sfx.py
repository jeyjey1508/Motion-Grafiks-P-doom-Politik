#!/usr/bin/env python3
"""Synthetisiert Soundeffekte und eine Hintergrundmusik (keine Fremdlizenzen).

Aufruf (im Projektordner):
    pip install numpy scipy
    python3 scripts/generate_sfx.py

Ergebnis:
    public/audio/sfx/*.wav     kurze Effekte (Whoosh, Pop, Impact, ...)
    public/audio/music/bed.mp3 ruhiger, treibender Musik-Teppich (200 s)

Alles ist deterministisch (fester Zufalls-Seed): gleiche Eingabe, gleiche Dateien.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "public" / "audio" / "sfx"
MUSIC_DIR = ROOT / "public" / "audio" / "music"
SR = 44100
RNG = np.random.default_rng(2024)


# ---------------------------------------------------------------- helpers ---


def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def noise(seconds: float) -> np.ndarray:
    return RNG.standard_normal(int(seconds * SR))


def bandpass(x: np.ndarray, lo: float, hi: float, order: int = 2) -> np.ndarray:
    sos = butter(order, [lo, hi], btype="bandpass", fs=SR, output="sos")
    return sosfilt(sos, x)


def lowpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, cutoff, btype="lowpass", fs=SR, output="sos")
    return sosfilt(sos, x)


def highpass(x: np.ndarray, cutoff: float, order: int = 2) -> np.ndarray:
    sos = butter(order, cutoff, btype="highpass", fs=SR, output="sos")
    return sosfilt(sos, x)


def chirp(f0: float, f1: float, seconds: float, curve: float = 3.0) -> np.ndarray:
    """Sinus mit exponentiell fallender/steigender Frequenz."""
    t = t_axis(seconds)
    k = np.exp(-curve * t / seconds)
    freq = f1 + (f0 - f1) * k
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase)


def sweep_filter(x: np.ndarray, centers: np.ndarray, q: float = 1.2) -> np.ndarray:
    """Zeitvariabler Bandpass: Mischung vorgefilterter Bänder entlang `centers`."""
    bands = np.geomspace(150, 6000, 14)
    filtered = []
    for fc in bands:
        bw = fc / q
        filtered.append(bandpass(x, max(30, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2)))
    filtered = np.stack(filtered)
    pos = np.interp(np.log(centers), np.log(bands), np.arange(len(bands)))
    lo = np.floor(pos).astype(int).clip(0, len(bands) - 2)
    frac = pos - lo
    idx = np.arange(x.size)
    return filtered[lo, idx] * (1 - frac) + filtered[lo + 1, idx] * frac


def env_adsr(n: int, attack: float, release: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    r = np.exp(-np.maximum(t - attack, 0) / max(release, 1e-4))
    return a * r


def normalize(x: np.ndarray, peak: float = 0.89) -> np.ndarray:
    m = np.max(np.abs(x))
    return x if m == 0 else x / m * peak


def to_stereo(x: np.ndarray, pan: np.ndarray | float = 0.0) -> np.ndarray:
    pan = np.asarray(pan)
    left = np.cos((pan + 1) * np.pi / 4)
    right = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * left, x * right], axis=1)


def fade_edges(x: np.ndarray, ms: float = 4) -> np.ndarray:
    n = int(SR * ms / 1000)
    ramp = np.linspace(0, 1, n)
    x = x.copy()
    x[:n] *= ramp[:, None] if x.ndim == 2 else ramp
    x[-n:] *= ramp[::-1][:, None] if x.ndim == 2 else ramp[::-1]
    return x


def write_wav(name: str, x: np.ndarray, peak: float = 0.89) -> None:
    x = fade_edges(normalize(x, peak))
    if x.ndim == 1:
        x = to_stereo(x)
    SFX_DIR.mkdir(parents=True, exist_ok=True)
    wavfile.write(SFX_DIR / f"{name}.wav", SR, (x * 32767).astype(np.int16))
    print(f"  sfx  {name}.wav  {x.shape[0] / SR:.2f} s")


# -------------------------------------------------------------------- sfx ---


def whoosh(seconds: float, peak_at: float, f_lo: float, f_hi: float) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / n
    # Hüllkurve: weich an, kurz nach dem Höhepunkt schnell aus
    env = np.where(t < peak_at, (t / peak_at) ** 2.2, np.exp(-(t - peak_at) * 9))
    centers = np.where(
        t < peak_at,
        f_lo * (f_hi / f_lo) ** (t / peak_at),
        f_hi * (f_lo * 1.6 / f_hi) ** ((t - peak_at) / (1 - peak_at)),
    )
    body = sweep_filter(noise(seconds), centers) * env
    air = highpass(noise(seconds), 4000) * env * 0.12
    pan = np.interp(t, [0, 1], [-0.7, 0.7])
    return to_stereo(body + air, pan)


def pop(f0: float, f1: float) -> np.ndarray:
    seconds = 0.14
    tone = chirp(f0, f1, seconds, curve=6)
    env = env_adsr(tone.size, 0.002, 0.035)
    click = highpass(noise(seconds), 2500) * env_adsr(tone.size, 0.0005, 0.004) * 0.25
    return tone * env + click


def impact() -> np.ndarray:
    seconds = 1.8
    boom = chirp(120, 38, seconds, curve=7) * env_adsr(int(seconds * SR), 0.003, 0.55)
    sub = np.sin(2 * np.pi * 42 * t_axis(seconds)) * env_adsr(int(seconds * SR), 0.01, 0.9) * 0.5
    crack = lowpass(noise(seconds), 2500) * env_adsr(int(seconds * SR), 0.001, 0.03) * 0.7
    tail = lowpass(noise(seconds), 400) * env_adsr(int(seconds * SR), 0.02, 0.6) * 0.25
    return np.tanh((boom + sub + crack + tail) * 1.6)


def stamp() -> np.ndarray:
    seconds = 0.45
    n = int(seconds * SR)
    thump = chirp(160, 70, seconds, curve=9) * env_adsr(n, 0.001, 0.09)
    knock = bandpass(noise(seconds), 250, 1400) * env_adsr(n, 0.001, 0.025) * 1.2
    return np.tanh((thump + knock) * 1.4)


def counter_roll() -> np.ndarray:
    seconds = 1.4
    out = np.zeros(int(seconds * SR))
    tick = highpass(noise(0.02), 3000) * env_adsr(int(0.02 * SR), 0.0003, 0.003)
    tick += np.sin(2 * np.pi * 2400 * t_axis(0.02)) * env_adsr(int(0.02 * SR), 0.0003, 0.004) * 0.6
    pos = 0.0
    gap = 0.03
    while pos < seconds - 0.03:
        i = int(pos * SR)
        amp = 0.55 + 0.45 * (1 - pos / seconds)
        out[i : i + tick.size] += tick[: out.size - i] * amp
        pos += gap
        gap *= 1.045  # wird langsamer, wie ein auslaufendes Zählwerk
    return out


def riser() -> np.ndarray:
    seconds = 2.4
    n = int(seconds * SR)
    t = np.arange(n) / n
    centers = 300 * (5000 / 300) ** (t**1.5)
    body = sweep_filter(noise(seconds), centers, q=2.0) * t**2.2
    tone = np.sin(2 * np.pi * np.cumsum(180 * (6 ** t)) / SR) * t**3 * 0.25
    return to_stereo(body + tone, np.sin(t * 6) * 0.3)


def ding() -> np.ndarray:
    seconds = 2.2
    t = t_axis(seconds)
    n = t.size
    partials = [(880, 1.0, 1.1), (1320, 0.5, 0.8), (1760, 0.3, 0.5), (2637, 0.18, 0.3)]
    out = sum(a * np.sin(2 * np.pi * f * t) * env_adsr(n, 0.002, d) for f, a, d in partials)
    return out


def glitch() -> np.ndarray:
    seconds = 0.5
    n = int(seconds * SR)
    out = np.zeros(n)
    pos = 0
    rng = np.random.default_rng(7)
    while pos < n:
        length = int(rng.uniform(0.015, 0.06) * SR)
        f = rng.choice([180, 360, 720, 1440, 2880])
        seg = np.sign(np.sin(2 * np.pi * f * np.arange(length) / SR))
        seg = np.round(seg * 4) / 4 * rng.uniform(0.3, 1.0)
        if rng.random() < 0.35:
            seg = np.zeros(length)
        out[pos : pos + length] = seg[: n - pos]
        pos += length
    return lowpass(out, 6000) * env_adsr(n, 0.002, 0.25)


# ------------------------------------------------------------------ music ---


def note_freq(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def soft_saw(freq: float, t: np.ndarray, harmonics: int = 10, bright: float = 3.2) -> np.ndarray:
    out = np.zeros_like(t)
    for h in range(1, harmonics + 1):
        out += np.sin(2 * np.pi * freq * h * t) / h * np.exp(-h / bright)
    return out


def music(seconds: float = 200.0) -> np.ndarray:
    bpm = 100
    beat = 60 / bpm
    bar = beat * 4
    n = int(seconds * SR)
    t = np.arange(n) / SR
    left = np.zeros(n)
    right = np.zeros(n)

    # Dm – Bb – F – C, je zwei Takte
    chords = [
        [50, 53, 57, 62],  # Dm
        [46, 50, 53, 58],  # Bb
        [53, 57, 60, 65],  # F
        [48, 52, 55, 60],  # C
    ]
    chord_len = bar * 2
    n_chords = int(np.ceil(seconds / chord_len))

    for c in range(n_chords):
        notes = chords[c % 4]
        start = c * chord_len
        s0 = max(0, int((start - 0.3) * SR))
        s1 = min(n, int((start + chord_len + 0.8) * SR))
        if s0 >= n:
            break
        tt = t[s0:s1] - start
        env = np.clip((tt + 0.3) / 0.6, 0, 1) * np.clip((chord_len + 0.8 - tt) / 1.1, 0, 1)
        bright = 2.4 + 0.8 * np.sin(2 * np.pi * (start / 40))
        for i, m in enumerate(notes):
            f = note_freq(m + 12)
            a = soft_saw(f * 1.0015, tt, bright=bright) + soft_saw(f * 0.9985, tt, bright=bright)
            gain = 0.06 * env
            left[s0:s1] += a * gain * (0.8 if i % 2 else 1.0)
            right[s0:s1] += a * gain * (1.0 if i % 2 else 0.8)

        # Bass: Grundton, Achtel mit "Sidechain"-Atmen
        root = note_freq(notes[0] - 12)
        b0, b1 = int(start * SR), min(n, int((start + chord_len) * SR))
        if b0 < n and start >= bar * 4:
            tb = t[b0:b1] - start
            pulse = 1 - 0.75 * np.exp(-((tb % (beat / 2)) / 0.06))
            bass = (np.sin(2 * np.pi * root * tb) + 0.25 * np.sin(4 * np.pi * root * tb)) * pulse
            left[b0:b1] += bass * 0.16
            right[b0:b1] += bass * 0.16

        # Arpeggio ab Takt 9
        if start >= bar * 8:
            step = beat / 4
            pattern = [0, 2, 1, 3, 2, 1, 3, 2]
            k = 0
            pos = start
            while pos < start + chord_len and pos < seconds - 0.3:
                m = notes[pattern[k % len(pattern)]] + 24
                f = note_freq(m)
                p0 = int(pos * SR)
                length = int(0.28 * SR)
                tp = np.arange(length) / SR
                tone = (np.sin(2 * np.pi * f * tp) + np.sin(2 * np.pi * 3 * f * tp) / 9)
                tone *= env_adsr(length, 0.003, 0.09) * 0.045
                for delay, fb, side in [(0, 1.0, 0), (beat * 0.75, 0.35, 1), (beat * 1.5, 0.15, 0)]:
                    d0 = p0 + int(delay * SR)
                    if d0 + length >= n:
                        continue
                    if side == 0:
                        left[d0 : d0 + length] += tone * fb
                        right[d0 : d0 + length] += tone * fb * 0.7
                    else:
                        right[d0 : d0 + length] += tone * fb
                        left[d0 : d0 + length] += tone * fb * 0.7
                pos += step
                k += 1

    # Kick ab Takt 5 (vierviertel), alle 16 Takte ein Takt Pause
    kick_len = int(0.35 * SR)
    kick = chirp(130, 48, 0.35, curve=10) * env_adsr(kick_len, 0.002, 0.12)
    hat_len = int(0.05 * SR)
    hat = highpass(noise(0.05), 7000) * env_adsr(hat_len, 0.0005, 0.012)
    total_beats = int(seconds / beat)
    for b in range(total_beats):
        pos = b * beat
        bar_index = b // 4
        if bar_index < 4 or bar_index % 16 == 15:
            continue
        p0 = int(pos * SR)
        if p0 + kick_len < n:
            left[p0 : p0 + kick_len] += kick * 0.32
            right[p0 : p0 + kick_len] += kick * 0.32
        if bar_index >= 8:
            h0 = int((pos + beat / 2) * SR)
            if h0 + hat_len < n:
                left[h0 : h0 + hat_len] += hat * 0.05
                right[h0 : h0 + hat_len] += hat * 0.06

    mix = np.stack([left, right], axis=1)
    mix = np.tanh(mix * 1.2)
    # sanftes Ein- und Ausblenden der Datei
    fade_in = np.clip(t / 2.0, 0, 1)[:, None]
    fade_out = np.clip((seconds - t) / 4.0, 0, 1)[:, None]
    return normalize(mix * fade_in * fade_out, 0.8)


def main() -> None:
    print("Erzeuge Soundeffekte ...")
    write_wav("whoosh", whoosh(0.75, 0.55, 250, 3500))
    write_wav("whoosh-soft", whoosh(0.5, 0.6, 200, 1800), peak=0.7)
    write_wav("pop", pop(1100, 420))
    write_wav("pop-low", pop(620, 240))
    write_wav("impact", impact())
    write_wav("stamp", stamp())
    write_wav("counter", counter_roll(), peak=0.6)
    write_wav("riser", riser(), peak=0.75)
    write_wav("ding", ding(), peak=0.7)
    write_wav("glitch", glitch(), peak=0.6)

    print("Erzeuge Musik ...")
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    tmp = MUSIC_DIR / "bed.wav"
    wavfile.write(tmp, SR, (music() * 32767).astype(np.int16))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "160k", str(MUSIC_DIR / "bed.mp3")],
        check=True,
    )
    tmp.unlink()
    print("  music bed.mp3")


if __name__ == "__main__":
    main()
