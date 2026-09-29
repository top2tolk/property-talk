/* Property Talk art: layered portrait avatars with light and shadow, expressive faces and blurred scene backdrops.
   Everything is drawn as SVG so it stays sharp on any phone and needs no image files. */
(function (root) {
  'use strict';

  function h2r(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function r2h(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return ('0' + v.toString(16)).slice(-2); }).join(''); }
  function mix(a, b, t) { var A = h2r(a), B = h2r(b); return r2h([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var uid = 0;

  var BROWS = {
    neutral:   ['M134 176 C146 168 166 166 180 171', 'M220 171 C234 166 254 168 266 176'],
    happy:     ['M134 172 C148 162 168 160 180 166', 'M220 166 C234 160 252 162 266 172'],
    delighted: ['M134 168 C148 156 168 154 180 162', 'M220 162 C234 154 252 156 266 168'],
    thinking:  ['M134 178 C148 170 166 170 180 174', 'M220 164 C236 156 254 160 266 170'],
    concerned: ['M134 178 C150 172 166 168 180 162', 'M220 162 C234 168 250 172 266 178'],
    surprised: ['M134 164 C148 150 168 148 180 158', 'M220 158 C234 148 252 150 266 164']
  };
  var MOUTH_FOR = { neutral: 'neutral', happy: 'smile', delighted: 'grin', thinking: 'think', concerned: 'frown', surprised: 'o' };

  /* Mouth shapes. Keys: neutral smile grin think frown o a ee m */
  function mouth(ch, key) {
    var lipU = ch.lips || '#c4707a';
    var lipL = mix(lipU, '#ffffff', 0.1);
    var dark = '#2f1014';
    var tooth = '#f7f3ee';
    var line = mix(lipU, '#000000', 0.55);
    var s = '';
    if (key === 'm') key = 'neutral';
    if (key === 'neutral') {
      s += '<path d="M170 278 C184 283 216 283 230 278" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
      s += '<path d="M170 278 C182 270 192 268 200 271 C208 268 218 270 230 278 C216 281 208 282 200 282 C192 282 184 281 170 278Z" fill="' + lipU + '"/>';
      s += '<path d="M171 279 C183 292 217 292 229 279 C218 283 210 284 200 284 C190 284 182 283 171 279Z" fill="' + lipL + '"/>';
      s += '<ellipse cx="200" cy="286" rx="9" ry="2.6" fill="#fff" opacity=".22"/>';
    } else if (key === 'smile') {
      s += '<path d="M166 274 C182 288 218 288 234 274" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
      s += '<path d="M166 274 C180 268 192 266 200 269 C208 266 220 268 234 274 C218 282 210 283 200 283 C190 283 182 282 166 274Z" fill="' + lipU + '"/>';
      s += '<path d="M168 276 C182 296 218 296 232 276 C218 286 210 287 200 287 C190 287 182 286 168 276Z" fill="' + lipL + '"/>';
      s += '<ellipse cx="200" cy="290" rx="10" ry="2.8" fill="#fff" opacity=".22"/>';
    } else if (key === 'grin') {
      s += '<path d="M164 272 C182 300 218 300 236 272 C220 268 210 266 200 268 C190 266 180 268 164 272Z" fill="' + dark + '"/>';
      s += '<path d="M172 273 C186 269 214 269 228 273 L226 283 C214 280 186 280 174 283Z" fill="' + tooth + '"/>';
      s += '<path d="M180 292 C190 286 210 286 220 292 C212 298 188 298 180 292Z" fill="#c4565c" opacity=".85"/>';
      s += '<path d="M164 272 C180 266 192 264 200 267 C208 264 220 266 236 272 C220 271 210 270 200 271 C190 270 180 271 164 272Z" fill="' + lipU + '"/>';
      s += '<path d="M166 274 C182 300 218 300 234 274 C220 296 208 299 200 299 C192 299 180 296 166 274Z" fill="' + lipL + '" opacity=".95"/>';
    } else if (key === 'think') {
      s += '<path d="M172 281 C186 283 208 281 228 275" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
      s += '<path d="M172 280 C184 272 194 270 202 272 C210 270 220 271 228 275 C216 279 208 281 200 281 C192 281 184 281 172 280Z" fill="' + lipU + '"/>';
      s += '<path d="M173 281 C185 292 214 292 227 276 C216 283 208 285 200 285 C190 285 182 284 173 281Z" fill="' + lipL + '"/>';
    } else if (key === 'frown') {
      s += '<path d="M172 286 C186 277 214 277 228 286" fill="none" stroke="' + line + '" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>';
      s += '<path d="M172 284 C184 274 194 272 200 274 C206 272 216 274 228 284 C216 279 208 278 200 278 C192 278 184 279 172 284Z" fill="' + lipU + '"/>';
      s += '<path d="M174 285 C186 296 214 296 226 285 C216 290 208 291 200 291 C192 291 184 290 174 285Z" fill="' + lipL + '"/>';
    } else if (key === 'a') {
      s += '<path d="M172 276 C182 268 218 268 228 276 C226 302 212 312 200 312 C188 312 174 302 172 276Z" fill="' + dark + '"/>';
      s += '<path d="M178 275 C190 270 210 270 222 275 L220 283 C210 280 190 280 180 283Z" fill="' + tooth + '"/>';
      s += '<path d="M186 304 C192 294 208 294 214 304 C208 310 192 310 186 304Z" fill="#c4565c"/>';
      s += '<path d="M170 277 C182 268 192 266 200 269 C208 266 218 268 230 277 C218 274 208 272 200 273 C192 272 182 274 170 277Z" fill="' + lipU + '"/>';
      s += '<path d="M174 298 C184 314 216 314 226 298 C218 308 210 311 200 311 C190 311 182 308 174 298Z" fill="' + lipL + '"/>';
    } else if (key === 'o') {
      s += '<ellipse cx="200" cy="290" rx="14" ry="13" fill="' + dark + '"/>';
      s += '<ellipse cx="200" cy="284" rx="8" ry="3" fill="' + tooth + '" opacity=".9"/>';
      s += '<ellipse cx="200" cy="290" rx="14" ry="13" fill="none" stroke="' + lipU + '" stroke-width="7"/>';
      s += '<ellipse cx="196" cy="282" rx="7" ry="2.2" fill="#fff" opacity=".2"/>';
    } else if (key === 'ee') {
      s += '<path d="M167 278 C184 273 216 273 233 278 C222 294 178 294 167 278Z" fill="' + dark + '"/>';
      s += '<path d="M174 277 C188 274 212 274 226 277 L224 283 C212 281 188 281 176 283Z" fill="' + tooth + '"/>';
      s += '<path d="M166 278 C184 271 216 271 234 278 C216 275 184 275 166 278Z" fill="' + lipU + '"/>';
      s += '<path d="M168 279 C184 296 216 296 232 279 C220 291 180 291 168 279Z" fill="' + lipL + '"/>';
    }
    return s;
  }

  function eye(cx, cy, o) {
    var open = o.open || 1;
    var ry = (o.wide ? 14 : 12) * open;
    var lash = o.lash || 3;
    var s = '<g class="eye">';
    s += '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="27" ry="15" fill="' + o.skinLo + '" opacity=".25" filter="url(#f' + o.u + ')"/>';
    s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="21" ry="' + ry + '" fill="url(#ew' + o.u + ')"/>';
    if (open < 1) s += '<clipPath id="ec' + o.u + cx + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="21" ry="' + ry + '"/></clipPath><g clip-path="url(#ec' + o.u + cx + ')">';
    s += '<g class="iris"><circle cx="' + cx + '" cy="' + cy + '" r="10.6" fill="url(#ir' + o.u + ')"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="10.6" fill="none" stroke="' + mix(o.eyes, '#000000', 0.5) + '" stroke-width="1.2" opacity=".7"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4.8" fill="#08090b"/>';
    s += '<circle cx="' + (cx - 3.5) + '" cy="' + (cy - 3.5) + '" r="2.8" fill="#fff" opacity=".95"/>';
    s += '<circle cx="' + (cx + 3.5) + '" cy="' + (cy + 3.6) + '" r="1.3" fill="#fff" opacity=".55"/></g>';
    if (open < 1) s += '</g>';
    s += '<path d="M' + (cx - 22) + ' ' + (cy + 1) + ' C' + (cx - 12) + ' ' + (cy - ry - 4) + ' ' + (cx + 12) + ' ' + (cy - ry - 4) + ' ' + (cx + 22) + ' ' + (cy + 1) + '" fill="none" stroke="#15100e" stroke-width="' + lash + '" stroke-linecap="round"/>';
    s += '<path d="M' + (cx - 20) + ' ' + (cy - ry - 2) + ' C' + (cx - 10) + ' ' + (cy - ry - 11) + ' ' + (cx + 10) + ' ' + (cy - ry - 11) + ' ' + (cx + 20) + ' ' + (cy - ry - 2) + '" fill="none" stroke="' + o.skinLo + '" stroke-width="2" opacity=".55"/>';
    if (o.squint) {
      s += '<path d="M' + (cx - 23) + ' ' + (cy + 4) + ' C' + (cx - 12) + ' ' + (cy + 4 - o.squint) + ' ' + (cx + 12) + ' ' + (cy + 4 - o.squint) + ' ' + (cx + 23) + ' ' + (cy + 4) + ' C' + (cx + 14) + ' ' + (cy + 20) + ' ' + (cx - 14) + ' ' + (cy + 20) + ' ' + (cx - 23) + ' ' + (cy + 4) + 'Z" fill="' + o.skin + '"/>';
    }
    s += '<g class="lid" style="transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0)"><ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="23" ry="15" fill="' + o.skin + '"/>';
    s += '<path d="M' + (cx - 22) + ' ' + (cy + 8) + ' C' + (cx - 10) + ' ' + (cy + 15) + ' ' + (cx + 10) + ' ' + (cy + 15) + ' ' + (cx + 22) + ' ' + (cy + 8) + '" fill="none" stroke="#15100e" stroke-width="2.6" stroke-linecap="round"/></g>';
    s += '</g>';
    return s;
  }

  /* ---------- culture kit: patterns, fur, attire, hair, headwear ---------- */
  var SH = 'M0 480 C10 418 76 390 146 376 L254 376 C324 390 390 418 400 480Z';
  var rnd = function (seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; };

  function bloom(x, y, r, col, cen, n) {
    var s = '<g transform="translate(' + x + ' ' + y + ')">', i;
    n = n || 5;
    for (i = 0; i < n; i++) s += '<ellipse cx="0" cy="' + (-r) + '" rx="' + (r * 0.72) + '" ry="' + r + '" fill="' + col + '" transform="rotate(' + (i * 360 / n) + ')"/>';
    return s + '<circle r="' + (r * 0.55) + '" fill="' + cen + '"/></g>';
  }

  function pattern(kind, id, col, col2) {
    var h = '<pattern id="' + id + '" patternUnits="userSpaceOnUse" ';
    if (kind === 'diamond') {
      return h + 'width="24" height="24" patternTransform="rotate(28) scale(.7)"><path d="M12 2 L22 12 L12 22 L2 12Z" fill="none" stroke="' + col + '" stroke-width="1.4"/><path d="M12 7.5 L16.5 12 L12 16.5 L7.5 12Z" fill="' + col + '" opacity=".85"/><circle cx="0" cy="0" r="1.8" fill="' + col + '"/><circle cx="24" cy="0" r="1.8" fill="' + col + '"/><circle cx="0" cy="24" r="1.8" fill="' + col + '"/><circle cx="24" cy="24" r="1.8" fill="' + col + '"/></pattern>';
    }
    if (kind === 'floral') {
      return h + 'width="40" height="40">' + bloom(10, 10, 3.6, col, col2) + '<ellipse cx="18" cy="14" rx="2.2" ry="4.4" fill="' + col + '" opacity=".6" transform="rotate(50 18 14)"/>' + bloom(30, 30, 3.6, col, col2) + '<ellipse cx="22" cy="26" rx="2.2" ry="4.4" fill="' + col + '" opacity=".6" transform="rotate(50 22 26)"/></pattern>';
    }
    if (kind === 'medallion') {
      return h + 'width="46" height="46"><circle cx="23" cy="23" r="12" fill="none" stroke="' + col + '" stroke-width="1.6" opacity=".8"/><circle cx="23" cy="23" r="6" fill="none" stroke="' + col + '" stroke-width="1.4" opacity=".8"/><path d="M23 11V17M23 29V35M11 23H17M29 23H35" stroke="' + col + '" stroke-width="1.4" opacity=".7"/><circle cx="0" cy="0" r="2.2" fill="' + col + '" opacity=".7"/><circle cx="46" cy="0" r="2.2" fill="' + col + '" opacity=".7"/><circle cx="0" cy="46" r="2.2" fill="' + col + '" opacity=".7"/><circle cx="46" cy="46" r="2.2" fill="' + col + '" opacity=".7"/></pattern>';
    }
    if (kind === 'roses') {
      var rose = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#c92b34"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.68) + '" fill="#e8534e"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.36) + '" fill="#f7b26a"/><path d="M' + (x - r * 0.5) + ' ' + y + ' C' + x + ' ' + (y - r * 0.6) + ' ' + x + ' ' + (y + r * 0.6) + ' ' + (x + r * 0.5) + ' ' + y + '" stroke="#a51f2c" stroke-width="1" fill="none"/>'; };
      var leaf = function (x, y, a) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="3" ry="8" fill="#2f7d4a" transform="rotate(' + a + ' ' + x + ' ' + y + ')"/>'; };
      return h + 'width="64" height="64">' + leaf(14, 30, -40) + leaf(30, 12, 50) + leaf(44, 62, -40) + leaf(60, 44, 50) + rose(16, 16, 11) + rose(48, 48, 11) + '<circle cx="48" cy="12" r="3" fill="' + col + '"/><circle cx="12" cy="50" r="3" fill="' + col + '"/><circle cx="34" cy="32" r="2" fill="' + col + '"/></pattern>';
    }
    if (kind === 'sakura') {
      return h + 'width="50" height="50">' + bloom(13, 13, 4.6, '#ffffff', col) + bloom(38, 36, 4.2, '#ffe1e8', col) + '<circle cx="34" cy="10" r="1.6" fill="#fff"/><circle cx="8" cy="40" r="1.6" fill="#fff"/></pattern>';
    }
    if (kind === 'check') {
      return h + 'width="22" height="22"><rect x="0" y="0" width="11" height="22" fill="#fff" opacity=".34"/><rect x="0" y="0" width="22" height="11" fill="#fff" opacity=".34"/></pattern>';
    }
    if (kind === 'stripe') {
      return h + 'width="30" height="28"><rect x="0" y="0" width="30" height="13" fill="' + col + '"/></pattern>';
    }
    if (kind === 'dots') {
      return h + 'width="14" height="14"><circle cx="4" cy="4" r="1.7" fill="' + col + '"/><circle cx="11" cy="11" r="1.7" fill="' + col + '"/></pattern>';
    }
    if (kind === 'wool') {
      return h + 'width="8" height="8"><path d="M0 8 L8 0 M-1 1 L1 -1 M7 9 L9 7" stroke="#fff" stroke-width="1" opacity=".09"/></pattern>';
    }
    return '';
  }
  var PAT_FOR = { sabai: 'diamond', qipao: 'floral', tang: 'medallion', shawl: 'roses', coat: 'wool', tracht: 'check', breton: 'stripe', kimono: 'sakura', dirndl: 'none' };

  function fur(d, id, base, seed, x0, y0, x1, y1, n) {
    var r = rnd(seed), s = '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath><path d="' + d + '" fill="' + base + '"/><g clip-path="url(#' + id + ')" fill="none" stroke-linecap="round">', i, x, y, a, l, c;
    for (i = 0; i < n; i++) {
      x = x0 + r() * (x1 - x0); y = y0 + r() * (y1 - y0); a = (r() - 0.5) * 1.6 + 1.2; l = 6 + r() * 8;
      c = r() < 0.5 ? mix(base, '#000000', 0.35) : mix(base, '#ffffff', 0.4);
      s += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' q' + (Math.cos(a) * l * 0.5).toFixed(1) + ' ' + (Math.sin(a) * l * 0.4).toFixed(1) + ' ' + (Math.cos(a) * l).toFixed(1) + ' ' + (Math.sin(a) * l).toFixed(1) + '" stroke="' + c + '" stroke-width="2" opacity=".6"/>';
    }
    return s + '</g><path d="' + d + '" fill="none" stroke="' + mix(base, '#000000', 0.5) + '" stroke-width="1.5" opacity=".6"/>';
  }
  function btn(x, y, r, col) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '" stroke="' + mix(col, '#000000', 0.4) + '" stroke-width="1"/><circle cx="' + (x - r * 0.3) + '" cy="' + (y - r * 0.3) + '" r="' + (r * 0.35) + '" fill="#fff" opacity=".55"/>';
  }
  function knot(x, y, col) {
    return '<path d="M' + (x - 10) + ' ' + y + ' C' + (x - 10) + ' ' + (y - 6) + ' ' + (x - 3) + ' ' + (y - 6) + ' ' + x + ' ' + y + ' C' + (x - 3) + ' ' + (y + 6) + ' ' + (x - 10) + ' ' + (y + 6) + ' ' + (x - 10) + ' ' + y + 'Z M' + (x + 10) + ' ' + y + ' C' + (x + 10) + ' ' + (y - 6) + ' ' + (x + 3) + ' ' + (y - 6) + ' ' + x + ' ' + y + ' C' + (x + 3) + ' ' + (y + 6) + ' ' + (x + 10) + ' ' + (y + 6) + ' ' + (x + 10) + ' ' + y + 'Z" fill="none" stroke="' + col + '" stroke-width="2.4"/>' + btn(x, y, 3.6, col);
  }

  /* crossed collar (left panel over right): returns svg for skin V and two collar bands */
  function crossCollar(k, o) {
    var s = '';
    var v = 'M167 376 C170 398 178 416 191 432 C206 414 224 394 240 376Z';
    s += '<path d="' + v + '" fill="' + k.skin + '"/>';
    s += '<path d="M167 376 C170 398 178 416 191 432 C206 414 224 394 240 376" fill="none" stroke="' + k.skinDk + '" stroke-width="10" opacity=".13" filter="url(#f' + k.u + ')"/>';
    /* under collar (viewer's left) */
    s += '<path d="M163 372 C165 398 176 418 192 436" fill="none" stroke="' + o.band + '" stroke-width="' + o.w + '" stroke-linecap="round"/>';
    s += '<path d="M168 372 C170 396 180 414 194 431" fill="none" stroke="' + o.line + '" stroke-width="' + o.lw + '" stroke-linecap="round"/>';
    /* top collar runs from viewer's right neck down to lower left */
    s += '<path d="M244 372 C218 404 170 452 128 490" fill="none" stroke="' + o.band + '" stroke-width="' + o.w + '" stroke-linecap="round"/>';
    s += '<path d="M238 371 C212 402 166 448 124 486" fill="none" stroke="' + o.line + '" stroke-width="' + o.lw + '" stroke-linecap="round"/>';
    return s;
  }

  function attireBody(k) {
    var u = k.u, ch = k.ch, s = '', a = ch.attire, ac = k.accent, tr = k.trim, g = 'url(#jk' + u + ')';
    var base = '<path d="' + SH + '" fill="' + g + '"/>';
    var over = function () { return '<path d="' + SH + '" fill="url(#pt' + u + ')"/>'; };
    var hi = '<path d="M40 470 C60 430 100 410 130 402" stroke="#fff" stroke-width="3" fill="none" opacity=".12"/>';
    if (a === 'sabai') {
      s += base;
      s += '<path d="M158 376 C162 410 238 410 242 376Z" fill="' + k.skin + '"/>';
      s += '<path d="M158 377 C163 409 237 409 242 377" fill="none" stroke="' + ac + '" stroke-width="3"/>';
      var sash = 'M206 376 C250 376 304 386 330 400 C294 424 252 456 216 484 L84 484 C124 448 166 410 206 376Z';
      s += '<path d="' + sash + '" fill="url(#tg' + u + ')"/><path d="' + sash + '" fill="url(#pt' + u + ')" opacity=".95"/>';
      s += '<path d="M206 376 C166 410 124 448 84 484" fill="none" stroke="' + ac + '" stroke-width="5"/><path d="M330 400 C294 424 252 456 216 484" fill="none" stroke="' + ac + '" stroke-width="3" opacity=".8"/>';
      s += '<path d="M240 388 C214 420 180 452 150 480" fill="none" stroke="#000" stroke-width="10" opacity=".08"/>';
      s += hi;
    } else if (a === 'thai_jacket') {
      s += base;
      s += '<path d="M200 396 L200 490" stroke="' + k.jLo + '" stroke-width="2.4" opacity=".7"/>';
      s += '<rect x="262" y="428" width="46" height="40" rx="4" fill="none" stroke="' + k.jLo + '" stroke-width="2" opacity=".55"/><rect x="92" y="428" width="46" height="40" rx="4" fill="none" stroke="' + k.jLo + '" stroke-width="2" opacity=".55"/>';
      s += '<path d="M156 350 C172 368 228 368 244 350 L248 384 C230 400 170 400 152 384Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="1.8"/>';
      s += '<path d="M164 356 C178 370 222 370 236 356" fill="none" stroke="' + k.jLo + '" stroke-width="2" opacity=".5"/>';
      s += '<path d="M152 384 C170 400 230 400 248 384" fill="none" stroke="#000" stroke-width="6" opacity=".08" filter="url(#f' + u + ')"/>';
      s += btn(200, 378, 4.6, ac) + btn(200, 414, 5, ac) + btn(200, 440, 5, ac) + btn(200, 466, 5, ac);
      s += hi;
    } else if (a === 'qipao') {
      s += base + over();
      s += '<path d="M196 396 C176 400 156 412 148 430 L140 486" fill="none" stroke="' + tr + '" stroke-width="5" stroke-linecap="round"/>';
      s += '<path d="M196 396 C176 400 156 412 148 430 L140 486" fill="none" stroke="#fff" stroke-width="1" opacity=".3"/>';
      s += knot(184, 400, ac).replace(/M/, 'M') + knot(164, 410, ac) + knot(151, 424, ac);
      s += '<path d="M160 330 C180 346 220 346 240 330 L247 384 C226 398 174 398 153 384Z" fill="' + g + '" stroke="' + tr + '" stroke-width="4" stroke-linejoin="round"/>';
      s += '<path d="M160 330 C180 346 220 346 240 330 L247 384 C226 398 174 398 153 384Z" fill="url(#pt' + u + ')"/>';
      s += '<path d="M154 384 C174 398 226 398 246 384" fill="none" stroke="#000" stroke-width="7" opacity=".1" filter="url(#f' + u + ')"/>';
      s += btn(214, 386, 3.2, ac);
      s += hi;
    } else if (a === 'tang') {
      s += base + over();
      s += '<path d="M200 398 L200 490" stroke="' + k.jLo + '" stroke-width="2.6" opacity=".7"/>';
      s += '<path d="M156 348 C172 366 228 366 244 348 L250 384 C230 400 170 400 150 384Z" fill="' + g + '" stroke="' + tr + '" stroke-width="3.6" stroke-linejoin="round"/>';
      s += '<path d="M156 348 C172 366 228 366 244 348 L250 384 C230 400 170 400 150 384Z" fill="url(#pt' + u + ')" opacity=".8"/>';
      s += '<path d="M150 384 C170 400 230 400 250 384" fill="none" stroke="#000" stroke-width="7" opacity=".14" filter="url(#f' + u + ')"/>';
      s += knot(200, 383, ac) + knot(200, 414, ac) + knot(200, 442, ac) + knot(200, 470, ac);
      s += hi;
    } else if (a === 'shawl') {
      s += '<path d="' + SH + '" fill="' + mix(k.jacket, '#000000', 0.2) + '"/>';
      var sw = 'M0 480 C14 428 76 394 146 376 L200 452 L254 376 C324 394 386 428 400 480Z';
      s += '<path d="M156 376 L200 440 L244 376Z" fill="' + k.skin + '"/>';
      s += '<path d="M164 376 L200 430 L236 376" fill="none" stroke="' + k.skinDk + '" stroke-width="8" opacity=".14" filter="url(#f' + u + ')"/>';
      s += '<path d="' + sw + '" fill="url(#jk' + u + ')"/><path d="' + sw + '" fill="url(#pt' + u + ')"/>';
      s += '<path d="M146 376 L200 452 L254 376" fill="none" stroke="' + ac + '" stroke-width="8" stroke-linejoin="round"/><path d="M146 376 L200 452 L254 376" fill="none" stroke="#c92b34" stroke-width="2.4" stroke-linejoin="round"/>';
      s += '<path d="M60 470 C90 430 120 410 146 396 M340 470 C310 430 280 410 254 396" fill="none" stroke="#000" stroke-width="10" opacity=".14" filter="url(#f' + u + ')"/>';
      s += hi;
    } else if (a === 'coat') {
      s += base + over();
      s += '<path d="M200 400 L200 490" stroke="' + k.jLo + '" stroke-width="3" opacity=".8"/>';
      s += btn(176, 424, 6, mix(k.jacket, '#000000', .55)) + btn(224, 424, 6, mix(k.jacket, '#000000', .55)) + btn(176, 462, 6, mix(k.jacket, '#000000', .55)) + btn(224, 462, 6, mix(k.jacket, '#000000', .55));
      /* knit scarf in the V */
      s += '<path d="M168 372 L200 448 L232 372Z" fill="' + ac + '"/><path d="M180 376 L200 436 M190 376 L204 430 M212 376 L204 432 M222 376 L206 430" stroke="#000" stroke-width="2" opacity=".18"/>';
      s += '<path d="M168 372 C186 386 214 386 232 372" fill="none" stroke="#000" stroke-width="8" opacity=".15" filter="url(#f' + u + ')"/>';
      /* high collar flaps */
      var cl = 'M126 392 C118 346 136 318 166 318 C184 318 194 334 200 350 L206 380 L182 446 L130 480Z';
      s += '<path d="M134 394 C126 356 142 332 166 332 C180 334 190 346 196 360 L192 392 L172 440 L128 484Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="2"/>';
      s += '<path d="M266 394 C274 356 258 332 234 332 C220 334 210 346 204 360 L208 392 L228 440 L272 484Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="2"/>';
      s += '<path d="M134 394 C126 356 142 332 166 332 C180 334 190 346 196 360 L192 392 L172 440 L128 484Z M266 394 C274 356 258 332 234 332 C220 334 210 346 204 360 L208 392 L228 440 L272 484Z" fill="url(#pt' + u + ')"/>';
      s += '<path d="M152 348 C148 370 152 394 160 414 M248 348 C252 370 248 394 240 414" fill="none" stroke="#000" stroke-width="4" opacity=".14"/>';
      s += hi;
    } else if (a === 'dirndl') {
      /* white blouse, lace neckline, laced bodice, straps */
      s += '<path d="' + SH + '" fill="' + k.inner + '"/>';
      s += '<path d="M40 470 C60 430 100 410 130 402" stroke="#000" stroke-width="3" fill="none" opacity=".08"/>';
      s += '<path d="M150 376 C156 420 244 420 250 376Z" fill="' + k.skin + '"/>';
      var lace = '';
      for (var i = 0; i <= 12; i++) { var t = i / 12, x = 150 + 100 * t, y = 376 + 42 * 4 * t * (1 - t) * 0.98 + 4; lace += '<circle cx="' + x.toFixed(1) + '" cy="' + (y + 1).toFixed(1) + '" r="4.6" fill="#fff" stroke="#e3dccf" stroke-width="1"/>'; }
      s += '<path d="M150 376 C156 420 244 420 250 376" fill="none" stroke="#fff" stroke-width="7"/>' + lace;
      /* bodice */
      var bd = 'M92 480 C96 442 108 424 130 422 L136 442 L164 438 C176 418 190 418 200 428 C210 418 224 418 236 438 L264 442 L270 422 C292 424 304 442 308 480Z';
      
      s += '<path d="M150 380 L172 380 L166 434 L146 438Z" fill="' + g + '"/><path d="M250 380 L228 380 L234 434 L254 438Z" fill="' + g + '"/>';
      s += '<path d="M150 380 L146 438 M172 380 L166 434 M250 380 L254 438 M228 380 L234 434" stroke="' + ac + '" stroke-width="2" opacity=".9"/>';
      s += '<path d="' + bd + '" fill="' + g + '" stroke="' + ac + '" stroke-width="3" stroke-linejoin="round"/>';
      s += '<path d="M176 438 L190 428 M224 438 L210 428" stroke="' + ac + '" stroke-width="2"/>';
      /* lacing */
      s += '<path d="M200 432 L200 486" stroke="' + k.jLo + '" stroke-width="2"/>';
      for (var j = 0; j < 4; j++) { var yy = 440 + j * 11; s += '<circle cx="186" cy="' + yy + '" r="2.2" fill="' + ac + '"/><circle cx="214" cy="' + yy + '" r="2.2" fill="' + ac + '"/><path d="M186 ' + yy + ' L214 ' + (yy + 11) + ' M214 ' + yy + ' L186 ' + (yy + 11) + '" stroke="' + tr + '" stroke-width="2.2"/>'; }
      s += '<path d="' + bd + '" fill="url(#pt' + u + ')"/>';
      /* puff sleeves gathers */
      s += '<path d="M20 470 C24 430 60 410 100 404 M380 470 C376 430 340 410 300 404" stroke="#cfc6b6" stroke-width="3" fill="none"/>';
      s += '<path d="M60 470 C64 446 84 430 110 424 M340 470 C336 446 316 430 290 424" stroke="#e0d8ca" stroke-width="2.4" fill="none"/>';
    } else if (a === 'tracht') {
      s += base + over();
      s += '<path d="M166 376 L200 420 L234 376Z" fill="' + k.skin + '"/><path d="M172 376 L200 414 L228 376" fill="none" stroke="' + k.skinDk + '" stroke-width="8" opacity=".14" filter="url(#f' + u + ')"/>';
      /* braces */
      var br = 'url(#tg' + u + ')';
      s += '<path d="M148 384 L176 378 L182 490 L152 490Z" fill="' + br + '" stroke="' + mix(tr, '#000000', 0.45) + '" stroke-width="2"/><path d="M252 384 L224 378 L218 490 L248 490Z" fill="' + br + '" stroke="' + mix(tr, '#000000', 0.45) + '" stroke-width="2"/>';
      s += '<path d="M156 388 L160 486 M244 388 L240 486" stroke="' + ac + '" stroke-width="1.6" stroke-dasharray="4 4" opacity=".7"/>';
      s += '<rect x="168" y="432" width="64" height="26" rx="8" fill="' + br + '" stroke="' + mix(tr, '#000000', 0.45) + '" stroke-width="2"/>';
      s += bloom(200, 445, 4.4, '#f7f2e6', ac, 8);
      s += '<path d="M176 440 C182 436 186 452 178 452 M224 440 C218 436 214 452 222 452" fill="none" stroke="#f7f2e6" stroke-width="1.6"/>';
      /* collar */
      s += '<path d="M150 366 L192 380 L202 402 L156 392Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M250 366 L208 380 L198 402 L244 392Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="1.6" stroke-linejoin="round"/>';
      s += '<path d="M150 366 L192 380 L202 402 L156 392Z M250 366 L208 380 L198 402 L244 392Z" fill="url(#pt' + u + ')" opacity=".9"/>';
      s += hi;
    } else if (a === 'breton') {
      s += '<path d="' + SH + '" fill="' + k.jacket + '"/><path d="' + SH + '" fill="url(#pt' + u + ')"/>';
      s += '<path d="' + SH + '" fill="url(#sh' + u + ')"/>';
      if (ch.neckwear === 'kerchief') {
        s += '<path d="M164 372 C178 396 222 396 236 372Z" fill="' + k.skin + '"/>';
        s += '<path d="M160 372 C176 398 224 398 240 372" fill="none" stroke="' + k.jacket + '" stroke-width="9"/><path d="M160 372 C176 398 224 398 240 372" fill="none" stroke="' + ac + '" stroke-width="1.6" opacity=".7"/>';
        s += '<path d="M156 348 C174 364 226 364 244 348 L242 376 C224 390 176 390 158 376Z" fill="' + tr + '"/><path d="M156 348 C174 364 226 364 244 348 L242 376 C224 390 176 390 158 376Z" fill="url(#pd' + u + ')"/>';
        s += '<path d="M170 380 L230 380 L200 424Z" fill="' + tr + '"/><path d="M170 380 L230 380 L200 424Z" fill="url(#pd' + u + ')"/>';
        s += '<path d="M170 380 L230 380 L200 424Z" fill="none" stroke="#000" stroke-width="1.5" opacity=".2"/>';
        s += '<ellipse cx="200" cy="376" rx="9" ry="7" fill="' + tr + '" stroke="#000" stroke-opacity=".25" stroke-width="1.4"/>';
      } else {
        s += '<path d="M112 390 C150 418 250 418 288 390 L254 376 L146 376Z" fill="' + k.skin + '"/>';
        s += '<path d="M112 390 C150 418 250 418 288 390" fill="none" stroke="' + k.skinDk + '" stroke-width="6" opacity=".16"/>';
        s += '<path d="M108 388 C150 420 250 420 292 388" fill="none" stroke="' + k.jacket + '" stroke-width="7"/>';
        /* silk scarf knotted at the neck */
        s += '<path d="M158 344 C176 358 224 358 242 344 L246 370 C226 384 174 384 154 370Z" fill="' + tr + '"/><path d="M158 344 C176 358 224 358 242 344 L246 370 C226 384 174 384 154 370Z" fill="url(#pd' + u + ')"/>';
        s += '<path d="M154 370 C174 384 226 384 246 370" fill="none" stroke="#000" stroke-width="6" opacity=".14" filter="url(#f' + u + ')"/>';
        s += '<path d="M218 374 C232 396 244 426 240 460 L224 452 C226 424 218 400 212 380Z" fill="' + mix(tr, '#000000', 0.12) + '"/><path d="M226 372 C246 388 262 414 268 444 L252 446 C248 420 238 398 224 382Z" fill="' + tr + '"/>';
        s += '<path d="M218 374 C232 396 244 426 240 460 L224 452 C226 424 218 400 212 380Z M226 372 C246 388 262 414 268 444 L252 446 C248 420 238 398 224 382Z" fill="url(#pd' + u + ')"/>';
        s += '<ellipse cx="222" cy="374" rx="11" ry="9" fill="' + tr + '" stroke="#000" stroke-opacity=".25" stroke-width="1.4"/><ellipse cx="222" cy="374" rx="11" ry="9" fill="url(#pd' + u + ')"/>';
      }
      s += hi;
    } else if (a === 'kimono') {
      s += base + over();
      s += '<path d="M28 484 C36 448 76 418 122 400 M372 484 C364 448 324 418 278 400" fill="none" stroke="' + k.jLo + '" stroke-width="3" opacity=".5"/>';
      s += crossCollar(k, { band: mix(k.jacket, '#000000', 0.12), w: 12, line: '#f7f2ea', lw: 4.5 });
      /* obi */
      s += '<path d="M0 468 C110 456 290 456 400 468 L400 484 L0 484Z" fill="' + tr + '"/><path d="M0 468 C110 456 290 456 400 468" fill="none" stroke="' + ac + '" stroke-width="3"/>';
      s += '<path d="M0 476 C110 464 290 464 400 476" fill="none" stroke="' + ac + '" stroke-width="1.6" opacity=".6"/>';
      s += hi;
    } else if (a === 'haori') {
      s += base;
      s += '<path d="M172 376 L228 376 L232 490 L168 490Z" fill="' + k.inner + '"/>';
      s += '<path d="M172 376 L228 376 L232 490 L168 490Z" fill="none"/>';
      /* small crossed collar of the kimono inside */
      s += '<path d="M180 376 C182 392 190 404 200 414 C210 404 218 392 222 376Z" fill="' + k.skin + '"/>';
      s += '<path d="M176 374 C178 394 188 408 202 420" fill="none" stroke="#f4efe6" stroke-width="6" stroke-linecap="round"/><path d="M228 374 C212 398 190 430 174 460" fill="none" stroke="#f4efe6" stroke-width="6" stroke-linecap="round"/>';
      s += '<path d="M182 374 C184 392 192 406 202 415 M222 376 C208 396 192 418 182 434" fill="none" stroke="' + k.skin + '" stroke-width="1" opacity="0"/>';
      /* lapels */
      s += '<path d="M146 376 L176 376 C174 418 172 456 170 490 L134 490 C140 448 144 412 146 376Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="2"/><path d="M254 376 L224 376 C226 418 228 456 230 490 L266 490 C260 448 256 412 254 376Z" fill="' + k.jHi + '" stroke="' + k.jLo + '" stroke-width="2"/>';
      s += '<path d="M176 376 C174 418 172 456 170 490 M224 376 C226 418 228 456 230 490" fill="none" stroke="#000" stroke-width="6" opacity=".15" filter="url(#f' + u + ')"/>';
      /* haori himo cord */
      s += '<path d="M172 426 C188 436 212 436 228 426" fill="none" stroke="#efe9dc" stroke-width="3.4" stroke-linecap="round"/>';
      s += '<circle cx="172" cy="426" r="4.6" fill="#efe9dc"/><circle cx="228" cy="426" r="4.6" fill="#efe9dc"/>';
      s += '<path d="M200 434 C198 448 194 458 190 468 M200 434 C204 448 208 458 212 468" fill="none" stroke="#efe9dc" stroke-width="2.4" stroke-linecap="round"/><circle cx="200" cy="434" r="4" fill="#efe9dc"/>';
      /* kamon */
      s += '<circle cx="100" cy="448" r="10" fill="#f4efe6"/><circle cx="100" cy="448" r="6" fill="none" stroke="' + k.jacket + '" stroke-width="2"/><circle cx="100" cy="448" r="2" fill="' + k.jacket + '"/>';
      s += '<circle cx="300" cy="448" r="10" fill="#f4efe6"/><circle cx="300" cy="448" r="6" fill="none" stroke="' + k.jacket + '" stroke-width="2"/><circle cx="300" cy="448" r="2" fill="' + k.jacket + '"/>';
      s += '<path d="M24 484 C32 450 72 420 118 402 M376 484 C368 450 328 420 282 402" fill="none" stroke="' + k.jLo + '" stroke-width="3" opacity=".5"/>';
      s += hi;
    } else if (a === 'hanbok_f' || a === 'hanbok_m') {
      var f = a === 'hanbok_f';
      s += base;
      s += '<path d="M24 484 C34 448 76 418 124 400 M376 484 C366 448 324 418 276 400" fill="none" stroke="' + k.jLo + '" stroke-width="3" opacity=".55"/>';
      s += crossCollar(k, { band: tr, w: f ? 14 : 15, line: '#f7f2ea', lw: f ? 3.5 : 4.5 });
      if (f) {
        /* goreum ribbon */
        var rb = tr, rd = mix(tr, '#000000', 0.25);
        s += '<path d="M192 436 C186 458 178 472 168 486 L184 490 C192 474 198 458 196 440Z" fill="' + rd + '"/><path d="M194 436 C204 456 212 472 226 490 L242 484 C226 470 214 456 198 436Z" fill="' + rb + '"/>';
        s += '<path d="M192 434 C170 416 158 438 172 448 C184 454 192 446 192 434Z" fill="' + rb + '" stroke="' + rd + '" stroke-width="1.5"/><path d="M194 434 C216 418 230 438 216 448 C204 454 196 446 194 434Z" fill="' + rb + '" stroke="' + rd + '" stroke-width="1.5"/>';
        s += '<circle cx="193" cy="436" r="6.4" fill="' + rb + '" stroke="' + rd + '" stroke-width="1.5"/>';
        /* chima waist */
        s += '<path d="M0 472 C120 462 280 462 400 472 L400 484 L0 484Z" fill="' + ac + '"/><path d="M0 472 C120 462 280 462 400 472" fill="none" stroke="#f4efe6" stroke-width="3"/>';
      } else {
        s += '<path d="M191 436 C186 452 180 462 172 474 L184 478 C192 466 196 452 196 440Z" fill="' + ac + '"/><path d="M195 438 C204 452 210 464 220 476 L230 468 C220 458 210 448 199 436Z" fill="' + ac + '"/>';
        s += '<path d="M191 434 C176 424 166 440 178 446 C186 449 191 442 191 434Z M195 434 C210 424 222 440 210 446 C202 449 196 442 195 434Z" fill="' + ac + '" stroke="#b8ad98" stroke-width="1.2"/><circle cx="193" cy="436" r="5" fill="' + ac + '" stroke="#b8ad98" stroke-width="1.2"/>';
      }
      s += hi;
    } else {
      return null;
    }
    return s;
  }

  function scarfDrapes(k) {
    var u = k.u, ac = k.accent, col = k.jacket, s = '', i, x;
      var dl = 'M112 130 C100 160 96 230 100 300 C102 340 98 372 92 396 L166 396 C164 356 160 332 152 306 C142 262 138 216 132 176Z';
      var dr = 'M288 130 C300 160 304 230 300 300 C298 340 302 372 308 396 L234 396 C236 356 240 332 248 306 C258 262 262 216 268 176Z';
    s += '<path d="' + dl + '" fill="' + col + '"/><path d="' + dl + '" fill="url(#pt' + u + ')"/><path d="' + dr + '" fill="' + col + '"/><path d="' + dr + '" fill="url(#pt' + u + ')"/>';
    s += '<path d="' + dl + '" fill="url(#sh' + u + ')"/><path d="' + dr + '" fill="url(#sh' + u + ')"/>';
    s += '<path d="M132 176 C138 216 142 262 152 306 C160 332 164 356 166 396 M268 176 C262 216 258 262 248 306 C240 332 236 356 234 396" fill="none" stroke="' + ac + '" stroke-width="5"/><path d="M132 176 C138 216 142 262 152 306 C160 332 164 356 166 396 M268 176 C262 216 258 262 248 306 C240 332 236 356 234 396" fill="none" stroke="#c92b34" stroke-width="1.8"/>';
    for (i = 0; i < 9; i++) {
      x = 94 + i * 8; s += '<path d="M' + x + ' 396 L' + (x - 1 + (i % 2)) + ' 410" stroke="' + (i % 2 ? '#c92b34' : ac) + '" stroke-width="3" stroke-linecap="round"/>';
      x = 236 + i * 8; s += '<path d="M' + x + ' 396 L' + (x - 1 + (i % 2)) + ' 410" stroke="' + (i % 2 ? '#c92b34' : ac) + '" stroke-width="3" stroke-linecap="round"/>';
    }
    return s;
  }
  /* ---- hair ---- */
  var HAIR_FILL = function (u) { return 'url(#hr' + u + ')'; };
  function hairBack(k) {
    if (k.ch.hat === 'scarf') return scarfDrapes(k);
    var st = k.ch.style, f = 'url(#hr' + k.u + ')', s = '';
    var cap = '<path d="M106 194 C96 108 142 64 200 62 C258 64 304 108 294 194Z" fill="' + f + '"/>';
    if (st === 'bob') s += '<path d="M104 196 C90 110 138 58 200 58 C262 58 310 110 296 196 C304 254 296 306 272 338 C250 330 236 322 228 300 L172 300 C164 322 150 330 128 338 C104 306 96 254 104 196Z" fill="' + f + '"/>';
    else if (st === 'long') s += '<path d="M100 200 C86 110 136 58 200 58 C264 58 314 110 300 200 C312 270 308 340 300 404 C276 412 244 396 237 372 L237 300 L163 300 L163 372 C156 396 124 412 100 404 C92 340 88 270 100 200Z" fill="' + f + '"/>';
    else if (st === 'bun') s += '<ellipse cx="200" cy="52" rx="32" ry="30" fill="' + f + '"/><path d="M176 40 C186 28 208 28 222 38 M172 58 C184 44 214 44 228 56" fill="none" stroke="' + k.hairHi + '" stroke-width="2.4" opacity=".45" stroke-linecap="round"/>' + cap;
    else if (st === 'updo') s += '<ellipse cx="200" cy="34" rx="52" ry="26" fill="' + f + '"/><path d="M160 30 C180 16 224 16 244 30 M156 42 C178 26 226 26 246 42" fill="none" stroke="' + k.hairHi + '" stroke-width="2.6" opacity=".4" stroke-linecap="round"/>' + cap;
    else if (st === 'ponytail') s += cap + '<path d="M262 190 C298 204 316 260 310 326 C306 366 292 396 270 416 C262 388 264 350 264 316 C264 268 256 226 250 198Z" fill="' + f + '"/><path d="M280 240 C296 280 296 340 284 390" fill="none" stroke="' + k.hairHi + '" stroke-width="3" opacity=".4" stroke-linecap="round"/><path d="M256 232 C270 226 292 232 304 244 L300 258 C288 250 270 246 256 250Z" fill="' + (k.ch.tie || k.trim || '#c4707a') + '"/>';
    else if (st === 'braids') s += cap;
    return s;
  }
  function hairFront(k) {
    var st = k.ch.style, f = 'url(#hr' + k.u + ')', hh = k.hairHi, s = '';
    if (st === 'bob') {
      s += '<path d="M110 200 C100 120 148 78 204 80 C258 82 300 122 290 200 C284 152 254 122 216 118 C176 116 132 136 110 200Z" fill="' + f + '"/>';
      s += '<path d="M136 128 C160 104 200 98 236 108 M126 156 C138 132 160 118 186 112 M250 118 C270 132 282 156 284 182" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".55" stroke-linecap="round"/>';
    } else if (st === 'swept') {
      s += '<path d="M116 182 C108 108 150 70 206 72 C262 74 296 110 284 182 C272 142 246 116 206 112 C162 112 128 138 116 182Z" fill="' + f + '"/>';
      s += '<path d="M140 118 C170 92 216 88 254 106 M128 150 C142 128 166 112 196 106 M232 100 C256 108 272 128 278 152" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
    } else if (st === 'sidepart') {
      s += '<path d="M116 186 C106 108 148 72 208 72 C264 72 298 108 286 186 C282 150 266 124 236 114 C214 108 186 110 166 114 C142 124 124 150 116 186Z" fill="' + f + '"/>';
      s += '<path d="M162 84 C146 92 134 112 130 140 M168 88 C196 92 230 100 262 122 M150 108 C180 96 218 96 250 108" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
      s += '<path d="M164 84 C170 98 176 108 186 114" fill="none" stroke="' + k.hairLo + '" stroke-width="2.4" opacity=".6"/>';
    } else if (st === 'long') {
      s += '<path d="M112 196 C102 108 148 70 206 72 C264 74 300 112 288 196 C284 158 266 130 240 118 C206 114 172 124 146 146 C128 164 118 182 112 196Z" fill="' + f + '"/>';
      s += '<path d="M112 176 C104 230 106 300 116 356 C128 352 132 320 134 288 C136 246 130 206 120 176Z M288 176 C296 230 294 300 284 356 C272 352 268 320 266 288 C264 246 270 206 280 176Z" fill="' + f + '"/>';
      s += '<path d="M150 104 C180 84 228 84 256 108 M120 230 C118 270 122 310 126 340 M280 230 C282 270 278 310 274 340" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".45" stroke-linecap="round"/>';
    } else if (st === 'bun' || st === 'ponytail') {
      s += '<path d="M116 186 C108 112 148 78 202 78 C256 78 294 112 286 186 C280 150 262 124 236 114 C218 108 186 108 168 114 C142 124 124 150 116 186Z" fill="' + f + '"/>';
      s += '<path d="M146 112 C176 94 226 94 256 112 M134 138 C144 124 156 116 170 110" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".45" stroke-linecap="round"/>';
    } else if (st === 'updo') {
      s += '<path d="M108 194 C96 96 148 46 204 46 C260 46 306 96 294 194 C286 146 260 104 204 98 C148 104 116 146 108 194Z" fill="' + f + '"/>';
      s += '<path d="M130 100 C156 66 214 58 262 84 M118 140 C126 112 142 96 164 84 M244 76 C266 90 280 116 284 146" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".45" stroke-linecap="round"/>';
    } else if (st === 'braids') {
      s += '<path d="M116 190 C108 112 148 82 204 82 C258 82 296 112 288 190 C280 152 260 130 206 128 C154 130 126 152 116 190Z" fill="' + f + '"/>';
      var i, a, x, y, n = 15;
      for (i = 0; i < n; i++) {
        a = (18 + (144 * i) / (n - 1)) * Math.PI / 180;
        x = 200 - Math.cos(a) * 88; y = 174 - Math.sin(a) * 88;
        var rot = (Math.atan2(-Math.sin(a) * -88, Math.cos(a) * 88) * 180 / Math.PI);
        s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="10.5" ry="8.6" transform="rotate(' + (i % 2 ? 28 : -28) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="' + (i % 2 ? f : k.hair) + '" stroke="' + k.hairLo + '" stroke-width="1.4"/>';
        s += '<path d="M' + (x - 5).toFixed(1) + ' ' + (y - 3).toFixed(1) + ' l8 6" stroke="' + hh + '" stroke-width="2" opacity=".55" stroke-linecap="round"/>';
      }
    } else if (st === 'none') {
      /* no hair drawn */
    } else {
      s += '<path d="M118 176 C114 110 152 82 204 82 C254 82 290 110 284 176 C278 146 260 124 238 118 C226 110 214 110 204 112 C170 110 138 124 118 176Z" fill="' + f + '"/>';
      s += '<path d="M118 176 C116 196 120 206 124 214 L126 180Z M284 176 C286 196 282 206 278 214 L276 180Z" fill="' + f + '"/>';
      s += '<path d="M150 112 C176 98 224 98 252 112" fill="none" stroke="' + hh + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>';
    }
    s += '<path d="M200 90 C190 80 172 82 160 90" fill="none" stroke="#fff" stroke-width="2" opacity=".18"/>';
    return s;
  }

  /* ---- headwear & hair ornaments ---- */
  function headwear(k) {
    var h = k.ch.hat, u = k.u, s = '', hc = k.ch.hatColor || '#2a2a33', ac = k.accent, i, a, x, y;
    if (h === 'ushanka') {
      var fl = 'M118 112 C94 122 84 176 90 232 C94 256 122 262 130 242 C134 208 132 160 128 118Z';
      var fr = 'M282 112 C306 122 316 176 310 232 C306 256 278 262 270 242 C266 208 268 160 272 118Z';
      var cw = 'M112 132 C102 62 146 28 200 28 C254 28 298 62 288 132 C262 114 238 110 200 110 C162 110 138 114 112 132Z';
      var bd = 'M106 142 C114 106 158 98 200 98 C242 98 286 106 294 142 C262 128 240 124 200 124 C160 124 138 128 106 142Z';
      s += fur(fl, 'fa' + u, hc, 11, 84, 112, 136, 262, 46) + fur(fr, 'fb' + u, hc, 12, 264, 112, 316, 262, 46);
      s += fur(cw, 'fc' + u, mix(hc, '#000000', 0.08), 13, 100, 28, 300, 132, 90);
      s += fur(bd, 'fd' + u, mix(hc, '#ffffff', 0.08), 14, 100, 98, 300, 142, 60);
      s += '<path d="M112 144 C140 132 160 130 200 130 C240 130 260 132 288 144" fill="none" stroke="#000" stroke-width="8" opacity=".12" filter="url(#f' + u + ')"/>';
      s += '<path d="M150 60 C170 40 224 38 250 58" fill="none" stroke="#fff" stroke-width="3" opacity=".22" stroke-linecap="round"/>';
      if (k.ch.pin) s += '<path d="M200 106 l5 10 11 1 -8 7 3 11 -11 -6 -11 6 3 -11 -8 -7 11 -1Z" fill="' + k.ch.pin + '" stroke="#7a1a1a" stroke-width="1.4"/>';
    } else if (h === 'trachten') {
      var feather = '<path d="M244 92 C258 60 292 26 330 8 C322 44 296 82 258 100Z" fill="' + ac + '"/><path d="M244 94 C270 62 300 32 330 8" fill="none" stroke="' + mix(ac, '#000000', 0.5) + '" stroke-width="2"/><path d="M262 78 l-8 -2 M274 64 l-10 -4 M288 50 l-10 -5 M266 86 l8 4 M282 70 l10 4 M296 56 l10 2" stroke="' + mix(ac, '#000000', 0.35) + '" stroke-width="1.6" opacity=".8"/>';
      s += '<path d="M126 100 C124 44 156 20 200 20 C244 20 276 44 274 100Z" fill="' + hc + '"/>';
      s += '<path d="M126 100 C124 44 156 20 200 20 C244 20 276 44 274 100Z" fill="url(#hg' + u + ')"/>';
      s += '<path d="M168 28 C186 42 214 42 232 28" fill="none" stroke="' + mix(hc, '#000000', 0.4) + '" stroke-width="5" opacity=".7" stroke-linecap="round"/>';
      s += '<path d="M126 100 L274 100 L272 86 C240 92 160 92 128 86Z" fill="' + (k.ch.band || '#3b2f26') + '"/><path d="M128 88 C160 94 240 94 272 88" fill="none" stroke="' + ac + '" stroke-width="2" opacity=".85"/>';
      s += '<path d="M92 112 C96 96 150 88 200 88 C250 88 304 96 308 112 C300 128 254 128 200 128 C146 128 100 128 92 112Z" fill="' + hc + '"/>';
      s += '<path d="M92 112 C96 96 150 88 200 88 C250 88 304 96 308 112 C300 128 254 128 200 128 C146 128 100 128 92 112Z" fill="url(#hg' + u + ')"/>';
      s += '<path d="M96 116 C130 130 270 130 304 116" fill="none" stroke="#000" stroke-width="2" opacity=".25"/>';
      s += feather;
    } else if (h === 'beret') {
      var bt = 'M104 126 C92 78 146 46 216 50 C290 54 326 92 306 134 C296 116 268 108 214 108 C160 108 122 112 104 126Z';
      s += '<path d="M210 50 C210 40 214 34 220 32 L222 44Z" fill="' + hc + '" stroke="' + mix(hc, '#000000', 0.4) + '" stroke-width="1.4"/>';
      s += '<path d="' + bt + '" fill="' + hc + '"/><path d="' + bt + '" fill="url(#hg' + u + ')"/>';
      s += '<path d="M104 126 C122 112 160 108 214 108 C268 108 296 116 306 134" fill="none" stroke="' + mix(hc, '#000000', 0.45) + '" stroke-width="5" stroke-linecap="round" opacity=".8"/>';
      s += '<path d="M130 88 C158 66 214 60 262 70 M246 60 C282 70 300 96 296 118" fill="none" stroke="#fff" stroke-width="3" opacity=".16" stroke-linecap="round"/>';
    } else if (h === 'scarf') {
      var cp = 'M200 46 C262 46 304 84 300 152 C298 178 298 200 294 224 C288 230 282 228 282 220 C284 180 274 146 250 132 C232 122 168 122 150 132 C126 146 116 180 118 220 C118 228 112 230 106 224 C102 200 102 178 100 152 C96 84 138 46 200 46Z';
      /* hair peeking under the scarf */
      s += '<path d="M124 206 C118 158 150 132 200 130 C250 132 282 158 276 206 C268 166 240 146 200 146 C160 146 132 166 124 206Z" fill="url(#hr' + u + ')"/>';
      var col = k.jacket;
      s += '<path d="' + cp + '" fill="' + col + '"/><path d="' + cp + '" fill="url(#pt' + u + ')"/><path d="' + cp + '" fill="url(#sh' + u + ')"/>';
      s += '<path d="M150 132 C168 122 232 122 250 132 C274 146 284 180 282 220" fill="none" stroke="' + ac + '" stroke-width="5"/><path d="M150 132 C168 122 232 122 250 132 C274 146 284 180 282 220" fill="none" stroke="#c92b34" stroke-width="1.8"/>';
      s += '<path d="M152 60 C176 38 224 36 252 56" fill="none" stroke="#fff" stroke-width="3" opacity=".16" stroke-linecap="round"/>';
    }
    /* hair ornaments */
    var pin = k.ch.hairpin;
    if (pin === 'jasmine') {
      /* garland of jasmine around a bun plus a gold pin */
      for (i = 0; i < 11; i++) {
        a = (8 + i * 16.4) * Math.PI / 180;
        x = 200 - Math.cos(a) * 40; y = 74 + Math.sin(a) * 15;
        s += bloom(x.toFixed(1), y.toFixed(1), 4.6, '#fffdf4', '#f2c94c', 5);
      }
      s += '<path d="M232 50 L268 30" stroke="' + ac + '" stroke-width="3" stroke-linecap="round"/>' + bloom(270, 28, 5, ac, '#fff4c8', 6);
    } else if (pin === 'kanzashi') {
      s += '<path d="M224 50 L270 22" stroke="#c9a24a" stroke-width="3" stroke-linecap="round"/>';
      s += bloom(244, 52, 8, '#f4a6b8', '#fff1c4', 5) + bloom(262, 44, 6.4, '#ffd3de', '#fff1c4', 5) + bloom(232, 68, 6, '#e9718f', '#fff1c4', 5);
      s += '<path d="M244 62 C246 82 242 96 248 110 M254 58 C260 80 260 96 266 108" fill="none" stroke="#c9a24a" stroke-width="1.6"/><circle cx="248" cy="112" r="3.6" fill="#c0392b"/><circle cx="266" cy="110" r="3.6" fill="#f2c94c"/>';
    } else if (pin === 'flower') {
      s += bloom(252, 104, 8, ac, '#fff1c4', 6);
    } else if (pin === 'edelweiss') {
      s += bloom(270, 94, 7, '#f7f2e6', '#e8c85a', 8);
    }
    return s;
  }

  function neckBead(k) {
    var s = '', i, t, x, y, nk = k.ch.necklace;
    if (!nk) return s;
    for (i = 0; i <= 8; i++) {
      t = i / 8; x = 166 + 68 * t; y = 380 + 24 * Math.sin(Math.PI * t);
      if (nk === 'gold') s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.2" fill="#e2b950" stroke="#a9812a" stroke-width=".8"/>';
      else s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.6" fill="url(#pl' + k.u + ')" stroke="#cbbfae" stroke-width=".8"/>';
    }
    if (nk === 'gold') s += '<path d="M200 404 C190 394 186 408 200 418 C214 408 210 394 200 404Z" fill="#e2b950" stroke="#a9812a" stroke-width="1"/>';
    return s;
  }

  function avatar(ch, mood) {
    mood = BROWS[mood] ? mood : 'neutral';
    var u = 'a' + (++uid);
    var skin = ch.skin, skinHi = mix(skin, '#ffffff', 0.3), skinLo = mix(skin, '#8a4a2a', 0.3), skinDk = mix(skin, '#4a2410', 0.55);
    var hair = ch.hair, hairHi = mix(hair, '#ffffff', 0.4), hairLo = mix(hair, '#000000', 0.5);
    var jacket = ch.jacket || '#33465a', inner = ch.inner || '#f1ede6';
    var jHi = mix(jacket, '#ffffff', 0.16), jLo = mix(jacket, '#000000', 0.35);
    var accent = ch.accent || '#d9b04a', trim = ch.trim || accent;
    var browC = mix(hair, '#000000', ch.style === 'bob' ? 0.4 : 0.3);
    var happy = mood === 'happy', delighted = mood === 'delighted';
    var squint = delighted ? 9 : happy ? 5 : 0;
    var blush = (delighted ? 0.3 : happy ? 0.2 : 0.1) + (ch.blush || 0);
    var k = { u: u, ch: ch, skin: skin, skinHi: skinHi, skinLo: skinLo, skinDk: skinDk, hair: hair, hairHi: hairHi, hairLo: hairLo, jacket: jacket, inner: inner, jHi: jHi, jLo: jLo, accent: accent, trim: trim };
    var att = ch.attire, hat = ch.hat;
    var hidesHair = hat === 'ushanka';
    var p = [];
    p.push('<svg class="avatar" viewBox="0 0 400 480" role="img" aria-label="' + esc(ch.name) + '" xmlns="http://www.w3.org/2000/svg"><defs>');
    p.push('<radialGradient id="sk' + u + '" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="' + skinHi + '"/><stop offset=".55" stop-color="' + skin + '"/><stop offset="1" stop-color="' + skinLo + '"/></radialGradient>');
    p.push('<linearGradient id="nk' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skinDk + '"/><stop offset=".35" stop-color="' + skinLo + '"/><stop offset="1" stop-color="' + skin + '"/></linearGradient>');
    p.push('<linearGradient id="jk' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + jHi + '"/><stop offset=".55" stop-color="' + jacket + '"/><stop offset="1" stop-color="' + jLo + '"/></linearGradient>');
    p.push('<linearGradient id="tg' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + mix(trim, '#ffffff', 0.16) + '"/><stop offset=".55" stop-color="' + trim + '"/><stop offset="1" stop-color="' + mix(trim, '#000000', 0.3) + '"/></linearGradient>');
    p.push('<linearGradient id="sh' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>');
    p.push('<linearGradient id="hg' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>');
    p.push('<linearGradient id="hr' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + hairHi + '"/><stop offset=".5" stop-color="' + hair + '"/><stop offset="1" stop-color="' + hairLo + '"/></linearGradient>');
    p.push('<radialGradient id="ew' + u + '" cx=".5" cy=".5" r=".6"><stop offset=".55" stop-color="#fbf9f6"/><stop offset="1" stop-color="#cfc6c0"/></radialGradient>');
    p.push('<radialGradient id="ir' + u + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + mix(ch.eyes, '#ffffff', 0.35) + '"/><stop offset=".6" stop-color="' + ch.eyes + '"/><stop offset="1" stop-color="' + mix(ch.eyes, '#000000', 0.55) + '"/></radialGradient>');
    p.push('<radialGradient id="pl' + u + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9cfc2"/></radialGradient>');
    p.push('<clipPath id="cf' + u + '"><path d="M116 188 C116 120 152 86 200 86 C248 86 284 120 284 188 C284 248 256 304 200 314 C144 304 116 248 116 188Z"/></clipPath>');
    p.push('<filter id="f' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>');
    p.push('<filter id="g' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>');
    var pk = ch.pattern || PAT_FOR[att];
    if (pk && pk !== 'none') {
      var pc = { diamond: accent, floral: accent, medallion: accent, roses: accent, sakura: accent, check: accent, stripe: ch.stripe || '#f4efe6', dots: '#f4efe6', wool: '#fff' }[pk];
      p.push(pattern(pk, 'pt' + u, pc, pk === 'floral' ? '#fff4c8' : '#fff'));
    }
    p.push(pattern('dots', 'pd' + u, '#f4efe6'));
    p.push('</defs>');

    /* body */
    p.push('<g class="abody">');
    p.push('<path d="M166 280 L166 374 C166 394 234 394 234 374 L234 280Z" fill="url(#nk' + u + ')"/>');
    var ab = att ? attireBody(k) : null;
    if (ab === null) {
      p.push('<path d="M0 480 C10 418 76 390 146 376 L254 376 C324 390 390 418 400 480Z" fill="url(#jk' + u + ')"/>');
      p.push('<path d="M150 378 L200 462 L250 378 C236 372 216 370 200 372 C184 370 164 372 150 378Z" fill="' + inner + '"/>');
      p.push('<path d="M150 378 L200 462 L200 372 C184 370 164 372 150 378Z" fill="#000" opacity=".06"/>');
      if (ch.tie) p.push('<path d="M190 380 L210 380 L214 436 L200 458 L186 436Z" fill="' + ch.tie + '"/><path d="M190 380 L210 380 L206 396 L194 396Z" fill="#000" opacity=".18"/><path d="M194 400 L206 420 M194 416 L208 436" stroke="#fff" stroke-width="2" opacity=".14"/>');
      else p.push('<path d="M172 376 L200 428 L228 376Z" fill="' + skinLo + '"/>');
      p.push('<path d="M146 376 L178 472 L150 480 L96 432 C100 410 120 388 146 376Z" fill="' + jLo + '" opacity=".9"/>');
      p.push('<path d="M254 376 L222 472 L250 480 L304 432 C300 410 280 388 254 376Z" fill="' + jLo + '" opacity=".9"/>');
      p.push('<path d="M146 376 L178 472" stroke="' + jHi + '" stroke-width="2" opacity=".5"/><path d="M254 376 L222 472" stroke="' + jHi + '" stroke-width="2" opacity=".35"/>');
      p.push('<path d="M40 470 C60 430 100 410 130 402" stroke="#fff" stroke-width="3" fill="none" opacity=".12"/>');
      if (ch.pin) p.push('<circle cx="272" cy="418" r="4.6" fill="' + ch.pin + '" stroke="#8a6a2a" stroke-width="1"/><circle cx="270.6" cy="416.6" r="1.6" fill="#fff" opacity=".7"/>');
    } else p.push(ab);
    p.push(neckBead(k));
    p.push('</g>');

    /* head */
    p.push('<g class="ahead">');
    p.push(hairBack(k));
    p.push('<ellipse cx="114" cy="206" rx="13" ry="27" fill="' + skinLo + '"/><ellipse cx="286" cy="206" rx="13" ry="27" fill="' + skinLo + '"/>');
    p.push('<ellipse cx="114" cy="208" rx="6" ry="15" fill="' + skinDk + '" opacity=".35"/><ellipse cx="286" cy="208" rx="6" ry="15" fill="' + skinDk + '" opacity=".35"/>');
    if (ch.earring) p.push('<circle cx="112" cy="232" r="4" fill="' + ch.earring + '"/><circle cx="288" cy="232" r="4" fill="' + ch.earring + '"/>');
    p.push('<ellipse cx="200" cy="322" rx="32" ry="20" fill="' + skinDk + '" opacity=".45" filter="url(#f' + u + ')"/>');
    p.push('<path d="M116 188 C116 120 152 86 200 86 C248 86 284 120 284 188 C284 248 256 304 200 314 C144 304 116 248 116 188Z" fill="url(#sk' + u + ')"/>');
    p.push('<g clip-path="url(#cf' + u + ')">');
    p.push('<path d="M262 130 C282 160 288 214 268 268 C262 288 250 300 236 306" fill="none" stroke="' + skinDk + '" stroke-width="16" opacity=".14" filter="url(#f' + u + ')"/>');
    p.push('<path d="M124 150 C118 190 126 236 148 268" fill="none" stroke="#ffffff" stroke-width="3" opacity=".22" stroke-linecap="round"/>');
    p.push('<ellipse cx="150" cy="236" rx="30" ry="20" fill="' + skinHi + '" opacity=".22" filter="url(#f' + u + ')"/>');
    p.push('<ellipse cx="138" cy="248" rx="27" ry="17" fill="#ff7a70" opacity="' + blush + '" filter="url(#f' + u + ')"/><ellipse cx="262" cy="248" rx="27" ry="17" fill="#ff7a70" opacity="' + blush + '" filter="url(#f' + u + ')"/>');
    p.push('</g>');

    /* eyes */
    var eo = { u: u, skin: skin, skinLo: skinLo, eyes: ch.eyes, squint: squint, wide: mood === 'surprised', open: ch.eyeOpen, lash: ch.lash };
    p.push(eye(158, 196, eo));
    p.push(eye(242, 196, eo));
    var b = BROWS[mood], bw = ch.brow || 7;
    p.push('<path d="' + b[0] + '" stroke="' + browC + '" stroke-width="' + bw + '" stroke-linecap="round" fill="none" opacity=".92"/>');
    p.push('<path d="' + b[1] + '" stroke="' + browC + '" stroke-width="' + bw + '" stroke-linecap="round" fill="none" opacity=".92"/>');

    /* nose */
    p.push('<path d="M206 186 C210 214 216 232 222 242 C214 254 198 256 190 247 C198 245 204 236 204 220Z" fill="' + skinLo + '" opacity=".3"/>');
    p.push('<ellipse cx="200" cy="255" rx="16" ry="5" fill="' + skinDk + '" opacity=".22" filter="url(#f' + u + ')"/>');
    p.push('<ellipse cx="196" cy="240" rx="8" ry="6" fill="' + skinHi + '" opacity=".55"/>');
    p.push('<ellipse cx="188" cy="248" rx="3.6" ry="2.4" fill="' + skinDk + '" opacity=".45"/><ellipse cx="212" cy="248" rx="3.6" ry="2.4" fill="' + skinDk + '" opacity=".45"/>');

    /* beard */
    if (ch.beard) {
      p.push('<path d="M118 214 C120 282 156 322 200 324 C244 322 280 282 282 214 C270 254 246 268 200 268 C154 268 130 254 118 214Z" fill="url(#hr' + u + ')" opacity=".96"/>');
      p.push('<path d="M164 254 C180 246 194 251 200 254 C206 251 220 246 236 254 C222 264 210 260 200 260 C190 260 178 264 164 254Z" fill="' + hairLo + '" opacity=".9"/>');
    }

    /* mouth */
    p.push('<g class="mouth">' + mouth(ch, MOUTH_FOR[mood]) + '</g>');
    if (!ch.beard) p.push('<ellipse cx="200" cy="304" rx="22" ry="8" fill="' + skinDk + '" opacity=".14" filter="url(#f' + u + ')"/>');

    /* age lines */
    var age = ch.age || 0;
    if (age > 0) {
      var ao = (0.06 + age * 0.12).toFixed(2);
      p.push('<g fill="none" stroke="' + skinDk + '" stroke-width="2.2" stroke-linecap="round" opacity="' + ao + '">');
      p.push('<path d="M148 138 C176 132 224 132 252 138"/><path d="M154 150 C180 145 220 145 246 150"/>');
      p.push('<path d="M126 196 l-10 -5 M126 204 l-11 1 M126 212 l-9 6 M274 196 l10 -5 M274 204 l11 1 M274 212 l9 6"/>');
      p.push('<path d="M164 252 C156 266 156 278 164 290 M236 252 C244 266 244 278 236 290"/></g>');
    }

    /* glasses */
    if (ch.glasses) {
      p.push('<g fill="none" stroke="#b6905a" stroke-width="3.2"><circle cx="158" cy="196" r="30" fill="#ffffff" fill-opacity=".05"/><circle cx="242" cy="196" r="30" fill="#ffffff" fill-opacity=".05"/><path d="M188 192 C196 186 204 186 212 192"/><path d="M128 190 L112 186 M272 190 L288 186"/></g>');
      p.push('<path d="M138 178 C144 170 156 166 166 168" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/><path d="M222 178 C228 170 240 166 250 168" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>');
    }

    /* front hair, headwear */
    if (!hidesHair) p.push(hairFront(k));
    p.push(headwear(k));
    p.push('</g></svg>');
    return p.join('');
  }

  /* ---------- scene backdrops (portrait, drawn to be blurred) ---------- */
  function bokeh(list) {
    return list.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="' + b[3] + '" opacity="' + (b[4] || 0.35) + '"/>'; }).join('');
  }
  var SCENES = {
    home: function (u) {
      return '<defs><linearGradient id="w' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e5c8"/><stop offset="1" stop-color="#c99a6b"/></linearGradient>' +
        '<linearGradient id="s' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe4f5"/><stop offset="1" stop-color="#fbf5e6"/></linearGradient>' +
        '<linearGradient id="i' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4730"/><stop offset="1" stop-color="#2b1b12"/></linearGradient></defs>' +
        '<rect width="400" height="800" fill="url(#w' + u + ')"/>' +
        '<rect x="236" y="96" width="142" height="212" rx="6" fill="url(#s' + u + ')" stroke="#eadfcf" stroke-width="8"/><path d="M307 96V308M236 202H378" stroke="#fff" stroke-width="6" opacity=".85"/>' +
        '<path d="M236 308 L110 800 L340 800 L378 308Z" fill="#fff" opacity=".1"/>' +
        '<rect x="-4" y="104" width="204" height="196" fill="#efe5d7"/><path d="M98 104V300M-4 202H200" stroke="#d6c8b4" stroke-width="3"/><rect x="88" y="196" width="4" height="22" fill="#b79f80"/><rect x="104" y="196" width="4" height="22" fill="#b79f80"/>' +
        '<rect x="0" y="300" width="400" height="190" fill="#d8c4a6"/><path d="M0 345H400M0 390H400M0 435H400" stroke="#c9b28f" stroke-width="2" opacity=".7"/>' +
        '<rect x="0" y="490" width="400" height="26" fill="#f4efe8"/><rect x="0" y="516" width="400" height="290" fill="url(#i' + u + ')"/>' +
        '<path d="M90 0V70M310 0V52" stroke="#3a2a20" stroke-width="3" opacity=".6"/><circle cx="90" cy="82" r="24" fill="#ffd58a"/><circle cx="310" cy="64" r="24" fill="#ffd58a"/><circle cx="90" cy="82" r="60" fill="#ffd58a" opacity=".18"/><circle cx="310" cy="64" r="60" fill="#ffd58a" opacity=".18"/>' +
        bokeh([[50, 420, 22, '#fff2cf', .3], [350, 470, 16, '#fff2cf', .3], [30, 250, 14, '#ffe2a8', .25], [372, 380, 26, '#ffe9bd', .22]]);
    },
    around: function (u) {
      return '<defs><linearGradient id="k' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5eb8e0"/><stop offset=".5" stop-color="#fbd7a6"/><stop offset="1" stop-color="#f4a271"/></linearGradient>' +
        '<linearGradient id="p' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#48c0d0"/><stop offset="1" stop-color="#0d7a92"/></linearGradient></defs>' +
        '<rect width="400" height="800" fill="url(#k' + u + ')"/><circle cx="310" cy="250" r="46" fill="#fff4d6" opacity=".9"/><circle cx="310" cy="250" r="110" fill="#fff4d6" opacity=".2"/>' +
        '<path d="M0 420 C90 400 180 430 260 410 C320 396 360 404 400 400 L400 470 L0 470Z" fill="#2f8a5c" opacity=".85"/>' +
        '<rect x="0" y="450" width="400" height="20" fill="#efe6d6"/><rect x="0" y="470" width="400" height="330" fill="url(#p' + u + ')"/>' +
        '<path d="M20 520C90 508 130 540 200 528 260 516 320 546 390 530M0 600C80 588 140 620 220 606 290 594 340 620 400 610M30 690C100 680 170 706 250 692" stroke="#c8f4f7" stroke-width="5" fill="none" opacity=".45"/>' +
        '<path d="M44 800 C48 640 52 420 84 250" stroke="#3b2a20" stroke-width="14" fill="none"/><path d="M84 250 C40 230 8 250 -10 290 M84 250 C60 210 30 200 0 206 M84 250 C110 214 140 206 170 216 M84 250 C120 244 150 262 168 292 M84 250 C86 216 92 186 108 160" stroke="#1f6b45" stroke-width="16" stroke-linecap="round" fill="none"/>' +
        '<path d="M380 800 C376 660 372 500 348 380" stroke="#3b2a20" stroke-width="12" fill="none"/><path d="M348 380 C390 366 420 384 440 420 M348 380 C376 344 408 340 430 346 M348 380 C320 352 290 348 262 358 M348 380 C322 384 296 402 284 428" stroke="#1f6b45" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        bokeh([[130, 600, 26, '#fff', .18], [260, 660, 20, '#e8fbff', .2], [200, 560, 14, '#fff', .2], [330, 540, 18, '#e8fbff', .18]]);
    },
    general: function (u) {
      return '<defs><linearGradient id="w' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe3d1"/><stop offset="1" stop-color="#bda583"/></linearGradient>' +
        '<linearGradient id="z' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ee"/><stop offset=".6" stop-color="#d9f0f7"/><stop offset=".6" stop-color="#2a9cc0"/><stop offset="1" stop-color="#0d6f95"/></linearGradient></defs>' +
        '<rect width="400" height="800" fill="url(#w' + u + ')"/>' +
        '<rect x="20" y="90" width="360" height="260" rx="8" fill="url(#z' + u + ')" stroke="#f7f1e6" stroke-width="10"/><path d="M140 90V350M260 90V350" stroke="#f7f1e6" stroke-width="8"/>' +
        '<path d="M20 350 L-30 800 L430 800 L380 350Z" fill="#fff" opacity=".08"/>' +
        '<rect x="0" y="560" width="400" height="240" rx="30" fill="#3f5866"/><rect x="0" y="560" width="400" height="30" rx="14" fill="#557588"/><rect x="30" y="520" width="120" height="80" rx="20" fill="#d9c7a3"/><rect x="250" y="530" width="110" height="70" rx="20" fill="#c98a5a"/>' +
        '<path d="M372 300V560" stroke="#3a2f27" stroke-width="5"/><path d="M340 300 L404 300 L392 250 L352 250Z" fill="#ffe0a0"/><circle cx="372" cy="280" r="90" fill="#ffe0a0" opacity=".2"/>' +
        bokeh([[60, 430, 20, '#fff6dc', .3], [200, 470, 14, '#fff6dc', .25], [340, 470, 24, '#ffe9bd', .25]]);
    },
    deal: function (u) {
      var win = '', i, x;
      for (i = 0; i < 22; i++) { x = 10 + (i * 37) % 340; win += '<rect x="' + x + '" y="' + (250 + (i * 53) % 90) + '" width="8" height="10" fill="#ffd77a" opacity=".8"/>'; }
      return '<defs><linearGradient id="d' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2f63"/><stop offset=".55" stop-color="#e07a5f"/><stop offset="1" stop-color="#f6c589"/></linearGradient>' +
        '<linearGradient id="t' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3427"/><stop offset="1" stop-color="#241610"/></linearGradient></defs>' +
        '<rect width="400" height="800" fill="#1d2233"/><rect x="0" y="60" width="400" height="330" fill="url(#d' + u + ')"/>' +
        '<path d="M0 390V270h30V230h40v60h30V200h50v90h30v-50h40v70h30v-90h40v100h30v-40h40v120Z" fill="#141a2e"/>' + win +
        '<path d="M100 60V390M200 60V390M300 60V390" stroke="#0e1220" stroke-width="6" opacity=".7"/>' +
        '<rect x="0" y="390" width="400" height="410" fill="#252b3f"/><rect x="0" y="580" width="400" height="220" fill="url(#t' + u + ')"/><rect x="0" y="580" width="400" height="8" fill="#9b7654" opacity=".8"/>' +
        '<rect x="250" y="450" width="120" height="80" rx="6" fill="#8fd3ff" opacity=".7"/><rect x="250" y="450" width="120" height="80" rx="6" fill="none" stroke="#111" stroke-width="5"/><circle cx="310" cy="490" r="120" fill="#8fd3ff" opacity=".1"/>' +
        bokeh([[60, 440, 18, '#ffd77a', .35], [120, 500, 12, '#ffd77a', .3], [350, 320, 20, '#ffb37a', .3], [30, 330, 24, '#ffd77a', .25]]);
    },
    terms: function (u) {
      var books = '', i, cols = ['#7a3e2c', '#2f4a5a', '#8a6d3b', '#3f5a3c', '#5b2f3f', '#a2785a'];
      for (i = 0; i < 16; i++) { books += '<rect x="' + (14 + i * 23) + '" y="' + (128 + (i % 3) * 4) + '" width="18" height="' + (58 - (i % 3) * 4) + '" fill="' + cols[i % 6] + '"/>'; }
      for (i = 0; i < 16; i++) { books += '<rect x="' + (14 + i * 23) + '" y="' + (250 + (i % 4) * 3) + '" width="18" height="' + (54 - (i % 4) * 3) + '" fill="' + cols[(i + 2) % 6] + '"/>'; }
      return '<defs><linearGradient id="w' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3f2d"/><stop offset="1" stop-color="#2a1b12"/></linearGradient>' +
        '<radialGradient id="l' + u + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".8"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="800" fill="url(#w' + u + ')"/>' +
        '<rect x="0" y="120" width="400" height="8" fill="#3b2617"/><rect x="0" y="186" width="400" height="8" fill="#3b2617"/><rect x="0" y="244" width="400" height="8" fill="#3b2617"/><rect x="0" y="306" width="400" height="8" fill="#3b2617"/>' + books +
        '<rect x="0" y="560" width="400" height="240" fill="#3a2517"/><rect x="0" y="560" width="400" height="10" fill="#8a6440"/>' +
        '<rect x="40" y="520" width="140" height="40" fill="#efe9dd"/><rect x="50" y="506" width="130" height="14" fill="#fff8ea"/><rect x="250" y="530" width="10" height="30" fill="#c9a24a"/>' +
        '<circle cx="330" cy="470" r="150" fill="url(#l' + u + ')"/><path d="M300 470 L360 470 L346 420 L314 420Z" fill="#f4c46c"/><path d="M330 470V560" stroke="#c9a24a" stroke-width="5"/>' +
        bokeh([[60, 400, 22, '#ffcf7a', .25], [200, 420, 14, '#ffcf7a', .22], [370, 380, 26, '#ffcf7a', .25]]);
    },
    viewing: function (u) {
      return '<defs><linearGradient id="k' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9fd8"/><stop offset=".55" stop-color="#ffbe8a"/><stop offset="1" stop-color="#ff9a62"/></linearGradient>' +
        '<linearGradient id="g' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9a55"/><stop offset="1" stop-color="#1e5a34"/></linearGradient></defs>' +
        '<rect width="400" height="800" fill="url(#k' + u + ')"/><circle cx="90" cy="330" r="40" fill="#fff1c9"/><circle cx="90" cy="330" r="120" fill="#fff1c9" opacity=".2"/>' +
        '<rect x="40" y="300" width="330" height="200" fill="#f4efe8"/><rect x="40" y="280" width="220" height="30" fill="#e2dbd0"/><rect x="60" y="330" width="130" height="120" fill="#ffd98a"/><rect x="210" y="330" width="130" height="120" fill="#ffc46a"/><path d="M125 330V450M275 330V450" stroke="#f4efe8" stroke-width="5"/><rect x="40" y="500" width="330" height="10" fill="#cfc6b8"/>' +
        '<rect x="0" y="510" width="400" height="290" fill="url(#g' + u + ')"/><path d="M120 800 L170 510 L230 510 L290 800Z" fill="#d9cdb8" opacity=".85"/>' +
        '<rect x="0" y="430" width="30" height="90" fill="#2a2f3a"/><rect x="372" y="430" width="28" height="90" fill="#2a2f3a"/>' +
        '<path d="M396 470C380 410 350 380 320 372M396 470C400 420 420 400 440 396" stroke="#1f6b45" stroke-width="10" fill="none" stroke-linecap="round"/>' +
        bokeh([[60, 620, 24, '#fff2cf', .18], [330, 600, 30, '#ffe3a8', .16], [200, 700, 18, '#fff2cf', .16], [350, 200, 22, '#ffe3a8', .2]]);
    }
  };
  function scene(id) {
    var u = 's' + (++uid);
    var f = SCENES[id] || SCENES.general;
    return '<svg class="scene" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + f(u) + '</svg>';
  }

  root.PT_ART = { avatar: avatar, mouth: mouth, scene: scene, mix: mix, TALK: ['a', 'o', 'ee', 'a', 'm', 'o', 'ee', 'a', 'm'], MOODS: Object.keys(BROWS) };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.PT_ART;
})(typeof window !== 'undefined' ? window : globalThis);
