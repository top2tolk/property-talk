#!/usr/bin/env python3
"""Check that every core/lang/<code>.json has the same structure as en.json.
   python3 tools/check_packs.py [code ...]     (default: all packs found)"""
import json, os, sys, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = os.path.join(ROOT, "core", "lang")
SRC = json.load(open(os.path.join(L, "en.json"), encoding="utf-8"))
TH = json.load(open(os.path.join(L, "th.json"), encoding="utf-8"))
LANGS = ["th", "en", "zh", "ru", "de", "fr", "ja", "ko"]
THAI = re.compile(r"[฀-๿]")

def check(code):
    errs = []
    p = os.path.join(L, code + ".json")
    if not os.path.exists(p):
        return ["file missing"]
    try:
        d = json.load(open(p, encoding="utf-8"))
    except Exception as e:
        return ["invalid JSON: %s" % e]
    for k in ("code", "label", "bcp"):
        if not d.get(k):
            errs.append("missing " + k)
    if d.get("code") != code:
        errs.append("code field must be %r" % code)
    if set(d.get("origin", {})) != set(LANGS):
        errs.append("origin must have keys %s" % LANGS)
    if code != "th":
        ui = d.get("ui", {})
        miss = [k for k in SRC["ui"] if k not in ui]
        if miss: errs.append("ui missing %d keys, e.g. %r" % (len(miss), miss[0]))
        for k, v in ui.items():
            if not isinstance(v, str) or not v.strip():
                errs.append("ui empty value for %r" % k)
            elif code != "th" and THAI.search(v) and code != "th":
                errs.append("ui value still contains Thai: %r" % k)
        extra = [k for k in ui if k not in SRC["ui"]]
        if extra: errs.append("ui has unknown keys, e.g. %r" % extra[0])
    if set(d.get("cats", {})) != set(SRC["cats"]): errs.append("cats keys differ")
    if set(d.get("turns", {})) != set(SRC["turns"]): errs.append("turns keys differ")
    else:
        for k, t in d["turns"].items():
            if not t.get("q") or len(t.get("r", [])) != 5 or not all(t["r"]): errs.append("turn %s incomplete" % k)
    for f in ("react", "pairs", "demo"):
        if len(d.get(f, [])) != len(SRC[f]) or not all(d.get(f, [])): errs.append("%s must have %d non-empty items" % (f, len(SRC[f])))
    if code not in ("en",):
        g = d.get("gloss", {})
        miss = [k for k in TH["gloss"] if k not in g or not str(g[k]).strip()]
        if miss: errs.append("gloss missing %d words, e.g. %r" % (len(miss), miss[0]))
    return errs

codes = sys.argv[1:] or [c for c in LANGS if os.path.exists(os.path.join(L, c + ".json"))]
bad = 0
for c in codes:
    e = check(c)
    print(("OK   " if not e else "FAIL ") + c)
    for x in e[:8]: print("     -", x)
    bad += bool(e)
sys.exit(1 if bad else 0)
