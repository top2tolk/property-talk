#!/usr/bin/env python3
"""Bundle the demo into ONE self-contained html file (for artifact / offline preview).  python3 tools/build_preview.py out.html"""
import json, os, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(*p): return open(os.path.join(R, *p), encoding="utf-8").read()
langs = {c: json.load(open(os.path.join(R, "core", "lang", c + ".json"), encoding="utf-8")) for c in ["th","en","zh","ru","de","fr","ja","ko"]}
inline = {"base": json.load(open(os.path.join(R,"core","base.json"),encoding="utf-8")), "casts": json.load(open(os.path.join(R,"core","casts.json"),encoding="utf-8")), "lang": langs}
data = json.dumps(inline, ensure_ascii=False).replace("</", "<\\/")
html = """<title>Property Talk</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Noto+Sans+Thai:wght@400;500;600&display=swap">
<style>
""" + rd("core","style.css") + """
</style>
<div class="wrap">
  <header class="top">
    <div><h1 id="ptitle">Property Talk</h1><p class="muted small" id="psub"></p></div>
    <button class="pill" id="pill" data-act="tab" data-tab="credit" hidden><span class="dot" id="pdot"></span><span id="ptxt"></span></button>
  </header>
  <main id="app"></main>
</div>
<nav class="tabs" id="nav"></nav>
<div id="toast" hidden role="status"></div>
<div id="call" class="call" hidden></div>
<div id="big" hidden></div>
<script>
window.PT_CONFIG={slug:"demo",product:"Property Talk",customerName:"",codeHash:"",features:{interp:true,credit:true},audioBase:"about:blank#",coreBase:"./"};
window.PT_INLINE=""" + data + """;
</script>
<script>
""" + rd("core","art.js") + """
</script>
<script>
""" + rd("core","app.js") + """
</script>
"""
open(sys.argv[1], "w", encoding="utf-8").write(html)
print(len(html)//1024, "KB")
