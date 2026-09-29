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
    var ry = o.wide ? 14 : 12;
    var s = '<g class="eye">';
    s += '<ellipse cx="' + cx + '" cy="' + (cy + 2) + '" rx="27" ry="15" fill="' + o.skinLo + '" opacity=".25" filter="url(#f' + o.u + ')"/>';
    s += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="21" ry="' + ry + '" fill="url(#ew' + o.u + ')"/>';
    s += '<g class="iris"><circle cx="' + cx + '" cy="' + cy + '" r="10.6" fill="url(#ir' + o.u + ')"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="10.6" fill="none" stroke="' + mix(o.eyes, '#000000', 0.5) + '" stroke-width="1.2" opacity=".7"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="4.8" fill="#08090b"/>';
    s += '<circle cx="' + (cx - 3.5) + '" cy="' + (cy - 3.5) + '" r="2.8" fill="#fff" opacity=".95"/>';
    s += '<circle cx="' + (cx + 3.5) + '" cy="' + (cy + 3.6) + '" r="1.3" fill="#fff" opacity=".55"/></g>';
    s += '<path d="M' + (cx - 22) + ' ' + (cy + 1) + ' C' + (cx - 12) + ' ' + (cy - ry - 4) + ' ' + (cx + 12) + ' ' + (cy - ry - 4) + ' ' + (cx + 22) + ' ' + (cy + 1) + '" fill="none" stroke="#15100e" stroke-width="3" stroke-linecap="round"/>';
    s += '<path d="M' + (cx - 20) + ' ' + (cy - ry - 2) + ' C' + (cx - 10) + ' ' + (cy - ry - 11) + ' ' + (cx + 10) + ' ' + (cy - ry - 11) + ' ' + (cx + 20) + ' ' + (cy - ry - 2) + '" fill="none" stroke="' + o.skinLo + '" stroke-width="2" opacity=".55"/>';
    if (o.squint) {
      s += '<path d="M' + (cx - 23) + ' ' + (cy + 4) + ' C' + (cx - 12) + ' ' + (cy + 4 - o.squint) + ' ' + (cx + 12) + ' ' + (cy + 4 - o.squint) + ' ' + (cx + 23) + ' ' + (cy + 4) + ' C' + (cx + 14) + ' ' + (cy + 20) + ' ' + (cx - 14) + ' ' + (cy + 20) + ' ' + (cx - 23) + ' ' + (cy + 4) + 'Z" fill="' + o.skin + '"/>';
    }
    s += '<g class="lid" style="transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0)"><ellipse cx="' + cx + '" cy="' + (cy - 1) + '" rx="23" ry="15" fill="' + o.skin + '"/>';
    s += '<path d="M' + (cx - 22) + ' ' + (cy + 8) + ' C' + (cx - 10) + ' ' + (cy + 15) + ' ' + (cx + 10) + ' ' + (cy + 15) + ' ' + (cx + 22) + ' ' + (cy + 8) + '" fill="none" stroke="#15100e" stroke-width="2.6" stroke-linecap="round"/></g>';
    s += '</g>';
    return s;
  }

  function avatar(ch, mood) {
    mood = BROWS[mood] ? mood : 'neutral';
    var u = 'a' + (++uid);
    var skin = ch.skin, skinHi = mix(skin, '#ffffff', 0.3), skinLo = mix(skin, '#8a4a2a', 0.3), skinDk = mix(skin, '#4a2410', 0.55);
    var hair = ch.hair, hairHi = mix(hair, '#ffffff', 0.4), hairLo = mix(hair, '#000000', 0.5);
    var jacket = ch.jacket || '#33465a', inner = ch.inner || '#f1ede6';
    var jHi = mix(jacket, '#ffffff', 0.16), jLo = mix(jacket, '#000000', 0.35);
    var browC = mix(hair, '#000000', ch.style === 'bob' ? 0.4 : 0.3);
    var happy = mood === 'happy', delighted = mood === 'delighted';
    var squint = delighted ? 9 : happy ? 5 : 0;
    var blush = delighted ? 0.3 : happy ? 0.2 : 0.1;
    var p = [];
    p.push('<svg class="avatar" viewBox="0 0 400 480" role="img" aria-label="' + esc(ch.name) + '" xmlns="http://www.w3.org/2000/svg"><defs>');
    p.push('<radialGradient id="sk' + u + '" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="' + skinHi + '"/><stop offset=".55" stop-color="' + skin + '"/><stop offset="1" stop-color="' + skinLo + '"/></radialGradient>');
    p.push('<linearGradient id="nk' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + skinDk + '"/><stop offset=".35" stop-color="' + skinLo + '"/><stop offset="1" stop-color="' + skin + '"/></linearGradient>');
    p.push('<linearGradient id="jk' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + jHi + '"/><stop offset=".55" stop-color="' + jacket + '"/><stop offset="1" stop-color="' + jLo + '"/></linearGradient>');
    p.push('<linearGradient id="hr' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + hairHi + '"/><stop offset=".5" stop-color="' + hair + '"/><stop offset="1" stop-color="' + hairLo + '"/></linearGradient>');
    p.push('<radialGradient id="ew' + u + '" cx=".5" cy=".5" r=".6"><stop offset=".55" stop-color="#fbf9f6"/><stop offset="1" stop-color="#cfc6c0"/></radialGradient>');
    p.push('<radialGradient id="ir' + u + '" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="' + mix(ch.eyes, '#ffffff', 0.35) + '"/><stop offset=".6" stop-color="' + ch.eyes + '"/><stop offset="1" stop-color="' + mix(ch.eyes, '#000000', 0.55) + '"/></radialGradient>');
    p.push('<radialGradient id="pl' + u + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9cfc2"/></radialGradient>');
    p.push('<clipPath id="cf' + u + '"><path d="M116 188 C116 120 152 86 200 86 C248 86 284 120 284 188 C284 248 256 304 200 314 C144 304 116 248 116 188Z"/></clipPath>');
    p.push('<filter id="f' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>');
    p.push('<filter id="g' + u + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>');
    p.push('</defs>');

    /* body */
    p.push('<g class="abody">');
    p.push('<path d="M166 280 L166 374 C166 394 234 394 234 374 L234 280Z" fill="url(#nk' + u + ')"/>');
    p.push('<path d="M0 480 C10 418 76 390 146 376 L254 376 C324 390 390 418 400 480Z" fill="url(#jk' + u + ')"/>');
    p.push('<path d="M150 378 L200 462 L250 378 C236 372 216 370 200 372 C184 370 164 372 150 378Z" fill="' + inner + '"/>');
    p.push('<path d="M150 378 L200 462 L200 372 C184 370 164 372 150 378Z" fill="#000" opacity=".06"/>');
    p.push('<path d="M172 376 L200 428 L228 376Z" fill="' + skinLo + '"/>');
    p.push('<path d="M146 376 L178 472 L150 480 L96 432 C100 410 120 388 146 376Z" fill="' + jLo + '" opacity=".9"/>');
    p.push('<path d="M254 376 L222 472 L250 480 L304 432 C300 410 280 388 254 376Z" fill="' + jLo + '" opacity=".9"/>');
    p.push('<path d="M146 376 L178 472" stroke="' + jHi + '" stroke-width="2" opacity=".5"/><path d="M254 376 L222 472" stroke="' + jHi + '" stroke-width="2" opacity=".35"/>');
    p.push('<path d="M40 470 C60 430 100 410 130 402" stroke="#fff" stroke-width="3" fill="none" opacity=".12"/>');
    if (ch.necklace) {
      for (var i = 0; i <= 8; i++) {
        var t = i / 8, x = 166 + 68 * t, y = 380 + 24 * Math.sin(Math.PI * t);
        p.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4.6" fill="url(#pl' + u + ')" stroke="#cbbfae" stroke-width=".8"/>');
      }
    }
    p.push('</g>');

    /* head */
    p.push('<g class="ahead">');
    if (ch.style === 'bob') {
      p.push('<path d="M104 196 C90 110 138 58 200 58 C262 58 310 110 296 196 C304 254 296 306 272 338 C250 330 236 322 228 300 L172 300 C164 322 150 330 128 338 C104 306 96 254 104 196Z" fill="url(#hr' + u + ')"/>');
    }
    p.push('<ellipse cx="114" cy="206" rx="13" ry="27" fill="' + skinLo + '"/><ellipse cx="286" cy="206" rx="13" ry="27" fill="' + skinLo + '"/>');
    p.push('<ellipse cx="114" cy="208" rx="6" ry="15" fill="' + skinDk + '" opacity=".35"/><ellipse cx="286" cy="208" rx="6" ry="15" fill="' + skinDk + '" opacity=".35"/>');
    p.push('<ellipse cx="200" cy="322" rx="32" ry="20" fill="' + skinDk + '" opacity=".45" filter="url(#f' + u + ')"/>');
    p.push('<path d="M116 188 C116 120 152 86 200 86 C248 86 284 120 284 188 C284 248 256 304 200 314 C144 304 116 248 116 188Z" fill="url(#sk' + u + ')"/>');
    p.push('<g clip-path="url(#cf' + u + ')">');
    p.push('<path d="M262 130 C282 160 288 214 268 268 C262 288 250 300 236 306" fill="none" stroke="' + skinDk + '" stroke-width="16" opacity=".14" filter="url(#f' + u + ')"/>');
    p.push('<path d="M124 150 C118 190 126 236 148 268" fill="none" stroke="#ffffff" stroke-width="3" opacity=".22" stroke-linecap="round"/>');
    p.push('<ellipse cx="150" cy="236" rx="30" ry="20" fill="' + skinHi + '" opacity=".22" filter="url(#f' + u + ')"/>');
    p.push('<ellipse cx="138" cy="248" rx="27" ry="17" fill="#ff7a70" opacity="' + blush + '" filter="url(#f' + u + ')"/><ellipse cx="262" cy="248" rx="27" ry="17" fill="#ff7a70" opacity="' + blush + '" filter="url(#f' + u + ')"/>');
    p.push('</g>');

    /* eyes */
    var eo = { u: u, skin: skin, skinLo: skinLo, eyes: ch.eyes, squint: squint, wide: mood === 'surprised' };
    p.push(eye(158, 196, eo));
    p.push(eye(242, 196, eo));
    var b = BROWS[mood];
    p.push('<path d="' + b[0] + '" stroke="' + browC + '" stroke-width="7" stroke-linecap="round" fill="none" opacity=".92"/>');
    p.push('<path d="' + b[1] + '" stroke="' + browC + '" stroke-width="7" stroke-linecap="round" fill="none" opacity=".92"/>');

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

    /* front hair */
    if (ch.style === 'bob') {
      p.push('<path d="M110 200 C100 120 148 78 204 80 C258 82 300 122 290 200 C284 152 254 122 216 118 C176 116 132 136 110 200Z" fill="url(#hr' + u + ')"/>');
      p.push('<path d="M136 128 C160 104 200 98 236 108 M126 156 C138 132 160 118 186 112 M250 118 C270 132 282 156 284 182" fill="none" stroke="' + hairHi + '" stroke-width="3" opacity=".55" stroke-linecap="round"/>');
    } else if (ch.style === 'swept') {
      p.push('<path d="M116 182 C108 108 150 70 206 72 C262 74 296 110 284 182 C272 142 246 116 206 112 C162 112 128 138 116 182Z" fill="url(#hr' + u + ')"/>');
      p.push('<path d="M140 118 C170 92 216 88 254 106 M128 150 C142 128 166 112 196 106 M232 100 C256 108 272 128 278 152" fill="none" stroke="' + hairHi + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>');
    } else {
      p.push('<path d="M118 176 C114 110 152 82 204 82 C254 82 290 110 284 176 C278 146 260 124 238 118 C226 110 214 110 204 112 C170 110 138 124 118 176Z" fill="url(#hr' + u + ')"/>');
      p.push('<path d="M118 176 C116 196 120 206 124 214 L126 180Z M284 176 C286 196 282 206 278 214 L276 180Z" fill="url(#hr' + u + ')"/>');
      p.push('<path d="M150 112 C176 98 224 98 252 112" fill="none" stroke="' + hairHi + '" stroke-width="3" opacity=".5" stroke-linecap="round"/>');
    }
    p.push('<path d="M200 90 C190 80 172 82 160 90" fill="none" stroke="#fff" stroke-width="2" opacity=".18"/>');
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
