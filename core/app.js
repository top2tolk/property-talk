/* Property Talk: shared app. Each customer folder loads this file plus its own config.js. */
(function(){
'use strict';
var CFG=window.PT_CONFIG||{};
var FEAT=CFG.features||{};
var SLUG=CFG.slug||'demo';
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var mem={};
var store={
  get:function(k){k=SLUG+':'+k;try{var v=localStorage.getItem(k);return v===null?mem[k]:v}catch(e){return mem[k]}},
  set:function(k,v){k=SLUG+':'+k;mem[k]=v;try{localStorage.setItem(k,v)}catch(e){}}
};
function jget(k,d){try{var v=store.get(k);return v?JSON.parse(v):d}catch(e){return d}}
function fmt(n,d){return Number(n).toLocaleString('th-TH',{maximumFractionDigits:d==null?2:d})}

var C=null,CHARS={},CATS=[],G={},PAIRS=[],DEMO=[];
var LV=['สั้น','มาตรฐาน','สุภาพ'];
var AUDIO_BASE=CFG.audioBase||'../../core/audio/';

var wallet,calc,st;
function initState(){
  var W0=jget('wallet',null);
  wallet=(W0&&typeof W0.bal==='number')?W0:{bal:100,cap:100};
  calc=jget('calc',null)||{cpt:0.5,fee:3.5,fixed:0,target:20000,packs:[{c:100,p:199},{c:300,p:499},{c:1000,p:1290}]};
  st={tab:'practice',cat:null,turn:0,picked:null,score:null,log:[],showTh:store.get('th')!=='0',word:null,
      vault:jget('vault',[]),review:null,dir:'th-en',text:'',out:null,lines:[]};
}
function saveWallet(){store.set('wallet',JSON.stringify(wallet))}
function saveVault(){store.set('vault',JSON.stringify(st.vault))}
function saveCalc(){store.set('calc',JSON.stringify(calc))}
function level(){
  if(wallet.bal<=0)return 'out';
  var p=wallet.bal/wallet.cap*100;
  if(p<=10)return 'crit';
  if(p<=25)return 'warn';
  return 'ok';
}
var LVTXT={ok:'เพียงพอ',warn:'ใกล้หมด ควรเติมเร็ว ๆ นี้',crit:'เหลือน้อยมาก เติมเงินได้เลย',out:'หมดแล้ว ระบบหยุดแปลจนกว่าจะเติมเงิน'};

/* ---------- helpers ---------- */
var toastT=null;
function toast(m){var t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200)}
function copyText(text){
  function fb(){
    try{var a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var ok=document.execCommand('copy');document.body.removeChild(a);toast(ok?'คัดลอกแล้ว':'คัดลอกไม่ได้ ลองกดค้างที่ข้อความ')}catch(e){toast('คัดลอกไม่ได้ ลองกดค้างที่ข้อความ')}
  }
  try{navigator.clipboard.writeText(text).then(function(){toast('คัดลอกแล้ว')},fb)}catch(e){fb()}
}
function setTalk(on){var f=$('#faceBox');if(f)f.classList.toggle('talk',on)}
var talkT=null,curAudio=null;
function speak(text,lang,rate,face){
  if(!('speechSynthesis' in window)){toast('เครื่องนี้ยังไม่รองรับเสียงอ่าน');return}
  try{
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate||1;
    var vs=speechSynthesis.getVoices();var pre=lang.slice(0,2).toLowerCase();var v=null;
    for(var i=0;i<vs.length;i++){var vl=(vs[i].lang||'').replace('_','-').toLowerCase();if(vl===lang.toLowerCase()){v=vs[i];break}if(!v&&vl.indexOf(pre)===0)v=vs[i]}
    if(v)u.voice=v;
    if(face){u.onstart=function(){setTalk(true)};u.onend=u.onerror=function(){setTalk(false)};clearTimeout(talkT);talkT=setTimeout(function(){setTalk(false)},text.length*95/(rate||1)+1800)}
    speechSynthesis.speak(u);
  }catch(e){toast('เล่นเสียงไม่ได้ในเครื่องนี้')}
}
/* Plays the pre-generated mp3 when it exists, otherwise falls back to the device voice. */
function playLine(aid,text,lang,rate,face){
  if(!aid){speak(text,lang,rate,face);return}
  try{if(curAudio){curAudio.pause();curAudio=null}if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}
  var fell=false;
  function fallback(){if(fell)return;fell=true;setTalk(false);speak(text,lang,rate,face)}
  try{
    var a=new Audio(AUDIO_BASE+aid+'.mp3');curAudio=a;a.playbackRate=rate||1;
    a.addEventListener('error',fallback);
    if(face){a.addEventListener('playing',function(){setTalk(true)});a.addEventListener('ended',function(){setTalk(false)});a.addEventListener('pause',function(){setTalk(false)})}
    var p=a.play();if(p&&p.catch)p.catch(fallback);
  }catch(e){fallback()}
}
function setMic(on){var m=document.querySelectorAll('.mic');for(var i=0;i<m.length;i++)m[i].classList.toggle('live',on)}
function listen(lang,ok,fail){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){fail('nosupport');return}
  try{
    var r=new SR();r.lang=lang;r.interimResults=false;r.maxAlternatives=1;
    r.onresult=function(e){ok(e.results[0][0].transcript)};
    r.onerror=function(e){setMic(false);fail(e.error||'error')};
    r.onend=function(){setMic(false)};
    setMic(true);r.start();
  }catch(e){setMic(false);fail('error')}
}
function micFail(code){
  if(code==='not-allowed'||code==='service-not-allowed')toast('ไมค์ถูกบล็อก กรุณาอนุญาตการใช้ไมค์ในเบราว์เซอร์ หรือเลือกประโยคตอบแทน');
  else if(code==='nosupport')toast('เบราว์เซอร์นี้ยังไม่รองรับการฟังเสียง ใช้ Chrome หรือเลือกประโยคตอบแทน');
  else if(code==='no-speech')toast('ไม่ได้ยินเสียง ลองพูดอีกครั้ง');
  else toast('ฟังเสียงไม่สำเร็จ ลองอีกครั้งหรือเลือกประโยคตอบแทน');
}
function bg(s){s=s.toLowerCase().replace(/[^a-z0-9฀-๿]/g,'');var o=[];for(var i=0;i<s.length-1;i++)o.push(s.slice(i,i+2));return o}
function dice(a,b){
  var A=bg(a),B=bg(b);if(!A.length||!B.length)return 0;
  var m={};A.forEach(function(x){m[x]=(m[x]||0)+1});var h=0;
  B.forEach(function(x){if(m[x]>0){h++;m[x]--}});
  return 2*h/(A.length+B.length);
}
function gloss(w){return G[w]||G[w.replace(/s$/,'')]||G[w.replace(/es$/,'')]||G[w.replace(/ed$/,'')]||G[w.replace(/ing$/,'')]||null}
function words(text){
  return text.split(/(\s+)/).map(function(t){
    if(!/[A-Za-z]/.test(t))return esc(t);
    var c=t.toLowerCase().replace(/[^a-z'-]/g,'');
    return '<span class="w" role="button" tabindex="0" data-w="'+esc(c)+'">'+esc(t)+'</span>';
  }).join('');
}
function reg(en,th,cat,aid){st.lines.push({en:en,th:th,cat:cat,aid:aid||null});return st.lines.length-1}
function isSaved(en){return st.vault.some(function(v){return v.en===en})}
var IC={
 play:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
 copy:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
 mic:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 big:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function icSave(on){return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" fill="'+(on?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}
function acts(i,side,extra){
  var l=st.lines[i];var saved=isSaved(l.en);
  return '<div class="acts">'+
   '<button class="btn sm" data-act="say" data-i="'+i+'" data-side="'+side+'" data-rate="1">'+IC.play+'ฟัง</button>'+
   '<button class="btn sm" data-act="say" data-i="'+i+'" data-side="'+side+'" data-rate="0.7">ฟังช้า</button>'+
   '<button class="btn sm" data-act="copy" data-i="'+i+'" data-side="'+side+'">'+IC.copy+'คัดลอก</button>'+
   '<button class="btn sm'+(saved?' on':'')+'" data-act="save" data-i="'+i+'">'+icSave(saved)+(saved?'เก็บแล้ว':'เก็บ')+'</button>'+(extra||'')+'</div>';
}

/* ---------- faces ---------- */
var fid=0;
function faceSVG(ch,mood){
  fid++;
  var brow=mood==='thinking'?'M60 65 L76 67 M84 62 L100 58':mood==='happy'?'M60 66 Q68 60 76 66 M84 66 Q92 60 100 66':'M60 65 L76 65 M84 65 L100 65';
  var smile=mood==='happy'?'M67 91 Q80 106 93 91':mood==='thinking'?'M72 96 Q80 93 88 97':'M70 93 Q80 100 90 93';
  var hair=ch.beard
    ?'<path d="M50 72 Q48 38 80 38 Q112 38 110 72 Q102 52 80 52 Q58 52 50 72Z" fill="'+ch.hair+'"/><path d="M52 84 Q56 114 80 114 Q104 114 108 84 Q100 101 80 101 Q60 101 52 84Z" fill="'+ch.hair+'"/>'
    :(ch.glasses?'<path d="M46 94 Q36 34 80 34 Q124 34 114 94 Q112 62 96 54 Q80 62 64 54 Q48 62 46 94Z" fill="'+ch.hair+'"/>'
    :'<path d="M50 70 Q50 38 80 38 Q110 38 110 70 Q104 52 80 50 Q56 52 50 70Z" fill="'+ch.hair+'"/>');
  var gl=ch.glasses?'<g fill="none" stroke="#2b3a40" stroke-width="2"><circle cx="68" cy="76" r="10"/><circle cx="92" cy="76" r="10"/><path d="M78 76h4"/></g>':'';
  return '<svg viewBox="0 0 160 160" role="img" aria-label="'+esc(ch.name)+'"><defs><clipPath id="cp'+fid+'"><circle cx="80" cy="80" r="78"/></clipPath></defs><g clip-path="url(#cp'+fid+')">'+
   '<rect width="160" height="160" fill="var(--face-bg)"/>'+
   '<path d="M14 160 Q20 118 80 116 Q140 118 146 160Z" fill="'+ch.shirt+'"/>'+
   '<rect x="70" y="98" width="20" height="24" fill="'+ch.skin+'"/>'+
   '<ellipse cx="80" cy="76" rx="30" ry="34" fill="'+ch.skin+'"/>'+hair+
   '<circle class="eye" cx="68" cy="76" r="3.2" fill="#1c2b30"/><circle class="eye" cx="92" cy="76" r="3.2" fill="#1c2b30"/>'+gl+
   '<path d="'+brow+'" stroke="#3a3128" stroke-width="2.4" stroke-linecap="round" fill="none"/>'+
   '<path d="M80 80 L77 88 L82 88" stroke="rgba(0,0,0,.25)" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+
   '<path class="m-smile" d="'+smile+'" stroke="#7b2d2d" stroke-width="2.6" fill="none" stroke-linecap="round"/>'+
   '<ellipse class="m-open" cx="80" cy="95" rx="7" ry="5" fill="#7b2d2d"/></g></svg>';
}

/* ---------- views ---------- */
function catById(id){return CATS.filter(function(x){return x.id===id})[0]}
function vMenu(){
  var h='<div class="cats">';
  CATS.forEach(function(c){
    h+='<button class="cat" data-act="cat" data-cat="'+c.id+'"><span class="mini">'+faceSVG(CHARS[c.char],'happy')+'</span><span><b>'+c.th+'</b><span class="muted small">'+c.en+' · '+c.turns.length+' บทสนทนา · คุยกับ '+CHARS[c.char].name+'</span></span></button>';
  });
  h+='</div>';
  return '<div class="card"><h2>เลือกหมวดที่อยากฝึก</h2><p class="muted small" style="margin-top:4px">กดเลือกหมวด ฟังลูกค้าพูด แล้วตอบด้วยเสียงหรือเลือกประโยคตอบ แต่ละข้อมี 3 ระดับ สั้น มาตรฐาน สุภาพ</p></div>'+h+
   '<p class="note">บทสนทนาเป็นตัวอย่างสำหรับฝึกภาษา ไม่ใช่คำแนะนำทางกฎหมาย เงื่อนไขซื้อขายจริงควรตรวจกับเอกสารและทนาย</p>';
}
function vScene(){
  var c=catById(st.cat);var ch=CHARS[c.char];
  var head='<div class="row" style="justify-content:space-between"><button class="btn sm" data-act="back">← หมวดทั้งหมด</button><span class="row"><b>'+c.th+'</b><button class="btn sm'+(st.showTh?' on':'')+'" data-act="toggleTh" aria-pressed="'+st.showTh+'">คำแปลไทย</button></span></div>';
  var dots='<div class="dots" aria-label="ความคืบหน้า">'+c.turns.map(function(_,i){return '<i class="'+(i<st.turn||(i===st.turn&&st.picked!==null)?'done':'')+'"></i>'}).join('')+'</div>';
  if(st.turn>=c.turns.length){
    var list=st.log.map(function(l){var i=reg(l.en,l.th,c.th,null);return '<div class="item"><div><div class="e">'+esc(l.en)+'</div><div class="muted small">'+esc(l.th)+'</div></div><button class="btn sm" data-act="save" data-i="'+i+'">'+icSave(isSaved(l.en))+'เก็บ</button></div>'}).join('');
    return head+dots+'<div class="card"><h2>จบบทสนทนา ทำครบ '+c.turns.length+' ข้อ</h2><p class="muted small" style="margin-top:4px">ประโยคที่คุณตอบ เก็บเข้าคลังไว้ทบทวนได้</p><div style="margin-top:8px">'+list+'</div><div class="acts"><button class="btn primary" data-act="cat" data-cat="'+c.id+'">เล่นอีกรอบ</button><button class="btn" data-act="back">เลือกหมวดอื่น</button><button class="btn" data-act="saveall">เก็บทั้งหมด</button></div></div>';
  }
  var t=c.turns[st.turn];var mood=st.picked!==null?'happy':t.mood;
  var i0=reg(t.en,t.th,c.th,t.id+'-q');
  var h=head+dots;
  h+='<div class="stage"><div class="face" id="faceBox">'+faceSVG(ch,mood)+'</div><div><h3>'+ch.name+'</h3><p class="muted small">'+ch.role+'</p></div></div>';
  h+='<div class="bubble"><div class="en">'+words(t.en)+'</div>'+(st.showTh?'<div class="th">'+esc(t.th)+'</div>':'')+acts(i0,'en')+'</div>';
  h+='<div class="wordbar" id="wordbar"></div>';
  if(st.picked===null){
    h+='<div class="card"><div class="row" style="flex-wrap:nowrap"><button class="mic" data-act="mic" aria-label="กดแล้วพูดตอบ">'+IC.mic+'</button><div><h3>พูดตอบเป็นภาษาอังกฤษ</h3><p class="muted small">กดไมค์แล้วพูดประโยคใดประโยคหนึ่งด้านล่าง หรือแตะเลือกเลย</p></div></div></div>';
    h+='<div class="opts">'+t.r.map(function(r,i){return '<button class="opt" data-act="pick" data-r="'+i+'"><span class="tag lv">'+LV[i]+'</span><span class="e">'+esc(r[0])+'</span><span class="t">'+esc(r[1])+'</span></button>'}).join('')+'</div>';
  }else{
    var r=t.r[st.picked];var i1=reg(r[0],r[1],c.th,t.id+'-r'+st.picked);
    h+='<div class="bubble me"><div class="row" style="margin-bottom:6px"><span class="tag">คุณตอบ · '+LV[st.picked]+'</span>'+(st.score!==null?'<span class="tag">ตรงกับประโยค '+st.score+'%</span>':'')+'</div><div class="en">'+words(r[0])+'</div>'+(st.showTh?'<div class="th">'+esc(r[1])+'</div>':'')+acts(i1,'en')+'</div>';
    h+='<button class="btn primary" data-act="next">'+(st.turn+1>=c.turns.length?'จบบทสนทนา':'ข้อต่อไป →')+'</button>';
  }
  return h;
}
function vPractice(){return st.cat?vScene():vMenu()}

function vInterp(){
  var th=st.dir==='th-en';
  var ex=PAIRS.filter(function(p){return th?p.w==='a':p.w==='c'});
  var h='<div class="seg" role="group" aria-label="ทิศทางการแปล"><button class="'+(th?'on':'')+'" data-act="dir" data-dir="th-en">ฉันพูดไทย → English</button><button class="'+(!th?'on':'')+'" data-act="dir" data-dir="en-th">ลูกค้าพูด English → ไทย</button></div>';
  h+='<div class="card"><label class="f" for="src">'+(th?'พิมพ์หรือพูดภาษาไทย':'Type or speak English')+'<textarea id="src" rows="3" placeholder="'+(th?'เช่น ราคาขายคือสิบสองล้านบาท':'e.g. Is the price negotiable?')+'">'+esc(st.text)+'</textarea></label>'+
   '<div class="row" style="margin-top:10px"><button class="mic" data-act="imic" aria-label="พูดเพื่อแปล" style="width:52px;height:52px">'+IC.mic+'</button><button class="btn primary" data-act="irun">แปล'+(FEAT.credit?' (ใช้ 1 เครดิต)':'')+'</button><button class="btn" data-act="iclear">ล้าง</button></div></div>';
  h+='<div id="iout"></div>';
  h+='<div class="card"><h3>ประโยคตัวอย่าง แตะเพื่อแปล</h3><div class="chips" style="margin-top:8px">'+ex.map(function(p){var k=PAIRS.indexOf(p);return '<button class="chip" data-act="ex" data-k="'+k+'">'+esc(th?p.th:p.en)+'</button>'}).join('')+'</div></div>';
  h+='<p class="note">ต้นแบบ: แปลได้เฉพาะประโยคตัวอย่างที่เตรียมไว้ การแปลอิสระต้องต่อบริการแปลที่มีค่าใช้จ่ายต่อครั้ง การแปลผิดในเรื่องสัญญามีผลทางกฎหมาย ควรตรวจกับเอกสารจริง</p>';
  return h;
}
function outCard(o){
  if(!o)return '';
  if(o.blocked)return '<div class="card"><h3>เครดิตหมด</h3><p class="muted" style="margin-top:4px">ระบบหยุดแปลจนกว่าจะเติมเครดิต</p>'+(FEAT.credit?'<div class="acts"><button class="btn primary" data-act="tab" data-tab="credit">ไปหน้าเติมเงิน</button></div>':'')+'</div>';
  if(o.miss)return '<div class="card"><h3>ยังแปลประโยคนี้ไม่ได้ในต้นแบบ</h3><p class="muted" style="margin-top:4px">'+(FEAT.credit?'ไม่ได้หักเครดิต ':'')+'เลือกจากประโยคตัวอย่างด้านล่าง หรือรอเวอร์ชันที่ต่อบริการแปลจริง</p></div>';
  var th=st.dir==='th-en';var i=reg(o.en,o.th,'ล่ามสด',null);
  return '<div class="card out"><p class="muted small">'+(th?'คุณพูดว่า: '+esc(o.th):'ลูกค้าพูดว่า: '+esc(o.en))+'</p><div class="en" style="margin-top:6px">'+esc(th?o.en:o.th)+'</div>'+
   acts(i,th?'en':'th','<button class="btn sm" data-act="big" data-i="'+i+'" data-side="'+(th?'en':'th')+'">'+IC.big+'จอใหญ่</button>')+'</div>';
}
function updateOut(){var e=$('#iout');if(e){st.lines=[];e.innerHTML=outCard(st.out)}}

function vaultItems(){return st.vault.length?st.vault:DEMO}
function vVault(){
  var real=st.vault.length>0;var items=vaultItems();
  if(st.review){
    var it=items[st.review.i];if(!it){st.review=null;return vVault()}
    return '<div class="row" style="justify-content:space-between"><button class="btn sm" data-act="rexit">← กลับคลัง</button><span class="muted small">'+(st.review.i+1)+' / '+items.length+'</span></div>'+
     '<div class="card flash" data-act="flip" role="button" tabindex="0" aria-label="แตะเพื่อพลิกการ์ด">'+(st.review.flip?'<div class="en">'+esc(it.en)+'</div>':'<div class="muted small">แปลเป็นอังกฤษว่าอะไร</div><div style="font-size:20px;font-weight:600">'+esc(it.th)+'</div>')+'<div class="muted small">แตะเพื่อ'+(st.review.flip?'ดูโจทย์':'ดูคำตอบ')+'</div></div>'+
     '<div class="row"><button class="btn" data-act="rprev">ก่อนหน้า</button><button class="btn" data-act="rsay" data-id="'+it.id+'">'+IC.play+'ฟัง</button><button class="btn primary" data-act="rnext">ถัดไป</button></div>';
  }
  var groups={};items.forEach(function(v){(groups[v.cat]=groups[v.cat]||[]).push(v)});
  var h='<div class="card"><h2>คลังศัพท์ของฉัน</h2><p class="muted small" style="margin-top:4px">'+(real?'เก็บไว้ '+items.length+' รายการ':'ตอนนี้เป็นรายการตัวอย่าง กดปุ่ม เก็บ ข้างประโยคหรือแตะคำเพื่อเริ่มสะสมของจริง')+'</p>'+
   '<div class="acts"><button class="btn primary" data-act="rstart">ทบทวนแฟลชการ์ด</button><button class="btn" data-act="vcopy">คัดลอกทั้งหมด</button></div></div>';
  Object.keys(groups).forEach(function(k){
    h+='<div class="card"><h3>'+esc(k)+'</h3>'+groups[k].map(function(v){
      return '<div class="item"><div style="min-width:0"><div class="e">'+esc(v.en)+'</div><div class="muted small">'+esc(v.th)+'</div></div><div class="row" style="flex:none"><button class="btn sm" data-act="rsay" data-id="'+v.id+'" aria-label="ฟัง">'+IC.play+'</button>'+(real?'<button class="btn sm" data-act="vdel" data-id="'+v.id+'">ลบ</button>':'')+'</div></div>';
    }).join('')+'</div>';
  });
  h+='<p class="note">คลังเก็บอยู่ในเบราว์เซอร์เครื่องนี้ ถ้าล้างข้อมูลหรือเปลี่ยนเครื่องจะหาย ใช้ปุ่มคัดลอกทั้งหมดเพื่อสำรองไว้ใน Line หรือโน้ต</p>';
  return h;
}

function calcRows(){
  return calc.packs.map(function(p,i){
    var fee=p.p*calc.fee/100,cost=p.c*calc.cpt,profit=p.p-fee-cost,m=p.p>0?profit/p.p*100:0;
    var need=profit>0?Math.ceil((calc.target+calc.fixed)/profit):null;
    return {i:i,c:p.c,p:p.p,fee:fee,cost:cost,profit:profit,m:m,need:need};
  });
}
function calcOut(){
  var rows=calcRows();
  var h='<div class="tbl"><table><thead><tr><th>แพ็ก</th><th>ค่าธรรมเนียมชำระ</th><th>ต้นทุนแปล</th><th>กำไร</th><th>กำไร %</th><th>ต้องขาย/เดือน</th></tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr><td>'+fmt(r.c,0)+' ครั้ง</td><td>'+fmt(r.fee)+'</td><td>'+fmt(r.cost)+'</td><td class="'+(r.profit>0?'good':'bad')+'">'+fmt(r.profit)+'</td><td class="'+(r.m>=40?'good':r.m>=20?'':'bad')+'">'+fmt(r.m,0)+'%</td><td>'+(r.need===null?'ขาดทุน':fmt(r.need,0)+' แพ็ก')+'</td></tr>';
  });
  h+='</tbody></table></div>';
  var thin=rows.filter(function(r){return r.m<30});
  var be=rows.map(function(r){return fmt(r.cost/(1-calc.fee/100))}).join(' / ');
  h+='<p class="small" style="margin-top:8px">ราคาต่ำสุดที่ไม่ขาดทุน ต่อแพ็ก: '+be+' บาท</p>';
  if(thin.length)h+='<p class="note" style="margin-top:8px">แพ็กที่กำไรต่ำกว่า 30% เสี่ยงหลุดขาดทุนเมื่อค่าแปลหรือค่าธรรมเนียมเปลี่ยน ลองปรับราคาขึ้นหรือลดจำนวนครั้งต่อแพ็ก</p>';
  else h+='<p class="note" style="margin-top:8px">ทุกแพ็กมีกำไรเกิน 30% เครดิตที่ลูกค้าซื้อแล้วใช้ไม่หมดยังเป็นกำไรเพิ่ม แต่ยังไม่นับในตารางนี้</p>';
  return h;
}
function vCredit(){
  var lv=level();var pct=Math.max(0,Math.min(100,wallet.bal/wallet.cap*100));
  var h='<div class="card"><p class="muted small">เครดิตคงเหลือ (1 เครดิต = แปล 1 ครั้ง)</p><div class="row" style="align-items:baseline;justify-content:space-between"><span class="bal" id="balnum">'+fmt(wallet.bal,0)+'</span><span class="tag" id="lvtag">'+LVTXT[lv]+'</span></div>'+
   '<div style="margin:12px 0 4px"><div class="meter" role="img" aria-label="เครดิตเหลือ '+Math.round(pct)+' เปอร์เซ็นต์"><div class="fill '+lv+'" id="fill" style="width:'+pct+'%"></div><i style="left:10%"></i><i style="left:25%"></i></div><div class="ticks"><span style="left:10%">10%</span><span style="left:25%">25%</span></div></div>'+
   '<p class="muted small">ถัง '+fmt(wallet.cap,0)+' ครั้งจากการเติมล่าสุด · เขียว เพียงพอ · เหลือง ≤25% ใกล้หมด · แดง ≤10% ให้เติมเลย · 0 หยุดแปล</p>'+
   '<div class="acts"><button class="btn sm" data-act="use" data-n="1">จำลองใช้ 1</button><button class="btn sm" data-act="use" data-n="10">จำลองใช้ 10</button><button class="btn sm" data-act="use" data-n="50">จำลองใช้ 50</button><button class="btn sm" data-act="reset">รีเซ็ตเป็น 100</button></div></div>';
  h+='<div class="card"><h3>แพ็กเติมเงิน</h3><div class="packs" style="margin-top:10px">'+calc.packs.map(function(p,i){
    return '<div class="pack"><b>'+fmt(p.c,0)+' ครั้ง</b><span class="muted small">฿'+fmt(p.p,0)+' · ฿'+fmt(p.p/p.c)+' ต่อครั้ง</span><button class="btn primary sm" data-act="topup" data-i="'+i+'">จำลองเติมเงิน</button></div>';
  }).join('')+'</div><p class="note" style="margin-top:10px">ปุ่มนี้จำลองการเติมเท่านั้น ยังไม่มีการตัดเงินจริง ของจริงต้องต่อพร้อมเพย์หรือบัตรผ่านผู้ให้บริการชำระเงิน และเก็บยอดเครดิตไว้ที่ฝั่งเซิร์ฟเวอร์ เพราะยอดที่เก็บในเบราว์เซอร์แก้ไขได้</p></div>';
  h+='<div class="card"><h3>เครื่องคิดกำไร</h3><p class="muted small" style="margin-top:4px">ตัวเลขทั้งหมดเป็นค่าสมมติที่แก้ได้ ใส่ต้นทุนจริงจากบิลบริการแปลและใบแจ้งค่าธรรมเนียมของผู้ให้บริการชำระเงิน</p>'+
   '<div class="grid2" style="margin-top:10px">'+
   '<label class="f" for="k-cpt">ต้นทุนแปลต่อครั้ง (บาท)<input id="k-cpt" type="number" inputmode="decimal" step="0.05" min="0" value="'+calc.cpt+'" data-k="cpt"></label>'+
   '<label class="f" for="k-fee">ค่าธรรมเนียมชำระเงิน (%)<input id="k-fee" type="number" inputmode="decimal" step="0.1" min="0" value="'+calc.fee+'" data-k="fee"></label>'+
   '<label class="f" for="k-fixed">ค่าคงที่ต่อเดือน (บาท)<input id="k-fixed" type="number" inputmode="decimal" step="50" min="0" value="'+calc.fixed+'" data-k="fixed"></label>'+
   '<label class="f" for="k-target">เป้ากำไรต่อเดือน (บาท)<input id="k-target" type="number" inputmode="decimal" step="500" min="0" value="'+calc.target+'" data-k="target"></label></div>'+
   '<div class="tbl" style="margin-top:12px"><table><thead><tr><th>จำนวนครั้ง</th><th>ราคาขาย (บาท)</th></tr></thead><tbody>'+calc.packs.map(function(p,i){return '<tr><td><input type="number" inputmode="numeric" min="1" value="'+p.c+'" data-pk="'+i+'" data-f="c" aria-label="จำนวนครั้งแพ็ก '+(i+1)+'"></td><td><input type="number" inputmode="numeric" min="0" value="'+p.p+'" data-pk="'+i+'" data-f="p" aria-label="ราคาแพ็ก '+(i+1)+'"></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div id="calc-out" style="margin-top:12px">'+calcOut()+'</div></div>';
  return h;
}

/* ---------- render ---------- */
function updatePill(){
  var p=$('#pill');if(!p)return;
  p.hidden=!FEAT.credit;
  var lv=level();$('#pdot').className='dot '+lv;$('#ptxt').textContent='เครดิต '+fmt(wallet.bal,0);
}
function buildNav(){
  var tabs=[['practice','ฝึกพูด',true],['interp','ล่ามสด',!!FEAT.interp],['vault','คลังศัพท์',true],['credit','เครดิต',!!FEAT.credit]].filter(function(t){return t[2]});
  var nav=$('#nav');nav.style.gridTemplateColumns='repeat('+tabs.length+',1fr)';
  nav.innerHTML=tabs.map(function(t){return '<button class="tab" data-act="tab" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('');
}
function render(){
  st.lines=[];
  var tabs=document.querySelectorAll('.tab');
  for(var i=0;i<tabs.length;i++){if(tabs[i].getAttribute('data-tab')===st.tab)tabs[i].setAttribute('aria-current','page');else tabs[i].removeAttribute('aria-current')}
  var v=st.tab==='practice'?vPractice():st.tab==='interp'?vInterp():st.tab==='vault'?vVault():vCredit();
  $('#app').innerHTML='<div style="display:flex;flex-direction:column;gap:14px;min-width:0">'+v+'</div>';
  if(st.tab==='interp')updateOut();
  updatePill();
}
function refreshWallet(){
  updatePill();
  if(st.tab==='credit'){
    var lv=level();var pct=Math.max(0,Math.min(100,wallet.bal/wallet.cap*100));
    var f=$('#fill');if(f){f.style.width=pct+'%';f.className='fill '+lv}
    var n=$('#balnum');if(n)n.textContent=fmt(wallet.bal,0);
    var t=$('#lvtag');if(t)t.textContent=LVTXT[lv];
  }
}
function spend(n){
  var before=level();wallet.bal=Math.max(0,wallet.bal-n);saveWallet();refreshWallet();
  var after=level();
  if(after!==before&&after!=='ok'){toast(after==='warn'?'เครดิตเหลือไม่ถึง 25% ควรเติมเร็ว ๆ นี้':after==='crit'?'เครดิตเหลือไม่ถึง 10% เติมเงินได้เลย':'เครดิตหมดแล้ว ระบบหยุดแปล')}
}
function setWord(w){
  st.word=w;var el=$('#wordbar');if(!el)return;
  var g=gloss(w);
  el.innerHTML='<b>'+esc(w)+'</b><span>'+(g?esc(g):'ยังไม่มีในพจนานุกรมตัวอย่าง')+'</span><button class="btn sm" data-act="wsay">'+IC.play+'ฟัง</button><button class="btn sm" data-act="wsave">เก็บคำนี้</button>';
}
function addVault(en,th,cat){
  if(isSaved(en)){st.vault=st.vault.filter(function(v){return v.en!==en});saveVault();toast('เอาออกจากคลังแล้ว');return false}
  st.vault.push({id:'v'+Date.now()+Math.floor(Math.random()*1000),en:en,th:th||'-',cat:cat||'ทั่วไป'});saveVault();toast('เก็บเข้าคลังแล้ว');return true;
}
function pick(r,score){
  st.picked=r;st.score=score==null?null:score;
  var c=catById(st.cat);var t=c.turns[st.turn];
  st.log.push({en:t.r[r][0],th:t.r[r][1]});
  render();
}
function enterTurn(){
  render();
  var c=catById(st.cat);
  if(c&&st.turn<c.turns.length){var t=c.turns[st.turn];playLine(t.id+'-q',t.en,'en-US',1,true)}
}
function runInterp(){
  var ta=$('#src');if(ta)st.text=ta.value;
  var txt=st.text.trim();if(!txt){toast('พิมพ์หรือพูดก่อนนะ');return}
  if(FEAT.credit&&wallet.bal<=0){st.out={blocked:true};updateOut();return}
  var th=st.dir==='th-en';var best=null,bs=0;
  PAIRS.forEach(function(p){var s=dice(txt,th?p.th:p.en);if(s>bs){bs=s;best=p}});
  if(best&&bs>=0.55){st.out=best;if(FEAT.credit)spend(1)}else st.out={miss:true};
  updateOut();
}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  if(!C)return;
  var wEl=e.target.closest('.w');
  if(wEl){setWord(wEl.getAttribute('data-w'));return}
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.getAttribute('data-act');
  var L=function(){return st.lines[+b.getAttribute('data-i')]};
  if(a==='tab'){st.tab=b.getAttribute('data-tab');render();window.scrollTo(0,0)}
  else if(a==='cat'){st.cat=b.getAttribute('data-cat');st.turn=0;st.picked=null;st.score=null;st.log=[];enterTurn();window.scrollTo(0,0)}
  else if(a==='back'){st.cat=null;st.picked=null;render()}
  else if(a==='toggleTh'){st.showTh=!st.showTh;store.set('th',st.showTh?'1':'0');render()}
  else if(a==='say'){var l=L();var side=b.getAttribute('data-side');var rate=parseFloat(b.getAttribute('data-rate'));
    if(side==='th')speak(l.th,'th-TH',rate,false);else playLine(l.aid,l.en,'en-US',rate,st.tab==='practice')}
  else if(a==='copy'){var l2=L();copyText(b.getAttribute('data-side')==='th'?l2.th:l2.en)}
  else if(a==='save'){var l3=L();addVault(l3.en,l3.th,l3.cat);render()}
  else if(a==='saveall'){var c=catById(st.cat);st.log.forEach(function(l4){if(!isSaved(l4.en)){st.vault.push({id:'v'+Date.now()+Math.floor(Math.random()*1000),en:l4.en,th:l4.th,cat:c.th})}});saveVault();toast('เก็บประโยคที่ตอบแล้ว');render()}
  else if(a==='pick'){pick(+b.getAttribute('data-r'),null)}
  else if(a==='next'){st.turn++;st.picked=null;st.score=null;enterTurn();window.scrollTo(0,0)}
  else if(a==='mic'){
    var c2=catById(st.cat);var t=c2.turns[st.turn];
    listen('en-US',function(txt){
      var bi=0,bsc=0;t.r.forEach(function(r,i){var s=dice(txt,r[0]);if(s>bsc){bsc=s;bi=i}});
      if(bsc<0.4){toast('ได้ยินว่า "'+txt+'" ยังไม่ตรงกับประโยคตัวอย่าง ลองอีกครั้งหรือแตะเลือก')}
      else pick(bi,Math.round(bsc*100));
    },micFail);
  }
  else if(a==='wsay'&&st.word)speak(st.word,'en-US',0.8,false);
  else if(a==='wsave'&&st.word){var g=gloss(st.word);addVault(st.word,g||'-','คำศัพท์');setWord(st.word)}
  else if(a==='dir'){st.dir=b.getAttribute('data-dir');st.out=null;st.text='';render()}
  else if(a==='irun'){runInterp()}
  else if(a==='iclear'){st.text='';st.out=null;render()}
  else if(a==='imic'){
    listen(st.dir==='th-en'?'th-TH':'en-US',function(txt){st.text=txt;var ta=$('#src');if(ta)ta.value=txt;runInterp()},micFail);
  }
  else if(a==='ex'){var p=PAIRS[+b.getAttribute('data-k')];st.text=st.dir==='th-en'?p.th:p.en;var ta2=$('#src');if(ta2)ta2.value=st.text;runInterp()}
  else if(a==='big'){var l5=L();var tx=b.getAttribute('data-side')==='en'?l5.en:l5.th;var bg2=$('#big');bg2.innerHTML='<div class="txt">'+esc(tx)+'</div><div class="row" style="justify-content:center"><button class="btn primary" data-act="bigclose">ปิด</button></div>';bg2.hidden=false}
  else if(a==='bigclose'){$('#big').hidden=true}
  else if(a==='rstart'){st.review={i:0,flip:false};render()}
  else if(a==='rexit'){st.review=null;render()}
  else if(a==='flip'){st.review.flip=!st.review.flip;render()}
  else if(a==='rnext'||a==='rprev'){var n=vaultItems().length;st.review.i=(st.review.i+(a==='rnext'?1:n-1))%n;st.review.flip=false;render()}
  else if(a==='rsay'){var id=b.getAttribute('data-id');var it=vaultItems().filter(function(v){return v.id===id})[0];if(it)speak(it.en,'en-US',0.9,false)}
  else if(a==='vdel'){var id2=b.getAttribute('data-id');st.vault=st.vault.filter(function(v){return v.id!==id2});saveVault();render()}
  else if(a==='vcopy'){copyText(vaultItems().map(function(v){return v.en+' = '+v.th}).join('\n'))}
  else if(a==='use'){spend(+b.getAttribute('data-n'))}
  else if(a==='reset'){wallet={bal:100,cap:100};saveWallet();render()}
  else if(a==='topup'){var pk=calc.packs[+b.getAttribute('data-i')];wallet.bal+=pk.c;wallet.cap=Math.max(pk.c,wallet.bal);saveWallet();refreshWallet();toast('จำลองเติมเงินแล้ว +'+fmt(pk.c,0)+' ครั้ง')}
});
document.addEventListener('keydown',function(e){
  if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.getAttribute&&(e.target.classList.contains('w')||e.target.getAttribute('data-act')==='flip')){e.preventDefault();e.target.click()}
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='src'){st.text=t.value;return}
  var k=t.getAttribute&&t.getAttribute('data-k');
  if(k){calc[k]=Math.max(0,parseFloat(t.value)||0);saveCalc();var o=$('#calc-out');if(o)o.innerHTML=calcOut();return}
  var pk=t.getAttribute&&t.getAttribute('data-pk');
  if(pk!==null&&pk!==undefined){calc.packs[+pk][t.getAttribute('data-f')]=Math.max(0,parseFloat(t.value)||0);saveCalc();var o2=$('#calc-out');if(o2)o2.innerHTML=calcOut()}
});

/* ---------- access code gate ---------- */
function sha256hex(s){
  if(!(window.crypto&&crypto.subtle))return Promise.reject(new Error('nocrypto'));
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(buf){
    return Array.prototype.map.call(new Uint8Array(buf),function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
  });
}
function showGate(onOk){
  $('#nav').hidden=true;
  $('#app').innerHTML='<div class="card"><h2>ใส่รหัสเข้าใช้งาน</h2><p class="muted small" style="margin-top:4px">รหัสส่งให้ทาง Line หลังชำระเงิน</p>'+
   '<label class="f" for="code" style="margin-top:12px">รหัสเข้าใช้<input id="code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>'+
   '<div class="acts"><button class="btn primary" id="unlock">เข้าใช้งาน</button></div><p id="gerr" class="small bad" style="margin-top:8px"></p></div>';
  function tryIt(){
    var v=($('#code').value||'').trim().toUpperCase();if(!v)return;
    sha256hex(SLUG+':'+v).then(function(h){
      if(h===CFG.codeHash){store.set('unlock','1');$('#nav').hidden=false;onOk()}
      else $('#gerr').textContent='รหัสไม่ถูกต้อง ตรวจตัวอักษรอีกครั้ง';
    },function(){$('#gerr').textContent='เบราว์เซอร์นี้ตรวจรหัสไม่ได้ กรุณาเปิดผ่านลิงก์ https ด้วย Chrome หรือ Safari'});
  }
  $('#unlock').addEventListener('click',tryIt);
  $('#code').addEventListener('keydown',function(e){if(e.key==='Enter')tryIt()});
}

/* ---------- boot ---------- */
function start(){
  initState();buildNav();render();
}
function boot(){
  var t=$('#ptitle');if(t)t.textContent=CFG.product||'Property Talk';
  var s=$('#psub');if(s)s.textContent=CFG.customerName?'สำหรับ '+CFG.customerName:'ฝึกพูดอังกฤษสำหรับนายหน้าอสังหา';
  document.title=CFG.product||'Property Talk';
  $('#app').innerHTML='<p class="muted">กำลังโหลด...</p>';
  fetch(CFG.contentUrl||'../../core/content.json').then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(function(data){
    C=data;CHARS=data.chars;CATS=data.cats;G=data.glossary;PAIRS=data.pairs;DEMO=data.demo;
    if(CFG.codeHash&&store.get('unlock')!=='1')showGate(start);else start();
  }).catch(function(){
    $('#app').innerHTML='<div class="card"><h3>โหลดเนื้อหาไม่ได้</h3><p class="muted small" style="margin-top:4px">ต้องเปิดผ่านลิงก์เว็บ ไม่ใช่เปิดไฟล์ตรงจากเครื่อง ถ้าเปิดผ่านลิงก์แล้วยังเป็นแบบนี้ ให้แจ้งผู้ขาย</p></div>';
  });
}
if('speechSynthesis' in window){try{speechSynthesis.getVoices()}catch(e){}}
boot();
})();
