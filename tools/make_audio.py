#!/usr/bin/env python3
"""Generate the mp3 files for every line the client and the sample replies speak, in all 8 languages (core/lang/*.json).

Two engines (choose with TTS_ENGINE):
  edge    (default) free neural voices from Microsoft Edge read-aloud, no key, no account. Run it on GitHub Actions.
  openai  paid, needs OPENAI_API_KEY.
Files are written to core/audio/<lang>/... (client lines per voice f/m, sample replies once) and existing files are skipped.

  python3 tools/make_audio.py --dry-run     # list what would be made, count characters, no key needed
  python3 tools/make_audio.py               # make the missing files
  python3 tools/make_audio.py --force       # remake everything (after changing voices or wording)
  python3 tools/make_audio.py --only zh/    # only ids that start with this text (here: Chinese)

Settings can be changed with environment variables (check the provider docs for current model and voice names):
  OPENAI_TTS_MODEL   default gpt-4o-mini-tts
  PT_VOICES          JSON such as {"f":"nova","m":"onyx","agent":"alloy"}
"""
import argparse
import asyncio
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGDIR = os.path.join(ROOT, "core", "lang")
LANGS = ["th", "en", "zh", "ru", "de", "fr", "ja", "ko"]
OUT = os.path.join(ROOT, "core", "audio")
URL = "https://api.openai.com/v1/audio/speech"
DEFAULT_VOICES = {"f": "nova", "m": "onyx", "agent": "alloy"}
EDGE_VOICES = {
    "th": {"f": "th-TH-PremwadeeNeural", "m": "th-TH-NiwatNeural"},
    "en": {"f": "en-US-JennyNeural", "m": "en-US-GuyNeural"},
    "zh": {"f": "zh-CN-XiaoxiaoNeural", "m": "zh-CN-YunxiNeural"},
    "ru": {"f": "ru-RU-SvetlanaNeural", "m": "ru-RU-DmitryNeural"},
    "de": {"f": "de-DE-KatjaNeural", "m": "de-DE-ConradNeural"},
    "fr": {"f": "fr-FR-DeniseNeural", "m": "fr-FR-HenriNeural"},
    "ja": {"f": "ja-JP-NanamiNeural", "m": "ja-JP-KeitaNeural"},
    "ko": {"f": "ko-KR-SunHiNeural", "m": "ko-KR-InJoonNeural"},
}
INSTRUCTIONS = "Speak naturally in {lang}, in a warm, clear, conversational tone at a moderate pace, like a real native speaker talking about property."


def jobs(voices):
    out = []
    for code in LANGS:
        path = os.path.join(LANGDIR, code + ".json")
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            p = json.load(f)
        label = p["label"]
        for tid, t in p["turns"].items():
            for g in ("f", "m"):
                out.append(("%s/%s/%s-q" % (code, g, tid), t["q"], g, label))
            for i, r in enumerate(t["r"]):
                out.append(("%s/%s-r%d" % (code, tid, i), r, "agent", label))
        for i, r in enumerate(p["react"]):
            for g in ("f", "m"):
                out.append(("%s/%s/react-%d" % (code, g, i), r, g, label))
    return out


def speak(text, voice, model, key, label="English"):
    body = {"model": model, "voice": voice, "input": text, "response_format": "mp3"}
    if model.startswith("gpt-4o"):
        body["instructions"] = INSTRUCTIONS.format(lang=label)
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def write(id_, audio):
    path = os.path.join(OUT, id_ + ".mp3")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(audio)


def run_edge(todo):
    """Free Microsoft neural voices through the edge-tts package (pip install edge-tts). No key needed."""
    import edge_tts

    async def one(sem, n, total, id_, text, kind, label, failed):
        code = id_.split("/")[0]
        voice = EDGE_VOICES[code]["f" if kind == "f" else "m"]
        async with sem:
            for attempt in range(4):
                try:
                    comm = edge_tts.Communicate(text, voice, rate="-4%")
                    buf = bytearray()
                    async for chunk in comm.stream():
                        if chunk["type"] == "audio":
                            buf += chunk["data"]
                    if len(buf) < 500:
                        raise RuntimeError("empty audio")
                    write(id_, bytes(buf))
                    print("[%d/%d] %s" % (n, total, id_))
                    return
                except Exception as e:
                    print("  %s failed (%s): %s" % (id_, type(e).__name__, str(e)[:100]))
                    await asyncio.sleep(2 * (attempt + 1))
            failed.append(id_)

    async def go():
        sem = asyncio.Semaphore(4)
        failed = []
        await asyncio.gather(*[one(sem, n, len(todo), *j, failed) for n, j in enumerate(todo, 1)])
        return failed

    return asyncio.run(go())


def run_openai(todo, voices, model):
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        sys.exit("OPENAI_API_KEY is not set")
    failed = []
    for n, (id_, text, kind, label) in enumerate(todo, 1):
        for attempt in range(3):
            try:
                write(id_, speak(text, voices[kind], model, key, label))
                print("[%d/%d] %s" % (n, len(todo), id_))
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode("utf-8", "replace")[:200]
                print("  %s failed (%s): %s" % (id_, e.code, msg))
                if e.code in (401, 403):
                    sys.exit("The key was refused. Check the key and that billing is on.")
                time.sleep(2 * (attempt + 1))
            except Exception as e:
                print("  %s failed: %s" % (id_, e))
                time.sleep(2 * (attempt + 1))
        else:
            failed.append(id_)
        time.sleep(0.2)
    return failed


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", default="")
    a = ap.parse_args()

    voices = dict(DEFAULT_VOICES)
    if os.environ.get("PT_VOICES"):
        voices.update(json.loads(os.environ["PT_VOICES"]))
    model = os.environ.get("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    engine = os.environ.get("TTS_ENGINE", "edge")

    todo = [j for j in jobs(voices) if j[0].startswith(a.only)]
    if not a.force:
        todo = [j for j in todo if not os.path.exists(os.path.join(OUT, j[0] + ".mp3"))]

    chars = sum(len(j[1]) for j in todo)
    print("%d files to make, %d characters, engine=%s" % (len(todo), chars, engine))
    if a.dry_run:
        for i, t, v, _l in todo[:8]:
            print("  %-22s %-6s %s" % (i, v, t[:50]))
        if len(todo) > 8:
            print("  ...")
        return

    failed = run_edge(todo) if engine == "edge" else run_openai(todo, voices, model)
    if failed:
        sys.exit("failed: %d files, e.g. %s  (run again to retry only these)" % (len(failed), ", ".join(failed[:5])))
    print("done")


if __name__ == "__main__":
    main()
