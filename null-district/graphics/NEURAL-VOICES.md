# 1.20 — neural dialogue and cohesive story

The ten-shot opening now lasts 133.069 seconds with 21 original spoken lines. The script establishes the soul network, the courier's fatal crash and restoration debt, Vesper's murder and confinement, why she planted Mournfang in a courier package, who is on the midnight blacklist and how each district contributes to stopping the transfer. Conversations use direct questions and answers. The receipt now displays the date of death and restoration debt, matching the spoken reveal.

## Cast and delivery

| Character | Kokoro stock voice | Language | Speed |
| --- | --- | --- | --- |
| Courier 09 | am_michael | en-US | 1.02 |
| Vesper | af_heart | en-US | 1.02 |
| Sable Customer Care | bf_emma | en-GB | 1.00 |
| Ash Regent | bm_george | en-GB | 0.94 |

Every old voice file is replaced. Light EQ keeps the voices clear; Vesper and the Regent receive restrained short reverb. No pitch shifting, telephone-band filtering or heavy distortion is applied. Each clip is normalized to -18 LUFS with a -2 dB true-peak target before encoding to mono 24 kHz Vorbis quality 5. Decoded sample peaks are below 0.86, with no silent clips. Encoded-container and decoded lengths differ by less than 0.1 seconds; the timeline uses the container lengths, with additional cue gaps. Captions, mouth animation and playback cues follow the generated clips. Pausing, replay, skipping and offline playback remain.

Only the finished Ogg audio ships. There is no model, Python interpreter, neural runtime, cloud API or voice-service dependency inside the game. Voices are synthesized with stock presets rather than cloned from a requested person; the fictional roles and dialogue are original.

## Rebuild

Create a Python 3.12 virtual environment and install `kokoro-onnx==0.5.0` and `soundfile==0.14.0`; FFmpeg/FFprobe must be available. The tested ONNX Runtime was 1.31.1. Download the official model and voice bank into a local build-only directory:

- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx
- https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin

Run `python null-district/tools/render-prologue-voices.py --model-dir /path/to/models` from the repository root. The script limits CPU threads, adapts kokoro-onnx 0.5.0's speed input to this model's float export (preserving fractional speeds), renders all clips, writes their actual encoded timings and saves a transcript/hash manifest. It does not download models automatically. The pronunciation aliases for Mournfang, Rainline and Shin-Kuro affect synthesis only; captions retain the correct names.

The engine is MIT-licensed; the official project identifies the model as Apache 2.0. Model, voice-bank and output hashes plus cast settings are in `audio/prologue/voice-manifest.json`. The build uses the official Kokoro v1.0 export; no model weights are included in the repository or executable. See the accompanying notice for source links and the engine attribution.

## Checks

`tests/voices.mjs` detects stale audio after screenplay edits by matching every line's text, speaker, duration and Ogg hash to the manifest. Waveform checks verify 24 kHz mono, non-silent audio, safe peaks and replacement of all nineteen previous clips. Full renderer playback checks all ten shots, 21 voice starts, timing, captions, pause/mute/skip, resource cleanup and the natural final-title state. The packaged desktop test decodes the same voices offline and checks gameplay handoff. Windows is cross-built and archive-verified; application execution tests run on Linux.
