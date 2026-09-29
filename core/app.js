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
function fmt(n,d){return Number(n).toLocaleString(NL||'th-TH',{maximumFractionDigits:d==null?2:d})}

var BASE=null,CASTS=null,PACKS={},CATS=[],G={},PAIRS=[],DEMO=[],REACT=[],RM=[];
/* Language model: NATIVE = what the user speaks (UI + translations), TARGET = what they practise.
   Inside the views a line is {en: text in TARGET, th: text in NATIVE} (names kept from the first Thai/English version). */
var NATIVE='th',TARGET='en',GENDER='f',TL='en-US',NL='th-TH';
var CORE=CFG.coreBase||'../../core/';
var LANGS=[['th','ไทย','TH','th-TH'],['en','English','EN','en-US'],['zh','中文','ZH','zh-CN'],['ru','Русский','RU','ru-RU'],['de','Deutsch','DE','de-DE'],['fr','Français','FR','fr-FR'],['ja','日本語','JA','ja-JP'],['ko','한국어','KO','ko-KR']];/*keep*/
var MOUTH_FOR={neutral:'neutral',happy:'smile',delighted:'grin',thinking:'think',concerned:'frown',surprised:'o'};
var LV=[],LVTXT={};
var AUDIO_BASE=CFG.audioBase||'../../core/audio/';

var wallet,calc,st;
function initState(){
  var W0=jget('wallet',null);
  wallet=(W0&&typeof W0.bal==='number')?W0:{bal:100,cap:100};
  calc=jget('calc',null)||{cpt:0.5,fee:3.5,fixed:0,target:20000,packs:[{c:100,p:199},{c:300,p:499},{c:1000,p:1290}]};
  st={tab:'practice',cat:null,turn:0,picked:null,score:null,log:[],showTh:store.get('th')!=='0',word:null,
      vault:jget(vkey(),[]),review:null,dir:'th-en',text:'',out:null,lines:[],ring:false,sheet:false,mood:'neutral',curChar:null,callStart:0,callEnd:0};
}
function saveWallet(){store.set('wallet',JSON.stringify(wallet))}
function vkey(){return NATIVE==='th'&&TARGET==='en'?'vault':'vault_'+NATIVE+'_'+TARGET}
function saveVault(){store.set(vkey(),JSON.stringify(st.vault))}
function saveCalc(){store.set('calc',JSON.stringify(calc))}
function level(){
  if(wallet.bal<=0)return 'out';
  var p=wallet.bal/wallet.cap*100;
  if(p<=10)return 'crit';
  if(p<=25)return 'warn';
  return 'ok';
}


/* ---------- languages ---------- */
function _(s){
  if(NATIVE==='th')return s;
  var u=(PACKS[NATIVE]&&PACKS[NATIVE].ui)||{},f=(PACKS.en&&PACKS.en.ui)||{};
  return s.replace(/[^<>"]*[฀-๿][^<>"]*/g,function(run){
    var m=run.match(/^(\s*)([\s\S]*?)(\s*)$/);var k=m[2];
    var v=u[k];if(v===undefined)v=f[k];
    return v===undefined?run:m[1]+v+m[3];
  });
}

/* ---------- flags (inline SVG, so they show on every device) ---------- */
function star(cx,cy,r,rot){var p=[];for(var i=0;i<10;i++){var a=(rot||-90)*Math.PI/180+i*Math.PI/5,rr=i%2?r*.382:r;p.push((cx+rr*Math.cos(a)).toFixed(2)+','+(cy+rr*Math.sin(a)).toFixed(2))}return '<polygon points="'+p.join(' ')+'" fill="#ffde00"/>'}
function flag(c){
  var b={
   th:'<rect width="30" height="20" fill="#a51931"/><rect y="3.33" width="30" height="13.34" fill="#f4f5f8"/><rect y="6.66" width="30" height="6.68" fill="#2d2a4a"/>',
   en:'<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.4"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6"/><path d="M15 0V20M0 10H30" stroke="#c8102e" stroke-width="3.4"/>',
   zh:'<rect width="30" height="20" fill="#de2910"/>'+star(5,5,3)+star(10,2.2,1,-70)+star(12,4.4,1,-50)+star(12,7.4,1,-25)+star(10,9.6,1,-10),
   ru:'<rect width="30" height="20" fill="#fff"/><rect y="6.66" width="30" height="6.67" fill="#0039a6"/><rect y="13.33" width="30" height="6.67" fill="#d52b1e"/>',
   de:'<rect width="30" height="20" fill="#000"/><rect y="6.66" width="30" height="6.67" fill="#dd0000"/><rect y="13.33" width="30" height="6.67" fill="#ffce00"/>',
   fr:'<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>',
   ja:'<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>',
   ko:'<rect width="30" height="20" fill="#fff"/><path d="M10.5 10a4.5 4.5 0 0 1 9 0z" fill="#cd2e3a"/><path d="M10.5 10a4.5 4.5 0 0 0 9 0z" fill="#0047a0"/><circle cx="12.75" cy="10" r="2.25" fill="#0047a0"/><circle cx="17.25" cy="10" r="2.25" fill="#cd2e3a"/>'+
      [[5,4,-35],[25,4,35],[5,16,35],[25,16,-35]].map(function(q){return '<g transform="translate('+q[0]+' '+q[1]+') rotate('+q[2]+')" stroke="#000" stroke-width=".9"><path d="M-2.2 -1.4H2.2M-2.2 0H2.2M-2.2 1.4H2.2"/></g>'}).join('')
  }[c]||'';
  return '<svg class="flag" viewBox="0 0 30 20" aria-hidden="true">'+b+'</svg>';
}
function langInfo(c){for(var i=0;i<LANGS.length;i++)if(LANGS[i][0]===c)return LANGS[i];return LANGS[1]}
function cast(){var c=CASTS[TARGET]||CASTS.en;return c[GENDER]||c.f}
function origin(){var o=PACKS[NATIVE]&&PACKS[NATIVE].origin;return (o&&o[TARGET])||''}
function aidQ(id){return TARGET+'/'+GENDER+'/'+id+'-q'}
function aidR(id,i){return TARGET+'/'+id+'-r'+i}
function aidX(i){return TARGET+'/'+GENDER+'/react-'+i}
function loadPack(code){
  if(PACKS[code])return Promise.resolve(PACKS[code]);
  if(window.PT_INLINE&&PT_INLINE.lang&&PT_INLINE.lang[code]){PACKS[code]=PT_INLINE.lang[code];return Promise.resolve(PACKS[code])}
  return fetch(CORE+'lang/'+code+'.json').then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(function(d){PACKS[code]=d;return d});
}
function applyLang(){
  var n=PACKS[NATIVE],t=PACKS[TARGET];
  TL=langInfo(TARGET)[3];NL=langInfo(NATIVE)[3];
  CATS=BASE.cats.map(function(c){return {id:c.id,th:n.cats[c.id],en:t.cats[c.id],turns:c.turns.map(function(x){return {id:x.id,mood:x.mood,en:t.turns[x.id].q,th:n.turns[x.id].q,r:[0,1,2].map(function(i){return [t.turns[x.id].r[i],n.turns[x.id].r[i]]})}})}});
  PAIRS=BASE.pairs.map(function(p,i){return {w:p.w,en:t.pairs[i],th:n.pairs[i]}});
  DEMO=BASE.demo.map(function(d,i){return {id:d.id,en:t.demo[i],th:n.demo[i],cat:_('ตัวอย่าง')}});
  REACT=[0,1,2].map(function(i){return [t.react[i],n.react[i]]});
  RM=BASE.reaction_moods||[];
  G=n.gloss||{};
  LV=[_('สั้น'),_('มาตรฐาน'),_('สุภาพ')];
  LVTXT={ok:_('เพียงพอ'),warn:_('ใกล้หมด ควรเติมเร็ว ๆ นี้'),crit:_('เหลือน้อยมาก เติมเงินได้เลย'),out:_('หมดแล้ว ระบบหยุดแปลจนกว่าจะเติมเงิน')};
  LV=LV.map(_);Object.keys(LVTXT).forEach(function(k){LVTXT[k]=_(LVTXT[k])});
  DEMO.forEach(function(d){d.cat=_(d.cat)});
  document.documentElement.lang=NATIVE;
  var s=$('#psub');if(s)s.textContent=CFG.customerName?_('สำหรับ ')+CFG.customerName:_('ฝึกพูดสำหรับนายหน้าอสังหา');
  var pl=$('#pill');if(pl)pl.setAttribute('aria-label',_('ดูเครดิตคงเหลือ'));
  var nv=$('#nav');if(nv)nv.setAttribute('aria-label',_('เมนูหลัก'));
  buildLangBtn();
}
function buildLangBtn(){
  var hd=document.querySelector('header.top');if(!hd)return;
  var b=$('#langbtn');
  if(!b){b=document.createElement('button');b.id='langbtn';b.className='langbtn';b.setAttribute('data-act','langs');hd.insertBefore(b,$('#pill'))}
  b.setAttribute('aria-label',_('เลือกภาษา'));
  b.innerHTML=flag(NATIVE)+'<i aria-hidden="true">→</i>'+flag(TARGET);
}
function refreshAll(){
  st.vault=jget(vkey(),[]);st.cat=null;st.picked=null;st.ring=false;st.sheet=false;st.review=null;st.out=null;st.text='';st.dir='th-en';st.word=null;
  if(gateOn){showGate(gateOk);return}
  buildNav();render();
}
function setLangs(n,tg,g){
  var nn=n||NATIVE,tt=tg||TARGET;
  if(nn===tt)tt=(nn==='en')?'th':'en';
  Promise.all([loadPack(nn),loadPack(tt),loadPack('en')]).then(function(){
    stopAllSound();NATIVE=nn;TARGET=tt;GENDER=g||GENDER;
    store.set('native',NATIVE);store.set('target',TARGET);store.set('gender',GENDER);
    applyLang();refreshAll();updateLangModal();
  },function(){toast(_('โหลดภาษานี้ไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่'))});
}
function langModalHTML(){
  function chips(kind,cur,other){return '<div class="chips lchips">'+LANGS.map(function(l){return '<button class="chip'+(l[0]===cur?' on':'')+'" data-act="'+kind+'" data-l="'+l[0]+'"'+(l[0]===other?' disabled':'')+'>'+flag(l[0])+'<span>'+l[1]+'</span></button>'}).join('')+'</div>'}
  var cs=CASTS[TARGET]||CASTS.en;
  function pick(g,label){var c=cs[g];return '<button class="cpick'+(GENDER===g?' on':'')+'" data-act="gender" data-g="'+g+'" aria-pressed="'+(GENDER===g)+'"><span class="cth">'+PT_ART.avatar(c,'happy')+'</span><b>'+esc(c.name)+'</b><span class="small muted">'+label+'</span></button>'}
  return '<div class="lmc"><div class="row" style="justify-content:space-between"><h3>'+esc(_('เลือกภาษา'))+'</h3><button class="btn sm primary" data-act="langclose">'+esc(_('เสร็จ'))+'</button></div>'+
    '<p class="lmh">'+esc(_('ภาษาของฉัน'))+'</p>'+chips('lang-n',NATIVE,TARGET)+
    '<p class="lmh">'+esc(_('ภาษาคู่สนทนา'))+'</p>'+chips('lang-t',TARGET,NATIVE)+
    '<p class="lmh">'+esc(_('ลูกค้าที่คุยด้วย'))+' · '+esc(origin())+'</p><div class="cpicks">'+pick('f',esc(_('ผู้หญิง')))+pick('m',esc(_('ผู้ชาย')))+'</div></div>';
}
function updateLangModal(){var m=$('#lang');if(m&&!m.hidden)m.innerHTML=langModalHTML()}
function openLangModal(){var m=$('#lang');if(!m){m=document.createElement('div');m.id='lang';m.className='lm';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');document.body.appendChild(m)}m.innerHTML=langModalHTML();m.hidden=false}
var gateOn=false,gateOk=null;

/* ---------- helpers ---------- */
var toastT=null;
function toast(m){var t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){t.hidden=true},3200)}
function copyText(text){
  function fb(){
    try{var a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var ok=document.execCommand('copy');document.body.removeChild(a);toast(ok?_('คัดลอกแล้ว'):_('คัดลอกไม่ได้ ลองกดค้างที่ข้อความ'))}catch(e){toast(_('คัดลอกไม่ได้ ลองกดค้างที่ข้อความ'))}
  }
  try{navigator.clipboard.writeText(text).then(function(){toast(_('คัดลอกแล้ว'))},fb)}catch(e){fb()}
}
var lipT=null,lip=null;
function setMouth(key){var f=$('#faceBox');if(!f||!st.curChar)return;var m=f.querySelector('.mouth');if(m)m.innerHTML=PT_ART.mouth(st.curChar,key)}
/* ---- lip-sync: mouth shapes follow the spoken text (or the real audio loudness when we play an mp3) ---- */
var VOW_A=/[aáàâäãåạ]|[аяэ]|[ะาำอ]/i,VOW_O=/[oóòôöõuúùûüw]|[оёуюы]|[โุูว]/i,VOW_E=/[eéèêëiíìîïy]|[еи]|[เแิีึื]/i,CLOSED=/[mbp]|[мбп]|[มบป]/i;
function visSeq(text){
  var out=[],tbl=['a','o','ee','a','ee','o'];
  for(var i=0;i<text.length;i++){
    var ch=text.charAt(i),c=text.charCodeAt(i),s;
    if(/\s|[.,!?;:、。！？，…"'()]/.test(ch))s='m';
    else if(CLOSED.test(ch))s='m';
    else if(VOW_A.test(ch))s='a';
    else if(VOW_O.test(ch))s='o';
    else if(VOW_E.test(ch))s='ee';
    else if(c>=0x3040)s=tbl[c%tbl.length];
    else s='ee';
    out.push(s);
  }
  return out;
}
var MSPC={th:105,en:68,zh:190,ru:72,de:70,fr:66,ja:150,ko:140};
function msPerChar(lang){return MSPC[(lang||'en').slice(0,2)]||80}
function lipStop(){clearInterval(lipT);lipT=null;lip=null;var f=$('#faceBox');if(f)f.classList.remove('talk');setMouth(MOUTH_FOR[st.mood||'neutral']||'neutral')}
function lipTick(){
  if(!lip)return;var s;
  if(lip.amp){s=lip.amp()}
  else{var p=lip.getP?lip.getP():(Date.now()-lip.t0)/lip.dur;p=Math.max(0,Math.min(.999,p));s=lip.seq[Math.floor(p*lip.seq.length)]||'m'}
  if(s!==lip.last){lip.last=s;setMouth(s)}
}
function lipStart(o){
  lipStop();var f=$('#faceBox');if(f)f.classList.add('talk');
  o.seq=visSeq(o.text);o.t0=Date.now();o.last='';lip=o;lipT=setInterval(lipTick,55);lipTick();
}
function setTalk(on){if(!on)lipStop()}
var ac=null,ringTimer=null;
function ringOnce(){
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();var t=ac.currentTime;
    [[0,880],[.18,660],[.36,880],[.54,660]].forEach(function(n){
      var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=n[1];
      g.gain.setValueAtTime(0,t+n[0]);g.gain.linearRampToValueAtTime(.4,t+n[0]+.02);g.gain.linearRampToValueAtTime(0,t+n[0]+.16);
      o.connect(g);g.connect(ac.destination);o.start(t+n[0]);o.stop(t+n[0]+.18);
    });
  }catch(e){}
}
/* Ringtone: a short synthesised chime built as a WAV blob and played with a normal <audio> element (works on every phone browser after a tap). */
var ringUrl=null,ringAudio=null;
function ringWav(){
  var sr=11025,dur=2.4,n=Math.floor(sr*dur),pcm=new Int16Array(n);
  var notes=[[0,880],[.16,1108.7],[.32,1318.5],[.48,1108.7],[.95,880],[1.11,1108.7],[1.27,1318.5],[1.43,1108.7]];
  notes.forEach(function(nt){
    var s0=Math.floor(nt[0]*sr),len=Math.floor(.32*sr);
    for(var i=0;i<len&&s0+i<n;i++){
      var tt=i/sr,env=Math.exp(-tt*8)*Math.min(1,tt/.004),f=nt[1];
      var v=Math.sin(2*Math.PI*f*tt)+.45*Math.sin(2*Math.PI*2*f*tt)+.18*Math.sin(2*Math.PI*3*f*tt);
      pcm[s0+i]+=Math.round(v*env*9500);
    }
  });
  var buf=new ArrayBuffer(44+n*2),dv=new DataView(buf);
  function w(o,s){for(var k=0;k<s.length;k++)dv.setUint8(o+k,s.charCodeAt(k))}
  w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,sr,true);dv.setUint32(28,sr*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);
  for(var m=0;m<n;m++)dv.setInt16(44+m*2,Math.max(-32768,Math.min(32767,pcm[m])),true);
  return URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));
}
function buzz(){try{if(navigator.vibrate)navigator.vibrate([250,120,250])}catch(e){}}
function startRing(){
  stopRing();buzz();ringTimer=setInterval(buzz,2400);
  try{
    ringUrl=ringUrl||ringWav();
    ringAudio=new Audio(ringUrl);ringAudio.loop=true;ringAudio.volume=1;
    var pr=ringAudio.play();if(pr&&pr.catch)pr.catch(function(){ringOnce()});
  }catch(e){ringOnce()}
}
function stopRing(){
  clearInterval(ringTimer);ringTimer=null;
  try{if(ringAudio){ringAudio.pause();ringAudio=null}if(navigator.vibrate)navigator.vibrate(0)}catch(e){}
}
function stopAllSound(){try{if(curAudio){curAudio.pause();curAudio=null}if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}setTalk(false)}
var talkT=null,curAudio=null;
/* ---- voices: choose a female or male device voice for the client the user picked ---- */
var FEM=/female|woman|zira|samantha|karen|victoria|susan|hazel|kanya|narisa|premwadee|xiaoxiao|xiaoyi|huihui|yaoyao|tingting|mei-?jia|sin-?ji|kyoko|haruka|ayumi|nanami|yuna|sun-?hi|heami|seoyeon|milena|irina|katya|svetlana|tatyana|anna|hedda|vicki|marie|amelie|julie|denise|celine|paulina|helena|fiona|tessa|moira|allison|ava|jenny|aria|emma|sara|amy|libby|sonia|elsa|katja|ting|lekha|kalpana|joana|monica|sabina|luciana|yelda|zosia|ioana/i;
var MAL=/\bmale\b|david|mark|daniel|alex|thomas|george|james|pattara|niwat|kangkang|yunyang|yunxi|zhiwei|ichiro|otoya|keita|ryan|guy|mikhail|pavel|dmitri|stefan|jonas|claude|paul|henri|hortense|jorge|diego|fred|bruce|ralph|junior|rishi|oliver|liam|daniel|conrad|killian|florian|jan\b|hans|kangkan/i;
function pickVoice(lang,gender){
  var vs=[];try{vs=speechSynthesis.getVoices()||[]}catch(e){}
  var pre=lang.slice(0,2).toLowerCase(),L=lang.toLowerCase(),c=[];
  for(var i=0;i<vs.length;i++){var vl=(vs[i].lang||'').replace('_','-').toLowerCase();if(vl.indexOf(pre)===0)c.push({v:vs[i],exact:vl===L})}
  if(!c.length)return {v:null,match:false};
  function sc(o){var n=(o.v.name||'')+' '+(o.v.voiceURI||'');return (o.exact?4:0)+(/natural|neural|online|google|premium|enhanced/i.test(n)?3:0)+(o.v.localService?0:1)}
  function isF(o){return FEM.test((o.v.name||'')+' '+(o.v.voiceURI||''))}
  function isM(o){var n=(o.v.name||'')+' '+(o.v.voiceURI||'');return !FEM.test(n)&&MAL.test(n)}
  var pool=c;
  if(gender==='f')pool=c.filter(isF);else if(gender==='m')pool=c.filter(isM);
  var match=pool.length>0;if(!match)pool=c;
  pool.sort(function(a,b){return sc(b)-sc(a)});
  return {v:pool[0].v,match:match&&!!gender,female:isF(pool[0])};
}
var noVoiceSaid=false;
function speak(text,lang,rate,face){
  rate=rate||1;var gender=face?GENDER:null;
  var dur=text.length*msPerChar(lang)/rate+300;
  function mouth(){if(face){lipStart({text:text,dur:dur});clearTimeout(talkT);talkT=setTimeout(lipStop,dur*2.2+1500)}}
  if(!('speechSynthesis' in window)){mouth();if(!noVoiceSaid){noVoiceSaid=true;toast(_('เครื่องนี้ไม่มีเสียงอ่านในตัว ลองเปิดใน Chrome หรือ Safari'))}return}
  try{
    speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=rate;
    var pv=pickVoice(lang,gender);if(pv.v)u.voice=pv.v;
    /* no matching device voice: shift the pitch so the client still sounds female or male */
    if(gender&&!pv.match)u.pitch=gender==='f'?(pv.female?1.1:1.45):0.72;
    mouth();
    if(face){
      u.onstart=function(){if(lip&&lip.text===text)lip.t0=Date.now()};
      u.onboundary=function(e){if(lip&&lip.text===text&&e.charIndex!=null&&text.length)lip.t0=Date.now()-(e.charIndex/text.length)*lip.dur};
      u.onend=u.onerror=function(){clearTimeout(talkT);lipStop()};
    }
    speechSynthesis.speak(u);
  }catch(e){mouth();toast(_('เล่นเสียงไม่ได้ในเครื่องนี้'))}
}
/* Plays the pre-generated mp3 when it exists, otherwise falls back to the device voice. */
function audioLip(a,text){
  var amp=null;
  try{
    if(new URL(a.src,location.href).origin===location.origin){
      ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();
      var src=ac.createMediaElementSource(a),an=ac.createAnalyser();an.fftSize=512;src.connect(an);an.connect(ac.destination);
      var buf=new Uint8Array(an.fftSize);
      amp=function(){an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}var r=Math.sqrt(s/buf.length);return r<.02?'m':r<.06?'ee':r<.13?'o':'a'};
    }
  }catch(e){amp=null}
  lipStart({text:text,dur:((a.duration&&isFinite(a.duration))?a.duration*1000:text.length*75),getP:function(){return a.duration?a.currentTime/a.duration:0},amp:amp});
}
function playLine(aid,text,lang,rate,face){
  if(!aid){speak(text,lang,rate,face);return}
  try{if(curAudio){curAudio.pause();curAudio=null}if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}
  var fell=false;
  function fallback(){if(fell)return;fell=true;lipStop();speak(text,lang,rate,face)}
  try{
    var a=new Audio(AUDIO_BASE+aid+'.mp3');curAudio=a;a.playbackRate=rate||1;
    a.addEventListener('error',fallback);
    if(face){a.addEventListener('playing',function(){if(!fell)audioLip(a,text)});a.addEventListener('ended',lipStop);a.addEventListener('pause',lipStop)}
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
  if(code==='not-allowed'||code==='service-not-allowed')toast(_('ไมค์ถูกบล็อก กรุณาอนุญาตการใช้ไมค์ในเบราว์เซอร์ หรือเลือกประโยคตอบแทน'));
  else if(code==='nosupport')toast(_('เบราว์เซอร์นี้ยังไม่รองรับการฟังเสียง ใช้ Chrome หรือเลือกประโยคตอบแทน'));
  else if(code==='no-speech')toast(_('ไม่ได้ยินเสียง ลองพูดอีกครั้ง'));
  else toast(_('ฟังเสียงไม่สำเร็จ ลองอีกครั้งหรือเลือกประโยคตอบแทน'));
}
function bg(s){s=s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}]/gu,'');var o=[];for(var i=0;i<s.length-1;i++)o.push(s.slice(i,i+2));return o}
function dice(a,b){
  var A=bg(a),B=bg(b);if(!A.length||!B.length)return 0;
  var m={};A.forEach(function(x){m[x]=(m[x]||0)+1});var h=0;
  B.forEach(function(x){if(m[x]>0){h++;m[x]--}});
  return 2*h/(A.length+B.length);
}
function gloss(w){return G[w]||G[w.replace(/s$/,'')]||G[w.replace(/es$/,'')]||G[w.replace(/ed$/,'')]||G[w.replace(/ing$/,'')]||null}
function words(text){
  if(TARGET!=='en')return esc(text);
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
 end:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M3 14.5c5-5 13-5 18 0l-2.2 3.2-3.6-1.6v-2.3a10 10 0 0 0-6.4 0v2.3l-3.6 1.6z" fill="currentColor"/></svg>',
 ans:'<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M3 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3zM16.5 11l5-3v8l-5-3z" fill="currentColor"/></svg>',
 next:'<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 big:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};
function icSave(on){return '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z" fill="'+(on?'currentColor':'none')+'" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'}
function acts(i,side,extra){
  var l=st.lines[i];var saved=isSaved(l.en);
  return '<div class="acts">'+
   '<button class="btn sm" data-act="say" data-i="'+i+'" data-side="'+side+'" data-rate="1">'+IC.play+_('ฟัง</button>')+
   '<button class="btn sm" data-act="say" data-i="'+i+'" data-side="'+side+_('" data-rate="0.7">ฟังช้า</button>')+
   '<button class="btn sm" data-act="copy" data-i="'+i+'" data-side="'+side+'">'+IC.copy+_('คัดลอก</button>')+
   '<button class="btn sm'+(saved?' on':'')+'" data-act="save" data-i="'+i+'">'+icSave(saved)+(saved?_('เก็บแล้ว'):_('เก็บ'))+'</button>'+(extra||'')+'</div>';
}

/* ---------- faces ---------- */
function faceSVG(ch,mood){return PT_ART.avatar(ch,mood)}

/* ---------- views ---------- */
function catById(id){return CATS.filter(function(x){return x.id===id})[0]}
var HAS_SR=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
var IN_APP=/\bLine\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(navigator.userAgent||'');
function tipHTML(){
  if(HAS_SR)return '';
  return '<div class="tip"><p>'+esc(_('เบราว์เซอร์นี้ใช้ไมค์พูดตอบไม่ได้ เปิดใน Chrome (Android) หรือ Safari (iPhone) จะพูดตอบได้ ตอนนี้แตะเลือกประโยคตอบได้เลย'))+'</p><div class="acts">'+(IN_APP?'<button class="btn sm primary" data-act="openext">'+esc(_('เปิดในเบราว์เซอร์'))+'</button>':'')+'<button class="btn sm" data-act="copylink">'+esc(_('คัดลอกลิงก์'))+'</button></div></div>';
}
function vMenu(){
  var h=tipHTML()+_('<div class="hero"><h2>ฝึกคุยกับลูกค้า</h2><p>เลือกสถานการณ์ แล้วรับสายเหมือนลูกค้าโทรเข้ามาจริง ๆ</p></div>')+'<button class="langbar" data-act="langs"><span class="lbf">'+PT_ART.avatar(cast(),'happy')+'</span><span class="lbt"><b>'+esc(cast().name)+'</b><span class="small muted">'+esc(origin())+'</span></span><span class="lbl">'+flag(NATIVE)+'<i>→</i>'+flag(TARGET)+'</span></button><div class="cats">';
  CATS.forEach(function(c){
    var ch=cast();
    h+='<button class="catcard" data-act="cat" data-cat="'+c.id+'"><span class="cbg">'+PT_ART.scene(c.id)+'</span><span class="cshade"></span><span class="cav">'+faceSVG(ch,'happy')+'</span><span class="ctext"><b>'+c.th+'</b><span class="cen">'+c.en+'</span><span class="cmeta"><i class="live"></i>'+esc(ch.name)+_(' โทรเข้า · ')+c.turns.length+_(' ข้อ</span></span></button>');
  });
  h+=_('</div><p class="note">บทสนทนาเป็นตัวอย่างสำหรับฝึกภาษา ไม่ใช่คำแนะนำทางกฎหมาย เงื่อนไขซื้อขายจริงควรตรวจกับเอกสารและทนาย</p>');
  return h;
}
function vPractice(){return vMenu()}

var callTimer=null;
function fmtTime(ms){var s=Math.max(0,Math.floor(ms/1000));return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+(s%60)).slice(-2)}
function callTop(c,ch){
  var dots=_('<div class="cprog" aria-label="ความคืบหน้า">')+c.turns.map(function(_,i){return '<i class="'+(i<st.turn||(i===st.turn&&st.picked!==null)?'done':'')+'"></i>'}).join('')+'</div>';
  return _('<header class="ctop"><button class="cbtn end sm" data-act="back" aria-label="วางสาย">')+IC.end+'</button><div class="cwho"><b>'+esc(ch.name)+'</b><span><i class="live"></i>'+esc(origin())+' · <span id="ctime">'+fmtTime((st.callEnd||Date.now())-st.callStart)+'</span></span></div>'+dots+'</header>';
}
function cb(act,attrs,icon,label,cls){return '<div class="cbw"><button class="cbtn'+(cls?' '+cls:'')+'" data-act="'+act+'" '+attrs+' aria-label="'+label+'">'+icon+'</button><span class="cl">'+label+'</span></div>'}
function renderCall(){
  var el=$('#call');if(!el)return;
  if(st.cat===null||st.tab!=='practice'){
    el.hidden=true;el.innerHTML='';document.body.style.overflow='';clearInterval(callTimer);callTimer=null;return;
  }
  var c=catById(st.cat);var ch=cast();st.curChar=ch;
  var bd='<div class="bd">'+PT_ART.scene(c.id)+'</div><div class="shade"></div>';
  var h;
  if(st.ring){
    st.mood='happy';
    h=bd+'<div class="ringbox"><div class="ringav"><i></i><i></i><i></i><div class="rface" id="faceBox">'+faceSVG(ch,'happy')+'</div></div><h2>'+esc(ch.name)+_('</h2><p class="rsub">วิดีโอคอลเข้า · ')+esc(c.th)+_('</p><p class="rcall">กำลังโทรหาคุณ</p></div>')+
      _('<div class="ringbtns"><div class="rb"><button class="cbtn end big" data-act="back" aria-label="ปฏิเสธสาย">')+IC.end+_('</button><span class="cl">ปฏิเสธ</span></div><div class="rb"><button class="cbtn ans big" data-act="answer" aria-label="รับสาย">')+IC.ans+_('</button><span class="cl">รับสาย</span></div></div>');
  }else if(st.turn>=c.turns.length){
    st.mood='delighted';
    var dur=fmtTime((st.callEnd||Date.now())-st.callStart);
    var list=st.log.map(function(l){var i=reg(l.en,l.th,c.th,null);return '<div class="item"><div style="min-width:0"><div class="e">'+esc(l.en)+'</div><div class="small dim">'+esc(l.th)+'</div></div><button class="btn sm glass" data-act="save" data-i="'+i+'">'+icSave(isSaved(l.en))+_('เก็บ</button></div>')}).join('');
    h=bd+callTop(c,ch)+'<div class="cface small" id="faceBox">'+faceSVG(ch,'delighted')+_('</div><div class="cbottom"><div class="sub sum"><h3>จบสายแล้ว · ')+dur+_('</h3><p class="th">คุณตอบครบ ')+c.turns.length+_(' ข้อ ประโยคที่ตอบเก็บไว้ทบทวนได้</p><div class="sumlist">')+list+_('</div></div><div class="row"><button class="btn primary" data-act="again">โทรอีกรอบ</button><button class="btn glass" data-act="saveall">เก็บทั้งหมด</button><button class="btn glass" data-act="back">วางสาย</button></div></div>');
  }else{
    var t=c.turns[st.turn];var picked=st.picked!==null;
    var mood=picked?(RM[st.picked]||'happy'):t.mood;st.mood=mood;
    var i0=reg(t.en,t.th,c.th,aidQ(t.id));var focus=i0,my='',react='';
    if(picked){
      var r=t.r[st.picked];var i1=reg(r[0],r[1],c.th,aidR(t.id,st.picked));focus=i1;
      my=_('<div class="sub me"><div class="row" style="margin-bottom:6px"><span class="tag">คุณตอบ · ')+LV[st.picked]+'</span>'+(st.score!==null?_('<span class="tag">ตรงกับประโยค ')+st.score+'%</span>':'')+'</div><div class="en">'+words(r[0])+'</div>'+(st.showTh?'<div class="th">'+esc(r[1])+'</div>':'')+'</div>';
      var rc=REACT[st.picked];
      if(rc)react='<div class="react"><span class="rdot"></span><span><b>'+esc(ch.name)+'</b> '+esc(rc[0])+(st.showTh?' <em>'+esc(rc[1])+'</em>':'')+'</span></div>';
    }
    var fl=st.lines[focus];var saved=isSaved(fl.en);
    var main=picked
      ?_('<div class="cbw main"><button class="cmain next" data-act="next" aria-label="ข้อต่อไป">')+IC.next+'</button><span class="cl">'+(st.turn+1>=c.turns.length?_('จบสาย'):_('ต่อไป'))+'</span></div>'
      :_('<div class="cbw main"><button class="cmain mic" data-act="mic" aria-label="กดแล้วพูดตอบ">')+IC.mic+_('</button><span class="cl">พูดตอบ</span></div>');
    var ctrls='<div class="ctrls">'+
      cb('say','data-i="'+focus+'" data-side="en" data-rate="1"',IC.play,_('ฟังซ้ำ'))+
      cb('say','data-i="'+focus+'" data-side="en" data-rate="0.7"','<b>0.7×</b>',_('ช้า'))+main+
      cb('toggleTh','','<b>'+langInfo(NATIVE)[2]+'</b>',_('คำแปล'),st.showTh?'on':'')+
      cb('save','data-i="'+focus+'"',icSave(saved),saved?_('เก็บแล้ว'):_('เก็บ'),saved?'on':'')+
      cb('copy','data-i="'+focus+'" data-side="en"',IC.copy,_('คัดลอก'))+'</div>';
    var pill=picked?'':_('<button class="pillbtn" data-act="sheet"><span>เลือกประโยคตอบ (3 ระดับ)</span><span aria-hidden="true">▲</span></button>');
    var sheet=picked?'':'<div class="sheet'+(st.sheet?' open':'')+_('" id="sheet" role="dialog" aria-label="เลือกประโยคตอบ"><div class="grab"></div><div class="row" style="justify-content:space-between"><h3>เลือกประโยคตอบ</h3><button class="btn sm glass" data-act="sheet">ปิด</button></div><div class="copts">')+
      t.r.map(function(r,i){return '<button class="copt" data-act="pick" data-r="'+i+'"><span class="tag lv">'+LV[i]+'</span><span class="e">'+esc(r[0])+'</span><span class="t">'+esc(r[1])+'</span></button>'}).join('')+'</div></div>';
    h=bd+callTop(c,ch)+'<div class="cface" id="faceBox">'+faceSVG(ch,mood)+'</div><div class="cbottom"><div class="cstack">'+react+
      '<div class="sub'+(picked?' mini':'')+'"><div class="en">'+words(t.en)+'</div>'+(st.showTh?'<div class="th">'+esc(t.th)+'</div>':'')+'</div>'+my+
      '<div class="wordbar" id="wordbar"></div></div>'+pill+ctrls+'</div>'+sheet;
  }
  el.innerHTML=h;el.className='call'+(st.ring?' ringing':'');el.hidden=false;document.body.style.overflow='hidden';
  clearInterval(callTimer);callTimer=null;
  if(!st.ring&&st.turn<c.turns.length){callTimer=setInterval(function(){var tt=$('#ctime');if(tt)tt.textContent=fmtTime(Date.now()-st.callStart)},1000)}
}


function vInterp(){
  var th=st.dir==='th-en';
  var ex=PAIRS.filter(function(p){return th?p.w==='a':p.w==='c'});
  var h=_('<div class="seg" role="group" aria-label="ทิศทางการแปล"><button class="')+(th?'on':'')+'" data-act="dir" data-dir="th-en">'+esc(_('ฉันพูด')+' '+langInfo(NATIVE)[1]+' → '+langInfo(TARGET)[1])+'</button><button class="'+(!th?'on':'')+'" data-act="dir" data-dir="en-th">'+esc(_('ลูกค้าพูด')+' '+langInfo(TARGET)[1]+' → '+langInfo(NATIVE)[1])+'</button></div>';
  h+='<div class="card"><label class="f" for="src">'+(th?_('พิมพ์หรือพูด')+' '+langInfo(NATIVE)[1]:_('พิมพ์หรือพูด')+' '+langInfo(TARGET)[1])+'<textarea id="src" rows="3" placeholder="'+esc(th?PAIRS[1].th:PAIRS[4]?PAIRS[4].en:'')+'">'+esc(st.text)+'</textarea></label>'+
   _('<div class="row" style="margin-top:10px"><button class="mic" data-act="imic" aria-label="พูดเพื่อแปล" style="width:52px;height:52px">')+IC.mic+_('</button><button class="btn primary" data-act="irun">แปล')+(FEAT.credit?_(' (ใช้ 1 เครดิต)'):'')+_('</button><button class="btn" data-act="iclear">ล้าง</button></div></div>');
  h+='<div id="iout"></div>';
  h+=_('<div class="card"><h3>ประโยคตัวอย่าง แตะเพื่อแปล</h3><div class="chips" style="margin-top:8px">')+ex.map(function(p){var k=PAIRS.indexOf(p);return '<button class="chip" data-act="ex" data-k="'+k+'">'+esc(th?p.th:p.en)+'</button>'}).join('')+'</div></div>';
  h+=_('<p class="note">ต้นแบบ: แปลได้เฉพาะประโยคตัวอย่างที่เตรียมไว้ การแปลอิสระต้องต่อบริการแปลที่มีค่าใช้จ่ายต่อครั้ง การแปลผิดในเรื่องสัญญามีผลทางกฎหมาย ควรตรวจกับเอกสารจริง</p>');
  return h;
}
function outCard(o){
  if(!o)return '';
  if(o.blocked)return _('<div class="card"><h3>เครดิตหมด</h3><p class="muted" style="margin-top:4px">ระบบหยุดแปลจนกว่าจะเติมเครดิต</p>')+(FEAT.credit?_('<div class="acts"><button class="btn primary" data-act="tab" data-tab="credit">ไปหน้าเติมเงิน</button></div>'):'')+'</div>';
  if(o.miss)return _('<div class="card"><h3>ยังแปลประโยคนี้ไม่ได้ในต้นแบบ</h3><p class="muted" style="margin-top:4px">')+(FEAT.credit?_('ไม่ได้หักเครดิต '):'')+_('เลือกจากประโยคตัวอย่างด้านล่าง หรือรอเวอร์ชันที่ต่อบริการแปลจริง</p></div>');
  var th=st.dir==='th-en';var i=reg(o.en,o.th,_('ล่ามสด'),null);
  return '<div class="card out"><p class="muted small">'+(th?_('คุณพูดว่า: ')+esc(o.th):_('ลูกค้าพูดว่า: ')+esc(o.en))+'</p><div class="en" style="margin-top:6px">'+esc(th?o.en:o.th)+'</div>'+
   acts(i,th?'en':'th','<button class="btn sm" data-act="big" data-i="'+i+'" data-side="'+(th?'en':'th')+'">'+IC.big+_('จอใหญ่</button>'))+'</div>';
}
function updateOut(){var e=$('#iout');if(e){st.lines=[];e.innerHTML=outCard(st.out)}}

function vaultItems(){return st.vault.length?st.vault:DEMO}
function vVault(){
  var real=st.vault.length>0;var items=vaultItems();
  if(st.review){
    var it=items[st.review.i];if(!it){st.review=null;return vVault()}
    return _('<div class="row" style="justify-content:space-between"><button class="btn sm" data-act="rexit">← กลับคลัง</button><span class="muted small">')+(st.review.i+1)+' / '+items.length+'</span></div>'+
     _('<div class="card flash" data-act="flip" role="button" tabindex="0" aria-label="แตะเพื่อพลิกการ์ด">')+(st.review.flip?'<div class="en">'+esc(it.en)+'</div>':_('<div class="muted small">แปลเป็นภาษาที่ฝึกว่าอะไร</div><div style="font-size:20px;font-weight:600">')+esc(it.th)+'</div>')+_('<div class="muted small">แตะเพื่อ')+(st.review.flip?_('ดูโจทย์'):_('ดูคำตอบ'))+'</div></div>'+
     _('<div class="row"><button class="btn" data-act="rprev">ก่อนหน้า</button><button class="btn" data-act="rsay" data-id="')+it.id+'">'+IC.play+_('ฟัง</button><button class="btn primary" data-act="rnext">ถัดไป</button></div>');
  }
  var groups={};items.forEach(function(v){(groups[v.cat]=groups[v.cat]||[]).push(v)});
  var h=_('<div class="card"><h2>คลังศัพท์ของฉัน</h2><p class="muted small" style="margin-top:4px">')+(real?_('เก็บไว้ ')+items.length+_(' รายการ'):_('ตอนนี้เป็นรายการตัวอย่าง กดปุ่ม เก็บ ข้างประโยคหรือแตะคำเพื่อเริ่มสะสมของจริง'))+'</p>'+
   _('<div class="acts"><button class="btn primary" data-act="rstart">ทบทวนแฟลชการ์ด</button><button class="btn" data-act="vcopy">คัดลอกทั้งหมด</button></div></div>');
  Object.keys(groups).forEach(function(k){
    h+='<div class="card"><h3>'+esc(k)+'</h3>'+groups[k].map(function(v){
      return '<div class="item"><div style="min-width:0"><div class="e">'+esc(v.en)+'</div><div class="muted small">'+esc(v.th)+'</div></div><div class="row" style="flex:none"><button class="btn sm" data-act="rsay" data-id="'+v.id+_('" aria-label="ฟัง">')+IC.play+'</button>'+(real?'<button class="btn sm" data-act="vdel" data-id="'+v.id+_('">ลบ</button>'):'')+'</div></div>';
    }).join('')+'</div>';
  });
  h+=_('<p class="note">คลังเก็บอยู่ในเบราว์เซอร์เครื่องนี้ ถ้าล้างข้อมูลหรือเปลี่ยนเครื่องจะหาย ใช้ปุ่มคัดลอกทั้งหมดเพื่อสำรองไว้ใน Line หรือโน้ต</p>');
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
  var h=_('<div class="tbl"><table><thead><tr><th>แพ็ก</th><th>ค่าธรรมเนียมชำระ</th><th>ต้นทุนแปล</th><th>กำไร</th><th>กำไร %</th><th>ต้องขาย/เดือน</th></tr></thead><tbody>');
  rows.forEach(function(r){
    h+='<tr><td>'+fmt(r.c,0)+_(' ครั้ง</td><td>')+fmt(r.fee)+'</td><td>'+fmt(r.cost)+'</td><td class="'+(r.profit>0?'good':'bad')+'">'+fmt(r.profit)+'</td><td class="'+(r.m>=40?'good':r.m>=20?'':'bad')+'">'+fmt(r.m,0)+'%</td><td>'+(r.need===null?_('ขาดทุน'):fmt(r.need,0)+_(' แพ็ก'))+'</td></tr>';
  });
  h+='</tbody></table></div>';
  var thin=rows.filter(function(r){return r.m<30});
  var be=rows.map(function(r){return fmt(r.cost/(1-calc.fee/100))}).join(' / ');
  h+=_('<p class="small" style="margin-top:8px">ราคาต่ำสุดที่ไม่ขาดทุน ต่อแพ็ก: ')+be+_(' บาท</p>');
  if(thin.length)h+=_('<p class="note" style="margin-top:8px">แพ็กที่กำไรต่ำกว่า 30% เสี่ยงหลุดขาดทุนเมื่อค่าแปลหรือค่าธรรมเนียมเปลี่ยน ลองปรับราคาขึ้นหรือลดจำนวนครั้งต่อแพ็ก</p>');
  else h+=_('<p class="note" style="margin-top:8px">ทุกแพ็กมีกำไรเกิน 30% เครดิตที่ลูกค้าซื้อแล้วใช้ไม่หมดยังเป็นกำไรเพิ่ม แต่ยังไม่นับในตารางนี้</p>');
  return h;
}
function vCredit(){
  var lv=level();var pct=Math.max(0,Math.min(100,wallet.bal/wallet.cap*100));
  var h=_('<div class="card"><p class="muted small">เครดิตคงเหลือ (1 เครดิต = แปล 1 ครั้ง)</p><div class="row" style="align-items:baseline;justify-content:space-between"><span class="bal" id="balnum">')+fmt(wallet.bal,0)+'</span><span class="tag" id="lvtag">'+LVTXT[lv]+'</span></div>'+
   _('<div style="margin:12px 0 4px"><div class="meter" role="img" aria-label="เครดิตเหลือ ')+Math.round(pct)+_(' เปอร์เซ็นต์"><div class="fill ')+lv+'" id="fill" style="width:'+pct+'%"></div><i style="left:10%"></i><i style="left:25%"></i></div><div class="ticks"><span style="left:10%">10%</span><span style="left:25%">25%</span></div></div>'+
   _('<p class="muted small">ถัง ')+fmt(wallet.cap,0)+_(' ครั้งจากการเติมล่าสุด · เขียว เพียงพอ · เหลือง ≤25% ใกล้หมด · แดง ≤10% ให้เติมเลย · 0 หยุดแปล</p>')+
   _('<div class="acts"><button class="btn sm" data-act="use" data-n="1">จำลองใช้ 1</button><button class="btn sm" data-act="use" data-n="10">จำลองใช้ 10</button><button class="btn sm" data-act="use" data-n="50">จำลองใช้ 50</button><button class="btn sm" data-act="reset">รีเซ็ตเป็น 100</button></div></div>');
  h+=_('<div class="card"><h3>แพ็กเติมเงิน</h3><div class="packs" style="margin-top:10px">')+calc.packs.map(function(p,i){
    return '<div class="pack"><b>'+fmt(p.c,0)+_(' ครั้ง</b><span class="muted small">฿')+fmt(p.p,0)+_(' · ฿')+fmt(p.p/p.c)+_(' ต่อครั้ง</span><button class="btn primary sm" data-act="topup" data-i="')+i+_('">จำลองเติมเงิน</button></div>');
  }).join('')+_('</div><p class="note" style="margin-top:10px">ปุ่มนี้จำลองการเติมเท่านั้น ยังไม่มีการตัดเงินจริง ของจริงต้องต่อพร้อมเพย์หรือบัตรผ่านผู้ให้บริการชำระเงิน และเก็บยอดเครดิตไว้ที่ฝั่งเซิร์ฟเวอร์ เพราะยอดที่เก็บในเบราว์เซอร์แก้ไขได้</p></div>');
  h+=_('<div class="card"><h3>เครื่องคิดกำไร</h3><p class="muted small" style="margin-top:4px">ตัวเลขทั้งหมดเป็นค่าสมมติที่แก้ได้ ใส่ต้นทุนจริงจากบิลบริการแปลและใบแจ้งค่าธรรมเนียมของผู้ให้บริการชำระเงิน</p>')+
   '<div class="grid2" style="margin-top:10px">'+
   _('<label class="f" for="k-cpt">ต้นทุนแปลต่อครั้ง (บาท)<input id="k-cpt" type="number" inputmode="decimal" step="0.05" min="0" value="')+calc.cpt+'" data-k="cpt"></label>'+
   _('<label class="f" for="k-fee">ค่าธรรมเนียมชำระเงิน (%)<input id="k-fee" type="number" inputmode="decimal" step="0.1" min="0" value="')+calc.fee+'" data-k="fee"></label>'+
   _('<label class="f" for="k-fixed">ค่าคงที่ต่อเดือน (บาท)<input id="k-fixed" type="number" inputmode="decimal" step="50" min="0" value="')+calc.fixed+'" data-k="fixed"></label>'+
   _('<label class="f" for="k-target">เป้ากำไรต่อเดือน (บาท)<input id="k-target" type="number" inputmode="decimal" step="500" min="0" value="')+calc.target+'" data-k="target"></label></div>'+
   _('<div class="tbl" style="margin-top:12px"><table><thead><tr><th>จำนวนครั้ง</th><th>ราคาขาย (บาท)</th></tr></thead><tbody>')+calc.packs.map(function(p,i){return '<tr><td><input type="number" inputmode="numeric" min="1" value="'+p.c+'" data-pk="'+i+_('" data-f="c" aria-label="จำนวนครั้งแพ็ก ')+(i+1)+'"></td><td><input type="number" inputmode="numeric" min="0" value="'+p.p+'" data-pk="'+i+_('" data-f="p" aria-label="ราคาแพ็ก ')+(i+1)+'"></td></tr>'}).join('')+'</tbody></table></div>'+
   '<div id="calc-out" style="margin-top:12px">'+calcOut()+'</div></div>';
  return h;
}

/* ---------- render ---------- */
function updatePill(){
  var p=$('#pill');if(!p)return;
  p.hidden=!FEAT.credit;
  var lv=level();$('#pdot').className='dot '+lv;$('#ptxt').textContent=_('เครดิต ')+fmt(wallet.bal,0);
}
function buildNav(){
  var tabs=[['practice',_('ฝึกพูด'),true],['interp',_('ล่ามสด'),!!FEAT.interp],['vault',_('คลังศัพท์'),true],['credit',_('เครดิต'),!!FEAT.credit]].filter(function(t){return t[2]});
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
  renderCall();
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
  if(after!==before&&after!=='ok'){toast(after==='warn'?_('เครดิตเหลือไม่ถึง 25% ควรเติมเร็ว ๆ นี้'):after==='crit'?_('เครดิตเหลือไม่ถึง 10% เติมเงินได้เลย'):_('เครดิตหมดแล้ว ระบบหยุดแปล'))}
}
function setWord(w){
  st.word=w;var el=$('#wordbar');if(!el)return;
  var g=gloss(w);
  el.innerHTML='<b>'+esc(w)+'</b><span>'+(g?esc(g):_('ยังไม่มีในพจนานุกรมตัวอย่าง'))+'</span><button class="btn sm" data-act="wsay">'+IC.play+_('ฟัง</button><button class="btn sm" data-act="wsave">เก็บคำนี้</button>');
}
function addVault(en,th,cat){
  if(isSaved(en)){st.vault=st.vault.filter(function(v){return v.en!==en});saveVault();toast(_('เอาออกจากคลังแล้ว'));return false}
  st.vault.push({id:'v'+Date.now()+Math.floor(Math.random()*1000),en:en,th:th||'-',cat:cat||_('ทั่วไป')});saveVault();toast(_('เก็บเข้าคลังแล้ว'));return true;
}
function pick(r,score){
  st.picked=r;st.score=score==null?null:score;st.sheet=false;
  var c=catById(st.cat);var t=c.turns[st.turn];
  st.log.push({en:t.r[r][0],th:t.r[r][1]});
  render();
  var rc=REACT[r];if(rc)playLine(aidX(r),rc[0],TL,1,true);
}
function enterTurn(){
  st.sheet=false;render();
  var c=catById(st.cat);
  if(c&&st.turn<c.turns.length){var t=c.turns[st.turn];playLine(aidQ(t.id),t.en,TL,1,true)}
}
function runInterp(){
  var ta=$('#src');if(ta)st.text=ta.value;
  var txt=st.text.trim();if(!txt){toast(_('พิมพ์หรือพูดก่อนนะ'));return}
  if(FEAT.credit&&wallet.bal<=0){st.out={blocked:true};updateOut();return}
  var th=st.dir==='th-en';var best=null,bs=0;
  PAIRS.forEach(function(p){var s=dice(txt,th?p.th:p.en);if(s>bs){bs=s;best=p}});
  if(best&&bs>=0.55){st.out=best;if(FEAT.credit)spend(1)}else st.out={miss:true};
  updateOut();
}

/* ---------- events ---------- */
document.addEventListener('click',function(e){
  if(!BASE)return;
  var wEl=e.target.closest('.w');
  if(wEl){setWord(wEl.getAttribute('data-w'));return}
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.getAttribute('data-act');
  var L=function(){return st.lines[+b.getAttribute('data-i')]};
  if(a==='openext'){try{var ux=new URL(location.href);ux.searchParams.set('openExternalBrowser','1');location.href=ux.toString()}catch(e){copyText(location.href)}}
  else if(a==='copylink'){copyText(location.href.split('?')[0])}
  else if(a==='langs'){openLangModal()}
  else if(a==='langclose'){var lmx=$('#lang');if(lmx)lmx.hidden=true}
  else if(a==='lang-n'){setLangs(b.getAttribute('data-l'),null,null)}
  else if(a==='lang-t'){setLangs(null,b.getAttribute('data-l'),null)}
  else if(a==='gender'){GENDER=b.getAttribute('data-g');store.set('gender',GENDER);updateLangModal();refreshAll()}
  else if(a==='tab'){st.tab=b.getAttribute('data-tab');render();window.scrollTo(0,0)}
  else if(a==='cat'){st.cat=b.getAttribute('data-cat');st.turn=0;st.picked=null;st.score=null;st.log=[];st.sheet=false;st.ring=true;startRing();render()}
  else if(a==='answer'){stopRing();st.ring=false;st.callStart=Date.now();st.callEnd=0;enterTurn()}
  else if(a==='again'){st.turn=0;st.picked=null;st.score=null;st.log=[];st.callStart=Date.now();st.callEnd=0;enterTurn()}
  else if(a==='sheet'){st.sheet=!st.sheet;var sh=$('#sheet');if(sh)sh.classList.toggle('open',st.sheet)}
  else if(a==='back'){stopRing();stopAllSound();st.cat=null;st.picked=null;st.ring=false;st.sheet=false;render()}
  else if(a==='toggleTh'){st.showTh=!st.showTh;store.set('th',st.showTh?'1':'0');render()}
  else if(a==='say'){var l=L();var side=b.getAttribute('data-side');var rate=parseFloat(b.getAttribute('data-rate'));
    if(side==='th')speak(l.th,NL,rate,false);else playLine(l.aid,l.en,TL,rate,!!(l.aid&&/-q$|\/react-/.test(l.aid)))}
  else if(a==='copy'){var l2=L();copyText(b.getAttribute('data-side')==='th'?l2.th:l2.en)}
  else if(a==='save'){var l3=L();addVault(l3.en,l3.th,l3.cat);render()}
  else if(a==='saveall'){var c=catById(st.cat);st.log.forEach(function(l4){if(!isSaved(l4.en)){st.vault.push({id:'v'+Date.now()+Math.floor(Math.random()*1000),en:l4.en,th:l4.th,cat:c.th})}});saveVault();toast(_('เก็บประโยคที่ตอบแล้ว'));render()}
  else if(a==='pick'){pick(+b.getAttribute('data-r'),null)}
  else if(a==='next'){stopAllSound();st.turn++;st.picked=null;st.score=null;if(st.turn>=catById(st.cat).turns.length)st.callEnd=Date.now();enterTurn()}
  else if(a==='mic'){
    var c2=catById(st.cat);var t=c2.turns[st.turn];
    listen(TL,function(txt){
      var bi=0,bsc=0;t.r.forEach(function(r,i){var s=dice(txt,r[0]);if(s>bsc){bsc=s;bi=i}});
      if(bsc<0.4){toast(_('ได้ยินว่า "')+txt+_('" ยังไม่ตรงกับประโยคตัวอย่าง ลองอีกครั้งหรือแตะเลือก'))}
      else pick(bi,Math.round(bsc*100));
    },micFail);
  }
  else if(a==='wsay'&&st.word)speak(st.word,TL,0.8,false);
  else if(a==='wsave'&&st.word){var g=gloss(st.word);addVault(st.word,g||'-',_('คำศัพท์'));setWord(st.word)}
  else if(a==='dir'){st.dir=b.getAttribute('data-dir');st.out=null;st.text='';render()}
  else if(a==='irun'){runInterp()}
  else if(a==='iclear'){st.text='';st.out=null;render()}
  else if(a==='imic'){
    listen(st.dir==='th-en'?NL:TL,function(txt){st.text=txt;var ta=$('#src');if(ta)ta.value=txt;runInterp()},micFail);
  }
  else if(a==='ex'){var p=PAIRS[+b.getAttribute('data-k')];st.text=st.dir==='th-en'?p.th:p.en;var ta2=$('#src');if(ta2)ta2.value=st.text;runInterp()}
  else if(a==='big'){var l5=L();var tx=b.getAttribute('data-side')==='en'?l5.en:l5.th;var bg2=$('#big');bg2.innerHTML='<div class="txt">'+esc(tx)+_('</div><div class="row" style="justify-content:center"><button class="btn primary" data-act="bigclose">ปิด</button></div>');bg2.hidden=false}
  else if(a==='bigclose'){$('#big').hidden=true}
  else if(a==='rstart'){st.review={i:0,flip:false};render()}
  else if(a==='rexit'){st.review=null;render()}
  else if(a==='flip'){st.review.flip=!st.review.flip;render()}
  else if(a==='rnext'||a==='rprev'){var n=vaultItems().length;st.review.i=(st.review.i+(a==='rnext'?1:n-1))%n;st.review.flip=false;render()}
  else if(a==='rsay'){var id=b.getAttribute('data-id');var it=vaultItems().filter(function(v){return v.id===id})[0];if(it)speak(it.en,TL,0.9,false)}
  else if(a==='vdel'){var id2=b.getAttribute('data-id');st.vault=st.vault.filter(function(v){return v.id!==id2});saveVault();render()}
  else if(a==='vcopy'){copyText(vaultItems().map(function(v){return v.en+' = '+v.th}).join('\n'))}
  else if(a==='use'){spend(+b.getAttribute('data-n'))}
  else if(a==='reset'){wallet={bal:100,cap:100};saveWallet();render()}
  else if(a==='topup'){var pk=calc.packs[+b.getAttribute('data-i')];wallet.bal+=pk.c;wallet.cap=Math.max(pk.c,wallet.bal);saveWallet();refreshWallet();toast(_('จำลองเติมเงินแล้ว +')+fmt(pk.c,0)+_(' ครั้ง'))}
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
  gateOn=true;gateOk=onOk;$('#nav').hidden=true;
  $('#app').innerHTML=_('<div class="card"><h2>ใส่รหัสเข้าใช้งาน</h2><p class="muted small" style="margin-top:4px">รหัสส่งให้ทาง Line หลังชำระเงิน</p>')+
   _('<label class="f" for="code" style="margin-top:12px">รหัสเข้าใช้<input id="code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"></label>')+
   _('<div class="acts"><button class="btn primary" id="unlock">เข้าใช้งาน</button></div><p id="gerr" class="small bad" style="margin-top:8px"></p></div>');
  function tryIt(){
    var v=($('#code').value||'').trim().toUpperCase();if(!v)return;
    sha256hex(SLUG+':'+v).then(function(h){
      if(h===CFG.codeHash){store.set('unlock','1');gateOn=false;$('#nav').hidden=false;onOk()}
      else $('#gerr').textContent=_('รหัสไม่ถูกต้อง ตรวจตัวอักษรอีกครั้ง');
    },function(){$('#gerr').textContent=_('เบราว์เซอร์นี้ตรวจรหัสไม่ได้ กรุณาเปิดผ่านลิงก์ https ด้วย Chrome หรือ Safari')});
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
  document.title=CFG.product||'Property Talk';
  $('#app').innerHTML=_('<p class="muted">กำลังโหลด...</p>');
  var n0=store.get('native'),t0=store.get('target'),g0=store.get('gender');
  var ok=function(c){return LANGS.some(function(l){return l[0]===c})};
  if(ok(n0))NATIVE=n0;if(ok(t0))TARGET=t0;if(g0==='m')GENDER='m';
  if(NATIVE===TARGET)TARGET=NATIVE==='en'?'th':'en';
  Promise.all([window.PT_INLINE?Promise.resolve(PT_INLINE.base):fetch(CORE+'base.json').then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}),window.PT_INLINE?Promise.resolve(PT_INLINE.casts):fetch(CORE+'casts.json').then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}),loadPack(NATIVE),loadPack(TARGET),loadPack('en')]).then(function(x){
    BASE=x[0];CASTS=x[1];applyLang();
    if(CFG.codeHash&&store.get('unlock')!=='1')showGate(start);else start();
  }).catch(function(){
    $('#app').innerHTML=_('<div class="card"><h3>โหลดเนื้อหาไม่ได้</h3><p class="muted small" style="margin-top:4px">ต้องเปิดผ่านลิงก์เว็บ ไม่ใช่เปิดไฟล์ตรงจากเครื่อง ถ้าเปิดผ่านลิงก์แล้วยังเป็นแบบนี้ ให้แจ้งผู้ขาย</p></div>');
  });
}
if('speechSynthesis' in window){try{speechSynthesis.getVoices()}catch(e){}}
boot();
})();
