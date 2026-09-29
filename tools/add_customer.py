#!/usr/bin/env python3
"""Create a customer copy of Property Talk.

Each customer gets a small folder under customers/<slug>/ that loads the shared app in core/.
Updating core/ updates every customer at once.

Examples
  python3 tools/add_customer.py somchai --name "คุณสมชาย"
  python3 tools/add_customer.py demo --no-code --interp --credit --name "ทดลองใช้"
  python3 tools/add_customer.py somchai --force        # issue a new code for an existing customer
"""
import argparse
import hashlib
import os
import re
import secrets
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O/1/I so codes are easy to read out

TEMPLATE = """<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>@@PRODUCT@@</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600&display=swap">
<link rel="stylesheet" href="../../core/style.css">
</head>
<body>
<div class="wrap">
  <header class="top">
    <div>
      <h1 id="ptitle">@@PRODUCT@@</h1>
      <p class="muted small" id="psub"></p>
    </div>
    <button class="pill" id="pill" data-act="tab" data-tab="credit" aria-label="ดูเครดิตคงเหลือ" hidden><span class="dot" id="pdot"></span><span id="ptxt">เครดิต</span></button>
  </header>
  <main id="app"></main>
</div>
<nav class="tabs" id="nav" aria-label="เมนูหลัก"></nav>
<div id="toast" hidden role="status"></div>
<div id="big" hidden></div>
<script src="config.js"></script>
<script src="../../core/app.js"></script>
</body>
</html>
"""

CONFIG = """window.PT_CONFIG = {
  slug: "@@SLUG@@",
  product: "@@PRODUCT@@",
  customerName: "@@NAME@@",
  codeHash: "@@HASH@@",
  features: { interp: @@INTERP@@, credit: @@CREDIT@@ },
  audioBase: "../../core/audio/",
  contentUrl: "../../core/content.json"
};
"""


def js_str(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", help="folder name: lowercase letters, digits, hyphens")
    ap.add_argument("--name", default="", help="customer name shown under the title")
    ap.add_argument("--product", default="Property Talk")
    ap.add_argument("--code", help="use this access code instead of a random one")
    ap.add_argument("--no-code", action="store_true", help="no access code (demo only)")
    ap.add_argument("--interp", action="store_true", help="turn on the live interpreter tab (demo phrases only)")
    ap.add_argument("--credit", action="store_true", help="turn on the credit tab (simulation only)")
    ap.add_argument("--force", action="store_true", help="overwrite an existing customer folder")
    a = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{1,40}", a.slug):
        sys.exit("slug must be 2-41 chars: lowercase letters, digits, hyphens")
    folder = os.path.join(ROOT, "customers", a.slug)
    if os.path.exists(folder) and not a.force:
        sys.exit("customers/%s already exists (use --force to replace it and issue a new code)" % a.slug)

    code = None
    digest = ""
    if not a.no_code:
        code = (a.code or "".join(secrets.choice(ALPHA) for _ in range(8))).strip().upper()
        if len(code) < 8:
            sys.exit("code must be at least 8 characters")
        digest = hashlib.sha256((a.slug + ":" + code).encode("utf-8")).hexdigest()

    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, "index.html"), "w", encoding="utf-8") as f:
        f.write(TEMPLATE.replace("@@PRODUCT@@", a.product))
    cfg = (CONFIG.replace("@@SLUG@@", a.slug)
                 .replace("@@PRODUCT@@", js_str(a.product))
                 .replace("@@NAME@@", js_str(a.name))
                 .replace("@@HASH@@", digest)
                 .replace("@@INTERP@@", "true" if a.interp else "false")
                 .replace("@@CREDIT@@", "true" if a.credit else "false"))
    with open(os.path.join(folder, "config.js"), "w", encoding="utf-8") as f:
        f.write(cfg)

    print("created customers/%s/" % a.slug)
    print("link path : customers/%s/" % a.slug)
    if code:
        print("access code: %s   (send this to the customer; it is NOT stored anywhere in the repo)" % code)
    else:
        print("access code: none (anyone with the link can open it)")


if __name__ == "__main__":
    main()
