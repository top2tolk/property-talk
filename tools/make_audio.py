#!/usr/bin/env python3
"""Generate the mp3 files for every English line in core/content.json.

Needs an API key in the environment:  OPENAI_API_KEY
Files are written to core/audio/<line-id>.mp3 and existing files are skipped.

  python3 tools/make_audio.py --dry-run     # list what would be made, count characters, no key needed
  python3 tools/make_audio.py               # make the missing files
  python3 tools/make_audio.py --force       # remake everything (after changing voices or wording)
  python3 tools/make_audio.py --only home-  # only ids that start with this text

Settings can be changed with environment variables (check the provider docs for current model and voice names):
  OPENAI_TTS_MODEL   default gpt-4o-mini-tts
  PT_VOICES          JSON such as {"carol":"nova","lars":"onyx","tom":"echo","agent":"alloy"}
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "core", "content.json")
OUT = os.path.join(ROOT, "core", "audio")
URL = "https://api.openai.com/v1/audio/speech"
DEFAULT_VOICES = {"carol": "nova", "lars": "onyx", "tom": "echo", "agent": "alloy"}
INSTRUCTIONS = "Speak naturally in a warm, clear, conversational tone at a moderate pace, like a real person talking about property."


def jobs(voices):
    with open(CONTENT, encoding="utf-8") as f:
        data = json.load(f)
    out = []
    for cat in data["cats"]:
        for t in cat["turns"]:
            out.append((t["id"] + "-q", t["en"], voices.get(cat["char"], voices["agent"])))
            for i, r in enumerate(t["r"]):
                out.append((t["id"] + "-r%d" % i, r[0], voices["agent"]))
    return out


def speak(text, voice, model, key):
    body = {"model": model, "voice": voice, "input": text, "response_format": "mp3"}
    if model.startswith("gpt-4o"):
        body["instructions"] = INSTRUCTIONS
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode("utf-8"),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


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

    todo = [j for j in jobs(voices) if j[0].startswith(a.only)]
    if not a.force:
        todo = [j for j in todo if not os.path.exists(os.path.join(OUT, j[0] + ".mp3"))]

    chars = sum(len(t) for _, t, _ in todo)
    print("%d files to make, %d characters, model=%s" % (len(todo), chars, model))
    if a.dry_run:
        for i, t, v in todo[:8]:
            print("  %-14s %-6s %s" % (i, v, t[:60]))
        if len(todo) > 8:
            print("  ...")
        return

    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        sys.exit("OPENAI_API_KEY is not set")
    os.makedirs(OUT, exist_ok=True)

    failed = []
    for n, (id_, text, voice) in enumerate(todo, 1):
        for attempt in range(3):
            try:
                audio = speak(text, voice, model, key)
                with open(os.path.join(OUT, id_ + ".mp3"), "wb") as f:
                    f.write(audio)
                print("[%d/%d] %s" % (n, len(todo), id_))
                break
            except urllib.error.HTTPError as e:
                msg = e.read().decode("utf-8", "replace")[:200]
                print("  %s failed (%s): %s" % (id_, e.code, msg))
                if e.code in (401, 403):
                    sys.exit("The key was refused. Check the key and that billing is on.")
                time.sleep(2 * (attempt + 1))
            except Exception as e:  # network hiccup
                print("  %s failed: %s" % (id_, e))
                time.sleep(2 * (attempt + 1))
        else:
            failed.append(id_)
        time.sleep(0.2)

    if failed:
        sys.exit("failed: " + ", ".join(failed) + "  (run again to retry only these)")
    print("done")


if __name__ == "__main__":
    main()
