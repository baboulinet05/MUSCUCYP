'use strict';
/* ================= Langue (français par défaut, anglais si le téléphone est en anglais) ================= */
const EN=window.FONTE_LANG==='en'&&typeof I18N_EN!=='undefined';
const LOC=EN?'en-GB':'fr-FR';
const TR=(()=>{if(!EN)return s=>s;const U=I18N_EN.ui,cache=new Map(),units={min:'min',h:'h',jour:'day',jours:'days',semaine:'week',semaines:'weeks',mois:'months'};
  const keys=Object.keys(U).filter(k=>k.length>=3).sort((a,b)=>b.length-a.length),rx=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re=new RegExp('(?<![\\p{L}])(?:'+keys.map(rx).join('|')+')(?![\\p{L}])','gu');
  return s=>{if(!s||!/[A-Za-zÀ-ÿ]/.test(s))return s;const c=cache.get(s);if(c!==undefined)return c;const t=s.trim();let r;
    if(U[t]!==undefined)r=s.replace(t,U[t]);
    else r=s.replace(/il y a (\d+) ?(min|h|jours?|semaines?|mois)(?![\p{L}])/gu,(m,n,u)=>n+' '+(units[u]||u)+' ago').replace(re,m=>U[m]).replace(/(\d+) sur (\d+)/g,'$1 of $2').replace(/(^|\s)sur (\d+)/g,'$1out of $2').replace(/(\d+) jours?(?![\p{L}])/gu,(m,n)=>n+(n==1?' day':' days')).replace(/(\d+) semaines?(?![\p{L}])/gu,(m,n)=>n+(n==1?' week':' weeks'));
    if(cache.size>8000)cache.clear();cache.set(s,r);return r}})();
function trCtx(x){if(EN){const f=x.fillText.bind(x),m=x.measureText.bind(x);x.fillText=(t,...a)=>f(TR(String(t)),...a);x.measureText=t=>m(TR(String(t)))}return x}
function trDom(root){if(!EN||!root)return;if(root.nodeType===3){const v=root.data,t=TR(v);if(t!==v)root.data=t;return}if(root.nodeType!==1)return;
  if(root.closest&&root.closest('textarea,[contenteditable],.notr'))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('textarea,script,style,.notr')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while((n=w.nextNode())){const v=n.data,t=TR(v);if(t!==v)n.data=t}
  const els=root.querySelectorAll?[root,...root.querySelectorAll('[placeholder],[aria-label],[title],[alt]')]:[];for(const e of els)for(const a of['placeholder','aria-label','title','alt']){const v=e.getAttribute&&e.getAttribute(a);if(v){const t=TR(v);if(t!==v)e.setAttribute(a,t)}}}
if(EN){const mo=new MutationObserver(L=>{for(const m of L){if(m.type==='characterData')trDom(m.target);else m.addedNodes.forEach(trDom)}});
  document.addEventListener('DOMContentLoaded',()=>{trDom(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})});
  if(document.body){trDom(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})}}

const IMG='img/';
const MEDIA_MODE='webp';
function packOf(id){let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return h%8}
const packCache={},packLoading={};
function loadPack(n){if(packCache[n])return Promise.resolve(packCache[n]);if(!packLoading[n])packLoading[n]=fetch('media/'+n+'.json').then(r=>r.json()).then(d=>(packCache[n]=d)).catch(()=>{delete packLoading[n];return null});return packLoading[n]}
function imgAttr(id,f,thumb){if(MEDIA_MODE==='webp')return`src="media/${thumb?'thumb':'img'}/${encodeURIComponent(id)}-${f}.webp"`;if(MEDIA_MODE==='files')return`src="${IMG}${encodeURIComponent(id)}-${f}.jpg"`;return`data-m="${thumb?'thumbs':'p'+packOf(id)}|${esc(id)}-${f}"`}
function hydrate(){if(MEDIA_MODE!=='packs')return;document.querySelectorAll('img[data-m]:not([src])').forEach(img=>{if(img.dataset.busy)return;img.dataset.busy='1';const[p,k]=img.dataset.m.split('|');loadPack(p).then(d=>{if(d&&d[k])img.src=d[k];else{const w=img.classList.contains('f0')&&img.closest('.media-wrap');w?w.remove():img.remove()}})})}
const MUSCLES=['Pectoraux','Dos','Épaules','Trapèzes','Biceps','Triceps','Avant-bras','Abdos','Lombaires','Quadriceps','Ischios','Fessiers','Adducteurs','Mollets','Corps entier','Cardio','Mobilité'];
const ABBR={'Pectoraux':'PEC','Dos':'DOS','Épaules':'ÉPA','Trapèzes':'TRA','Biceps':'BIC','Triceps':'TRI','Avant-bras':'AVB','Abdos':'ABS','Lombaires':'LOM','Quadriceps':'QUA','Ischios':'ISC','Fessiers':'FES','Adducteurs':'ADD','Mollets':'MOL','Corps entier':'FULL','Cardio':'CAR','Mobilité':'MOB'};
const EQUIP=['Barre','Haltères','Machine','Poulie','Poids du corps','Barre EZ','Smith','Kettlebell','Élastique','Autre'];
const TYPES={w:{a:'kg',b:'reps',label:'Poids et répétitions'},b:{a:'+kg',b:'reps',label:'Poids du corps (lest optionnel)'},t:{a:'+kg',b:'sec',label:'Durée (lest optionnel)'},c:{a:'km',b:'min',label:'Cardio : distance et durée'}};
const ALIAS={'technogym':'','selection':'','pure strength':'','biostrength':'','chest press':'developpe machine','pectoral':'pec deck','shoulder press':'developpe epaules machine','lat machine':'tirage vertical','vertical traction':'tirage vertical machine','arm curl':'curl machine','arm extension':'extension triceps machine','abductor':'abduction','adductor':'adduction','rotary torso':'rotation du buste','abdominal crunch':'crunch machine','lower back':'extension lombaire','assisted dip':'dips assistes','assisted chin':'tractions assistees','skillrun':'tapis','skillbike':'velo','skillrow':'rameur','group cycle':'biking','synchro':'elliptique','vario':'elliptique','excite':'','stretch':'etirement','foam roller':'rouleau','bench':'developpe couche','sdt':'souleve de terre','deadlift':'souleve de terre','rdl':'roumain','ohp':'developpe militaire','pull up':'tractions','pullup':'tractions','chin up':'tractions supination','lat pulldown':'tirage vertical','pulldown':'tirage vertical','leg press':'presse a cuisses','calf':'mollets','fly':'ecarte','lateral raise':'elevations laterales','row':'rowing','squat bulgare':'bulgare','bss':'bulgare','hip':'hip thrust','press':'developpe','abs':'abdos','gainage':'planche'};

/* ================= Utilitaires ================= */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const slugify=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const slug=s=>norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clone=o=>JSON.parse(JSON.stringify(o));
const num=v=>{if(v===''||v==null)return NaN;const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:NaN};
const fmt=n=>{n=+n;if(!isFinite(n))return'';return(Math.round(n*100)/100).toString().replace('.',',')};
const fmtVol=n=>Math.round(n).toLocaleString(LOC)+' kg';
const fmtDur=ms=>{const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`};
const fmtDurLong=ms=>{const m=Math.max(1,Math.round(ms/60000));return m<60?m+' min':Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')};
const fmtSec=s=>{s=Math.round(+s||0);return s<60?s+' s':Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const fmtRest=o=>o<60?o+' s':(o%60?`${Math.floor(o/60)} min ${o%60}`:`${o/60} min`);
const fmtDay=t=>new Date(t).toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long'});
const fmtShort=t=>new Date(t).toLocaleDateString(LOC,{day:'numeric',month:'short'});
const fmtHour=t=>new Date(t).toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'});
const e1rm=(a,b)=>b<=1?a:a*(1+b/30);
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

const IC={zap:'M13 2L4 14h7l-1 8 9-12h-7z',refresh:'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',flame:'M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8zM12 21a6 6 0 0 0 6-6',crown:'M3 8l4 4 5-7 5 7 4-4-2 11H5z',users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.1a4 4 0 0 1 0 7.8M22 21v-1a6 6 0 0 0-4-5.6',cal:'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',chevl:'M15 6l-6 6 6 6',chevr:'M9 6l6 6-6 6',grip:'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',cloud:'M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.6 1.5A4 4 0 0 1 17.5 18z',medal:'M12 15a5 5 0 1 0 0-10a5 5 0 1 0 0 10zM8.5 13.5L7 21l5-3 5 3-1.5-7.5',chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',book:'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7',trend:'M3 17l6-6 4 4 8-8M15 7h6v6',share:'M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',ruler:'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',plus:'M12 5v14M5 12h14',check:'M5 12.5l4.5 4.5L19 7',search:'M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14zM20 20l-4.2-4.2',x:'M6 6l12 12M18 6L6 18',dots:'M5 12h.01M12 12h.01M19 12h.01','chev-down':'M6 9l6 6 6-6','chev-right':'M9 6l6 6-6 6','chev-left':'M15 6l-6 6 6 6',target:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10zM12 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z',link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',play:'M8 5.5v13l10.5-6.5z',clock:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5v4.5l3 2',list:'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',dumbbell:'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11',sliders:'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5.5a2.5 2.5 0 0 0 2.6 4M16 6h2.5a2.5 2.5 0 0 1-2.6 4M12 13v4M8.5 20h7',timer:'M12 21a8 8 0 1 0 0-16a8 8 0 1 0 0 16zM12 9.5v3.5M10 2.5h4',weight:'M6 8h12l2 12H4zM9.5 8a2.5 2.5 0 1 1 5 0',layers:'M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4',check2:'M20 6L9 17l-5-5',info:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v5M12 7.5h.01',film:'M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4'};
const icon=n=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true"${n==='dots'?' style="stroke-width:3.2"':''}><path d="${IC[n]}"${n==='play'?' fill="currentColor"':''}/></svg>`;

/* ================= Données ================= */
const BUILTIN=[];
(()=>{let m='';for(const line of RAW.split('\n')){const l=line.trim();if(!l)continue;if(l[0]==='#'){m=l.slice(1).trim();continue}const[name,equip,t]=l.split('|');const type=t||(m==='Cardio'?'c':m==='Mobilité'?'t':equip==='Poids du corps'?'b':'w');BUILTIN.push({id:slug(name),name,muscle:m,equip,type})}})();
(()=>{for(const[id,name,muscle,equip,type,k,en,s,r]of EDB){const has=!!(REPDB[id]||(INFO[id]&&INFO[id].img)||(typeof OEIMG!=='undefined'&&OEIMG[id]));BUILTIN.push({id,name,muscle,equip,type,en,edb:1,rare:!!r||!has});INFO[id]=Object.assign(INFO[id]||{},{s})}
  for(const id in EDB_STEPS)if(!INFO[id])INFO[id]={s:EDB_STEPS[id]};
  for(const id in REPDB){const[k,one]=REPDB[id].split(':');if(INFO[id])INFO[id].rp=k;else INFO[id]={s:[],rp:k};INFO[id].rp1=!!one}
  if(EN){const N=I18N_EN.names,St=I18N_EN.steps;for(const X of BUILTIN){if(N[X.id])X.name=N[X.id];const I=INFO[X.id];if(I){I.s=St[X.id]||[];delete I.tip}else if(St[X.id])INFO[X.id]={s:St[X.id]}}}
  if(typeof OEIMG!=='undefined')for(const id in OEIMG){const[k,one]=OEIMG[id].split(':');const I=INFO[id]||(INFO[id]={s:[]});if(I.img||I.rp)continue;I.oe=k;I.oe1=!!one}})();

const KEY='carnet-fonte-v1';
const APP_VERSION='4.0';
/* ================= Appli Android (Capacitor) ================= */
const NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const CP=NATIVE?window.Capacitor.Plugins:{};
async function nativeExport(txt){const name=`carnet-fonte-${new Date().toISOString().slice(0,10)}.json`;
  try{const r=await CP.Filesystem.writeFile({path:name,data:txt,directory:'CACHE',encoding:'utf8'});await CP.Share.share({title:'Sauvegarde Carnet de fonte',files:[r.uri],dialogTitle:'Enregistrer la sauvegarde'});markExport()}
  catch(e){if(!/cancel/i.test(String(e&&e.message)))flash('Enregistrement impossible : utilise Copier')}}
/* notification de fin de repos, programmée seulement quand l'appli passe en arrière-plan */
let notifAsked=false;
async function askNotif(){if(!NATIVE||notifAsked||!CP.LocalNotifications)return;notifAsked=true;const LN=CP.LocalNotifications;
  try{await LN.createChannel({id:'repos',name:'Fin du repos',description:'Prévient quand le temps de repos est écoulé',importance:5,vibration:true,visibility:1})}catch(e){}
  try{const p=await LN.checkPermissions();if(p.display!=='granted')await LN.requestPermissions()}catch(e){}}
const FONTE=()=>NATIVE&&CP.Fonte;
/* avis sur le Play Store : une seule fois, après 5 séances et une séance terminée */
/* rapports de plantage (Firebase Crashlytics, appli Android seulement) */
function crashSetup(){if(!NATIVE||!CP.FirebaseCrashlytics)return;try{CP.FirebaseCrashlytics.setEnabled({enabled:!S.settings.noCrash})}catch(e){}}
let crashN=0;
function crashReport(msg,stack){if(!NATIVE||!CP.FirebaseCrashlytics||S.settings.noCrash||crashN++>20)return;try{CP.FirebaseCrashlytics.recordException({message:String(msg).slice(0,500)+(stack?'\n'+String(stack).slice(0,1500):'')})}catch(e){}}
if(NATIVE){window.addEventListener('error',e=>crashReport(e.message+' @'+(e.filename||'').split('/').pop()+':'+e.lineno,e.error&&e.error.stack));window.addEventListener('unhandledrejection',e=>{const r=e.reason;if(r&&/cancel|annul|popup-closed/i.test(String(r.message||r)))return;crashReport('Promesse : '+(r&&r.message||r),r&&r.stack)})}
/* liens carnetdefonte://ami/<code> (invitations du classement ouvertes depuis un autre appli) */
function deepLink(u){const m=String(u||'').match(/ami[=\/]([A-Za-z0-9]{20,40}(?:\.[A-Za-z0-9_-]*)?)/);if(m){location.hash='ami='+m[1];checkFriendLink()}}
if(NATIVE&&CP.App){try{CP.App.addListener('appUrlOpen',e=>deepLink(e&&e.url));CP.App.getLaunchUrl&&CP.App.getLaunchUrl().then(r=>{if(r&&r.url)setTimeout(()=>deepLink(r.url),900)}).catch(()=>{})}catch(e){}}
if(NATIVE)setTimeout(()=>{crashSetup();widgetSync();remindSync();restSync()},1500);
async function askReview(){if(!NATIVE||!CP.InAppReview||S.settings.reviewAsked||S.history.length<5||MODAL)return;S.settings.reviewAsked=Date.now();save();try{await CP.InAppReview.requestReview()}catch(e){}}
/* widget d'écran d'accueil */
let widgetT=null;
function widgetSync(){if(!FONTE())return;clearTimeout(widgetT);widgetT=setTimeout(()=>{try{const i=dow(Date.now()),rid=(S.plan||{})[i],R=rid&&S.routines.find(r=>r.id===rid);
  const wk=monday(Date.now()),n=S.history.filter(w=>w.start>=wk).length,g=S.settings.weekGoal,doneToday=S.history.some(w=>dayKey(w.start)===dayKey(Date.now())),st=weekStreaks().cur;
  const title=S.active?'Séance en cours':doneToday?'Séance faite ✔':R?R.name:'Repos';
  const line1=S.active?(S.active.name||'Séance'):R?`${R.exercises.length} exercice${R.exercises.length>1?'s':''} · ${n}${g?' / '+g:''} séance${(g||n)>1?'s':''} cette semaine`:`${n}${g?' / '+g:''} séance${(g||n)>1?'s':''} cette semaine`;
  CP.Fonte.widget({title:TR(title),line1:TR(line1),line2:TR(st?`🔥 ${st} semaine${st>1?'s':''} d'affilée`:'')})}catch(e){}},800)}
/* rappels d'entraînement : notification les jours du planning */
async function remindSync(){if(!NATIVE||!CP.LocalNotifications)return;const LN=CP.LocalNotifications,R=S.settings.remind||{};
  try{await LN.cancel({notifications:[0,1,2,3,4,5,6].map(i=>({id:100+i}))})}catch(e){}
  if(!R.on)return;try{await LN.createChannel({id:'rappels',name:'Rappels d\'entraînement',description:'Les jours prévus dans ton planning',importance:3})}catch(e){}
  const [h,m]=(R.at||'18:00').split(':').map(Number),N=[];
  for(let i=0;i<7;i++){const rid=(S.plan||{})[i],r=rid&&S.routines.find(x=>x.id===rid);if(!r)continue;
    N.push({id:100+i,title:EN?`${r.name} today 💪`:`${r.name} aujourd'hui 💪`,body:EN?`${r.exercises.length} exercises planned. Let's go?`:`${r.exercises.length} exercices au programme. On y va ?`,channelId:'rappels',schedule:{on:{weekday:((i+1)%7)+1,hour:h,minute:m},allowWhileIdle:true}})}
  if(N.length)try{await LN.schedule({notifications:N})}catch(e){}}
const VIBS={tap:15,heavy:45,end:[200,100,200],pr:[60,40,60,40,160]};
function vib(t){try{if(FONTE()){CP.Fonte.haptic({type:t});return}if(navigator.vibrate)navigator.vibrate(VIBS[t]||15)}catch(e){}}
/* minuteur de repos natif : compte à rebours sur l'écran verrouillé, boutons +30 s / Passer */
function restSync(){if(!FONTE())return;const r=S.active&&S.active.rest;try{if(r&&r.end>Date.now()+500)CP.Fonte.restStart({end:r.end,total:r.total,title:TR('Repos')+' · '+(S.active.name||TR('Séance')),body:restNext()});else CP.Fonte.restStop()}catch(e){}}
function restNext(){try{const A=S.active;for(const e of A.exercises){const k=e.sets.findIndex(s=>!s.done&&s.t!=='w');if(k>=0)return TR('Ensuite :')+' '+ex(e.exId).name+' · '+TR('série')+' '+(k+1)}}catch(e){}return TR('À la série suivante !')}
function restFromNative(e){if(!S.active)return;if(e.action==='plus'&&S.active.rest){S.active.rest.end=e.end;S.active.rest.total=e.total||S.active.rest.total+30}else if(e.action==='skip'||e.action==='end')S.active.rest=null;save();renderRestBar();renderResume();tick()}
async function restResume(){if(!FONTE()||!S.active||!S.active.rest)return;try{const n=await CP.Fonte.restGet();if(!n.end)S.active.rest=null;else if(Math.abs(n.end-S.active.rest.end)>900){S.active.rest.end=n.end;S.active.rest.total=n.total||S.active.rest.total}save();renderRestBar();renderResume()}catch(e){}}
if(NATIVE)setTimeout(()=>{if(!FONTE())return;try{CP.Fonte.addListener('rest',restFromNative)}catch(e){}document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')restResume()})},0);
async function restNotif(){if(!NATIVE||!CP.LocalNotifications||FONTE())return;const LN=CP.LocalNotifications;try{await LN.cancel({notifications:[{id:1}]})}catch(e){}
  const r=S.active&&S.active.rest;if(!r||document.visibilityState!=='hidden'||r.end<=Date.now()+1000)return;
  try{await LN.schedule({notifications:[{id:1,title:'Repos terminé',body:'Série suivante : '+(S.active.name||'séance'),channelId:'repos',schedule:{at:new Date(r.end),allowWhileIdle:true}}]})}catch(e){}}
if(NATIVE){document.addEventListener('visibilitychange',restNotif);
  if(CP.App)CP.App.addListener('backButton',()=>{if(MODAL)return closeDlg();if(ui.detail.length){ui.detail.pop();renderDetail();renderRestBar();return}
    if(ui.picker)return ACTS['p-close']();if(ui.editorOpen)return ACTS['ed-min']();if(ui.tab!=='seance'){ui.tab='seance';renderMain();return}CP.App.minimizeApp()})}
function exampleRoutines(){
  const R=(name,list)=>({id:uid(),name,exercises:list.map(([n,k])=>({exId:slug(n),rest:90,sets:Array.from({length:k},()=>({t:'n',a:'',b:''}))}))});
  return[
    R('Push · exemple',[['Développé couché barre',4],['Développé incliné haltères',3],['Élévations latérales haltères',3],['Extension triceps corde',3],['Dips',3]]),
    R('Pull · exemple',[['Tractions pronation',4],['Rowing barre buste penché',3],['Tirage vertical prise serrée',3],['Face pull',3],['Curl incliné haltères',3]]),
    R('Legs · exemple',[['Squat barre haute',4],['Soulevé de terre roumain barre',3],['Presse à cuisses',3],['Leg curl assis',3],['Mollets debout machine',4]])
  ];
}
const defaultSettings=()=>({deloadUntil:0,deloadLast:0,deloadSnooze:0,onboarded:0,profile:null,fbUid:'',fbEmail:'',fbName:'',lbFb:false,accent:'rouge',lastReport:'',lbGist:'',lbName:'',showRare:false,mediaOffline:0,theme:'auto',gistId:'',ghLogin:'',lastSync:0,rest:90,sound:true,weekGoal:0,suggest:true,repLo:8,repHi:12,lastExport:0,backupSnooze:0});
const defaultState=()=>({v:1,settings:defaultSettings(),fav:[],friends:[],plan:{},vids:{},custom:[],routines:exampleRoutines(),history:[],active:null,body:[],goals:{},measures:[]});
function load(){let r=null;try{r=localStorage.getItem(KEY);if(r){const d=JSON.parse(r);if(d&&Array.isArray(d.history))return{...defaultState(),...d,settings:{...defaultSettings(),...(d.settings||{})}}}}catch(e){}
  if(r)try{localStorage.setItem(KEY+'-illisible-'+Date.now(),r)}catch(e){}return null}
let S=load()||defaultState();
let storageOK=true;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));storageOK=true}catch(e){storageOK=false}try{if(typeof widgetSync==='function')widgetSync()}catch(e){}try{if(typeof cloudDirty==='function')cloudDirty()}catch(e){}}
let saveT=null;function saveSoon(){clearTimeout(saveT);saveT=setTimeout(save,300)}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save()});

let EXI={};
function rebuildIndex(){EXI={};for(const e of BUILTIN)EXI[e.id]=e;for(const e of S.custom)EXI[e.id]={...e,custom:true}}
/* exercices perso devenus des exercices de l'annuaire : fusion */
(function migrateCustom(){try{const key=s=>norm(s).replace(/[^a-z0-9]+/g,' ').trim();const B={};for(const e of BUILTIN)if(!e.edb)B[key(e.name)]=e.id;const map={};
  S.custom=S.custom.filter(c=>{const b=B[key(c.name)];if(b){map[c.id]=b;return false}return true});if(!Object.keys(map).length)return;
  const fix=list=>list.forEach(e=>{if(map[e.exId])e.exId=map[e.exId]});S.history.forEach(w=>fix(w.exercises));S.routines.forEach(r=>fix(r.exercises));if(S.active)fix(S.active.exercises);
  for(const k in map)if(S.goals&&S.goals[k]){S.goals[map[k]]=S.goals[k];delete S.goals[k]}save()}catch(e){}})();
/* exercices ExerciseDB fusionnés avec un exercice de l'annuaire : on suit le nouvel identifiant */
(function migrateRedir(){try{let ch=false;const R=id=>{if(EDB_REDIR[id]){ch=true;return EDB_REDIR[id]}return id};const fix=list=>(list||[]).forEach(e=>{e.exId=R(e.exId)});
  S.history.forEach(w=>fix(w.exercises));S.routines.forEach(r=>fix(r.exercises));if(S.active)fix(S.active.exercises);
  if(S.goals)for(const k in S.goals)if(EDB_REDIR[k]){if(!S.goals[EDB_REDIR[k]])S.goals[EDB_REDIR[k]]=S.goals[k];delete S.goals[k];ch=true}
  if(Array.isArray(S.fav))S.fav=[...new Set(S.fav.map(R))];if(ch)save()}catch(e){}})();
rebuildIndex();
const ex=id=>EXI[id]||{id,name:'Exercice supprimé',muscle:'—',equip:'—',type:'w'};
const allEx=()=>Object.values(EXI);

/* ================= UI state ================= */
const ui={calMonth:null,mediaSplit:false,tab:'seance',editorOpen:false,edMode:'workout',draft:null,picker:null,detail:[],xq:'',xMuscle:'Tous',xEquip:''};
let MODAL=null;
const edTarget=()=>ui.edMode==='workout'?S.active:ui.draft;
const findE=u=>{const T=edTarget();return T?T.exercises.find(e=>e.uid===u):null};
const defaultName=()=>{const h=new Date().getHours();return h<12?'Séance du matin':h<18?"Séance de l'après-midi":'Séance du soir'};

/* ================= Calculs ================= */
function prevMatch(E,i){const P=prevSets(E.exId);if(!P.length)return null;const s=E.sets[i];const isW=s.t==='w';
  let k=0;for(let j=0;j<i;j++)if((E.sets[j].t==='w')===isW)k++;const same=P.filter(p=>(p.t==='w')===isW);return same[k]||null}
const INC={'Barre':2.5,'Smith':2.5,'Barre EZ':2.5,'Machine':2.5,'Poulie':2.5,'Haltères':2,'Kettlebell':4,'Élastique':0,'Autre':2.5,'Poids du corps':0};
function suggestFor(E,i){const p=prevMatch(E,i);if(!p)return null;const X=ex(E.exId);const s=E.sets[i];const a=+p.a||0,b=+p.b||0;
  if(!S.settings.suggest||s.t==='w')return{a,b,up:0};
  if(deloadOn()&&X.type==='w'){const inc=INC[X.equip]||2.5;return{a:a>0?Math.max(inc,Math.round(a*.85/inc)*inc):a,b,up:0,dl:1}}
  if(X.type==='w'){const lo=S.settings.repLo||8,hi=S.settings.repHi||12,inc=INC[X.equip]??2.5,rir=p.rir!=null&&p.rir!==''?+p.rir:null;
    if(a>0&&b>0&&b<lo-1&&inc)return{a:Math.max(inc,a-inc),b:lo,up:-inc,down:1};
    if(a>0&&b>=hi&&inc){const big=rir!=null&&rir>=3&&inc;return{a:a+(big?inc*2:inc),b:lo,up:big?inc*2:inc}}
    if(a>0&&b>0&&b<hi){if(rir===0)return{a,b,up:0,hold:1};return{a,b:b+(rir!=null&&rir>=3?2:1),up:0,rep:1}}return{a,b,up:0}}
  if(X.type==='b'){if(b>0)return{a,b:b+1,up:0,rep:1};return{a,b,up:0}}
  if(X.type==='t'){if(b>0)return{a,b:b+5,up:0,rep:1};return{a,b,up:0}}
  return{a,b,up:0}}
/* stagnation : nombre de séances sans battre le meilleur score */
function plateauFor(exId){const X=ex(exId);if(X.type==='c')return null;const ses=sessionsFor(exId).slice().reverse();if(ses.length<4)return null;
  if(Date.now()-ses[ses.length-1].w.start>45*864e5)return null;
  let best=0,since=0,top=0;for(const s of ses){const v=score(X.type,s.sets);if(v>best+1e-6){best=v;since=0}else since++;if(X.type==='w')top=Math.max(top,maxA(s.sets))}
  if(since<3)return null;const inc=INC[X.equip]||2.5;const dl=X.type==='w'&&top>0?Math.round(top*.9/inc)*inc:0;return{n:since,dl}}
function prevSets(exId){for(const w of S.history){const e=w.exercises.filter(e=>e.exId===exId);if(e.length)return e.flatMap(x=>x.sets)}return[]}
function setStr(s,type,short){const a=+s.a||0,b=+s.b||0;
  if(type==='w')return`${fmt(a)} kg × ${b}`;
  if(type==='b')return a?`+${fmt(a)} kg × ${b}`:`${b} reps`;
  if(type==='t')return fmtSec(b)+(a?` · +${fmt(a)} kg`:'');
  return[a?fmt(a)+' km':'',b?fmt(b)+' min':''].filter(Boolean).join(' · ')||'—'}
function setVol(s,type){if(s.t==='w')return 0;if(type==='w'||type==='b')return(num(s.a)||0)*(num(s.b)||0);return 0}
function wVolume(w){let v=0;for(const e of w.exercises){const T=ex(e.exId).type;for(const s of e.sets)if(s.done!==false)v+=setVol(s,T)}return v}
/* calories estimées : MET × poids × durée (muscu ≈ 5 MET, cardio ≈ 7,5 MET) */
function bodyAt(t){const B=bodySorted();if(!B.length)return 0;let k=B[0].kg;for(const b of B)if(b.t<=t)k=b.kg;return +k||0}
function kcalFor(w){const kg=bodyAt(w.start)||75,T=Math.max(0,(w.end-w.start)/36e5);let cm=0;for(const e of w.exercises)if(ex(e.exId).type==='c')for(const s of e.sets)if(s.done!==false)cm+=+s.b||0;
  const ch=Math.min(T,cm/60);return Math.round(kg*((T-ch)*5+ch*7.5))}
const fmtKcal=n=>'≈ '+Math.round(n).toLocaleString(LOC)+' kcal';
function wSets(w){let n=0;for(const e of w.exercises)for(const s of e.sets)if(s.done!==false&&s.t!=='w')n++;return n}
function activeStats(){let v=0,n=0;for(const e of S.active.exercises){const T=ex(e.exId).type;for(const s of e.sets)if(s.done){v+=setVol(s,T);if(s.t!=='w')n++}}return{v,n}}
function score(type,sets){let best=0;for(const s of sets){if(s.t==='w')continue;const a=+s.a||0,b=+s.b||0;
  if(type==='w'){if(a>0&&b>0)best=Math.max(best,e1rm(a,b))}else if(type==='b'||type==='t')best=Math.max(best,b);else best=Math.max(best,a||b)}return best}
function maxA(sets){let m=0;for(const s of sets)if(s.t!=='w'&&(+s.b||0)>0)m=Math.max(m,+s.a||0);return m}
function sessionsFor(id){return S.history.map(w=>{const sets=w.exercises.filter(e=>e.exId===id).flatMap(e=>e.sets);return sets.length?{w,sets}:null}).filter(Boolean)}
function usesMap(){const m={};for(const w of S.history)for(const e of w.exercises)m[e.exId]=(m[e.exId]||0)+1;return m}
function recentIds(){const seen=[];for(const w of S.history)for(const e of w.exercises)if(!seen.includes(e.exId))seen.push(e.exId);return seen}
function computePRs(rec){const prs=[],seen=new Set();for(const e of rec.exercises){if(seen.has(e.exId))continue;seen.add(e.exId);const X=ex(e.exId);
  const old=S.history.flatMap(w=>w.exercises.filter(x=>x.exId===e.exId).flatMap(x=>x.sets));if(!old.length)continue;
  const now=rec.exercises.filter(x=>x.exId===e.exId).flatMap(x=>x.sets);
  if(X.type==='w'){const na=maxA(now),oa=maxA(old);if(na>oa)prs.push({exId:e.exId,label:'Poids max',value:fmt(na)+' kg'});const ns=score('w',now),os=score('w',old);if(ns>os+0.05)prs.push({exId:e.exId,label:'1RM estimé',value:Math.round(ns)+' kg'})}
  else{const ns=score(X.type,now),os=score(X.type,old);if(ns>os)prs.push({exId:e.exId,label:X.type==='b'?'Reps max':X.type==='t'?'Durée max':'Distance max',value:X.type==='b'?ns+' reps':X.type==='t'?fmtSec(ns):fmt(ns)+(X.type==='c'?' km':'')})}}
  return prs}
const monday=t=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()};

function filterEx(q,muscle,equip){
  let L;
  if(muscle==='Récents')L=recentIds().map(ex).filter(x=>EXI[x.id]);
  else if(muscle==='Favoris')L=(S.fav||[]).map(ex).filter(x=>EXI[x.id]);
  else{L=allEx();if(muscle&&muscle!=='Tous')L=L.filter(x=>x.muscle===muscle)}
  if(equip)L=L.filter(x=>x.equip===equip);
  if(!S.settings.showRare&&muscle!=='Favoris'&&muscle!=='Récents'){const U=usesMap(),F=new Set(S.fav||[]);L=L.filter(x=>!x.rare||U[x.id]||F.has(x.id))}
  if(q&&q.trim()){let nq=norm(q.trim());const sub=[];for(const k of Object.keys(ALIAS).sort((x,y)=>y.length-x.length))if(nq.includes(k)){nq=nq.replace(k,'{'+sub.length+'}');sub.push(ALIAS[k])}nq=nq.replace(/\{(\d+)\}/g,(_,n)=>' '+sub[n]+' ');const toks=nq.split(/\s+/).filter(Boolean);const raw=norm(q.trim()).split(/\s+/).filter(Boolean);L=L.filter(x=>{const h=norm(x.name+' '+x.muscle+' '+x.equip+' '+(x.en||''));return toks.every(t=>h.includes(t))||raw.every(t=>h.includes(t))})}
  if(muscle!=='Récents'){const F=new Set(S.fav||[]);L.sort((a,b)=>(F.has(b.id)-F.has(a.id))||a.name.localeCompare(b.name,'fr'))}
  return L}

/* ================= Import Hevy ================= */
const HEVY_MAP={"bench press barbell":"developpe-couche-barre","bench press dumbbell":"developpe-couche-halteres","bench press smith machine":"developpe-couche-smith","bench press close grip barbell":"developpe-couche-prise-serree","close grip bench press":"developpe-couche-prise-serree","incline bench press barbell":"developpe-incline-barre","incline bench press dumbbell":"developpe-incline-halteres","incline bench press smith machine":"developpe-incline-smith","decline bench press barbell":"developpe-decline-barre","decline bench press dumbbell":"developpe-decline-halteres","floor press barbell":"developpe-sol-floor-press","chest press machine":"developpe-couche-machine","incline chest press machine":"developpe-incline-machine","iso lateral chest press machine":"presse-pectorale-convergente","chest fly dumbbell":"ecarte-couche-halteres","incline chest fly dumbbell":"ecarte-incline-halteres","chest fly machine":"pec-deck-butterfly","butterfly pec deck":"pec-deck-butterfly","cable fly crossovers":"ecarte-poulie-vis-a-vis-milieu","low cable fly crossovers":"ecarte-poulie-vis-a-vis-basse","high cable fly crossovers":"ecarte-poulie-vis-a-vis-haute","chest fly cable":"ecarte-poulie-vis-a-vis-milieu","seated chest flys cable":"ecarte-poulie-vis-a-vis-milieu","pullover dumbbell":"pull-over-haltere","push up":"pompes","push up weighted":"pompes-lestees","incline push ups":"pompes-inclinees","decline push up":"pompes-declinees","diamond push up":"pompes-diamant","ring push up":"pompes-sur-anneaux","pike pushup":"pompes-piquees-pike-push-up","handstand push up":"pompes-en-equilibre-handstand-push-up","chest dip":"dips-buste-penche-pectoraux","chest dip weighted":"dips-buste-penche-pectoraux","triceps dip":"dips","triceps dip weighted":"dips","bench dip":"dips-entre-deux-bancs","seated dip machine":"dips-machine","pull up":"tractions-pronation","pull up weighted":"tractions-pronation","wide pull up":"tractions-prise-large","chin up":"tractions-supination","chin up weighted":"tractions-supination","pull up assisted":"tractions-assistees-machine","chin up assisted":"tractions-assistees-machine","lat pulldown cable":"tirage-vertical-prise-large","lat pulldown machine":"tirage-vertical-machine","lat pulldown close grip cable":"tirage-vertical-prise-serree","reverse grip lat pulldown cable":"tirage-vertical-supination","single arm lat pulldown":"tirage-vertical-unilateral","straight arm lat pulldown cable":"tirage-bras-tendus-poulie","rope straight arm pulldown":"pull-over-poulie","bent over row barbell":"rowing-barre-buste-penche","bent over row dumbbell":"rowing-halteres-buste-penche","dumbbell row":"rowing-haltere-unilateral","pendlay row barbell":"rowing-pendlay","yates row":"rowing-yates-supination","t bar row":"rowing-t-bar","meadows rows barbell":"meadows-row","seal row":"seal-row","chest supported incline row dumbbell":"rowing-poitrine-appuyee-halteres","seated cable row v grip cable":"rowing-assis-poulie-prise-serree","seated cable row bar wide grip":"rowing-assis-poulie-prise-large","seated cable row bar grip":"rowing-assis-poulie-prise-large","single arm cable row":"rowing-unilateral-poulie","seated row machine":"rowing-machine-convergente","iso lateral row machine":"rowing-machine-convergente","iso lateral high row machine":"high-row-machine","inverted row":"rowing-inverse","deadlift barbell":"souleve-de-terre","sumo deadlift":"souleve-de-terre-sumo","deadlift trap bar":"souleve-de-terre-trap-bar","trap bar deadlift":"souleve-de-terre-trap-bar","rack pull":"rack-pull","romanian deadlift barbell":"souleve-de-terre-roumain-barre","romanian deadlift dumbbell":"souleve-de-terre-roumain-halteres","single leg romanian deadlift":"souleve-de-terre-roumain-unilateral","straight leg deadlift":"souleve-de-terre-jambes-tendues","good morning barbell":"good-morning","back extension hyperextension":"extension-lombaire-banc-45","back extension":"extension-lombaire-banc-45","back extension machine":"extension-lombaire-machine","back extension weighted hyperextension":"extension-lombaire-banc-45","reverse hyperextension":"hyperextension-inversee","superman":"superman","overhead press barbell":"developpe-militaire-debout","seated overhead press barbell":"developpe-militaire-assis","shoulder press dumbbell":"developpe-halteres-assis","seated shoulder press dumbbell":"developpe-halteres-assis","standing military press dumbbell":"developpe-halteres-debout","seated shoulder press machine":"developpe-epaules-machine","shoulder press machine plates":"developpe-epaules-machine","overhead press smith machine":"developpe-epaules-smith","arnold press dumbbell":"developpe-arnold","push press":"push-press","landmine press":"landmine-press","lateral raise dumbbell":"elevations-laterales-halteres","seated lateral raise dumbbell":"elevations-laterales-assis","lateral raise cable":"elevations-laterales-poulie","single arm lateral raise cable":"elevations-laterales-poulie","lateral raise machine":"elevations-laterales-machine","lateral raise band":"elevations-laterales-elastique","front raise dumbbell":"elevations-frontales-halteres","front raise cable":"elevations-frontales-poulie","plate front raise":"elevations-frontales-disque","rear delt reverse fly dumbbell":"oiseau-halteres","rear delt reverse fly cable":"oiseau-poulie","rear delt reverse fly machine":"reverse-pec-deck","face pull":"face-pull","face pull cable":"face-pull","upright row barbell":"rowing-menton-barre","upright row cable":"rowing-menton-poulie","shrug barbell":"shrug-barre","shrug dumbbell":"shrug-halteres","shrug machine":"shrug-machine","shrug smith machine":"shrug-smith","shrug cable":"shrug-poulie","bicep curl barbell":"curl-barre-droite","ez bar biceps curl":"curl-barre-ez","bicep curl dumbbell":"curl-halteres-simultane","bicep curl cable":"curl-poulie-basse","bicep curl machine":"curl-machine","hammer curl dumbbell":"curl-marteau","hammer curl cable":"curl-marteau-corde","rope cable curl":"curl-marteau-corde","seated incline curl dumbbell":"curl-incline-halteres","preacher curl barbell":"curl-pupitre-barre-ez-larry-scott","preacher curl dumbbell":"curl-pupitre-haltere","preacher curl machine":"curl-pupitre-machine","concentration curl":"curl-concentre","spider curl dumbbell":"curl-araignee-spider-curl","zottman curl dumbbell":"curl-zottman","drag curl":"curl-drag","21s bicep curl":"curl-21","behind the back bicep wrist curl barbell":"curl-poignets-barre","behind the back curl cable":"curl-bayesien-poulie-derriere","overhead curl cable":"curl-poulie-haute-double-biceps","reverse curl barbell":"curl-inverse-barre-ez","reverse curl dumbbell":"curl-inverse-barre-ez","triceps pushdown":"extension-triceps-poulie-barre","triceps rope pushdown":"extension-triceps-corde","single arm triceps pushdown cable":"extension-triceps-unilaterale-poulie","triceps extension cable":"extension-au-dessus-de-la-tete-poulie","overhead triceps extension cable":"extension-au-dessus-de-la-tete-poulie","triceps extension dumbbell":"extension-nuque-haltere","triceps extension barbell":"extension-nuque-barre-ez","triceps extension machine":"extension-triceps-machine","skullcrusher barbell":"barre-au-front-skull-crusher","skullcrusher dumbbell":"barre-au-front-halteres","triceps kickback dumbbell":"kickback-haltere","triceps kickback cable":"kickback-poulie","jm press barbell":"jm-press","wrist curl barbell":"curl-poignets-barre","wrist curl dumbbell":"curl-poignets-haltere","reverse wrist curl barbell":"curl-poignets-inverse","dead hang":"suspension-a-la-barre-dead-hang","farmers walk":"farmer-walk","plate pinch":"pince-disque-plate-pinch","squat barbell":"squat-barre-haute","full squat":"squat-barre-haute","pause squat barbell":"squat-pause","box squat barbell":"box-squat","front squat":"front-squat","front squat barbell":"front-squat","zercher squat":"zercher-squat","squat smith machine":"squat-smith","hack squat":"hack-squat","hack squat machine":"hack-squat","pendulum squat machine":"pendulum-squat","belt squat machine":"belt-squat","leg press machine":"presse-a-cuisses","leg press horizontal machine":"presse-a-cuisses","single leg press machine":"presse-a-cuisses-unilaterale","leg extension machine":"leg-extension","single leg extensions":"leg-extension-unilateral","goblet squat":"squat-goblet-haltere","squat dumbbell":"squat-goblet-haltere","lunge dumbbell":"fentes-avant-halteres","lunge barbell":"fentes-barre","reverse lunge dumbbell":"fentes-arriere-halteres","walking lunge dumbbell":"fentes-marchees-halteres","lateral lunge":"fente-laterale","bulgarian split squat":"squat-bulgare-halteres","split squat dumbbell":"squat-bulgare-halteres","step up":"step-up-halteres","step up dumbbell":"step-up-halteres","sissy squat weighted":"sissy-squat","squat bodyweight":"squat-poids-du-corps","air squats":"squat-poids-du-corps","jump squat":"squat-saute","pistol squat":"pistol-squat","wall sit":"chaise-contre-le-mur","lying leg curl machine":"leg-curl-allonge","seated leg curl machine":"leg-curl-assis","standing leg curls":"leg-curl-debout-unilateral","nordic hamstrings curls":"nordic-curl","glute ham raise":"glute-ham-raise","hip thrust barbell":"hip-thrust-barre","hip thrust machine":"hip-thrust-machine","hip thrust smith machine":"hip-thrust-smith","single leg hip thrust":"hip-thrust-unilateral","glute bridge":"pont-fessier","glute kickback machine":"kickback-fessier-machine","glute kickback on machine":"kickback-fessier-machine","cable kickback":"kickback-fessier-poulie","hip abduction machine":"abduction-machine","hip adduction machine":"adduction-machine","cable pull through":"pull-through-poulie","lateral band walks":"marche-laterale-elastique","frog pumps dumbbell":"frog-pump","sumo squat dumbbell":"squat-sumo-haltere","standing calf raise machine":"mollets-debout-machine","standing calf raise":"mollets-poids-du-corps","standing calf raise smith":"mollets-smith","standing calf raise dumbbell":"mollets-unilateral-haltere","single leg standing calf raise":"mollets-unilateral-haltere","seated calf raise":"mollets-assis-machine","calf press machine":"mollets-a-la-presse","donkey calf raise":"mollets-donkey","crunch":"crunch","crunch weighted":"crunch","cable crunch":"crunch-poulie","crunch machine":"crunch-machine","decline crunch":"crunch-decline","reverse crunch":"crunch-inverse","sit up":"sit-up","bicycle crunch":"bicycle-crunch","hanging leg raise":"releves-de-jambes-suspendu","hanging knee raise":"releves-de-genoux-suspendu","knee raise parallel bars":"releves-de-jambes-chaise-romaine","leg raise parallel bars":"releves-de-jambes-chaise-romaine","lying leg raise":"releves-de-jambes-au-sol","toes to bar":"toes-to-bar","v up":"v-up","dragon flag":"dragon-flag","ab wheel":"roue-abdominale","russian twist weighted":"russian-twist","russian twist bodyweight":"russian-twist","mountain climber":"mountain-climbers","dead bug":"dead-bug","plank":"planche-gainage","side plank":"gainage-lateral","hollow rock":"hollow-hold","l sit hold":"l-sit","cable core palloff press":"pallof-press","cable twist up to down":"woodchopper-poulie","cable twist down to up":"woodchopper-poulie","clean":"epaule-power-clean","power clean":"epaule-power-clean","hang clean":"hang-clean","clean and jerk":"epaule-jete","snatch":"arrache","thruster barbell":"thruster-barre","thruster dumbbell":"thruster-halteres","kettlebell swing":"swing-kettlebell","kettlebell snatch":"snatch-kettlebell","kettlebell turkish get up":"turkish-get-up","wall ball":"wall-ball","burpee":"burpees","sled push":"poussee-de-traineau","treadmill":"tapis-de-course","running":"course-a-pied-exterieur","walking":"marche-inclinee-tapis","cycling":"velo-exterieur","spinning":"velo-stationnaire","rowing machine":"rameur","elliptical trainer":"elliptique","stair machine":"stairmaster","air bike":"assault-bike","ski erg":"skierg","swimming":"natation","jump rope":"corde-a-sauter","curl biceps poulie":"curl-poulie-basse","curl biceps machine":"curl-machine","curl biceps barre":"curl-barre-droite","curl biceps haltere":"curl-halteres-simultane","extension triceps corde":"extension-triceps-corde","developpe couche incline machine smith":"developpe-incline-smith","developpe couche machine smith":"developpe-couche-smith","developpe couche barre":"developpe-couche-barre","developpe couche haltere":"developpe-couche-halteres","developpe couche incline barre":"developpe-incline-barre","developpe couche incline haltere":"developpe-incline-halteres","curl marteau poulie":"curl-marteau-corde","curl marteau haltere":"curl-marteau","curl pupitre machine":"curl-pupitre-machine","oiseau machine":"reverse-pec-deck","tirage poitrine machine":"tirage-vertical-machine","tirage poitrine poulie":"tirage-vertical-prise-large","tirage poitrine prise serree poulie":"tirage-vertical-prise-serree","tirage poitrine prise inversee poulie":"tirage-vertical-supination","curl derriere le dos cable":"curl-bayesien-poulie-derriere","curl derriere le dos poulie":"curl-bayesien-poulie-derriere","chest press convergent machine":"presse-pectorale-convergente","chest press incline machine":"developpe-incline-machine","tirage bas iso lateral":"rowing-machine-convergente","tirage assis a la poulie prise en v poulie":"rowing-assis-poulie-prise-serree","rowing poulie assis prise en v":"rowing-assis-poulie-prise-serree","elevation laterale a un bras cable":"elevations-laterales-poulie","elevation laterale un bras poulie":"elevations-laterales-poulie","elevation laterale haltere":"elevations-laterales-halteres","elevation laterale machine":"elevations-laterales-machine","dips triceps":"dips","extension triceps au dessus de la tete poulie":"extension-au-dessus-de-la-tete-poulie","extension des triceps au dessus de la tete cable":"extension-au-dessus-de-la-tete-poulie","extension unilaterale des triceps a la poulie":"extension-triceps-unilaterale-poulie","presse epaules assis machine":"developpe-epaules-machine","tractions":"tractions-pronation","abduction hanche":"abduction-machine","adduction hanche":"adduction-machine","leg curl assis":"leg-curl-assis","leg curl allonge machine":"leg-curl-allonge","ecartes poulie":"ecarte-poulie-vis-a-vis-milieu","ecartes poulie basse":"ecarte-poulie-vis-a-vis-basse","presse a cuisses":"presse-a-cuisses","curl incline assis haltere":"curl-incline-halteres","kickbacks fessier machine":"kickback-fessier-machine","extension dos hyperextension lestee":"extension-lombaire-banc-45","tirage vers visage":"face-pull","crunch decline":"crunch-decline","rowing barre t buste appuye":"rowing-t-bar-machine","rowing penche haltere":"rowing-halteres-buste-penche","rowing penche barre":"rowing-barre-buste-penche","shrug poulie":"shrug-poulie","extension mollets machine":"mollets-a-la-presse","squat barre":"squat-barre-haute","souleve de terre barre":"souleve-de-terre","souleve de terre roumain barre":"souleve-de-terre-roumain-barre","developpe couche decline machine":"+Développé décliné machine|Pectoraux|Machine","ecarte machine":"+Écarté machine|Pectoraux|Machine","extension triceps assis":"+Extension triceps assis|Triceps|Machine","tirage machine convergente":"+Tirage machine convergente|Dos|Machine","traction verticale machine":"+Traction verticale machine|Dos|Machine","curl inverse poulie":"+Curl inversé poulie|Avant-bras|Poulie","curl inverse cable":"+Curl inversé poulie|Avant-bras|Poulie","presse epaules machine a plaques":"+Développé épaules machine à disques|Épaules|Machine","developpe epaules machine a disques":"+Développé épaules machine à disques|Épaules|Machine","presse a cuisses horizontal":"+Presse à cuisses horizontale|Quadriceps|Machine","rangee de mines terrestres":"+Rowing landmine|Dos|Barre"};
const hkey=s=>norm(s).replace(/[^a-z0-9]+/g,' ').trim();
function parseCSV(txt){txt=txt.replace(/^\ufeff/,'');const first=txt.slice(0,txt.indexOf('\n'));const D=(first.split(';').length>first.split(',').length)?';':',';
  const rows=[];let row=[],f='',q=false;for(let i=0;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
    else if(c==='"')q=true;else if(c===D){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&txt[i+1]==='\n')i++;row.push(f);f='';if(row.length>1||row[0]!=='')rows.push(row);row=[]}else f+=c}
  if(f!==''||row.length){row.push(f);rows.push(row)}return rows}
const MONTHS={jan:0,janv:0,feb:1,fev:1,févr:1,fevr:1,mar:2,mars:2,apr:3,avr:3,may:4,mai:4,jun:5,juin:5,jul:6,juil:6,aug:7,aout:7,sep:8,sept:8,oct:9,nov:10,dec:11};
function parseHevyDate(str){if(!str)return NaN;const t=norm(str).trim();
  let m=t.match(/^(\d{1,2})\s+([a-z]+)\.?\s+(\d{4}),?\s+(\d{1,2})[:h](\d{2})/);if(m&&MONTHS[m[2]]!=null)return new Date(+m[3],MONTHS[m[2]],+m[1],+m[4],+m[5]).getTime();
  m=t.match(/^([a-z]+)\.?\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})/);if(m&&MONTHS[m[1]]!=null)return new Date(+m[3],MONTHS[m[1]],+m[2],+m[4],+m[5]).getTime();
  m=t.match(/^(\d{4})-(\d{2})-(\d{2})[ t](\d{2}):(\d{2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]).getTime();
  m=t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})/);if(m)return new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime();
  const d=Date.parse(str);return isNaN(d)?NaN:d}
function guessMuscle(n){const t=norm(n);const R=[[/mollet|calf/,'Mollets'],[/shrug|trapez/,'Trapèzes'],[/leg curl|ischio|hamstring|roumain|romanian/,'Ischios'],[/fess|glute|hip thrust|kickback.*(fess|glute)|abduct/,'Fessiers'],[/adduct/,'Adducteurs'],[/squat|presse a cuisse|leg press|fente|lunge|leg extension|quadri/,'Quadriceps'],[/crunch|abdo|\babs?\b|gainage|plank|planche|sit up|leg raise|releve/,'Abdos'],[/lombaire|back extension|extension dos|hyperext/,'Lombaires'],[/poignet|wrist|avant bras|forearm|curl invers|reverse curl/,'Avant-bras'],[/triceps|skull|kickback|dips|pushdown|barre au front/,'Triceps'],[/curl|biceps/,'Biceps'],[/lateral|laterale|epaule|shoulder|militaire|overhead press|arnold|oiseau|rear delt|face pull|visage|frontale|front raise/,'Épaules'],[/tirage|traction|pull|row|rowing|lat |dorsa|\bdos\b|back/,'Dos'],[/couche|bench|pec|chest|ecarte|fly|butterfly|pompe|push up|dip/,'Pectoraux'],[/course|run|velo|bike|cycl|rameur|rowing machine|elliptique|tapis|treadmill|natation|swim|corde a sauter|jump rope|marche|walk/,'Cardio']];
  for(const[r,m]of R)if(r.test(t))return m;return'Corps entier'}
function guessEquip(n){const t=norm(n);const R=[[/smith/,'Smith'],[/haltere|dumbbell/,'Haltères'],[/ez/,'Barre EZ'],[/barre|barbell/,'Barre'],[/poulie|cable|cablee|corde|rope/,'Poulie'],[/machine|disques|plaques|plate/,'Machine'],[/kettlebell/,'Kettlebell'],[/elastique|band/,'Élastique'],[/poids du corps|bodyweight|pompe|traction|dips|pull up|push up/,'Poids du corps']];for(const[r,e]of R)if(r.test(t))return e;return'Autre'}
/* export Strong → même forme que l'export Hevy */
function strongDur(t){t=String(t||'').trim();let m=t.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);if(m)return m[3]!=null?(+m[1]*3600+ +m[2]*60+ +m[3]):(+m[1]*60+ +m[2]);
  let sec=0;for(const[,n,u]of t.matchAll(/(\d+(?:[.,]\d+)?)\s*(h|m|min|s)\b/gi))sec+=num(n)*(/^h/i.test(u)?3600:/^m/i.test(u)?60:1);if(sec)return sec;const n=num(t);return n>0?n:0}
function strongRows(rows){const H=rows[0].map(h=>norm(h).trim());const c=n=>H.indexOf(n);
  const ci={date:c('date'),wn:c('workout name'),dur:c('duration'),ex:c('exercise name'),so:c('set order'),w:c('weight'),unit:c('weight unit'),reps:c('reps'),dist:c('distance'),dunit:c('distance unit'),sec:c('seconds'),note:c('notes'),wnote:c('workout notes'),rpe:c('rpe')};
  const out=[['title','start_time','end_time','description','exercise_title','superset_id','exercise_notes','set_type','weight_kg','reps','distance_km','duration_seconds','rpe']];
  const pad=n=>String(n).padStart(2,'0'),iso=t=>{const d=new Date(t);return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`};
  for(let i=1;i<rows.length;i++){const r=rows[i],g=k=>ci[k]>=0&&ci[k]<r.length?r[ci[k]].trim():'';const st=parseHevyDate(g('date'));if(isNaN(st))continue;
    const d=strongDur(g('dur'));const so=norm(g('so'));const lbs=/lb/i.test(g('unit'));const mi=/mi/i.test(g('dunit'));const w=num(g('w')),dist=num(g('dist'));
    out.push([g('wn')||'Séance',iso(st),iso(st+(d>0?d*1000:3600e3)),g('wnote'),g('ex'),'',g('note'),so==='w'?'warmup':so==='d'?'dropset':so==='f'?'failure':'normal',w>0?String(lbs?w*0.453592:w):'',g('reps'),dist>0?String(mi?dist*1.60934:dist):'',g('sec'),g('rpe')])}
  return out}
function analyzeHevy(txt){let rows=parseCSV(txt);if(rows.length<2)throw new Error('Fichier vide');let src='Hevy';
  {const h0=rows[0].map(h=>norm(h).trim());if(h0.includes('exercise name')&&(h0.includes('workout name')||h0.includes('date'))){rows=strongRows(rows);src='Strong'}}
  const H=rows[0].map(h=>norm(h).trim());const col=n=>H.indexOf(n);
  const ci={title:col('title'),start:col('start_time'),end:col('end_time'),desc:col('description'),ex:col('exercise_title'),ss:col('superset_id'),note:col('exercise_notes'),type:col('set_type'),kg:col('weight_kg'),lbs:col('weight_lbs'),reps:col('reps'),km:col('distance_km'),mi:col('distance_miles'),sec:col('duration_seconds'),rpe:col('rpe')};
  if(ci.title<0||ci.start<0||ci.ex<0)throw new Error("Ce fichier ne ressemble pas à un export Hevy ou Strong.");
  const nameIdx={};for(const X of allEx())nameIdx[hkey(X.name)]=X.id;
  const resolved={},creates={};
  function resolve(name,stat){const k=hkey(name);if(k in resolved)return resolved[k];let id=null,plan=null;const m=HEVY_MAP[k];
    if(m&&m[0]!=='+'&&EXI[m])id=m;else if(nameIdx[k])id=nameIdx[k];
    else{let nm=name,mu,eq;if(m&&m[0]==='+'){[nm,mu,eq]=m.slice(1).split('|')}else{mu=guessMuscle(name);eq=guessEquip(name)}
      const ex2=allEx().find(x=>hkey(x.name)===hkey(nm));if(ex2)id=ex2.id;else{const ck=hkey(nm);plan=creates[ck]||(creates[ck]={id:'c-'+uid(),name:nm,muscle:mu,equip:eq,stat:{w:0,r:0,d:0,s:0}});id=plan.id}}
    return resolved[k]=id}
  const W=new Map();
  for(let i=1;i<rows.length;i++){const r=rows[i];const g=c=>c>=0&&c<r.length?r[c].trim():'';
    const start=parseHevyDate(g(ci.start));if(isNaN(start))continue;const title=g(ci.title)||'Séance';const key=title+'|'+start;
    let w=W.get(key);if(!w){const end=parseHevyDate(g(ci.end));w={id:uid(),name:title,start,end:isNaN(end)||end<start?start+3600e3:end,routineId:null,exercises:[],prs:[],hevy:true,src};W.set(key,w)}
    const exName=g(ci.ex);if(!exName)continue;const id=resolve(exName);
    const kg=ci.kg>=0?num(g(ci.kg)):(ci.lbs>=0?num(g(ci.lbs))*0.453592:NaN);const reps=num(g(ci.reps));const km=ci.km>=0?num(g(ci.km)):(ci.mi>=0?num(g(ci.mi))*1.60934:NaN);const sec=num(g(ci.sec));
    const pl=Object.values(creates).find(p=>p.id===id);if(pl){if(kg>0)pl.stat.w++;if(reps>0)pl.stat.r++;if(km>0)pl.stat.d++;if(sec>0)pl.stat.s++}
    const st=norm(g(ci.type));const t=st.startsWith('warm')?'w':st.startsWith('drop')?'d':st.startsWith('fail')?'f':'n';
    const ssid=g(ci.ss);const last=w.exercises[w.exercises.length-1];
    let E=last&&last.exId===id&&last._name===exName?last:null;
    if(!E){E={exId:id,_name:exName,ss:ssid?'h'+w.id+ssid:null,rest:S.settings.rest,note:g(ci.note),sets:[]};w.exercises.push(E)}
    const rpe=num(g(ci.rpe));E.sets.push({t,_kg:kg,_reps:reps,_km:km,_sec:sec,_rir:rpe>0?Math.max(0,Math.min(3,Math.round(10-rpe))):null})}
  for(const p of Object.values(creates)){const s=p.stat;p.type=s.d>0?'c':(s.s>0&&!s.r)?'t':(s.w>0?'w':(s.r>0?'b':'w'))}
  const typeOf=id=>{const p=Object.values(creates).find(x=>x.id===id);return p?p.type:ex(id).type};
  const list=[...W.values()].filter(w=>w.exercises.length);
  for(const w of list){for(const E of w.exercises){const T=typeOf(E.exId);E.sets=E.sets.map(x=>{const a=T==='c'?(x._km||0):(x._kg||0);const b=T==='c'?((x._sec||0)/60):T==='t'?(x._sec||0):(x._reps||0);const o={t:x.t,a:Math.round(a*100)/100,b:Math.round(b*100)/100};if(x._rir!=null)o.rir=x._rir;return o}).filter(x=>x.a>0||x.b>0);delete E._name}
    w.exercises=w.exercises.filter(E=>E.sets.length);ssClean(w)}
  const fresh=list.filter(w=>w.exercises.length&&!S.history.some(h=>Math.abs(h.start-w.start)<90e3&&h.name===w.name));
  const used=new Set(fresh.flatMap(w=>w.exercises.map(e=>e.exId)));
  for(const w of fresh){delete w.hevy;w.imp=src}
  return{src,workouts:fresh,dupes:list.length-fresh.length,creates:Object.values(creates).filter(p=>used.has(p.id)),matched:[...used].filter(id=>EXI[id]).length,used:used.size}}
function hevyImport(txt){let r;try{r=analyzeHevy(txt)}catch(e){return openDlg({title:'Import impossible',html:`<p class="dtext">${esc(e.message||'Fichier illisible.')}</p>`,buttons:[{label:'OK',kind:'primary'}]})}
  if(!r.workouts.length)return openDlg({title:'Rien de nouveau',html:`<p class="dtext">${r.dupes?`Les ${r.dupes} séances de ce fichier sont déjà dans ton historique.`:'Aucune séance trouvée dans ce fichier.'}</p>`,buttons:[{label:'OK',kind:'primary'}]});
  const W=r.workouts.slice().sort((a,b)=>a.start-b.start);const nSets=W.reduce((a,w)=>a+w.exercises.reduce((b,e)=>b+e.sets.length,0),0);
  openDlg({title:'Importer depuis '+r.src,html:`<div class="sum"><div><span class="k">Séances</span><span class="v">${W.length}</span></div><div><span class="k">Séries</span><span class="v">${nSets.toLocaleString(LOC)}</span></div><div><span class="k">Exercices</span><span class="v">${r.used}</span></div></div>
    <p class="dtext">Du ${fmtShort(W[0].start)} ${new Date(W[0].start).getFullYear()} au ${fmtShort(W[W.length-1].start)} ${new Date(W[W.length-1].start).getFullYear()}.${r.dupes?` ${r.dupes} séance${r.dupes>1?'s':''} déjà présente${r.dupes>1?'s':''} ser${r.dupes>1?'ont':'a'} ignorée${r.dupes>1?'s':''}.`:''}</p>
    <p class="dtext">${r.matched} exercice${r.matched>1?'s':''} reconnu${r.matched>1?'s':''} dans l'annuaire${r.creates.length?`, ${r.creates.length} ajouté${r.creates.length>1?'s':''} comme exercice${r.creates.length>1?'s':''} perso : ${esc(r.creates.map(c=>c.name).join(', '))}.`:'.'}</p>`,
  buttons:[{label:`Importer ${W.length} séance${W.length>1?'s':''}`,kind:'primary',fn:()=>{
      for(const c of r.creates)S.custom.push({id:c.id,name:c.name,muscle:c.muscle,equip:c.equip,type:c.type});rebuildIndex();
      S.history.push(...W);S.history.sort((a,b)=>b.start-a.start);save();ui.tab='historique';ui.calMonth=null;renderAll();flash(`${W.length} séances importées`)}},{label:'Annuler',kind:'soft'}]})}

/* ================= Échauffement & disques ================= */
function workWeight(E){for(let i=0;i<E.sets.length;i++){const s=E.sets[i];if(s.t==='w')continue;const v=num(s.a);if(v>0)return v;const g=ui.edMode==='workout'?suggestFor(E,i):null;if(g&&g.a)return g.a;const t=num(s.ta);if(t>0)return t}return 0}
const r25=v=>Math.max(0,Math.round(v/2.5)*2.5);
function addWarmup(E){const X=ex(E.exId);const w=workWeight(E);if(!(w>0))return openDlg({title:'Charge de travail inconnue',html:'<p class="dtext">Indique d\'abord le poids de ta première série, puis relance l\'échauffement.</p>',buttons:[{label:'OK',kind:'primary'}]});
  const bar=['Barre','Smith'].includes(X.equip)?20:X.equip==='Barre EZ'?10:0;const W=ui.edMode==='workout';
  const plan=[[.5,10],[.7,5],[.85,3]].map(([p,r])=>({a:Math.max(bar,r25(w*p)),b:r})).filter((x,i,a)=>x.a<w&&(i===0||x.a!==a[i-1].a));
  E.sets=E.sets.filter(s=>!(s.t==='w'&&!s.done&&s.a===''&&s.b===''));
  const ws=plan.map(x=>W?{t:'w',a:'',b:'',done:false,ta:fmt(x.a),tb:String(x.b)}:{t:'w',a:fmt(x.a),b:String(x.b)});
  E.sets.unshift(...ws);save();renderEditor();flash(`${ws.length} séries d'échauffement ajoutées`)}
const PLATES=[25,20,15,10,5,2.5,1.25];const PCOL={25:'var(--fail)',20:'var(--drop)',15:'var(--warm)',10:'var(--done-ink)',5:'var(--fg)',2.5:'var(--muted)',1.25:'var(--muted)'};
function platesFor(total,bar){let side=(total-bar)/2;const out=[];if(side<0)return null;for(const p of PLATES){while(side>=p-1e-9){out.push(p);side-=p}}return{out,rest:Math.round(side*2*100)/100}}
function plateHTML(total,bar){const r=platesFor(total,bar);if(!(total>0))return'<p class="dtext">Entre un poids.</p>';if(!r)return`<p class="derr">Le poids est inférieur à la barre (${fmt(bar)} kg).</p>`;
  const H={25:72,20:66,15:58,10:50,5:40,2.5:32,1.25:26};
  return`<div class="pl-vis" aria-hidden="true"><span class="pl-bar"></span>${r.out.map(p=>`<span class="pl" style="height:${H[p]}px;background:${PCOL[p]}"></span>`).join('')}<span class="pl-end"></span></div>
  <p class="pl-txt"><b>De chaque côté :</b> ${r.out.length?Object.entries(r.out.reduce((m,p)=>(m[p]=(m[p]||0)+1,m),{})).sort((a,b)=>b[0]-a[0]).map(([p,n])=>`${n} × ${fmt(p)} kg`).join(' + '):'rien, la barre seule'}</p>${r.rest?`<p class="dtext">Il manque ${fmt(r.rest)} kg pour tomber juste avec ces disques.</p>`:''}`}
function plateDlg(w,bar){openDlg({title:'Calculateur de disques',html:`<div class="pl-in"><label class="fld"><span>Poids total (kg)</span><input id="pl-w" type="text" inputmode="decimal" value="${w?fmt(w):''}" placeholder="ex. 87,5"></label><label class="fld"><span>Barre</span><select id="pl-b">${[[20,'Olympique 20 kg'],[15,'Femme 15 kg'],[10,'EZ / courte 10 kg'],[0,'Smith / sans barre']].map(([v,l])=>`<option value="${v}" ${v===bar?'selected':''}>${l}</option>`).join('')}</select></label></div><div id="pl-out">${plateHTML(w,bar)}</div>`,buttons:[{label:'Fermer',kind:'primary'}]})}
document.addEventListener('input',e=>{if(e.target.id==='pl-w'||e.target.id==='pl-b'){const o=$('#pl-out');if(o)o.innerHTML=plateHTML(num($('#pl-w').value),+$('#pl-b').value)}});
document.addEventListener('change',e=>{if(e.target.id==='pl-b'){const o=$('#pl-out');if(o)o.innerHTML=plateHTML(num($('#pl-w').value),+$('#pl-b').value)}});

/* ================= Séries par muscle ================= */
const MAIN_M=['Pectoraux','Dos','Épaules','Biceps','Triceps','Quadriceps','Ischios','Fessiers','Mollets','Abdos','Trapèzes','Avant-bras','Lombaires','Adducteurs'];
function muscleWeek(off){const end=Date.now()-off*7*864e5,start=end-7*864e5;const m={};for(const k of MAIN_M)m[k]=0;
  for(const w of S.history){if(w.start<start||w.start>=end)continue;for(const e of w.exercises){const X=ex(e.exId);if(!(X.muscle in m))continue;m[X.muscle]+=e.sets.filter(s=>s.t!=='w').length}}return m}
function muscleHTML(){const off=ui.mOff||0;const m=muscleWeek(off);const L=MAIN_M.map(k=>[k,m[k]]).sort((a,b)=>b[1]-a[1]);const mx=Math.max(20,...L.map(x=>x[1]));
  const zone=v=>v===0?['z0','aucune']:v<6?['z1','faible']:v<=20?['z2','bon']:['z3','élevé'];
  return`<section class="card msc"><div class="cal-h"><button class="icon-btn" data-act="m-nav:1" aria-label="Semaine précédente">${icon('chev-left')}</button><div class="cal-t"><b>Séries par muscle</b><span class="s">${off?`du ${fmtShort(Date.now()-(off+1)*7*864e5)} au ${fmtShort(Date.now()-off*7*864e5-864e5)}`:'7 derniers jours'}</span></div><button class="icon-btn" data-act="m-nav:-1" ${off?'':'disabled'} aria-label="Semaine suivante">${icon('chev-right')}</button></div>
  <div class="mbars">${L.map(([k,v])=>{const z=zone(v);return`<div class="mrow ${z[0]}"><span class="mn">${k}</span><span class="mt"><span class="mf" style="width:${Math.max(v?3:0,v/mx*100)}%"></span><span class="mband" style="left:${10/mx*100}%;width:${10/mx*100}%"></span></span><b class="num">${v}</b></div>`}).join('')}</div>
  <p class="mleg"><span class="lg z1"></span>moins de 6 <span class="lg z2"></span>6 à 20 <span class="lg z3"></span>plus de 20 · zone grisée : 10 à 20 séries, la fourchette souvent conseillée pour progresser.</p></section>`}

/* ================= Mensurations ================= */
const MEAS=['Bras','Avant-bras','Poitrine','Épaules','Taille','Hanches','Cuisse','Mollet','Cou'];
function measDlg(kind){const d=new Date();const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  openDlg({title:'Nouvelle mesure',html:`<label class="fld"><span>Zone</span><select id="ms-k">${MEAS.map(k=>`<option ${k===kind?'selected':''}>${k}</option>`).join('')}</select></label><div class="fld-row"><label class="fld"><span>Tour (cm)</span><input id="ms-v" type="text" inputmode="decimal" autofocus placeholder="ex. 38,5"></label><label class="fld"><span>Date</span><input id="ms-d" type="date" value="${iso}" max="${iso}"></label></div><p class="derr" id="ms-err" hidden></p>`,
  buttons:[{label:'Enregistrer',kind:'primary',fn:()=>{const v=num($('#ms-v').value);if(!(v>5&&v<300)){const e=$('#ms-err');e.textContent='Indique une mesure entre 5 et 300 cm.';e.hidden=false;return false}
    const[y,m,dd]=($('#ms-d').value||iso).split('-').map(Number);S.measures=S.measures||[];S.measures.push({id:uid(),k:$('#ms-k').value,t:new Date(y,m-1,dd,12).getTime(),v});save();renderMain();renderDetail();flash('Mesure enregistrée')}},{label:'Annuler',kind:'soft'}]})}
function measLast(){const out={};for(const x of (S.measures||[]).slice().sort((a,b)=>a.t-b.t)){(out[x.k]=out[x.k]||[]).push(x)}return out}
function measCardHTML(){const M=measLast();const ks=MEAS.filter(k=>M[k]);
  return`<section class="card bodyc"><div class="bc-top"><div class="mini"><span class="k">Mensurations</span>${ks.length?'':'<span class="s">Tour de bras, taille, cuisse…</span>'}</div><button class="btn btn-soft sm" data-act="meas-add">${icon('plus')}Mesure</button></div>
  ${ks.length?`<div class="mgrid">${ks.map(k=>{const L=M[k],l=L[L.length-1],f=L[0],d=l.v-f.v;return`<button class="mcell" data-act="meas-open:${k}"><span class="k">${k}</span><span class="v">${fmt(l.v)} cm</span><span class="s ${d>0?'pos':d<0?'neg':''}">${L.length>1?`${d>0?'+':d<0?'−':''}${fmt(Math.abs(d))} cm`:'1re mesure'}</span></button>`}).join('')}</div>`:''}</section>`}
function measDetailHTML(k){const L=(measLast()[k]||[]);
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">${esc(k)}</div><button class="btn-ghost" data-act="meas-add:${k}">${icon('plus')}Mesure</button></div>
  <div class="sheet-body"><div class="wrapx dwrap"><section class="card dsec"><span class="k">Évolution (cm)</span>${chartSVG(L.map(x=>({t:x.t,v:x.v})),'cm')}</section>
  <section class="dsec"><h2>Mesures</h2>${L.slice().reverse().map(x=>`<div class="bw-row"><span>${esc(cap(fmtDay(x.t)))}</span><b class="num">${fmt(x.v)} cm</b><button class="icon-btn" data-act="meas-del:${x.id}" aria-label="Supprimer la mesure">${icon('x')}</button></div>`).join('')||'<p class="dtext">Aucune mesure.</p>'}</section></div></div>`}

/* ================= Image à partager ================= */
function shareImage(w){openSheet('Partager ta séance',[{label:'Story Instagram (vertical)',fn:()=>shareImageGo(w,'story')},{label:'Publication (carré 4:5)',fn:()=>shareImageGo(w,'post')}])}
async function shareImageGo(w,fmt){try{await document.fonts.ready}catch(e){}
    const cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const x=trCtx(cv.getContext('2d'));
  if(fmt!=='story'){x.fillStyle='#0E1012';x.fillRect(0,0,1080,1350)}
  const red=accentHex('d'),fg='#ECEEF0',mu='#8F98A1',ln='#2A2F35';const D='"Barlow Condensed","Arial Narrow",sans-serif',B='"Figtree",system-ui,sans-serif';
  [[red,150],['#6A97F2',130],['#E5AE22',110],['#55C985',90]].forEach(([c,h],i)=>{x.fillStyle=c;x.beginPath();x.roundRect(80+i*30,80+(150-h)/2,20,h,5);x.fill()});
  x.fillStyle=mu;x.font=`600 30px ${B}`;x.fillText(cap(fmtDay(w.start)).toUpperCase(),220,130);
  x.fillStyle=fg;x.font=`700 76px ${D}`;let title=w.name.toUpperCase();while(x.measureText(title).width>780&&title.length>4)title=title.slice(0,-2);if(title!==w.name.toUpperCase())title+='…';x.fillText(title,220,205);
  const st=[['DURÉE',fmtDurLong(w.end-w.start)],['VOLUME',fmtVol(wVolume(w))],['SÉRIES',String(wSets(w))],['CALORIES','≈ '+Math.round(kcalFor(w))]];
  st.forEach(([k,v],i)=>{const X0=80+i*232;x.fillStyle='#171A1E';x.beginPath();x.roundRect(X0,290,216,150,24);x.fill();x.fillStyle=mu;x.font=`600 24px ${B}`;x.fillText(k,X0+24,345);x.fillStyle=fg;let fs=54;x.font=`700 ${fs}px ${D}`;while(x.measureText(v).width>176&&fs>30){fs-=2;x.font=`700 ${fs}px ${D}`}x.fillText(v,X0+24,415)});
  let y=520;const exs=w.exercises.slice(0,8);x.font=`700 34px ${D}`;x.fillStyle=red;x.fillText('EXERCICES',80,y);y+=20;
  for(const e of exs){const X=ex(e.exId);const work=e.sets.filter(s=>s.t!=='w');let best=work[0];for(const s of work)if((+s.a||0)*(+s.b||1)>(+best.a||0)*(+best.b||1))best=s;
    y+=62;x.strokeStyle=ln;x.lineWidth=2;x.beginPath();x.moveTo(80,y-44);x.lineTo(1000,y-44);x.stroke();
    x.fillStyle=fg;x.font=`600 34px ${B}`;let n=X.name;while(x.measureText(n).width>600&&n.length>4)n=n.slice(0,-2);if(n!==X.name)n+='…';x.fillText(n,80,y);
    x.fillStyle=mu;x.font=`500 30px ${B}`;const r=`${work.length} × ${best?setStr(best,X.type):''}`;x.textAlign='right';x.fillText(r,1000,y);x.textAlign='left'}
  if(w.exercises.length>8){y+=56;x.fillStyle=mu;x.font=`500 28px ${B}`;x.fillText(`+ ${w.exercises.length-8} autres exercices`,80,y)}
  if(w.prs&&w.prs.length){y=Math.min(y+90,1180);x.fillStyle=accentHex('sd');x.beginPath();x.roundRect(80,y-50,920,80,20);x.fill();x.fillStyle=red;x.font=`700 38px ${D}`;x.fillText(`🏆 ${w.prs.length} RECORD${w.prs.length>1?'S':''} BATTU${w.prs.length>1?'S':''}`,110,y+5)}
  let out;
  if(fmt==='story'){const ch=Math.min(1350,y+80);out=document.createElement('canvas');out.width=1080;out.height=1920;const o=trCtx(out.getContext('2d'));
    const g=o.createRadialGradient(540,0,80,540,300,1500);g.addColorStop(0,'#262B33');g.addColorStop(.55,'#0E1012');g.addColorStop(1,'#0E1012');o.fillStyle=g;o.fillRect(0,0,1080,1920);
    const top=Math.max(170,Math.round((1920-ch-260)/2));o.drawImage(cv,0,0,1080,ch,0,top,1080,ch);
    try{const L=await new Promise((ok,ko)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=ko;im.src='media/logo.svg'});o.drawImage(L,80,1920-230,110,110)}catch(e){}
    o.fillStyle=fg;o.font=`800 54px ${D}`;o.fillText('CARNET DE FONTE',214,1920-158);o.fillStyle=mu;o.font=`500 28px ${B}`;o.fillText('Carnet de muscu gratuit · sans pub',214,1920-116)}
  else{const Hf=Math.min(1350,Math.max(1080,y+170));out=document.createElement('canvas');out.width=1080;out.height=Hf;const o=trCtx(out.getContext('2d'));o.drawImage(cv,0,0);
    o.fillStyle=mu;o.font=`600 26px ${B}`;o.fillText('CARNET DE FONTE',80,Hf-60)}
  const blob=await new Promise(r=>out.toBlob(r,'image/png'));const url=URL.createObjectURL(blob);
  if(NATIVE&&CP.Filesystem&&CP.Share){try{const b64=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.readAsDataURL(blob)});
    const f=await CP.Filesystem.writeFile({path:'seance-carnet-de-fonte.png',data:b64,directory:'CACHE'});await CP.Share.share({title:'Ma séance',files:[f.uri],dialogTitle:'Partager ta séance'});return}catch(e){if(/cancel/i.test(String(e&&e.message)))return}}
  try{const f=new File([blob],'seance.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){if(e&&e.name==='AbortError')return}
  openDlg({title:'Ta séance en image',html:`<img src="${url}" alt="Résumé de la séance" class="shimg"><p class="dtext">Appuie longuement sur l'image pour l'enregistrer ou la partager.</p>`,buttons:[{label:'Fermer',kind:'primary'}]})}

/* ================= Rappel de sauvegarde ================= */
function backupDue(){const st=S.settings;if(ghToken()&&st.gistId&&st.lastSync&&Date.now()-st.lastSync<7*864e5)return false;if(S.history.length<3)return false;const now=Date.now();if(st.backupSnooze&&now<st.backupSnooze)return false;return!st.lastExport||now-st.lastExport>14*864e5}

/* ================= Supersets ================= */
const SSC=['var(--drop)','var(--warm)','var(--done-ink)','var(--accent)'];
function ssLetters(list){const m={};let n=0;list.forEach((e,i)=>{if(e.ss&&!(e.ss in m)){const cnt=list.filter(x=>x.ss===e.ss).length;if(cnt>1)m[e.ss]=n++}});return m}
function ssClean(T){const c={};T.exercises.forEach(e=>{if(e.ss)c[e.ss]=(c[e.ss]||0)+1});T.exercises.forEach((e,i)=>{if(e.ss&&(c[e.ss]<2))e.ss=null});
  /* keep groups contiguous */T.exercises.forEach((e,i)=>{if(!e.ss)return;const first=T.exercises.findIndex(x=>x.ss===e.ss);for(let k=first;k<i;k++)if(T.exercises[k].ss!==e.ss){e.ss=null;break}});
  const c2={};T.exercises.forEach(e=>{if(e.ss)c2[e.ss]=(c2[e.ss]||0)+1});T.exercises.forEach(e=>{if(e.ss&&c2[e.ss]<2)e.ss=null})}
function ssChip(e,letters){if(!e.ss||!(e.ss in letters))return'';const k=letters[e.ss];return`<span class="sschip" style="--ssc:${SSC[k%4]}">Superset ${String.fromCharCode(65+k)}</span>`}

/* ================= Objectifs ================= */
const GOAL_UNIT={w:'kg',b:'reps',t:'s',c:'km'};
const GOAL_LABEL={w:'Poids à soulever (kg)',b:'Répétitions en une série',t:'Durée tenue (secondes)',c:'Distance en une séance (km)'};
function bestFor(id){const X=ex(id);const sets=S.history.flatMap(w=>w.exercises.filter(e=>e.exId===id).flatMap(e=>e.sets)).filter(s=>s.t!=='w');
  if(X.type==='w')return maxA(sets);if(X.type==='c')return Math.max(0,...sets.map(s=>+s.a||0));return Math.max(0,...sets.map(s=>+s.b||0))}
function goalVal(type,v){return type==='t'?fmtSec(v):fmt(v)+' '+GOAL_UNIT[type]}
function goalBar(id){const g=S.goals[id];if(!g)return'';const X=ex(id),b=bestFor(id),p=Math.max(0,Math.min(1,b/g.v)),done=b>=g.v;
  return`<div class="goal ${done?'ok':''}"><div class="g-top"><span>${done?icon('trophy')+'Objectif atteint':'Objectif'}</span><b class="num">${b?goalVal(X.type,b):'—'} / ${goalVal(X.type,g.v)}</b></div><div class="g-track"><div class="g-fill" style="width:${Math.round(p*100)}%"></div></div></div>`}
function goalDlg(id){const X=ex(id),g=S.goals[id],b=bestFor(id);
  openDlg({title:'Objectif',html:`<p class="dtext">${esc(X.name)}${b?` · record actuel : ${goalVal(X.type,b)}`:''}</p><label class="fld"><span>${GOAL_LABEL[X.type]}</span><input id="g-v" type="text" inputmode="decimal" autofocus value="${g?fmt(g.v):''}" placeholder="${b?fmt(X.type==='w'?Math.ceil((b*1.1)/2.5)*2.5:Math.ceil(b*1.2)):''}"></label><p class="derr" id="g-err" hidden></p>`,
  buttons:[{label:'Enregistrer l\'objectif',kind:'primary',fn:()=>{const v=num($('#g-v').value);if(!(v>0)){const e=$('#g-err');e.textContent='Indique une valeur supérieure à 0.';e.hidden=false;return false}S.goals[id]={v,created:Date.now()};save();renderDetail();renderMain();flash('Objectif enregistré')}},
    ...(g?[{label:'Retirer l\'objectif',kind:'danger',fn:()=>{delete S.goals[id];save();renderDetail();renderMain()}}]:[]),{label:'Annuler',kind:'soft'}]})}

/* ================= Poids du corps ================= */
function bodySorted(){return(S.body||[]).slice().sort((a,b)=>a.t-b.t)}
function bodyDlg(){const last=bodySorted().pop();const d=new Date();const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  openDlg({title:'Nouvelle pesée',html:`<div class="fld-row"><label class="fld"><span>Poids (kg)</span><input id="bw-kg" type="text" inputmode="decimal" autofocus placeholder="${last?fmt(last.kg):'ex. 78,5'}"></label><label class="fld"><span>Date</span><input id="bw-d" type="date" value="${iso}" max="${iso}"></label></div><p class="derr" id="bw-err" hidden></p>`,
  buttons:[{label:'Enregistrer',kind:'primary',fn:()=>{const kg=num($('#bw-kg').value);const dv=$('#bw-d').value;if(!(kg>20&&kg<400)){const e=$('#bw-err');e.textContent='Indique un poids entre 20 et 400 kg.';e.hidden=false;return false}
    const [y,m,dd]=(dv||iso).split('-').map(Number);const t=new Date(y,m-1,dd,12).getTime();S.body=(S.body||[]).filter(b=>monday(b.t)!==monday(t)||new Date(b.t).toDateString()!==new Date(t).toDateString());S.body.push({id:uid(),t,kg});save();renderMain();renderDetail();flash('Pesée enregistrée')}},{label:'Annuler',kind:'soft'}]})}
function bodyCardHTML(){const B=bodySorted();
  if(!B.length)return`<section class="card bodyc"><div class="bc-top"><div class="mini"><span class="k">Poids du corps</span><span class="v">—</span></div><button class="btn btn-soft sm" data-act="body-add">${icon('plus')}Pesée</button></div><p class="dtext" style="font-size:14px">Note ton poids une fois par semaine, le matin à jeun, pour suivre son évolution.</p></section>`;
  const last=B[B.length-1];const ref=B.filter(b=>b.t<=last.t-27*864e5).pop()||B[0];const dlt=last.kg-ref.kg;
  const pts=B.slice(-20).map(b=>({t:b.t,v:b.kg}));
  return`<section class="card bodyc"><div class="bc-top"><button class="mini bc-open" data-act="body-open"><span class="k">Poids du corps</span><span class="v">${fmt(last.kg)} kg</span><span class="s">${ref!==last?`${dlt>0?'+':dlt<0?'−':''}${fmt(Math.abs(dlt))} kg depuis le ${fmtShort(ref.t)}`:'Première pesée le '+fmtShort(last.t)}</span></button><button class="btn btn-soft sm" data-act="body-add">${icon('plus')}Pesée</button></div>${pts.length>1?chartSVG(pts,'poids (kg)'):''}</section>`}
function bodyDetailHTML(){const B=bodySorted();
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Poids du corps</div><button class="btn-ghost" data-act="body-add">${icon('plus')}Pesée</button></div>
  <div class="sheet-body"><div class="wrapx dwrap">
    <section class="card dsec"><span class="k">Évolution (kg)</span>${chartSVG(B.map(b=>({t:b.t,v:b.kg})),'poids (kg)')}</section>
    <section class="dsec"><h2>Pesées</h2>${B.length?B.slice().reverse().map(b=>`<div class="bw-row"><span>${esc(cap(fmtDay(b.t)))}</span><b class="num">${fmt(b.kg)} kg</b><button class="icon-btn" data-act="body-del:${b.id}" aria-label="Supprimer la pesée">${icon('x')}</button></div>`).join(''):'<p class="dtext">Aucune pesée pour l\'instant.</p>'}</section>
  </div></div>`}

/* ================= Calendrier ================= */
function calendarHTML(){const H=S.history;const now=new Date();const m0=ui.calMonth?new Date(ui.calMonth):new Date(now.getFullYear(),now.getMonth(),1);
  const y=m0.getFullYear(),mo=m0.getMonth();const first=new Date(y,mo,1),days=new Date(y,mo+1,0).getDate(),lead=(first.getDay()+6)%7;
  const byDay={};for(const w of H){const d=new Date(w.start);if(d.getFullYear()===y&&d.getMonth()===mo)(byDay[d.getDate()]=byDay[d.getDate()]||[]).push(w)}
  const cnt=Object.values(byDay).reduce((a,l)=>a+l.length,0);const today=now.getFullYear()===y&&now.getMonth()===mo?now.getDate():0;
  let cells='';for(let i=0;i<lead;i++)cells+='<span></span>';
  for(let d=1;d<=days;d++){const has=byDay[d];cells+=has?`<button class="cd on ${d===today?'td':''}" data-act="cal-day:${y}-${mo}-${d}" aria-label="${d} : ${has.length} séance${has.length>1?'s':''}">${d}</button>`:`<span class="cd ${d===today?'td':''}">${d}</span>`}
  const isCur=y===now.getFullYear()&&mo===now.getMonth();
  return`<section class="card cal"><div class="cal-h"><button class="icon-btn" data-act="cal-nav:-1" aria-label="Mois précédent">${icon('chev-left')}</button><div class="cal-t"><b>${esc(cap(first.toLocaleDateString(LOC,{month:'long',year:'numeric'})))}</b><span class="s">${cnt} séance${cnt>1?'s':''}</span></div><button class="icon-btn" data-act="cal-nav:1" ${isCur?'disabled':''} aria-label="Mois suivant">${icon('chev-right')}</button></div>
  <div class="cal-g"><span class="cw">L</span><span class="cw">M</span><span class="cw">M</span><span class="cw">J</span><span class="cw">V</span><span class="cw">S</span><span class="cw">D</span>${cells}</div></section>`}

/* ================= Rendu principal ================= */
function renderAll(){renderMain();renderEditor();renderPicker(true);renderDetail();renderRestBar();renderDialog()}
let lastTab=null;
function renderMain(){if(ui.tab==='reglages'&&!NATIVE&&!FB&&!fbReady)setTimeout(()=>fbLoad().catch(()=>{}),0);
  const m=$('#main');const st=lastTab===ui.tab?m.scrollTop:0;
  m.innerHTML=ui.tab==='seance'?seanceView():ui.tab==='historique'?histView():ui.tab==='exercices'?exView():setView();
  m.scrollTop=st;lastTab=ui.tab;
  const tabs=[['seance','dumbbell','Séance'],['historique','clock','Historique'],['exercices','list','Exercices'],['reglages','sliders','Réglages']];
  $('#tabbar').innerHTML=tabs.map(([k,i,l])=>`<button class="tab ${ui.tab===k?'on':''}" data-act="tab:${k}" aria-current="${ui.tab===k?'page':'false'}">${icon(i)}<span>${l}</span></button>`).join('');
  renderResume()}
function renderResume(){const r=$('#resume');
  if(!S.active||(ui.editorOpen&&ui.edMode==='workout')){r.hidden=true;r.innerHTML='';return}
  r.hidden=false;const rest=S.active.rest;
  r.innerHTML=`<button class="resume" data-act="resume"><span class="dot"></span><span class="rn">${esc(S.active.name)} · <span class="num" data-elapsed>${fmtDur(Date.now()-S.active.start)}</span>${rest?` · repos <span class="num" data-restleft>${fmtDur(rest.end-Date.now()+999)}</span>`:''}</span><span class="go">Reprendre</span></button>`}

function platesHTML(){return`<div class="plates" aria-hidden="true"><i style="height:34px;background:var(--fail)"></i><i style="height:30px;background:var(--drop)"></i><i style="height:26px;background:var(--warm)"></i><i style="height:22px;background:var(--done-ink)"></i></div>`}

function seanceView(){
  const wk=monday(Date.now());const thisWeek=S.history.filter(w=>w.start>=wk);
  const R=S.routines;
  return`<div class="wrap">
  <header class="vh"><div><p class="eyebrow">${esc(cap(fmtDay(Date.now())))}</p><h1>Séance</h1></div></header>
  <div class="today-line">
    <div class="mini"><span class="k">Cette semaine</span><span class="v">${S.settings.weekGoal?`${thisWeek.length} / ${S.settings.weekGoal} séances`:`${thisWeek.length} séance${thisWeek.length>1?'s':''}`}</span>${S.settings.weekGoal?`<span class="wkbar" aria-hidden="true">${Array.from({length:S.settings.weekGoal},(_,i)=>`<i class="${i<thisWeek.length?'on':''}"></i>`).join('')}</span>`:''}</div>
    <div class="mini"><span class="k">Volume semaine</span><span class="v">${fmtVol(thisWeek.reduce((a,w)=>a+wVolume(w),0))}</span></div>
  </div>
  ${backupDue()?`<div class="bkp"><p><b>Sauvegarde tes données</b>${S.settings.lastExport?`Dernier export il y a ${Math.floor((Date.now()-S.settings.lastExport)/864e5)} jours.`:'Tu n\'as encore jamais exporté.'} Tout est stocké sur ce téléphone.</p><div class="btnrow"><button class="btn btn-primary sm" data-act="export">Exporter</button><button class="btn btn-soft sm" data-act="bkp-later">Plus tard</button></div></div>`:''}
  ${S.active?'':`<button class="btn btn-primary block lg" data-act="start-empty">${icon('plus')}Démarrer une séance vide</button>`}
  ${S.active?`<button class="btn btn-primary block lg" data-act="resume">${icon('play')}Reprendre la séance en cours</button>`:''}
  ${planCardHTML()||nextHTML()}
  ${S.active?'':`<div class="btnrow two"><button class="btn btn-soft" data-act="wu-start">${icon('flame')}Échauffement</button><button class="btn btn-soft" data-act="gen-open">${icon('zap')}Générer</button></div>`}
  ${deloadCardHTML()}
  ${recCardHTML()}
  <div class="sec-head"><h2>Routines</h2><button class="icon-btn" data-act="new-routine" aria-label="Nouvelle routine" title="Nouvelle routine">${icon('plus')}</button></div>
  <div class="sec-tools"><button class="btn-ghost" data-act="import-routine">${icon('link')}Importer</button><button class="btn-ghost" data-act="plan-open">${icon('cal')}Planning</button><button class="btn-ghost" data-act="programs">${icon('layers')}Programmes</button></div>
  ${R.length?`<div class="rgrid">${R.map(r=>{const n=r.exercises.reduce((a,e)=>a+e.sets.length,0);return`<article class="card rcard">
    <div class="rc-top"><h3>${esc(r.name)}</h3><button class="icon-btn" data-act="routine-menu:${r.id}" aria-label="Options de la routine">${icon('dots')}</button></div>
    <p class="rc-ex">${esc(r.exercises.map(e=>ex(e.exId).name).join(', '))||'Aucun exercice'}</p>
    <div class="rc-meta num">${r.exercises.length} exercice${r.exercises.length>1?'s':''} · ${n} séries</div>
    <button class="btn btn-soft block" data-act="start-routine:${r.id}">${icon('play')}Démarrer</button></article>`}).join('')}</div>`
  :`<div class="empty">${platesHTML()}<b>Pas encore de routine</b>Crée ta première routine ou enregistre une séance terminée comme routine.</div>`}
  ${neglectHTML()}
  ${Object.keys(S.goals||{}).length?`<div class="sec-head"><h2>Objectifs</h2></div><div class="goals">${Object.keys(S.goals).map(id=>{const X=ex(id);return`<button class="card grow" data-act="ex-open:${id}">${avHTML(X,'sm')}<span class="gr-m"><span class="t">${esc(X.name)}</span>${goalBar(id)}</span></button>`}).join('')}</div>`:''}
  <div class="sec-head"><h2>Corps</h2></div>
  ${bodyCardHTML()}
  ${measCardHTML()}
  ${!storageOK?`<p class="derr">Le stockage du navigateur est bloqué : tes données ne seront pas gardées. Ouvre l'app hors navigation privée.</p>`:''}
  </div>`}

function histView(){
  const H=S.history;
  const head=`<header class="vh"><div><p class="eyebrow">${H.length} séance${H.length>1?'s':''} au total</p><h1>Historique</h1></div>${H.length?`<span class="btnrow" style="flex:none;gap:6px"><button class="btn btn-soft sm" data-act="month:${mKey(Date.now())}">${icon('cal')}Bilan</button><button class="btn btn-soft sm" data-act="records">${icon('trophy')}Records</button></span>`:''}</header>`;
  if(!H.length)return`<div class="wrap">${head}<div class="empty">${platesHTML()}<b>Aucune séance pour l'instant</b>Termine ta première séance : elle apparaîtra ici avec sa durée, son volume et tes records.</div></div>`;
  const wk=monday(Date.now());const thisWeek=H.filter(w=>w.start>=wk);
  const weeks=[];for(let k=7;k>=0;k--){const d=new Date(wk);d.setDate(d.getDate()-7*k);weeks.push(d.getTime())}
  const counts=weeks.map((s,i)=>{const e=i<7?weeks[i+1]:Infinity;return H.filter(w=>w.start>=s&&w.start<e).length});
  const maxC=Math.max(3,...counts),W=330,Hh=104,top=16,bot=18,step=(W-20)/8,bw=Math.min(26,step-10);
  const bars=counts.map((c,i)=>{const h=c?Math.max(4,c/maxC*(Hh-top-bot)):3;const x=10+i*step+(step-bw)/2,y=Hh-bot-h;const d=new Date(weeks[i]);
    return`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="4" class="${i===7?'b-on':'b-off'}"/>${c?`<text x="${(x+bw/2).toFixed(1)}" y="${(y-4).toFixed(1)}" text-anchor="middle" class="tv">${c}</text>`:''}<text x="${(x+bw/2).toFixed(1)}" y="${Hh-4}" text-anchor="middle" class="tx">${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}</text>`}).join('');
  let html='',cur='';
  for(const w of H){const mk=new Date(w.start).toLocaleDateString(LOC,{month:'long',year:'numeric'});if(mk!==cur){cur=mk;html+=`<div class="month">${esc(mk)}</div>`}
    const exs=[];for(const e of w.exercises){const last=exs[exs.length-1];if(last&&last.id===e.exId)last.n+=e.sets.length;else exs.push({id:e.exId,n:e.sets.length})}
    html+=`<button class="card hcard" data-act="hist-open:${w.id}"><div class="hc-top"><h3>${esc(w.name)}</h3><span class="hc-date">${esc(cap(fmtShort(w.start)))}</span></div>
    <div class="hc-stats num"><span>${icon('clock')}${fmtDurLong(w.end-w.start)}</span><span>${icon('weight')}${fmtVol(wVolume(w))}</span><span>${icon('layers')}${wSets(w)} série${wSets(w)>1?'s':''}</span><span>${icon('flame')}${Math.round(kcalFor(w))} kcal</span>${w.prs&&w.prs.length?`<span class="pr">${icon('trophy')}${w.prs.length} record${w.prs.length>1?'s':''}</span>`:''}</div>
    <ul class="hc-ex">${exs.slice(0,4).map(e=>`<li><b>${e.n} ×</b>${esc(ex(e.id).name)}</li>`).join('')}${exs.length>4?`<li class="muted">+ ${exs.length-4} autre${exs.length>5?'s':''}</li>`:''}</ul></button>`}
  return`<div class="wrap">${head}
  <section class="card wk"><div class="wk-stats"><div class="mini"><span class="k">Cette semaine</span><span class="v">${thisWeek.length} séance${thisWeek.length>1?'s':''}</span></div><div class="mini"><span class="k">Volume</span><span class="v">${fmtVol(thisWeek.reduce((a,w)=>a+wVolume(w),0))}</span></div><div class="mini"><span class="k">Durée</span><span class="v">${thisWeek.length?fmtDurLong(thisWeek.reduce((a,w)=>a+(w.end-w.start),0)):'0 min'}</span></div></div>
  <svg class="chart" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Séances par semaine sur 8 semaines">${bars}</svg></section>
  ${badgesCardHTML()}
  <button class="card lbcard" data-act="lb-open">${icon('crown')}<span><b>Classement entre potes</b><span class="muted">${lbOn()?((S.friends||[]).length?(S.friends.length+' pote'+(S.friends.length>1?'s':'')):'Ajoute tes potes'):'Compare-toi à tes amis'}</span></span>${icon('chevr')}</button>
  ${statsHTML()}
  ${muscleHTML()}
  ${calendarHTML()}
  ${html}</div>`}

function equipSelect(f,val){return`<select class="sel" data-f="${f}" aria-label="Équipement"><option value="">Tout équipement</option>${EQUIP.map(e=>`<option ${e===val?'selected':''}>${e}</option>`).join('')}</select>`}
function chipsHTML(act,val){return`<div class="chips">${['Tous','Récents','Favoris',...MUSCLES].map(m=>`<button class="chip ${m===val?'on':''}" data-act="${act}:${m}">${m}</button>`).join('')}</div>`}
function avHTML(X,cls){const inf=INFO[X.id];return`<span class="av ${cls||''}">${ABBR[X.muscle]||'•'}${(S.fav||[]).includes(X.id)?'<span class="star" aria-label="favori">★</span>':''}${inf&&inf.img?`<img ${imgAttr(inf.img,0,true)} alt="" loading="lazy" decoding="async" onerror="this.remove()">`:inf&&inf.rp?`<img src="media/repdb/${inf.rp}-t.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:inf&&inf.oe?`<img src="media/oei/${inf.oe}-t.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:''}</span>`}
function exItem(X,mode,selected,uses){const body=`${avHTML(X)}<span class="xt"><span class="t">${esc(X.name)}</span><span class="s">${esc(X.muscle)} · ${esc(X.equip)}${X.custom?' · perso':''}${uses?` · ${uses}×`:''}</span></span>`;
  if(mode!=='pick')return`<button class="xi" data-act="x-open:${X.id}">${body}${icon('chev-right')}</button>`;
  return`<div class="xi"><button class="xi-main" data-act="p-toggle:${X.id}">${body}<span class="tick ${selected?'on':''}">${selected?icon('check'):''}</span></button><button class="icon-btn" data-act="p-info:${X.id}" aria-label="Voir la fiche de ${esc(X.name)}">${icon('info')}</button></div>`}
function exView(){return`<div class="wrap"><header class="vh"><div><p class="eyebrow">${filterEx('','Tous','').length} exercices</p><h1>Exercices</h1></div><button class="btn btn-soft sm" data-act="x-create">${icon('plus')}Créer</button></header>
  <label class="search">${icon('search')}<input type="search" data-f="xq" value="${esc(ui.xq)}" placeholder="Rechercher un exercice" autocomplete="off" aria-label="Rechercher"></label>
  ${chipsHTML('x-muscle',ui.xMuscle)}${equipSelect('xequip',ui.xEquip)}<div id="xlist">${xlistHTML()}</div></div>`}
function xlistHTML(){const L=filterEx(ui.xq,ui.xMuscle,ui.xEquip),U=usesMap();
  if(!L.length)return`<div class="empty"><b>Aucun résultat</b>${ui.xMuscle==='Favoris'?'Touche l\'étoile d\'un exercice pour le retrouver ici.':ui.xMuscle==='Récents'?'Les exercices que tu fais apparaîtront ici.':'Essaie un autre mot ou crée ton propre exercice.'}<div style="margin-top:12px"><button class="btn btn-soft sm" data-act="x-create">${icon('plus')}Créer « ${esc(ui.xq||'un exercice')} »</button></div></div>`;
  return`<div class="count-line">${L.length} exercice${L.length>1?'s':''}</div>`+L.map(X=>exItem(X,'browse',false,U[X.id])).join('')}
function renderXList(){const l=$('#xlist');if(l)l.innerHTML=xlistHTML()}

function setView(){
  const standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  const opts=[0,30,45,60,75,90,120,150,180,240,300];
  return`<div class="wrap"><header class="vh"><div><p class="eyebrow">Carnet de fonte</p><h1>Réglages</h1></div></header>
  <section class="card setc"><h3>Objectif hebdomadaire</h3>
    <div class="setrow"><span>Séances par semaine</span><select class="sel" data-f="weekgoal">${[0,1,2,3,4,5,6,7].map(o=>`<option value="${o}" ${(S.settings.weekGoal||0)===o?'selected':''}>${o?o+' séance'+(o>1?'s':''):'Aucun'}</option>`).join('')}</select></div></section>
  ${NATIVE?`<section class="card setc"><h3>Rappels</h3>
    <div class="setrow"><span>Me rappeler les jours de séance</span><button class="toggle ${(S.settings.remind||{}).on?'on':''}" data-act="toggle-remind" role="switch" aria-checked="${!!(S.settings.remind||{}).on}" aria-label="Rappels d'entraînement"></button></div>
    ${(S.settings.remind||{}).on?`<div class="setrow"><span>Heure du rappel</span><input type="time" class="sel" data-f="remindat" value="${esc((S.settings.remind||{}).at||'18:00')}"></div>`:''}
    <p class="dtext" style="font-size:13px">${Object.keys(S.plan||{}).length?'Une notification les jours prévus dans ton planning (onglet Séance → Planning).':'Remplis d\'abord ton planning de la semaine (onglet Séance → Planning) : les rappels suivent les jours prévus.'}</p></section>`:''}
  <section class="card setc"><h3>Progression</h3>
    <div class="setrow"><span>Suggérer la charge suivante</span><button class="toggle ${S.settings.suggest?'on':''}" data-act="toggle-suggest" role="switch" aria-checked="${!!S.settings.suggest}" aria-label="Suggérer la charge suivante"></button></div>
    <div class="setrow"><span>Fourchette de répétitions</span><span class="btnrow" style="flex:none;gap:6px"><select class="sel" data-f="replo" aria-label="Minimum">${[3,4,5,6,8,10,12,15].map(o=>`<option ${S.settings.repLo===o?'selected':''}>${o}</option>`).join('')}</select><select class="sel" data-f="rephi" aria-label="Maximum">${[5,6,8,10,12,15,20].map(o=>`<option ${S.settings.repHi===o?'selected':''}>${o}</option>`).join('')}</select></span></div>
    <p class="dtext" style="font-size:13px">Quand tu atteins le haut de la fourchette sur une série, l'app propose +2,5 kg (+2 kg aux haltères) et repart du bas. Sinon elle vise 1 rep de plus.</p>
    <button class="btn btn-soft" data-act="plates">${icon('weight')}Calculateur de disques</button></section>
  <section class="card setc"><h3>Minuteur de repos</h3>
    <div class="setrow"><span>Repos par défaut</span><select class="sel" data-f="defrest">${opts.map(o=>`<option value="${o}" ${S.settings.rest===o?'selected':''}>${o?fmtRest(o):'Désactivé'}</option>`).join('')}</select></div>
    <div class="setrow"><span>Son à la fin du repos</span><button class="toggle ${S.settings.sound?'on':''}" data-act="toggle-sound" role="switch" aria-checked="${S.settings.sound}" aria-label="Son à la fin du repos"></button></div>
    ${/iPhone|iPad/.test(navigator.userAgent)&&!NATIVE?`<p class="dtext" style="font-size:13px">Sur iPhone, le son et la vibration ne marchent que si l'app est ouverte à l'écran.</p>`:''}</section>
  <section class="card setc"><h3>Apparence</h3>
    <div class="setrow"><span>Couleur</span><div class="swatches" role="radiogroup" aria-label="Couleur de l'appli">${Object.entries(ACCENTS).map(([k,A])=>`<button class="sw ${(S.settings.accent||'rouge')===k?'on':''}" data-act="accent:${k}" role="radio" aria-checked="${(S.settings.accent||'rouge')===k}" aria-label="${A.n}" style="--c:${isDark()?A.d:A.l}"></button>`).join('')}</div></div>
    <div class="setrow"><span>Langue</span><select class="sel" data-f="lang">${[['auto','Automatique (langue du téléphone)'],['fr','Français'],['en','English']].map(([v,l])=>`<option value="${v}" ${(S.settings.lang||'auto')===v?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="setrow"><span>Thème</span><select class="sel" data-f="theme">${[['auto','Automatique (selon le téléphone)'],['light','Clair'],['dark','Sombre']].map(([v,l])=>`<option value="${v}" ${(S.settings.theme||'auto')===v?'selected':''}>${l}</option>`).join('')}</select></div></section>
  <section class="card setc"><h3>Annuaire d'exercices</h3>
    <div class="setrow"><span>Afficher tout l'annuaire<br><span class="muted" style="font-size:13px">ajoute les exercices sans illustration et les variantes rares (swiss ball, Bosu…)</span></span><button class="toggle ${S.settings.showRare?'on':''}" data-act="toggle-rare" role="switch" aria-checked="${!!S.settings.showRare}" aria-label="Afficher les variantes rares"></button></div>
    ${NATIVE?'':`<div class="setrow"><span>Images hors connexion<br><span class="muted" style="font-size:13px">${S.settings.mediaOffline?'Téléchargées le '+fmtShort(S.settings.mediaOffline):'Chargées au fil de l\'eau (environ 60 Mo pour tout)'}</span></span><button class="btn btn-soft sm" data-act="dl-media" id="dl-lbl">${dlBusy?'Téléchargement…':S.settings.mediaOffline?'Mettre à jour':'Tout télécharger'}</button></div>`}</section>
  ${cloudCardHTML()}
  <section class="card setc"><h3>Sauvegarde</h3>
    <p class="dtext">Tes données restent sur ce téléphone. Exporte-les de temps en temps pour ne rien perdre.</p>
    <button class="btn btn-soft block" data-act="restore">${icon('clock')}Revenir à une version précédente</button>
    <div class="btnrow"><button class="btn btn-primary" data-act="export">Exporter</button><button class="btn btn-soft" data-act="import-file">Importer un fichier</button><button class="btn btn-soft" data-act="import-paste">Coller une sauvegarde</button></div></section>
  <section class="card setc"><h3>Importer depuis Hevy ou Strong</h3>
    <ol class="steps"><li>Dans <b>Hevy</b> : Profil → Réglages → Exporter et importer des données → Exporter les données.<br>Dans <b>Strong</b> : Profil → ⚙️ → Exporter les données (Export Strong Data).</li><li>Enregistre le fichier CSV dans Fichiers.</li><li>Choisis-le ici : l'appli reconnaît toute seule Hevy ou Strong. Tes séances arrivent dans l'historique, avec la colonne « Précédent » et les records.</li></ol>
    <button class="btn btn-primary" data-act="hevy-file">Choisir le fichier CSV</button></section>
  <section class="card setc" ${NATIVE?'hidden':''}><h3>Installer sur l'iPhone</h3>
    ${standalone?`<p class="okline">${icon('check')}L'app est installée sur ton écran d'accueil.</p>`:`<button class="btn btn-soft" data-act="install-help" style="align-self:flex-start">Afficher le mode d'emploi</button><ol class="steps"><li>Ouvre l'app dans <b>Safari</b>.</li><li>Touche <b>Partager</b>, puis <b>Sur l'écran d'accueil</b>.</li><li>Lance-la depuis l'icône : elle s'ouvre en plein écran et marche hors ligne.</li></ol>`}</section>
  <section class="card setc"><h3>Données</h3>
    <div class="setrow"><span class="muted">Version de l'app</span><b class="num">${APP_VERSION}</b></div>
    ${NATIVE&&CP.FirebaseCrashlytics?`<div class="setrow"><span>Envoyer les rapports de plantage</span><button class="toggle ${S.settings.noCrash?'':'on'}" data-act="toggle-crash" role="switch" aria-checked="${!S.settings.noCrash}" aria-label="Rapports de plantage"></button></div>`:''}
    <div class="setrow"><span class="muted">Séances</span><b class="num">${S.history.length}</b></div>
    <div class="setrow"><span class="muted">Routines</span><b class="num">${S.routines.length}</b></div>
    <div class="setrow"><span class="muted">Exercices perso</span><b class="num">${S.custom.length}</b></div>
    <details class="credits"><summary>Crédits</summary><p class="dtext" style="font-size:13px">Photos : <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">Free Exercise DB</a> (domaine public).<br>Illustrations : <a href="https://repdb.co" target="_blank" rel="noopener">Exercise data by RepDB (repdb.co)</a>.<br>Illustrations : <a href="https://github.com/hitmanrepo/open-exercise-illustrations" target="_blank" rel="noopener">Open Exercise Illustrations</a> (CC0).<br>Noms et étapes d'une partie des exercices : exercises-dataset (MIT).<br>QR codes : qrcode-generator (MIT), © Kazuhiko Arase.</p></details>
    <button class="btn btn-soft block" data-act="onb-redo">Refaire le questionnaire (nouveau programme)</button>
    <button class="btn btn-danger block" data-act="wipe">Tout effacer</button></section>
  </div>`}

/* ================= Éditeur (séance / routine) ================= */
function renderEditor(){const el=$('#ed');const T=ui.editorOpen?edTarget():null;
  if(!T){el.hidden=true;el.innerHTML='';return}
  const b=el.querySelector('.sheet-body');const st=b?b.scrollTop:0;
  el.hidden=false;el.innerHTML=editorHTML(T);
  const nb=el.querySelector('.sheet-body');if(nb)nb.scrollTop=st;
  el.querySelectorAll('.ex-note').forEach(autosize)}
function editorHTML(T){const W=ui.edMode==='workout';
  let stats='';if(W){const{v,n}=activeStats();stats=`<div class="ed-stats"><div><span class="k">Volume</span><span class="v" id="st-vol">${fmtVol(v)}</span></div><div><span class="k">Séries</span><span class="v" id="st-sets">${n}</span></div><div><span class="k">Début</span><span class="v">${fmtHour(T.start)}</span></div></div>`}
  return`<div class="sheet-head">
    <button class="btn-ghost" data-act="ed-min">${W?icon('chev-down')+'Réduire':'Annuler'}</button>
    ${W?`<div class="ed-clock">${icon('clock')}<span data-elapsed>${fmtDur(Date.now()-T.start)}</span></div>`:`<div class="sh-title">${ui.draft.id?'Modifier la routine':'Nouvelle routine'}</div>`}
    <button class="btn btn-primary sm" data-act="ed-finish">${W?'Terminer':'Enregistrer'}</button></div>
  <div class="sheet-body"><div class="wrapx ed-wrap">${W&&!T.exercises.some(e=>e.sets.some(s=>s.done))?`<button class="btn btn-soft block" data-act="wu-start">${icon('flame')}Échauffement guidé (5 min)</button>`:''}
    <input class="ed-name" id="ed-name" data-f="ename" value="${esc(T.name)}" placeholder="${W?'Nom de la séance':'Nom de la routine'}" aria-label="Nom">
    ${W&&T.prevNote?`<p class="prevnote">${icon('book')}<span><b>La dernière fois :</b> ${esc(T.prevNote)}</span></p>`:''}
    ${W?`<textarea class="ex-note wnote" data-f="wnote" rows="1" placeholder="Note de séance : forme, sommeil, douleur…">${esc(T.note||'')}</textarea>`:''}
    ${stats}
    ${T.exercises.length?(()=>{const L=ssLetters(T.exercises);return T.exercises.map(E=>exCardHTML(E,W,L)).join('')})():`<div class="empty">${platesHTML()}<b>${W?'Séance vide':'Routine vide'}</b>Ajoute tes exercices depuis l'annuaire.</div>`}
    <button class="btn btn-primary block" data-act="ed-add-ex">${icon('plus')}Ajouter des exercices</button>
    ${W?`<button class="btn-ghost block danger" data-act="ed-cancel">Abandonner la séance</button>`:''}
  </div></div>`}
function ph(E,i){const s=E.sets[i];if(s.t==='w'&&(s.ta||s.tb))return{a:s.ta||'',b:s.tb||''};const g=suggestFor(E,i);
  return{a:g&&g.a?fmt(g.a):(s.ta||''),b:g&&g.b?fmt(g.b):(s.tb||'')}}
function exCardHTML(E,W,L){L=L||{};const ssOn=E.ss&&(E.ss in L);
  const X=ex(E.exId),T=TYPES[X.type];let n=0;let upDl=0,upDown=0,upInc=0,upRep=0;
  const rows=E.sets.map((s,i)=>{const lab=s.t==='n'?String(++n):s.t==='w'?'É':s.t==='d'?'D':'F';
    const ia=`<input class="sin" data-f="a" data-u="${E.uid}" data-i="${i}" inputmode="decimal" enterkeyhint="next" autocomplete="off" value="${esc(s.a)}" placeholder="${W?esc(ph(E,i).a):'—'}" aria-label="${T.a} série ${i+1}">`;
    const ib=`<input class="sin" data-f="b" data-u="${E.uid}" data-i="${i}" inputmode="${X.type==='c'?'decimal':'numeric'}" enterkeyhint="done" autocomplete="off" value="${esc(s.b)}" placeholder="${W?esc(ph(E,i).b):'—'}" aria-label="${T.b} série ${i+1}">`;
    const lb=`<button class="slabel ${s.t}" data-act="set-type:${E.uid}:${i}" aria-label="Type de série ${i+1}">${lab}${s.rir!=null&&s.rir!==''?`<i>R${s.rir}</i>`:''}</button>`;
    if(W&&!s.done){const g=suggestFor(E,i);if(g&&g.dl)upDl=1;else if(g&&g.down)upDown=g.up;else if(g&&g.up>0)upInc=g.up;else if(g&&g.rep)upRep=1}
    if(!W)return`<div class="srow r" data-row="${E.uid}-${i}">${lb}${ia}${ib}</div>`;
    const pv=prevMatch(E,i);
    return`<div class="srow ${s.done?'done':''} ${s.done&&s.pr?'pr':''}" data-row="${E.uid}-${i}">${lb}<button class="prev" data-act="prev-copy:${E.uid}:${i}" ${pv?'':'disabled'} aria-label="Reprendre la série précédente">${pv?esc(setStr(pv,X.type)):'—'}</button>${ia}${ib}<button class="chk" data-act="set-done:${E.uid}:${i}" aria-label="Valider la série ${i+1}" aria-pressed="${!!s.done}">${icon('check')}</button></div>`});
  const opts=[0,30,45,60,75,90,120,150,180,240,300];if(!opts.includes(+E.rest))opts.push(+E.rest),opts.sort((a,b)=>a-b);
  return`<section class="excard ${ssOn?'ss':''}" ${ssOn?`style="--ssc:${SSC[L[E.ss]%4]}"`:''}>
    ${ssChip(E,L)}
    <div class="ex-head"><button class="ex-name" data-act="ex-open:${X.id}">${avHTML(X,'sm')}<span><span class="t">${esc(X.name)}</span><span class="s">${esc(X.muscle)} · ${esc(X.equip)}</span></span></button><button class="icon-btn grip" data-drag="${E.uid}" aria-label="Glisser pour déplacer">${icon('grip')}</button><button class="icon-btn" data-act="ex-menu:${E.uid}" aria-label="Options de l'exercice">${icon('dots')}</button></div>
    ${W?`<textarea class="ex-note" data-f="note" data-u="${E.uid}" rows="1" placeholder="${esc(lastExNote(E.exId)?'Dernière fois : '+lastExNote(E.exId):'Ajouter une note')}">${esc(E.note||'')}</textarea>`:''}
    ${W&&S.settings.suggest&&!E.sets.some(x=>x.done)?(p=>p?`<p class="sugg plat">${icon('trend')}Pas de record depuis ${p.n} séances${p.dl?` : essaie une séance allégée à ${fmt(p.dl)} kg puis remonte`:' : change de variante ou de fourchette de reps'}</p>`:'')(plateauFor(E.exId)):''}
    ${W&&upDl?`<p class="sugg">${icon('trend')}Semaine de décharge : charges allégées d'environ 15 %</p>`:''}${W&&S.settings.suggest&&upDown&&!upDl?`<p class="sugg plat">${icon('trend')}Trop dur la dernière fois : on retire ${fmt(-upDown)} kg pour bien remonter</p>`:''}${W&&S.settings.suggest&&!upDl&&!upDown&&(upInc||upRep)&&!(!E.sets.some(x=>x.done)&&plateauFor(E.exId))?`<p class="sugg">${icon('trend')}${upInc?`Tu as atteint ${S.settings.repHi} reps : passe à +${fmt(upInc)} kg`:`Objectif : 1 rep de plus que la dernière fois`}</p>`:''}
    <label class="ex-rest">${icon('timer')}<span>Repos</span><select data-f="rest" data-u="${E.uid}" aria-label="Temps de repos">${opts.map(o=>`<option value="${o}" ${+E.rest===o?'selected':''}>${o?fmtRest(o):'désactivé'}</option>`).join('')}</select></label>
    <div class="sets"><div class="srow shead ${W?'':'r'}"><span>Série</span>${W?'<span>Précédent</span>':''}<span>${T.a}</span><span>${T.b}</span>${W?`<span class="c">${icon('check')}</span>`:''}</div>${rows.join('')}</div>
    ${W&&X.type==='t'&&E.sets.some(z=>!z.done)?`<button class="btn btn-primary block sm" data-act="chrono:${E.uid}">${icon('timer')}Lancer le chrono</button>`:''}
    <button class="btn btn-soft block sm" data-act="set-add:${E.uid}">${icon('plus')}Ajouter une série</button></section>`}
function autosize(t){t.style.height='auto';t.style.height=t.scrollHeight+'px'}
function updateStats(){if(ui.edMode!=='workout'||!S.active)return;const{v,n}=activeStats();const a=$('#st-vol'),b=$('#st-sets');if(a)a.textContent=fmtVol(v);if(b)b.textContent=n}
function validSet(s,type){const a=num(s.a),b=num(s.b);if(s.a!==''&&isNaN(a))return false;if(type==='c')return a>0||b>0;if(!(b>0))return false;if(type==='w')return a>=0;return true}
function toggleDone(u,i){const E=findE(u);if(!E)return;const s=E.sets[i];const X=ex(E.exId);
  if(s.done){s.done=false;save();renderEditor();updateStats();return}
  const p=ph(E,i);if(s.a===''&&p.a!=='')s.a=p.a;if(s.b===''&&p.b!=='')s.b=p.b;
  if(!validSet(s,X.type)){const row=document.querySelector(`[data-row="${u}-${i}"]`);if(row){row.classList.remove('shake');void row.offsetWidth;row.classList.add('shake')}flash(X.type==='w'?'Indique le poids et les répétitions':X.type==='c'?'Indique une distance ou une durée':'Indique les '+TYPES[X.type].b);return}
  s.done=true;vib('tap')
  if(ui.edMode==='workout'){const r=checkRecord(E,i);s.pr=!!r;if(r)setTimeout(()=>celebrate(X,r),120)}
  const T=edTarget();const grp=E.ss?T.exercises.filter(x=>x.ss===E.ss):[];
  if(grp.length>1&&grp[grp.length-1]!==E){/* superset : enchaîner sans repos */}
  else startRest(+E.rest||0);
  save();renderEditor();renderResume()}
function newEx(id){const W=ui.edMode==='workout';const prev=W?prevSets(id):[];
  const base=prev.length?prev.map(p=>({t:p.t||'n'})):[{t:'n'},{t:'n'},{t:'n'}];
  return{uid:uid(),exId:id,rest:S.settings.rest,note:'',sets:base.map(b=>W?{t:b.t,a:'',b:'',done:false,ta:'',tb:''}:{t:b.t,a:'',b:''})}}

function lastExNote(id){for(const w of S.history){const e=w.exercises.find(e=>e.exId===id&&e.note);if(e)return e.note.length>70?e.note.slice(0,68)+'…':e.note;if(w.exercises.some(e=>e.exId===id))return''}return''}
function startFrom(tpl,routineId){
  const pw=S.history.find(w=>(routineId&&w.routineId===routineId)||w.name===tpl.name);
  S.active={id:uid(),name:tpl.name||defaultName(),start:Date.now(),routineId:routineId||null,rest:null,note:'',prevNote:pw&&pw.note||'',
    exercises:(tpl.exercises||[]).map(e=>({uid:uid(),exId:e.exId,ss:e.ss||null,rest:e.rest??S.settings.rest,note:'',
      sets:(e.sets&&e.sets.length?e.sets:[{t:'n'}]).map(s=>({t:s.t||'n',a:'',b:'',done:false,ta:s.a!==''&&s.a!=null&&+s.a?fmt(s.a):'',tb:s.b!==''&&s.b!=null&&+s.b?fmt(s.b):''}))}))};
  ui.edMode='workout';ui.editorOpen=true;ui.detail=[];ui.picker=null;save();renderAll();wake(true)}
function ensureNoActive(fn){if(!S.active)return fn();
  openDlg({title:'Séance déjà en cours',html:`<p class="dtext">« ${esc(S.active.name)} » est toujours ouverte.</p>`,buttons:[{label:'Reprendre la séance',kind:'primary',fn:()=>ACTS.resume()},{label:'Abandonner et démarrer',kind:'danger',fn:()=>{S.active=null;fn()}},{label:'Annuler',kind:'soft'}]})}

function finishWorkout(){const A=S.active;if(!A)return;let done=0,filled=0;
  for(const e of A.exercises)for(const s of e.sets){if(s.done)done++;else if(s.a!==''||s.b!=='')filled++}
  if(!done&&!filled)return openDlg({title:'Aucune série validée',html:'<p class="dtext">Valide au moins une série avec le bouton ✓ pour enregistrer ta séance.</p>',buttons:[{label:'Continuer la séance',kind:'primary'},{label:'Abandonner la séance',kind:'danger',fn:discardWorkout}]});
  if(filled)return openDlg({title:'Séries non validées',html:`<p class="dtext">${filled} série${filled>1?'s sont remplies mais pas validées':' est remplie mais pas validée'}.</p>`,buttons:[{label:'Les valider et terminer',kind:'primary',fn:()=>commit(true)},{label:'Les ignorer et terminer',kind:'soft',fn:()=>commit(false)},{label:'Retour à la séance',kind:'soft'}]});
  openDlg({title:'Terminer la séance ?',html:`<p class="dtext">${done} série${done>1?'s':''} validée${done>1?'s':''} en ${fmtDurLong(Date.now()-A.start)}.</p>`,buttons:[{label:'Terminer',kind:'primary',fn:()=>commit(false)},{label:'Retour à la séance',kind:'soft'}]})}
function commit(includeFilled){const A=S.active;
  const rec={id:A.id,name:(A.name||'').trim()||defaultName(),start:A.start,end:Date.now(),routineId:A.routineId,note:(A.note||'').trim(),exercises:[]};
  for(const e of A.exercises){const X=ex(e.exId);const sets=e.sets.filter(s=>s.done||(includeFilled&&(s.a!==''||s.b!=='')&&validSet(s,X.type))).map(s=>{const o={t:s.t,a:num(s.a)||0,b:num(s.b)||0};if(s.rir!=null&&s.rir!=='')o.rir=s.rir;return o});
    if(sets.length)rec.exercises.push({exId:e.exId,ss:e.ss||null,rest:e.rest,note:(e.note||'').trim(),sets})}
  ssClean(rec);
  if(!rec.exercises.length){discardWorkout();flash('Aucune série valide : séance non enregistrée');return}
  rec.goalsHit=Object.keys(S.goals||{}).filter(id=>rec.exercises.some(e=>e.exId===id)&&bestFor(id)<S.goals[id].v);
  rec.prs=computePRs(rec);S.history.unshift(rec);S.history.sort((a,b)=>b.start-a.start);rec.goalsHit=rec.goalsHit.filter(id=>bestFor(id)>=S.goals[id].v);
  S.active=null;ui.editorOpen=false;ui.picker=null;save();wake(false);ui.tab='historique';renderAll();summaryDlg(rec);checkBadges();restSync();widgetSync();setTimeout(askReview,4000);setTimeout(bkDaily,1500);setTimeout(lbPublish,2000)}
function discardWorkout(){S.active=null;ui.editorOpen=false;ui.picker=null;save();wake(false);renderAll();restSync()}
function summaryDlg(rec){const n=rec.prs.length;
  const hasR=rec.routineId&&S.routines.some(r=>r.id===rec.routineId);
  openDlg({title:'Séance enregistrée',html:`<div class="sum"><div><span class="k">Durée</span><span class="v">${fmtDurLong(rec.end-rec.start)}</span></div><div><span class="k">Volume</span><span class="v">${fmtVol(wVolume(rec))}</span></div><div><span class="k">Séries</span><span class="v">${wSets(rec)}</span></div></div>
  <p class="kcal-line">${icon('flame')}${fmtKcal(kcalFor(rec))} <span class="muted">· estimation</span></p>
  ${n?`<div class="prs"><p class="prs-h">${icon('trophy')}${n} record${n>1?'s':''} battu${n>1?'s':''}</p><ul>${rec.prs.map(p=>`<li><span>${esc(ex(p.exId).name)}</span><b>${esc(p.label)} · ${esc(p.value)}</b></li>`).join('')}</ul></div>`:''}
  ${(rec.goalsHit||[]).length?`<div class="prs goalhit"><p class="prs-h">${icon('target')}Objectif atteint !</p><ul>${rec.goalsHit.map(id=>`<li><span>${esc(ex(id).name)}</span><b>${goalVal(ex(id).type,S.goals[id].v)}</b></li>`).join('')}</ul></div>`:''}`,
  buttons:[{label:'Partager en image',kind:'soft',fn:()=>{shareImage(rec);return false}},hasR?{label:'Mettre à jour la routine',kind:'soft',fn:()=>{updateRoutineFrom(rec);flash('Routine mise à jour')}}:{label:'Enregistrer comme routine',kind:'soft',fn:()=>{routineFrom(rec);flash('Routine créée')}},{label:'Fermer',kind:'primary'}]})}
const routineEx=w=>w.exercises.map(e=>({exId:e.exId,ss:e.ss||null,rest:e.rest??S.settings.rest,sets:e.sets.map(s=>({t:s.t,a:s.a||'',b:s.b||''}))}));
function routineFrom(w){S.routines.push({id:uid(),name:w.name,exercises:routineEx(w)});save();renderMain()}
function updateRoutineFrom(w){const r=S.routines.find(r=>r.id===w.routineId);if(r){r.exercises=routineEx(w);save();renderMain()}}
function editRoutine(r){ui.draft={id:r.id,name:r.name,exercises:r.exercises.map(e=>({uid:uid(),exId:e.exId,ss:e.ss||null,rest:e.rest??S.settings.rest,note:'',sets:e.sets.map(s=>({t:s.t||'n',a:s.a===''||s.a==null?'':fmt(s.a),b:s.b===''||s.b==null?'':fmt(s.b)}))}))};ui.edMode='routine';ui.editorOpen=true;renderAll()}
function saveDraft(){const D=ui.draft;if(!D.exercises.length)return openDlg({title:'Routine vide',html:'<p class="dtext">Ajoute au moins un exercice avant d\'enregistrer.</p>',buttons:[{label:'OK',kind:'primary'}]});
  const r={id:D.id||uid(),name:D.name.trim()||'Ma routine',exercises:D.exercises.map(e=>({exId:e.exId,ss:e.ss||null,rest:e.rest,sets:e.sets.map(s=>({t:s.t,a:isNaN(num(s.a))?'':num(s.a),b:isNaN(num(s.b))?'':num(s.b)}))}))};
  const i=S.routines.findIndex(x=>x.id===r.id);if(i>=0&&S.routines[i].prog)r.prog=S.routines[i].prog;if(i>=0)S.routines[i]=r;else S.routines.push(r);
  ui.draft=null;ui.editorOpen=false;ui.edMode='workout';save();ui.tab='seance';renderAll();flash('Routine enregistrée')}
function closeDraft(){ui.draft=null;ui.editorOpen=false;ui.edMode='workout';renderAll()}

/* ================= Sélecteur d'exercices ================= */
function openPicker(mode,u){ui.picker={mode,uid:u||null,sel:[],q:'',muscle:'Tous',equip:''};renderPicker(true);renderRestBar()}
function renderPicker(full){const el=$('#picker');const P=ui.picker;
  if(!P){el.hidden=true;el.innerHTML='';return}
  if(full||!el.innerHTML){el.hidden=false;
    el.innerHTML=`<div class="sheet-head"><button class="btn-ghost" data-act="p-close">Fermer</button><div class="sh-title">${P.mode==='replace'?'Remplacer':'Ajouter'}</div><button class="btn-ghost" data-act="p-create">${icon('plus')}Créer</button></div>
    <div class="pk-tools wrapx"><label class="search">${icon('search')}<input type="search" id="pq" data-f="pq" value="${esc(P.q)}" placeholder="Rechercher parmi ${allEx().length} exercices" autocomplete="off" aria-label="Rechercher"></label>${chipsHTML('p-muscle',P.muscle)}${equipSelect('pequip',P.equip)}</div>
    <div class="sheet-body"><div class="wrapx" id="plist"></div></div><div id="pfoot"></div>`}
  const L=filterEx(P.q,P.muscle,P.equip),U=usesMap();
  const SG=P.mode==='replace'&&P.from&&!P.q?suggestReplace(P.from):[];
  $('#plist').innerHTML=(SG.length?`<div class="sugg"><p class="sugg-h">${icon('zap')}Suggestions pour remplacer ${esc(ex(P.from).name)}</p>${SG.map(X=>exItem(X,'pick',false,U[X.id])).join('')}</div>`:'')+(L.length?`<div class="count-line">${L.length} exercice${L.length>1?'s':''}${P.sel.length?` · ${P.sel.length} sélectionné${P.sel.length>1?'s':''}`:''}</div>`+L.map(X=>exItem(X,'pick',P.sel.includes(X.id),U[X.id])).join('')
    :`<div class="empty" style="margin-top:16px"><b>Aucun résultat</b>Cet exercice n'est pas dans l'annuaire.<div style="margin-top:12px"><button class="btn btn-soft sm" data-act="p-create">${icon('plus')}Créer « ${esc(P.q||'un exercice')} »</button></div></div>`);
  $('#pfoot').innerHTML=P.mode==='add'?`<div class="pk-foot"><button class="btn btn-primary block" data-act="p-confirm" ${P.sel.length?'':'disabled'}>${P.sel.length?`Ajouter ${P.sel.length} exercice${P.sel.length>1?'s':''}`:'Sélectionne des exercices'}</button></div>`:''}
function replaceWith(id){const E=findE(ui.picker.uid);if(E){E.exId=id;E.sets.forEach(s=>{s.a='';s.b='';if('done'in s){s.done=false;s.ta='';s.tb=''}})}ui.picker=null;save();renderAll()}

/* ================= Fiches détail ================= */
function pushDetail(d){ui.detail.push(d);renderDetail();renderRestBar()}
function renderDetail(){const el=$('#detail');const d=ui.detail[ui.detail.length-1];
  if(!d){el.hidden=true;el.innerHTML='';return}
  if(d.kind==='w'&&!S.history.some(w=>w.id===d.id)){ui.detail.pop();return renderDetail()}
  el.hidden=false;el.innerHTML=d.kind==='ex'?exDetailHTML(d.id):d.kind==='body'?bodyDetailHTML():d.kind==='meas'?measDetailHTML(d.id):d.kind==='records'?recordsHTML():d.kind==='programs'?programsHTML():d.kind==='month'?monthHTML(d.id):d.kind==='onb'?onbHTML():d.kind==='warm'?warmHTML():d.kind==='rec'?recHTML():d.kind==='plan'?planHTML():d.kind==='badges'?badgesHTML():d.kind==='lb'?lbHTML():wDetailHTML(d.id);el.querySelector('.sheet-body').scrollTop=0}
function slines(sets,type){let n=0;return`<div class="slist">${sets.map(s=>{const l=s.t==='n'?String(++n):s.t==='w'?'É':s.t==='d'?'D':'F';return`<div class="sline"><span class="l ${s.t}">${l}</span><span>${esc(setStr(s,type))}${s.rir!=null?` <em class="rir">RIR ${s.rir}</em>`:''}</span><span class="e">${type==='w'&&s.t!=='w'&&s.a&&s.b?'1RM ~'+Math.round(e1rm(s.a,s.b)):''}</span></div>`}).join('')}</div>`}
function chartSVG(pts,unit){
  if(pts.length<2)return`<p class="dtext" style="font-size:14px">Le graphique de progression apparaît après deux séances avec cet exercice.</p>`;
  const W=330,H=160,L=38,R=12,T=14,B=24;const vs=pts.map(p=>p.v);let lo=Math.min(...vs),hi=Math.max(...vs);if(lo===hi){lo-=1;hi+=1}const pad=(hi-lo)*.12;lo=Math.max(0,lo-pad);hi+=pad;
  const raw=(hi-lo)/3,mag=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw);const t0=Math.floor(lo/step)*step,t1=Math.ceil(hi/step)*step;const ticks=[];for(let t=t0;t<=t1+1e-9;t+=step)ticks.push(+t.toFixed(4));lo=t0;hi=t1;
  const x=i=>L+i/(pts.length-1)*(W-L-R),y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);
  const line=pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
  const area=`${line}L${x(pts.length-1).toFixed(1)},${H-B}L${L},${H-B}Z`;
  const d=t=>{const z=new Date(t);return`${String(z.getDate()).padStart(2,'0')}/${String(z.getMonth()+1).padStart(2,'0')}`};
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progression ${esc(unit)}">
  ${ticks.map(t=>`<line x1="${L}" x2="${W-R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="grid"/><text x="${L-6}" y="${(y(t)+3.5).toFixed(1)}" text-anchor="end" class="tx">${fmt(t)}</text>`).join('')}
  <path d="${area}" class="ar"/><path d="${line}" class="ln"/>
  ${pts.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${i===pts.length-1?4.5:3}" class="pt ${i===pts.length-1?'end':''}"/>`).join('')}
  <text x="${L}" y="${H-6}" class="tx">${d(pts[0].t)}</text><text x="${W-R}" y="${H-6}" text-anchor="end" class="tx">${d(pts[pts.length-1].t)}</text></svg>`}
function mediaHTML(X){const inf=INFO[X.id]||{};
  if(inf.rp&&!inf.img){const CR='Illustrations : <a href="https://repdb.co" target="_blank" rel="noopener">Exercise data by RepDB (repdb.co)</a>',u=t=>`src="media/repdb/${inf.rp}-${t}.webp"`;
    if(inf.rp1)return`<figure class="media-wrap"><div class="media gifonly rp" id="media"><img class="f0" ${u('main')} alt="${esc(X.name)}" onerror="this.closest('.media-wrap').remove()"></div><figcaption><span></span><span class="credit">${CR}</span></figcaption></figure>`;
    return`<figure class="media-wrap"><div class="media rp ${ui.mediaSplit?'split':''}" id="media"><img class="f0" ${u('start')} alt="${esc(X.name)} : position de départ" onerror="this.closest('.media-wrap').remove()"><img class="f1" loading="lazy" ${u('peak')} alt="${esc(X.name)} : position d'arrivée"></div>
  <figcaption><button class="btn-ghost" data-act="media-mode">${icon('film')}<span id="media-lbl">${ui.mediaSplit?'Voir l\'animation':'Voir les 2 positions'}</span></button><span class="credit">${CR}</span></figcaption></figure>`}
  if(inf.oe&&!inf.img){const CR='Illustrations : Open Exercise Illustrations (CC0)',u=t=>`src="media/oei/${inf.oe}-${t}.webp"`;
    if(inf.oe1)return`<figure class="media-wrap"><div class="media gifonly oe" id="media"><img class="f0" ${u('hold')} alt="${esc(X.name)}" onerror="this.closest('.media-wrap').remove()"></div><figcaption><span></span><span class="credit">${CR}</span></figcaption></figure>`;
    return`<figure class="media-wrap"><div class="media oe ${ui.mediaSplit?'split':''}" id="media"><img class="f0" ${u('start')} alt="${esc(X.name)} : position de départ" onerror="this.closest('.media-wrap').remove()"><img class="f1" loading="lazy" ${u('end')} alt="${esc(X.name)} : position d'arrivée"></div>
  <figcaption><button class="btn-ghost" data-act="media-mode">${icon('film')}<span id="media-lbl">${ui.mediaSplit?'Voir l\'animation':'Voir les 2 positions'}</span></button><span class="credit">${CR}</span></figcaption></figure>`}
  if(!inf.img){if(!MAIN_M.includes(X.muscle))return'';return`<figure class="media-wrap"><div class="musmap">${bodySVG({},m=>m===X.muscle?'rs-target':'rs-n')}</div><figcaption><span class="credit">Muscle travaillé : <b>${esc(X.muscle)}</b></span></figcaption></figure>`}
  return`<figure class="media-wrap"><div class="media ${ui.mediaSplit?'split':''}" id="media"><img class="f0" ${imgAttr(inf.img,0)} alt="${esc(X.name)} : position de départ" onerror="this.closest('.media-wrap').remove()"><img class="f1" loading="lazy" ${imgAttr(inf.img,1)} alt="${esc(X.name)} : position d'arrivée"></div>
  <figcaption><button class="btn-ghost" data-act="media-mode">${icon('film')}<span id="media-lbl">${ui.mediaSplit?'Voir l\'animation':'Voir les 2 positions'}</span></button><span class="credit">Photos : Free Exercise DB</span></figcaption></figure>`}
function howHTML(X){const inf=INFO[X.id];if(!inf||!inf.s||!inf.s.length)return'';
  return`<section class="how"><h2>Comment faire</h2><ol class="howl">${inf.s.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${inf.tip?`<p class="tip"><b>Conseil</b>${esc(inf.tip)}</p>`:''}</section>`}
function exDetailHTML(id){const X=ex(id),T=X.type,ses=sessionsFor(id),all=ses.flatMap(s=>s.sets).filter(s=>s.t!=='w');
  let rec='',unit='';
  if(T==='w'){let best=null,bestV=null;for(const s of all){if(!(s.b>0))continue;if(!best||s.a>best.a||(s.a===best.a&&s.b>best.b))best=s;if(!bestV||s.a*s.b>bestV.a*bestV.b)bestV=s}
    rec=`<div><span class="k">Poids max</span><span class="v">${best?fmt(best.a)+' kg':'—'}</span><span class="sub">${best?'× '+best.b+' reps':'Pas encore de série'}</span></div><div><span class="k">1RM estimé</span><span class="v">${all.length?Math.round(score('w',all))+' kg':'—'}</span><span class="sub">Formule d'Epley</span></div><div><span class="k">Meilleure série</span><span class="v">${bestV?fmt(bestV.a)+' × '+bestV.b:'—'}</span><span class="sub">${bestV?fmtVol(bestV.a*bestV.b):'Volume d\'une série'}</span></div><div><span class="k">Séances</span><span class="v">${ses.length}</span><span class="sub">${ses.length?'Dernière : '+fmtShort(ses[0].w.start):'Jamais fait'}</span></div>`;unit='1RM estimé (kg)'}
  else if(T==='b'||T==='t'){const mb=Math.max(0,...all.map(s=>s.b)),ma=Math.max(0,...all.map(s=>s.a)),tot=all.reduce((a,s)=>a+s.b,0);
    rec=`<div><span class="k">${T==='b'?'Reps max':'Durée max'}</span><span class="v">${mb?(T==='b'?mb:fmtSec(mb)):'—'}</span></div><div><span class="k">Lest max</span><span class="v">${ma?'+'+fmt(ma)+' kg':'—'}</span></div><div><span class="k">${T==='b'?'Total reps':'Durée totale'}</span><span class="v">${tot?(T==='b'?tot:fmtSec(tot)):'—'}</span></div><div><span class="k">Séances</span><span class="v">${ses.length}</span></div>`;unit=T==='b'?'reps max':'durée max (s)'}
  else{const ma=Math.max(0,...all.map(s=>s.a)),mb=Math.max(0,...all.map(s=>s.b)),tot=all.reduce((a,s)=>a+s.a,0);
    rec=`<div><span class="k">Distance max</span><span class="v">${ma?fmt(ma)+' km':'—'}</span></div><div><span class="k">Durée max</span><span class="v">${mb?fmt(mb)+' min':'—'}</span></div><div><span class="k">Distance totale</span><span class="v">${tot?fmt(tot)+' km':'—'}</span></div><div><span class="k">Séances</span><span class="v">${ses.length}</span></div>`;unit='distance (km)'}
  const pts=ses.slice().reverse().map(s=>({t:s.w.start,v:score(T,s.sets)})).filter(p=>p.v>0);
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Exercice</div><button class="btn-ghost fav-btn ${(S.fav||[]).includes(id)?'on':''}" data-act="fav:${id}" aria-pressed="${(S.fav||[]).includes(id)}" aria-label="Favori"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>Favori</button></div>
  <div class="sheet-body"><div class="wrapx dwrap">
    <h2 style="font-size:28px">${esc(X.name)}</h2>
    <div class="tags"><span class="tag">${esc(X.muscle)}</span><span class="tag">${esc(X.equip)}</span><span class="tag">${esc(TYPES[T].label)}</span>${X.custom?'<span class="tag">Perso</span>':''}</div>
    ${mediaHTML(X)}${videoHTML(X)}${S.settings.suggest?nextTargetHTML(id):''}
    ${howHTML(X)}
    <section class="dsec">${S.goals[id]?goalBar(id):''}<button class="btn ${S.goals[id]?'btn-soft':'btn-primary'} block" data-act="goal-set:${id}">${icon('target')}${S.goals[id]?'Modifier l\'objectif':'Fixer un objectif'}</button></section>
    <div class="rec">${rec}</div>
    ${(p=>p?`<section class="plat-c"><b>Stagnation</b><p class="dtext">Pas de nouveau record depuis ${p.n} séances.${p.dl?` Fais une séance allégée à <b class="num">${fmt(p.dl)} kg</b> (−10 %), puis reprends ta progression normale.`:' Change de variante, de fourchette de reps ou de temps de repos pour relancer la progression.'} Vérifie aussi ton sommeil et ta récupération.</p></section>`:'')(plateauFor(id))}
    ${T==='w'&&all.length&&score('w',all)>0?(()=>{const m=score('w',all),inc=INC[X.equip]||2.5,r=v=>Math.max(0,Math.round(v/inc)*inc);return`<section class="card dsec"><span class="k">Charges estimées selon le nombre de reps</span><div class="pct">${[1,3,5,6,8,10,12,15].map(n=>`<div><span class="k">${n} rep${n>1?'s':''}</span><span class="v">${fmt(r(n<=1?m:m/(1+n/30)))}</span></div>`).join('')}</div><p class="dtext" style="font-size:13px">Calculé à partir de ton 1RM estimé (${Math.round(m)} kg). Ce sont des charges max : enlève 5 à 10 % pour garder 1 ou 2 reps en réserve.</p></section>`})():''}
    <section class="card dsec"><span class="k">Progression · ${esc(unit)}</span>${chartSVG(pts,unit)}</section>
    <section class="dsec"><h2>Historique</h2>${ses.length?ses.map(s=>`<div class="dex"><div class="dex-h"><span class="t" style="color:var(--fg)">${esc(cap(fmtDay(s.w.start)))}</span><span class="s">${esc(s.w.name)}</span></div>${slines(s.sets,T)}</div>`).join(''):'<p class="dtext">Tu n\'as pas encore fait cet exercice.</p>'}</section>
    ${X.custom?`<button class="btn btn-danger block" data-act="x-del:${X.id}">Supprimer cet exercice perso</button>`:''}
  </div></div>`}

function nextTargetHTML(id){const X=ex(id);if(!['w','b','t'].includes(X.type))return'';const P=prevSets(id).filter(s=>s.t!=='w');if(!P.length)return'';
  const E={exId:id,sets:P.map(s=>({t:s.t||'n'}))};const G=P.map((_,i)=>suggestFor(E,i)).filter(Boolean);if(!G.length)return'';
  const best=G.reduce((m,g)=>(+g.a||0)>(+m.a||0)||((+g.a||0)===(+m.a||0)&&(+g.b||0)>(+m.b||0))?g:m,G[0]);
  const why=best.dl?'semaine de décharge':best.down?'on allège un peu':best.up>0?`+${fmt(best.up)} kg`:best.rep?'une rep de plus':'confirme ta dernière séance';
  return`<section class="card nxt"><span class="k">Prochaine séance</span><span class="v">${esc(setStr({a:best.a,b:best.b},X.type))}</span><span class="s">${G.length} série${G.length>1?'s':''} · ${why}</span></section>`}
function wDetailHTML(id){const w=S.history.find(w=>w.id===id);
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Séance</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap">
    <div><p class="eyebrow">${esc(cap(fmtDay(w.start)))} · ${fmtHour(w.start)}</p><h2 style="font-size:28px;margin-top:4px">${esc(w.name)}</h2></div>
    ${w.note?`<p class="prevnote">${icon('book')}<span>${esc(w.note)}</span></p>`:''}
    <div class="sum"><div><span class="k">Durée</span><span class="v">${fmtDurLong(w.end-w.start)}</span></div><div><span class="k">Volume</span><span class="v">${fmtVol(wVolume(w))}</span></div><div><span class="k">Séries</span><span class="v">${wSets(w)}</span></div></div>
    <p class="kcal-line">${icon('flame')}${fmtKcal(kcalFor(w))} <span class="muted">· estimation${bodySorted().length?'':' pour 75 kg (ajoute ta pesée pour plus de précision)'}</span></p>
    ${w.prs&&w.prs.length?`<div class="prs"><p class="prs-h">${icon('trophy')}Records</p><ul>${w.prs.map(p=>`<li><span>${esc(ex(p.exId).name)}</span><b>${esc(p.label)} · ${esc(p.value)}</b></li>`).join('')}</ul></div>`:''}
    <section>${(()=>{const L=ssLetters(w.exercises);return w.exercises.map(e=>{const X=ex(e.exId);return`<div class="dex">${ssChip(e,L)}<div class="dex-h"><button class="t" data-act="ex-open:${X.id}">${esc(X.name)}</button><span class="s">${esc(X.muscle)}</span></div>${e.note?`<p class="note-txt">${esc(e.note)}</p>`:''}${slines(e.sets,X.type)}</div>`}).join('')})()}</section>
    <button class="btn btn-soft block" data-act="w-share:${w.id}">${icon('share')}Partager en image</button>
    <button class="btn btn-primary block" data-act="w-redo:${w.id}">${icon('play')}Refaire cette séance</button>
    <button class="btn btn-soft block" data-act="w-routine:${w.id}">Enregistrer comme routine</button>
    <button class="btn-ghost block danger" data-act="w-del:${w.id}">Supprimer la séance</button>
  </div></div>`}

/* ================= Minuteur de repos ================= */
function startRest(sec){if(!S.active||!sec)return;askNotif();S.active.rest={end:Date.now()+sec*1000,total:sec};renderRestBar();restSync()}
function renderRestBar(){const el=$('#restbar');const r=S.active&&S.active.rest;
  const show=r&&ui.editorOpen&&ui.edMode==='workout'&&!ui.picker&&!ui.detail.length;
  if(!show){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;const left=r.end-Date.now();
  el.innerHTML=`<div class="rb-track"><div class="rb-fill" data-restfill style="transform:scaleX(${Math.max(0,Math.min(1,left/(r.total*1000)))})"></div></div>
  <div class="rb-row"><button class="btn btn-soft sm" data-act="rest-adj:-15">−15 s</button><div class="rb-time"><span class="k">Repos</span><span data-restleft>${fmtDur(left+999)}</span></div><button class="btn btn-soft sm" data-act="rest-adj:15">+15 s</button><button class="btn btn-primary sm" data-act="rest-skip">Passer</button></div>`}
let actx=null;
function ensureAudio(){try{if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(C)actx=new C()}if(actx&&actx.state==='suspended')actx.resume()}catch(e){}}
document.addEventListener('pointerdown',ensureAudio,{passive:true});
function beep(){if(!S.settings.sound||!actx)return;try{const t0=actx.currentTime;[0,.24,.48].forEach((d,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=i===2?1175:880;g.gain.setValueAtTime(.0001,t0+d);g.gain.exponentialRampToValueAtTime(.4,t0+d+.012);g.gain.exponentialRampToValueAtTime(.0001,t0+d+.2);o.connect(g).connect(actx.destination);o.start(t0+d);o.stop(t0+d+.22)})}catch(e){}}
function tick(){if(!S.active)return;
  const t=fmtDur(Date.now()-S.active.start);document.querySelectorAll('[data-elapsed]').forEach(e=>{if(e.textContent!==t)e.textContent=t});
  const r=S.active.rest;if(!r)return;const left=r.end-Date.now();
  if(left<=0){S.active.rest=null;save();beep();vib('end');restSync();renderRestBar();renderResume();flash('Repos terminé, série suivante !');return}
  const txt=fmtDur(left+999);document.querySelectorAll('[data-restleft]').forEach(e=>{if(e.textContent!==txt)e.textContent=txt});
  document.querySelectorAll('[data-restfill]').forEach(e=>e.style.transform=`scaleX(${Math.max(0,Math.min(1,left/(r.total*1000)))})`)}
setInterval(tick,250);
let wl=null;
async function wake(on){try{if(on&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}else if(!on&&wl){await wl.release();wl=null}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(S.active&&ui.editorOpen)wake(true);tick()}});

/* ================= Dialogues ================= */
function openSheet(title,items){MODAL={kind:'sheet',title,items};renderDialog()}
function openDlg(o){MODAL={kind:'dlg',...o};renderDialog();setTimeout(()=>{const f=$('#dlg [autofocus]');if(f)f.focus()},60)}
function closeDlg(){MODAL=null;renderDialog()}
function confirmDlg(title,text,ok,fn){openDlg({title,html:`<p class="dtext">${esc(text)}</p>`,buttons:[{label:ok,kind:'danger',fn},{label:'Annuler',kind:'soft'}]})}
function renderDialog(){const el=$('#dlg');if(!MODAL){el.hidden=true;el.innerHTML='';return}el.hidden=false;const m=MODAL;
  const b=m.kind==='sheet'?m.items.map((it,i)=>`<button class="sh-item ${it.danger?'danger':''}" data-act="modal:${i}">${esc(it.label)}</button>`).join('')+`<button class="sh-item cancel" data-act="modal-close">Annuler</button>`
    :m.buttons.map((x,i)=>`<button class="btn block ${x.kind==='danger'?'btn-danger':x.kind==='primary'?'btn-primary':'btn-soft'}" data-act="modal:${i}">${esc(x.label)}</button>`).join('');
  el.innerHTML=`<div class="scrim" data-act="modal-close"></div><div class="dlg" role="dialog" aria-modal="true" aria-label="${esc(m.title||'Options')}">${m.title?`<h3 class="dtitle">${esc(m.title)}</h3>`:''}${m.html||''}<div class="dbtns k-${m.kind}">${b}</div></div>`}
let flashT=null;
function flash(msg,action){const t=$('#toast');t.innerHTML='';t.append(msg);if(action){const b=document.createElement('button');b.className='toast-act';b.dataset.act=action.act;b.textContent=action.label;t.append(b)}t.style.pointerEvents=action?'auto':'none';t.hidden=false;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(flashT);flashT=setTimeout(()=>{t.hidden=true},action?4200:2300)}
function createExerciseDlg(prefill,muscle){
  openDlg({title:'Nouvel exercice',html:`<label class="fld"><span>Nom</span><input id="ce-name" type="text" autofocus value="${esc(prefill||'')}" placeholder="ex. Rowing landmine" autocomplete="off"></label>
  <label class="fld"><span>Muscle principal</span><select id="ce-m">${MUSCLES.map(m=>`<option ${m===muscle?'selected':''}>${m}</option>`).join('')}</select></label>
  <label class="fld"><span>Équipement</span><select id="ce-e">${EQUIP.map(e=>`<option>${e}</option>`).join('')}</select></label>
  <label class="fld"><span>Ce que tu notes</span><select id="ce-t">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
  <p class="derr" id="ce-err" hidden></p>`,
  buttons:[{label:'Créer l\'exercice',kind:'primary',fn:()=>{const name=$('#ce-name').value.trim();
    if(!name){const er=$('#ce-err');er.textContent='Donne un nom à ton exercice.';er.hidden=false;return false}
    if(allEx().some(x=>norm(x.name)===norm(name))){const er=$('#ce-err');er.textContent='Un exercice porte déjà ce nom. Cherche-le dans l\'annuaire.';er.hidden=false;return false}
    const id='c-'+uid();S.custom.push({id,name,muscle:$('#ce-m').value,equip:$('#ce-e').value,type:$('#ce-t').value});rebuildIndex();save();flash('Exercice créé');
    if(ui.picker){if(ui.picker.mode==='replace'){replaceWith(id);return}ui.picker.sel.push(id);ui.picker.q='';ui.picker.muscle='Tous';renderPicker(true)}else{ui.xq='';renderMain()}}},{label:'Annuler',kind:'soft'}]})}
function markExport(){S.settings.lastExport=Date.now();save();renderMain()}
function copyText(txt){try{navigator.clipboard.writeText(txt).then(()=>{flash('Copié dans le presse-papiers');markExport()},()=>{const ta=$('#exp');if(ta){ta.focus();ta.select()}flash('Sélectionné : copie-le manuellement')})}catch(e){const ta=$('#exp');if(ta){ta.focus();ta.select()}}}
async function download(txt){const name=`carnet-fonte-${new Date().toISOString().slice(0,10)}.json`;try{const f=new File([txt],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});markExport();return}}catch(e){if(e&&e.name==='AbortError')return}markExport();try{const b=new Blob([txt],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`carnet-fonte-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}catch(e){flash('Téléchargement impossible ici : utilise Copier')}}
function applyImport(txt){let d;try{d=JSON.parse(txt)}catch(e){return flash('Ce texte n\'est pas une sauvegarde valide')}
  if(!d||!Array.isArray(d.history)||!Array.isArray(d.routines))return flash('Sauvegarde non reconnue');
  confirmDlg('Remplacer tes données ?',`La sauvegarde contient ${d.history.length} séance(s) et ${d.routines.length} routine(s). Tes données actuelles seront remplacées.`,'Importer',async()=>{await bkSave('import');S={...defaultState(),...d,settings:{...defaultSettings(),...(d.settings||{})}};rebuildIndex();save();ui.editorOpen=false;ui.picker=null;ui.detail=[];renderAll();flash('Sauvegarde importée')})}

/* ================= Actions ================= */
const ACTS={
  tab(t){ui.tab=t;renderMain()},
  'start-empty'(){ensureNoActive(()=>startFrom({name:defaultName(),exercises:[]},null))},
  'start-routine'(id){const r=S.routines.find(r=>r.id===id);if(r)ensureNoActive(()=>startFrom(r,r.id))},
  'routine-menu'(id){const i=S.routines.findIndex(r=>r.id===id),r=S.routines[i];if(!r)return;
    openSheet(r.name,[{label:'Modifier la routine',fn:()=>editRoutine(r)},{label:'Partager avec un collègue',fn:()=>shareRoutine(r)},{label:'Dupliquer',fn:()=>{S.routines.splice(i+1,0,{...clone(r),id:uid(),name:r.name+' (copie)',prog:undefined});save();renderMain()}},
      {label:'Supprimer',danger:true,fn:()=>confirmDlg('Supprimer la routine ?',`« ${r.name} » sera supprimée. Ton historique ne change pas.`,'Supprimer',()=>{S.routines=S.routines.filter(x=>x.id!==id);save();renderMain()})}])},
  'import-routine'(){importRoutineDlg()},
  chrono(u){const E=findE(u);if(!E)return;const i=E.sets.findIndex(z=>!z.done);if(i<0)return flash('Toutes les séries sont validées : ajoute une série');chronoStart(u,i)},
  'neg-open'(m){ui.tab='exercices';ui.xMuscle=m;ui.xq='';ui.xEquip='';renderMain()},
  'new-routine'(){ui.draft={id:null,name:'',exercises:[]};ui.edMode='routine';ui.editorOpen=true;renderAll();setTimeout(()=>{const n=$('#ed-name');if(n)n.focus()},80)},
  resume(){if(!S.active)return;ui.edMode='workout';ui.editorOpen=true;ui.draft=null;renderAll();wake(true)},
  'ed-min'(){if(ui.edMode==='routine'){if(ui.draft.exercises.length)return confirmDlg('Quitter sans enregistrer ?','Les modifications de la routine seront perdues.','Quitter',closeDraft);return closeDraft()}
    ui.editorOpen=false;save();wake(false);renderAll()},
  'ed-finish'(){ui.edMode==='workout'?finishWorkout():saveDraft()},
  'ed-cancel'(){confirmDlg('Abandonner la séance ?','Les séries saisies ne seront pas enregistrées.','Abandonner',discardWorkout)},
  'ed-add-ex'(){openPicker('add')},
  'ex-menu'(u){const T=edTarget(),i=T.exercises.findIndex(e=>e.uid===u),E=T.exercises[i];if(!E)return;
    const X=ex(E.exId);const items=[{label:'Remplacer (même muscle)',fn:()=>{openPicker('replace',u);ui.picker.muscle=X.muscle;ui.picker.from=X.id;renderPicker(true)}}];
    if(X.type==='w')items.push({label:'Ajouter l\'échauffement',fn:()=>addWarmup(E)});
    if(X.type==='w'&&['Barre','Smith','Barre EZ'].includes(X.equip))items.push({label:'Calculer les disques',fn:()=>plateDlg(workWeight(E),X.equip==='Barre EZ'?10:X.equip==='Smith'?0:20)});
    const nx=T.exercises[i+1];
    if(nx&&!(E.ss&&nx.ss===E.ss))items.push({label:'Superset avec « '+ex(nx.exId).name+' »',fn:()=>{const id=E.ss||nx.ss||uid();const old=nx.ss;T.exercises.forEach(x=>{if(old&&x.ss===old)x.ss=id});E.ss=id;nx.ss=id;ssClean(T);save();renderEditor();flash('Superset créé : le repos démarre après le dernier exercice')}});
    if(E.ss)items.push({label:'Retirer du superset',fn:()=>{E.ss=null;ssClean(T);save();renderEditor()}});
    if(i>0)items.push({label:'Monter',fn:()=>{T.exercises.splice(i,1);T.exercises.splice(i-1,0,E);ssClean(T);save();renderEditor()}});
    if(i<T.exercises.length-1)items.push({label:'Descendre',fn:()=>{T.exercises.splice(i,1);T.exercises.splice(i+1,0,E);ssClean(T);save();renderEditor()}});
    items.push({label:'Retirer l\'exercice',danger:true,fn:()=>{T.exercises.splice(i,1);ssClean(T);save();renderEditor();updateStats()}});
    openSheet(ex(E.exId).name,items)},
  'set-type'(u,i){const E=findE(u);if(!E)return;i=+i;const s=E.sets[i];const set=t=>()=>{s.t=t;save();renderEditor();updateStats()};
    const rir=v=>()=>{s.rir=v;save();renderEditor()};
    openSheet('Série',[{label:(s.t==='n'?'✓ ':'')+'Série normale',fn:set('n')},{label:(s.t==='w'?'✓ ':'')+'Échauffement (É)',fn:set('w')},{label:(s.t==='d'?'✓ ':'')+'Drop set (D)',fn:set('d')},{label:(s.t==='f'?'✓ ':'')+'Jusqu\'à l\'échec (F)',fn:set('f')},
      ...(s.t!=='w'?[0,1,2,3].map(v=>({label:(s.rir===v?'✓ ':'')+`Reps en réserve : ${v===3?'3 ou plus':v}`+(v===0?' (échec)':''),fn:rir(v)})):[]),
      ...(s.rir!=null&&s.rir!==''?[{label:'Effacer les reps en réserve',fn:rir(null)}]:[]),
      {label:'Supprimer la série',danger:true,fn:()=>{E.sets.splice(i,1);save();renderEditor();updateStats()}}])},
  'set-done'(u,i){toggleDone(u,+i)},
  'set-add'(u){const E=findE(u);if(!E)return;const l=E.sets[E.sets.length-1];
    E.sets.push(ui.edMode==='workout'?{t:'n',a:'',b:'',done:false,ta:l?(l.a||l.ta||''):'',tb:l?(l.b||l.tb||''):''}:{t:'n',a:l?l.a:'',b:l?l.b:''});save();renderEditor()},
  'prev-copy'(u,i){const E=findE(u);if(!E)return;const s=E.sets[+i],p=prevMatch(E,+i);if(!p||s.done)return;s.a=+p.a?fmt(p.a):'';s.b=+p.b?fmt(p.b):'';save();renderEditor()},
  'ex-open'(id){pushDetail({kind:'ex',id})},
  'p-toggle'(id){const P=ui.picker;if(P.mode==='replace')return replaceWith(id);const k=P.sel.indexOf(id);k>=0?P.sel.splice(k,1):P.sel.push(id);renderPicker(false)},
  'p-muscle'(m){ui.picker.muscle=m;renderPicker(true);const c=$('#picker .chip.on');if(c)c.scrollIntoView({inline:'center',block:'nearest'})},
  'p-confirm'(){const T=edTarget();for(const id of ui.picker.sel)T.exercises.push(newEx(id));ui.picker=null;save();renderAll();const b=$('#ed .sheet-body');if(b)b.scrollTop=b.scrollHeight},
  'p-close'(){ui.picker=null;renderPicker();renderRestBar()},
  'p-create'(){const P=ui.picker;createExerciseDlg(P.q,MUSCLES.includes(P.muscle)?P.muscle:'')},
  'p-info'(id){pushDetail({kind:'ex',id})},
  'media-mode'(){ui.mediaSplit=!ui.mediaSplit;const m=$('#media'),l=$('#media-lbl');if(m)m.classList.toggle('split',ui.mediaSplit);if(l)l.textContent=ui.mediaSplit?"Voir l'animation":'Voir les 2 positions'},
  'x-muscle'(m){ui.xMuscle=m;renderMain();const c=$('#main .chip.on');if(c)c.scrollIntoView({inline:'center',block:'nearest'})},
  'x-open'(id){pushDetail({kind:'ex',id})},
  'x-create'(){createExerciseDlg(ui.xq,MUSCLES.includes(ui.xMuscle)?ui.xMuscle:'')},
  'x-del'(id){confirmDlg('Supprimer cet exercice ?','Il disparaîtra de l\'annuaire. Les séances passées gardent leurs séries.','Supprimer',()=>{S.custom=S.custom.filter(x=>x.id!==id);rebuildIndex();save();ui.detail.pop();renderAll()})},
  'hist-open'(id){pushDetail({kind:'w',id})},
  'goal-set'(id){goalDlg(id)},
  'toggle-suggest'(){S.settings.suggest=!S.settings.suggest;save();renderMain()},
  plates(){plateDlg(0,20)},
  'm-nav'(d){ui.mOff=Math.max(0,(ui.mOff||0)+(+d));renderMain()},
  'meas-add'(k){measDlg(k||'Bras')},
  'meas-open'(k){pushDetail({kind:'meas',id:k})},
  'meas-del'(id){confirmDlg('Supprimer cette mesure ?','Elle sera retirée de ton suivi.','Supprimer',()=>{S.measures=S.measures.filter(x=>x.id!==id);save();renderDetail();renderMain()})},
  'w-share'(id){const w=S.history.find(w=>w.id===id);if(w)shareImage(w)},
  'install-help'(){installShown=false;maybeInstallPrompt(true)},
  'undo-set'(){const L=lastDeleted;if(!L)return;const E=findE(L.u);if(E){E.sets.splice(Math.min(L.i,E.sets.length),0,L.set);save();renderEditor();updateStats()}lastDeleted=null;$('#toast').hidden=true},
  records(){ui.rq='';pushDetail({kind:'records'})},
  programs(){pushDetail({kind:'programs'})},
  'prog-add'(i){const P=PROGRAMS[+i];const R=progRoutines(P);S.routines.push(...R);save();ui.detail=[];renderAll();ui.tab='seance';renderMain();flash(R.length>1?`${R.length} routines ajoutées`:'Routine ajoutée')},
  'cloud-connect'(){cloudDlg()},
  'onb-next'(){ui.onb.step++;renderDetail()},'onb-back'(){ui.onb.step--;renderDetail()},
  'onb-pick'(k,v){ui.onb.a[k]=v;if(ui.onb.step<ONB_Q.length){ui.onb.step++;renderDetail()}else renderDetail()},
  'onb-build'(){const kg=$('#onb-kg');if(kg)ui.onb.a.kg=kg.value;const a=ui.onb.a;if(!a.goal||!a.lvl||!a.where||!a.days){flash('Réponds à toutes les questions');return}ui.onb.prog=onbProgram(a);ui.onb.step=ONB_Q.length+1;renderDetail()},
  'onb-go'(){onbSave();const r=S.routines.find(r=>r.id===ui.onb.prog[0].id);ui.detail=[];renderDetail();ui.tab='seance';renderMain();if(r)startFrom(r,r.id)},
  'onb-done'(){onbSave();ui.detail=[];renderDetail();ui.tab='seance';renderMain();flash('Programme enregistré')},
  'onb-skip'(){S.settings.onboarded=1;save();ui.detail=[];renderDetail()},
  'onb-restore'(){S.settings.onboarded=1;save();ui.detail=[];renderDetail();ui.tab='reglages';renderMain()},
  'onb-redo'(){onbStart()},
  'fb-login'(){fbSignIn()},'fb-push'(){if(!fbOn()){flash('Connexion à Google en cours, réessaie dans un instant');return}fbPush('flash')},
  'fb-pull'(){openDlg({title:'Récupérer la sauvegarde ?',html:'<p class="dtext">Les données de ce téléphone seront remplacées par la dernière sauvegarde de ton compte Google.</p>',buttons:[{label:'Récupérer',kind:'danger',fn:async()=>{try{const d=await fbRead();applyCloud(d);flash('Données récupérées')}catch(e){openDlg({title:'Récupération impossible',html:`<p class="dtext">${esc(/introuvable/.test(e.message)?'Aucune sauvegarde sur ce compte.':fbErr(e))}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}},{label:'Annuler',kind:'soft'}]})},
  'fb-delete'(){confirmDlg('Supprimer ton compte ?','Ta sauvegarde en ligne et ton profil du classement seront définitivement supprimés. Tes séances restent sur ce téléphone.','Supprimer définitivement',()=>fbDeleteAccount())},
  'fb-off'(){confirmDlg('Se déconnecter de Google ?','Ta sauvegarde reste sur ton compte. Ce téléphone arrêtera simplement de se synchroniser.','Se déconnecter',()=>fbSignOut())},
  'cloud-push'(){cloudPush(true)},
  'cloud-pull'(){openDlg({title:'Récupérer depuis le cloud ?',html:'<p class="dtext">Les données de ce téléphone seront remplacées par ta dernière sauvegarde GitHub.</p>',buttons:[{label:'Récupérer',kind:'danger',fn:async()=>{try{const d=await cloudRead(S.settings.gistId);applyCloud(d);flash('Données récupérées')}catch(e){openDlg({title:'Échec',html:`<p class="dtext">${esc(e.message)}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}},{label:'Annuler',kind:'soft'}]})},
  'cloud-off'(){confirmDlg('Déconnecter GitHub ?','La sauvegarde reste sur ton GitHub. Ce téléphone arrêtera simplement de se synchroniser.','Déconnecter',()=>{setGhToken('');S.settings.gistId='';S.settings.ghLogin='';save();renderMain()})},
  'bkp-later'(){S.settings.backupSnooze=Date.now()+3*864e5;save();renderMain()},
  'body-add'(){bodyDlg()},
  'body-open'(){pushDetail({kind:'body'})},
  'body-del'(id){confirmDlg('Supprimer cette pesée ?','Elle sera retirée de ton suivi.','Supprimer',()=>{S.body=S.body.filter(b=>b.id!==id);save();renderDetail();renderMain()})},
  'cal-nav'(d){const now=new Date();const m=ui.calMonth?new Date(ui.calMonth):new Date(now.getFullYear(),now.getMonth(),1);m.setMonth(m.getMonth()+(+d));ui.calMonth=m.getTime();renderMain()},
  'cal-day'(k){const[y,mo,d]=k.split('-').map(Number);const L=S.history.filter(w=>{const x=new Date(w.start);return x.getFullYear()===y&&x.getMonth()===mo&&x.getDate()===d});
    if(L.length===1)return pushDetail({kind:'w',id:L[0].id});openSheet(cap(fmtDay(new Date(y,mo,d).getTime())),L.map(w=>({label:`${w.name} · ${fmtHour(w.start)}`,fn:()=>pushDetail({kind:'w',id:w.id})})))},
  'd-close'(){ui.detail.pop();renderDetail();renderRestBar()},
  'w-redo'(id){const w=S.history.find(w=>w.id===id);if(w)ensureNoActive(()=>startFrom({name:w.name,exercises:w.exercises},null))},
  'w-routine'(id){const w=S.history.find(w=>w.id===id);if(w){routineFrom(w);flash('Routine créée')}},
  'w-del'(id){confirmDlg('Supprimer la séance ?','Elle sera retirée de ton historique et de tes records.','Supprimer',()=>{S.history=S.history.filter(w=>w.id!==id);save();ui.detail.pop();renderAll()})},
  'rest-adj'(d){const r=S.active&&S.active.rest;if(!r)return;d=+d;r.end+=d*1000;r.total=Math.max(1,r.total+d);if(r.end<=Date.now())S.active.rest=null;save();renderRestBar();tick();restSync()},
  'rest-skip'(){if(S.active)S.active.rest=null;save();renderRestBar();renderResume();restSync()},
  'month-pdf'(k){monthPdf(k)},
  'month'(k){if(ui.detail.length&&ui.detail[ui.detail.length-1].kind==='month'){ui.detail[ui.detail.length-1].id=k;renderDetail()}else pushDetail({kind:'month',id:k})},
  'wu-start'(){warmStart()},'wu-pause'(){if(!WU)return;WU.paused=!WU.paused;renderDetail();warmDraw()},'wu-go'(d){warmGo(+d)},
  'wu-close'(){if(WU)clearInterval(WU.t);WU=null;ui.detail=ui.detail.filter(x=>x.kind!=='warm');renderDetail();renderRestBar()},
  'vid-set'(id){vidDlg(id)},
  'restore'(){restoreDlg()},
  'bk-pick'(src,k){k=decodeURIComponent(k);confirmDlg('Revenir à cette version ?','Tes données actuelles seront remplacées par celles de cette copie. Une copie de la version actuelle est faite avant, au cas où.','Restaurer',()=>bkRestore(src,k))},
  'dl-start'(){S.settings.deloadUntil=Date.now()+7*864e5;S.settings.deloadLast=Date.now();save();renderMain();flash('Semaine de décharge lancée')},
  'dl-stop'(){S.settings.deloadUntil=0;save();renderMain()},'dl-later'(){S.settings.deloadSnooze=Date.now()+14*864e5;save();renderMain()},
  'rec-open'(){pushDetail({kind:'rec'})},'badges-open'(){pushDetail({kind:'badges'})},'plan-open'(){pushDetail({kind:'plan'})},
  'plan-clear'(){S.plan={};save();renderDetail();renderMain()},
  'gen-open'(z){closeDlg();genDlg(z&&GEN_ZONES[z]?z:null)},
  'gen-swap'(i){const W=ui.gen;if(!W)return;i=+i;const e=W.exercises[i];const alt=suggestReplace(e.exId,6).filter(x=>!W.exercises.some(y=>y.exId===x.id));if(!alt.length){flash('Pas d\'autre exercice équivalent');return}
    const X=alt[Math.floor(Math.random()*Math.min(3,alt.length))];e.exId=X.id;const o=S.settings.gen;genShow(o,W)},
  'rp-pick'(id){replaceWith(id)},
  'lb-setup'(){lbSetupDlg()},'lb-add'(){lbAddDlg()},'lb-invite'(){lbInviteDlg()},'lb-refresh'(){lbRefresh(true);flash('Actualisation…')},
  'lb-tab'(k){ui.lbTab=k;renderDetail()},'lb-sort'(t,k){ui.lbSort=Object.assign({},ui.lbSort,{[t]:k});try{localStorage.setItem('fonte-lbsort',JSON.stringify(ui.lbSort))}catch(e){}renderDetail()},
  'lb-del'(id){const f=(S.friends||[]).find(f=>f.id===id);confirmDlg('Retirer ce pote ?',`${(lbFriends[id]&&lbFriends[id].p&&lbFriends[id].p.name)||(f&&f.name)||'Ce pote'} ne sera plus dans ton classement.`,'Retirer',()=>{S.friends=S.friends.filter(f=>f.id!==id);save();renderDetail()})},
  'lb-off'(){confirmDlg('Quitter le classement ?','Ton profil public sera supprimé et tes potes ne verront plus tes stats.','Quitter',async()=>{const id=S.settings.lbGist,wasFb=S.settings.lbFb;S.settings.lbGist='';S.settings.lbFb=false;save();renderDetail();if(wasFb&&fbOn()){try{await FB.fs.deleteDoc(FB.fs.doc(FB.D,'profiles',fbUser.uid))}catch(e){}}if(id){try{await gh('/gists/'+id,{method:'DELETE'})}catch(e){}}flash('Tu as quitté le classement')})},
  'lb-open'(){pushDetail({kind:'lb'});lbRefresh()},
  'accent'(k){if(!ACCENTS[k])return;S.settings.accent=k;save();applyTheme();renderMain()},
  'toggle-rare'(){S.settings.showRare=!S.settings.showRare;save();renderMain()},
  'dl-media'(){downloadMedia();const e=$('#dl-lbl');if(e)e.textContent='Téléchargement…'},
  'fav'(id){const i=S.fav.indexOf(id);if(i<0)S.fav.push(id);else S.fav.splice(i,1);save();renderDetail();if(ui.tab==='exercices')renderXList();flash(i<0?'Ajouté aux favoris':'Retiré des favoris')},
  'toggle-remind'(){const R=S.settings.remind=Object.assign({at:'18:00'},S.settings.remind);R.on=!R.on;save();renderMain();if(R.on)askNotif();remindSync();if(R.on)flash('Rappels activés')},
  'toggle-crash'(){S.settings.noCrash=!S.settings.noCrash;save();renderMain();crashSetup()},
  'toggle-sound'(){S.settings.sound=!S.settings.sound;save();renderMain();if(S.settings.sound){ensureAudio();beep()}},
  export(){const txt=JSON.stringify(S);openDlg({title:'Exporter mes données',html:`<p class="dtext">Garde ce texte ou ce fichier en lieu sûr. Il contient tes séances, routines et exercices perso.</p><textarea id="exp" class="ta" readonly rows="5">${esc(txt)}</textarea>`,
    buttons:[{label:'Copier',kind:'primary',fn:()=>{copyText(txt);return false}},...(NATIVE?[{label:'Enregistrer le fichier',kind:'soft',fn:()=>{nativeExport(txt);return false}}]:document.querySelector('link[rel="manifest"]')?[{label:'Télécharger le fichier',kind:'soft',fn:()=>{download(txt);return false}}]:[]),{label:'Fermer',kind:'soft'}]})},
  'import-file'(){$('#fileIn').click()},
  'hevy-file'(){$('#hevyIn').click()},
  'import-paste'(){openDlg({title:'Coller une sauvegarde',html:`<p class="dtext">Colle ici le texte exporté depuis l'app.</p><textarea id="imp" class="ta" rows="6" autofocus></textarea>`,buttons:[{label:'Importer',kind:'primary',fn:()=>{const v=$('#imp').value.trim();if(!v)return false;applyImport(v)}},{label:'Annuler',kind:'soft'}]})},
  wipe(){confirmDlg('Tout effacer ?','Séances, routines et exercices perso seront supprimés de ce téléphone. Exporte d\'abord si tu veux les garder.','Tout effacer',async()=>{await bkSave('effacement');S=defaultState();rebuildIndex();save();ui.editorOpen=false;ui.picker=null;ui.detail=[];renderAll();flash('Données effacées')})},
  modal(i){const m=MODAL;if(!m)return;const it=(m.kind==='sheet'?m.items:m.buttons)[+i];if(!it)return;if(m.kind==='sheet'){closeDlg();it.fn&&it.fn();return}const r=it.fn?it.fn():undefined;if(r!==false&&MODAL===m)closeDlg()},
  'modal-close'(){closeDlg()}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el||el.disabled)return;const[a,...args]=el.dataset.act.split(':');const fn=ACTS[a];if(fn){e.preventDefault();fn(...args)}});
document.addEventListener('input',e=>{const el=e.target,f=el.dataset&&el.dataset.f;if(!f||el.tagName==='SELECT')return;
  if(f==='a'||f==='b'){const E=findE(el.dataset.u);if(!E)return;const s=E.sets[+el.dataset.i];if(!s)return;s[f]=el.value.replace(/[^0-9.,]/g,'');if(s[f]!==el.value)el.value=s[f];saveSoon();updateStats()}
  else if(f==='note'){const E=findE(el.dataset.u);if(E){E.note=el.value;saveSoon()}autosize(el)}
  else if(f==='wnote'){if(S.active){S.active.note=el.value;saveSoon()}autosize(el)}
  else if(f==='rq'){ui.rq=el.value;const L=$('#detail');if(L){const pos=el.selectionStart;renderDetail();const n=$('#rq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}}
  else if(f==='ename'){const T=edTarget();if(T){T.name=el.value;saveSoon()}}
  else if(f==='pq'){ui.picker.q=el.value;renderPicker(false)}
  else if(f==='xq'){ui.xq=el.value;renderXList()}});
document.addEventListener('change',e=>{const el=e.target,f=el.dataset&&el.dataset.f;
  if(f==='rest'){const E=findE(el.dataset.u);if(E){E.rest=+el.value;save()}}
  else if(f==='pequip'){ui.picker.equip=el.value;renderPicker(false)}
  else if(f==='xequip'){ui.xEquip=el.value;renderXList()}
  else if(f==='defrest'){S.settings.rest=+el.value;save()}
  else if(f==='replo'){S.settings.repLo=+el.value;if(S.settings.repHi<=S.settings.repLo)S.settings.repHi=S.settings.repLo+2;save();renderMain()}
  else if(f==='rephi'){S.settings.repHi=+el.value;if(S.settings.repLo>=S.settings.repHi)S.settings.repLo=Math.max(1,S.settings.repHi-2);save();renderMain()}
  else if(f==='theme'){S.settings.theme=el.value;save();applyTheme()}
  else if(f&&f.startsWith('plan:')){S.plan=S.plan||{};const i=+f.slice(5);if(el.value)S.plan[i]=el.value;else delete S.plan[i];save();renderMain();remindSync()}
  else if(f==='weekgoal'){S.settings.weekGoal=+el.value;save()}
  else if(f==='lang'){S.settings.lang=el.value;save();setTimeout(()=>location.reload(),100)}
  else if(f==='remindat'){S.settings.remind=Object.assign({on:true},S.settings.remind,{at:el.value||'18:00'});save();remindSync()}
  else if(el.id==='hevyIn'){const file=el.files&&el.files[0];el.value='';if(!file)return;const r=new FileReader();r.onload=()=>hevyImport(String(r.result));r.onerror=()=>flash('Lecture du fichier impossible');r.readAsText(file)}
  else if(el.id==='fileIn'){const file=el.files&&el.files[0];el.value='';if(!file)return;const r=new FileReader();r.onload=()=>applyImport(String(r.result));r.onerror=()=>flash('Lecture du fichier impossible');r.readAsText(file)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(MODAL)closeDlg();else if(ui.detail.length)ACTS['d-close']();else if(ui.picker)ACTS['p-close']()}
  if(e.key==='Enter'&&e.target.classList&&e.target.classList.contains('sin')){e.preventDefault();const all=[...document.querySelectorAll('#ed .sin')];const k=all.indexOf(e.target);if(k>=0&&all[k+1])all[k+1].focus();else e.target.blur()}});

/* ================= Thème ================= */
const ACCENTS={rouge:{n:'Rouge',l:'#C62F2A',d:'#EE4B3F',sl:'#F7E2E0',sd:'#3A1D1B'},bleu:{n:'Bleu',l:'#2563C9',d:'#5B8DEF',sl:'#E1EAF8',sd:'#1A2740'},
  vert:{n:'Vert',l:'#1E8A4C',d:'#3FBF73',sl:'#DFF1E6',sd:'#16301F'},orange:{n:'Orange',l:'#C45F12',d:'#F08A3C',sl:'#F8E6D7',sd:'#3A2516'},
  violet:{n:'Violet',l:'#7041C4',d:'#A07BF0',sl:'#EAE2F8',sd:'#2A2140'},rose:{n:'Rose',l:'#C2336F',d:'#F06AA0',sl:'#F8E0EA',sd:'#3A1B28'},
  cyan:{n:'Turquoise',l:'#0E7F8C',d:'#2FC0CF',sl:'#DDF1F3',sd:'#15303A'}};
const accentHex=k=>(ACCENTS[S.settings.accent]||ACCENTS.rouge)[k];
function isDark(){const t=S.settings.theme||'auto';return t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function applyAccent(){const r=document.documentElement.style,A=ACCENTS[S.settings.accent];if(!A||S.settings.accent==='rouge'){r.removeProperty('--accent');r.removeProperty('--accent-soft');return}
  const d=isDark();r.setProperty('--accent',d?A.d:A.l);r.setProperty('--accent-soft',d?A.sd:A.sl)}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyAccent)}catch(e){}
function applyTheme(){const t=S.settings.theme||'auto';const r=document.documentElement;if(t==='auto')delete r.dataset.theme;else r.dataset.theme=t;applyAccent();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{if(t==='auto'){m.content=m.media&&m.media.includes('dark')?'#0E1012':'#F1F3F5'}else m.content=t==='dark'?'#0E1012':'#F1F3F5'})}

/* ================= Records en direct ================= */
function histBest(exId,excludeE,excludeI){const X=ex(exId);const sets=S.history.flatMap(w=>w.exercises.filter(e=>e.exId===exId).flatMap(e=>e.sets)).filter(s=>s.t!=='w');
  const live=S.active?S.active.exercises.filter(e=>e.exId===exId).flatMap(e=>e.sets.filter((s,i)=>s.done&&s.t!=='w'&&!(e===excludeE&&i===excludeI)).map(s=>({a:num(s.a)||0,b:num(s.b)||0}))):[];
  return{hist:sets.length,all:sets.concat(live),type:X.type}}
function checkRecord(E,i){const s=E.sets[i];if(s.t==='w')return null;const{hist,all,type}=histBest(E.exId,E,i);if(!hist)return null;const a=num(s.a)||0,b=num(s.b)||0;
  if(type==='w'){if(!(a>0&&b>0))return null;const ma=Math.max(0,...all.filter(x=>(+x.b||0)>0).map(x=>+x.a||0));const me=Math.max(0,...all.filter(x=>(+x.a||0)>0&&(+x.b||0)>0).map(x=>e1rm(+x.a,+x.b)));
    if(a>ma)return{kind:'Poids max',val:`${fmt(a)} kg × ${b}`};if(e1rm(a,b)>me+0.05)return{kind:'1RM estimé',val:`${Math.round(e1rm(a,b))} kg (${fmt(a)} × ${b})`};return null}
  if(type==='c'){const m=Math.max(0,...all.map(x=>+x.a||0));return a>m?{kind:'Distance max',val:fmt(a)+' km'}:null}
  const m=Math.max(0,...all.map(x=>+x.b||0));return b>m?{kind:type==='t'?'Durée max':'Reps max',val:type==='t'?fmtSec(b):b+' reps'}:null}
function celebrate(X,r){vib('pr');
  if(S.settings.sound&&actx){try{const t0=actx.currentTime;[523,659,784,1047].forEach((f,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+i*.09);g.gain.exponentialRampToValueAtTime(.35,t0+i*.09+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+i*.09+.35);o.connect(g).connect(actx.destination);o.start(t0+i*.09);o.stop(t0+i*.09+.4)})}catch(e){}}
  const old=$('#prfx');if(old)old.remove();const box=document.createElement('div');box.id='prfx';box.setAttribute('role','status');
  box.innerHTML=`<canvas></canvas><div class="prbanner"><span class="prb-ic">${icon('trophy')}</span><span><b>Nouveau record&nbsp;!</b><span>${esc(X.name)}</span><em>${esc(r.kind)} · ${esc(r.val)}</em></span></div>`;document.body.appendChild(box);
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){const cv=box.querySelector('canvas'),c=cv.getContext('2d');const W=cv.width=innerWidth*devicePixelRatio,H=cv.height=innerHeight*devicePixelRatio;const cols=['#EE4B3F','#6A97F2','#E5AE22','#55C985','#ECEEF0'];
    const P=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*18*devicePixelRatio,vy:(-Math.random()*16-6)*devicePixelRatio,r:Math.random()*Math.PI,vr:(Math.random()-.5)*.3,w:(6+Math.random()*6)*devicePixelRatio,h:(10+Math.random()*8)*devicePixelRatio,c:cols[Math.floor(Math.random()*5)]}));
    const t0=performance.now();(function f(t){const k=(t-t0)/1000;c.clearRect(0,0,W,H);for(const p of P){p.vy+=.55*devicePixelRatio;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.globalAlpha=Math.max(0,1-k/2.2);c.fillStyle=p.c;c.fillRect(-p.w/2,-p.h/2,p.w,p.h);c.restore()}if(k<2.3&&box.isConnected)requestAnimationFrame(f)})(t0)}
  setTimeout(()=>box.classList.add('out'),2600);setTimeout(()=>box.remove(),3100)}

/* ================= Page records ================= */
function recordsList(){const out=[];const ids=new Set(S.history.flatMap(w=>w.exercises.map(e=>e.exId)));
  for(const id of ids){const X=ex(id);let best=null,bt=0,e1=0,et=0,mb=0;
    for(const w of S.history)for(const e of w.exercises){if(e.exId!==id)continue;for(const s of e.sets){if(s.t==='w')continue;const a=+s.a||0,b=+s.b||0;
      if(X.type==='w'){if(b>0&&(!best||a>best.a||(a===best.a&&b>best.b))){best={a,b};bt=w.start}if(a>0&&b>0&&e1rm(a,b)>e1){e1=e1rm(a,b);et=w.start}}
      else{const v=X.type==='c'?a:b;if(v>mb){mb=v;bt=w.start}}}}
    if(X.type==='w'&&best)out.push({X,main:`${fmt(best.a)} kg × ${best.b}`,sub:e1?`1RM ~${Math.round(e1)} kg`:'',t:bt,sort:e1||best.a});
    else if(mb)out.push({X,main:X.type==='t'?fmtSec(mb):X.type==='c'?fmt(mb)+' km':mb+' reps',sub:'',t:bt,sort:mb})}
  return out}
function recordsHTML(){const L=recordsList();const q=hkey(ui.rq||'');const F=q?L.filter(r=>hkey(r.X.name+' '+r.X.muscle).includes(q)):L;const by={};for(const r of F)(by[r.X.muscle]=by[r.X.muscle]||[]).push(r);
  const order=MUSCLES.filter(m=>by[m]);const recent=L.slice().sort((a,b)=>b.t-a.t).slice(0,4);
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Mes records</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap">
  ${L.length?`<section class="dsec"><span class="k">Derniers records</span><div class="rec">${recent.map(r=>`<button class="rcell" data-act="ex-open:${r.X.id}"><span class="k">${esc(r.X.name)}</span><span class="v">${esc(r.main)}</span><span class="sub">${esc(cap(fmtShort(r.t)))}</span></button>`).join('')}</div></section>
  <label class="search">${icon('search')}<input type="search" id="rq" data-f="rq" value="${esc(ui.rq||'')}" placeholder="Rechercher un exercice" autocomplete="off" aria-label="Rechercher"></label>
  <div id="rlist">${order.map(m=>`<section class="dsec"><h2>${esc(m)}</h2>${by[m].sort((a,b)=>a.X.name.localeCompare(b.X.name,'fr')).map(r=>`<button class="xi" data-act="ex-open:${r.X.id}">${avHTML(r.X,'sm')}<span class="xt"><span class="t">${esc(r.X.name)}</span><span class="s">${esc(r.sub?r.sub+' · ':'')}${esc(fmtShort(r.t))} ${new Date(r.t).getFullYear()}</span></span><b class="num rmain">${esc(r.main)}</b></button>`).join('')}</section>`).join('')||'<p class="dtext">Aucun résultat.</p>'}</div>`
  :'<div class="empty"><b>Pas encore de record</b>Termine une séance pour voir tes meilleures performances ici.</div>'}
  </div></div>`}

/* ================= Statistiques ================= */
function weekStreaks(){const wk=new Set(S.history.map(w=>monday(w.start)));if(!wk.size)return{cur:0,best:0};const W=7*864e5;let best=0,run=0,prev=null;
  for(const m of [...wk].sort((a,b)=>a-b)){run=prev!==null&&Math.abs(m-prev-W)<36e5*2?run+1:1;best=Math.max(best,run);prev=m}
  let cur=0,m=monday(Date.now());if(!wk.has(m))m-=W;while([...wk].some(x=>Math.abs(x-m)<36e5*2)){cur++;m-=W}return{cur,best}}
function statsHTML(){const H=S.history;if(!H.length)return'';const vol=H.reduce((a,w)=>a+wVolume(w),0),dur=H.reduce((a,w)=>a+(w.end-w.start),0);const st=weekStreaks();
  const now=new Date();const months=[];for(let k=5;k>=0;k--){const d=new Date(now.getFullYear(),now.getMonth()-k,1);months.push(d)}
  const data=months.map((d,i)=>{const e=new Date(d.getFullYear(),d.getMonth()+1,1).getTime();const L=H.filter(w=>w.start>=d.getTime()&&w.start<e);return{d,n:L.length,v:L.reduce((a,w)=>a+wVolume(w),0)}});
  const mx=Math.max(1,...data.map(x=>x.v)),Wd=330,Hd=120,top=18,bot=20,step=(Wd-10)/6,bw=Math.min(34,step-12);
  const bars=data.map((x,i)=>{const h=x.v?Math.max(4,x.v/mx*(Hd-top-bot)):3;const X0=5+i*step+(step-bw)/2,y=Hd-bot-h;return`<rect x="${X0.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="5" class="${i===5?'b-on':'b-off'}"/>${x.n?`<text x="${(X0+bw/2).toFixed(1)}" y="${(y-5).toFixed(1)}" text-anchor="middle" class="tv">${x.n}</text>`:''}<text x="${(X0+bw/2).toFixed(1)}" y="${Hd-5}" text-anchor="middle" class="tx">${esc(x.d.toLocaleDateString(LOC,{month:'short'}))}</text>`}).join('');
  return`<section class="card stats"><div class="sec-in"><b class="sth">Statistiques</b><span class="s">depuis le ${fmtShort(H[H.length-1].start)} ${new Date(H[H.length-1].start).getFullYear()}</span></div>
  <div class="stg"><div><span class="k">Séances</span><span class="v">${H.length}</span></div><div><span class="k">Volume total</span><span class="v">${vol>=1e5?fmt(Math.round(vol/100)/10)+' t':fmtVol(vol)}</span></div><div><span class="k">Temps total</span><span class="v">${Math.round(dur/36e5)} h</span></div>
  <div><span class="k">Semaines d'affilée</span><span class="v">${st.cur}</span></div><div><span class="k">Record d'affilée</span><span class="v">${st.best} sem.</span></div><div><span class="k">Moyenne / sem.</span><span class="v">${fmt(Math.round(H.length/Math.max(1,(Date.now()-H[H.length-1].start)/(7*864e5))*10)/10)}</span></div></div>
  <span class="k">Volume par mois (nombre de séances au-dessus)</span><svg class="chart" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="Volume par mois sur 6 mois">${bars}</svg></section>`}


/* ================= Récupération musculaire =================
   Chaque série de travail charge le muscle principal ; la charge redescend linéairement sur 72 h. */
const REC_H=72;
function fatigue(){const f={};for(const m of MAIN_M)f[m]=0;const now=Date.now();
  for(const w of S.history){const h=(now-w.end)/36e5;if(h>REC_H)break;if(h<0)continue;const k=1-h/REC_H;
    for(const e of w.exercises){const X=ex(e.exId);if(!(X.muscle in f))continue;const n=e.sets.filter(s=>s.t!=='w'&&s.done!==false).length;f[X.muscle]+=n*k}}return f}
const recState=v=>v>=6?'tired':v>=2.5?'mid':'ok';
const REC_LBL={tired:'Fatigué',mid:'En récupération',ok:'Prêt'};
function readyIn(m){const now=Date.now();let t=0;for(let h=0;h<=REC_H;h+=3){let v=0;for(const w of S.history){const hh=(now-w.end)/36e5+h;if(hh>REC_H)break;if(hh<0)continue;for(const e of w.exercises){const X=ex(e.exId);if(X.muscle!==m)continue;v+=e.sets.filter(s=>s.t!=='w'&&s.done!==false).length*(1-hh/REC_H)}}if(v<2.5){t=h;break}t=h}return t}
function bodySVG(f,cls){const st=m=>cls?cls(m):`rs-${recState(f[m]||0)}`;
  const fig=(cx,back)=>{const L=[];const E=(m,x,y,rx,ry)=>L.push(`<ellipse class="${m?st(m):'rs-n'}" cx="${cx+x}" cy="${y}" rx="${rx}" ry="${ry}"><title>${m||''}</title></ellipse>`);
    const R=(m,x,y,w,h,r)=>L.push(`<rect class="${m?st(m):'rs-n'}" x="${cx+x}" y="${y}" width="${w}" height="${h}" rx="${r}"><title>${m||''}</title></rect>`);
    L.push(`<circle class="rs-n" cx="${cx}" cy="16" r="10"/><rect class="rs-n" x="${cx-4}" y="25" width="8" height="7" rx="2"/>`);
    for(const sx of[-1,1]){E('Épaules',sx*20,40,8,7);E(back?'Triceps':'Biceps',sx*25,60,5,11);E('Avant-bras',sx*28,84,4.5,12);
      if(back){E('Fessiers',sx*8.5,104,9,8);E('Ischios',sx*9,130,7.5,17);E('Mollets',sx*9,170,6,14)}
      else{E('Pectoraux',sx*9.5,49,10,8);E('Quadriceps',sx*10,128,7.5,19);E(null,sx*9,170,5,14)}}
    if(back){L.push(`<path class="${st('Trapèzes')}" d="M${cx-14} 33 L${cx+14} 33 L${cx+8} 46 L${cx-8} 46 Z"><title>Trapèzes</title></path>`);
      L.push(`<path class="${st('Dos')}" d="M${cx-17} 46 Q${cx} 42 ${cx+17} 46 L${cx+12} 80 Q${cx} 84 ${cx-12} 80 Z"><title>Dos</title></path>`);R('Lombaires',-9,82,18,13,4)}
    else{R('Abdos',-8.5,59,17,36,6);E('Adducteurs',-3.5,116,3,10);E('Adducteurs',3.5,116,3,10);L.push(`<rect class="rs-n" x="${cx-13}" y="95" width="26" height="8" rx="3"/>`)}
    return L.join('')};
  return`<svg class="bodymap" viewBox="0 0 210 196" role="img" aria-label="Récupération des muscles, de face et de dos">${fig(52,false)}${fig(158,true)}<text x="52" y="194" text-anchor="middle" class="tx">Face</text><text x="158" y="194" text-anchor="middle" class="tx">Dos</text></svg>`}
function recCardHTML(){if(!S.history.length)return'';const f=fatigue();const tired=MAIN_M.filter(m=>recState(f[m])==='tired'),ready=MAIN_M.filter(m=>recState(f[m])==='ok'&&['Pectoraux','Dos','Épaules','Quadriceps','Ischios','Fessiers','Biceps','Triceps'].includes(m));
  return`<button class="card recc" data-act="rec-open"><div class="recc-in"><div><span class="k">Récupération</span><span class="v">${tired.length?`${tired.length} muscle${tired.length>1?'s':''} fatigué${tired.length>1?'s':''}`:'Tout est récupéré'}</span><span class="s">${ready.length?'Prêts : '+ready.slice(0,4).map(esc).join(', ')+(ready.length>4?'…':''):'Laisse souffler un peu'}</span></div>${bodySVG(f)}</div></button>`}
function recHTML(){const f=fatigue();const L=MAIN_M.map(m=>[m,f[m],recState(f[m])]).sort((a,b)=>b[1]-a[1]);
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Récupération</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap">${bodySVG(f)}
  <div class="rlegend"><span><i class="rs-tired"></i>Fatigué</span><span><i class="rs-mid"></i>En récupération</span><span><i class="rs-ok"></i>Prêt</span></div>
  <ul class="mlist">${L.map(([m,v,st])=>{const h=st==='ok'?0:readyIn(m);return`<li><span><i class="dot rs-${st}"></i>${esc(m)}</span><b>${st==='ok'?'Prêt':`${REC_LBL[st]} · prêt dans ${h<24?h+' h':Math.round(h/24)+' j'}`}</b></li>`}).join('')}</ul>
  <p class="dtext" style="font-size:13px">Estimation à partir des séries faites ces 3 derniers jours : un muscle bien travaillé récupère en 48 à 72 h. Écoute aussi tes sensations.</p>
  <button class="btn btn-primary block" data-act="gen-open:auto">${icon('zap')}Générer une séance avec les muscles prêts</button></div></div>`}

/* ================= Remplacements suggérés ================= */
const firstWord=n=>norm(n).split(/[\s(:]/)[0];
function suggestReplace(id,n=4){const X=ex(id);if(!X||!X.muscle)return[];const U=usesMap(),F=new Set(S.fav||[]),fw=firstWord(X.name);
  return allEx().filter(y=>y.id!==id&&y.muscle===X.muscle&&!y.rare&&y.type===X.type).map(y=>{let sc=0;if(firstWord(y.name)===fw)sc+=3;if(U[y.id])sc+=2+Math.min(2,U[y.id]/5);if(F.has(y.id))sc+=2;if(y.equip!==X.equip)sc+=1;if(!y.edb)sc+=.5;return[sc,y]})
    .sort((a,b)=>b[0]-a[0]||a[1].name.localeCompare(b[1].name,'fr')).slice(0,n).map(x=>x[1])}

/* ================= Générateur de séance ================= */
const GEN_ZONES={auto:['Selon ma récup',null],full:['Corps entier',['Quadriceps','Pectoraux','Dos','Épaules','Ischios','Fessiers','Biceps','Triceps','Abdos']],
  haut:['Haut du corps',['Pectoraux','Dos','Épaules','Pectoraux','Dos','Biceps','Triceps','Épaules']],bas:['Bas du corps',['Quadriceps','Ischios','Fessiers','Quadriceps','Mollets','Adducteurs','Abdos']],
  push:['Push (pecs, épaules, triceps)',['Pectoraux','Épaules','Pectoraux','Triceps','Épaules','Triceps','Pectoraux']],pull:['Pull (dos, biceps)',['Dos','Dos','Trapèzes','Biceps','Dos','Biceps','Avant-bras']],
  jambes:['Jambes',['Quadriceps','Ischios','Fessiers','Quadriceps','Mollets','Ischios','Abdos']],bras:['Bras',['Biceps','Triceps','Biceps','Triceps','Avant-bras','Biceps','Triceps']],abdos:['Abdos et gainage',['Abdos','Abdos','Lombaires','Abdos','Abdos','Lombaires']]};
const GEN_EQ=[['Barre',['Barre','Barre EZ','Smith']],['Haltères',['Haltères']],['Machines et poulies',['Machine','Poulie']],['Poids du corps',['Poids du corps']],['Kettlebell',['Kettlebell']],['Élastique',['Élastique']]];
const HYBRID=/squat|fente|step-up|burpee|planche|pont|tirage vertical|thruster/;const LEGS=new Set(['Quadriceps','Ischios','Fessiers','Mollets','Adducteurs']);
const COMPOUND=/^(developpe|squat|souleve|rowing|tractions|dips|presse|fentes?|hip thrust|tirage|good morning|epaule|arrache|thruster|hack|pompes)/;
function genWorkout(o){const n={30:4,45:5,60:6,75:7,90:8}[o.dur]||5;const eq=new Set(GEN_EQ.filter(([l])=>o.eq.includes(l)).flatMap(x=>x[1]));const U=usesMap(),F=new Set(S.fav||[]);
  let slots;if(o.zone==='auto'){const f=fatigue();const big=['Quadriceps','Dos','Pectoraux','Ischios','Épaules','Fessiers','Biceps','Triceps','Mollets','Abdos'];const ready=big.filter(m=>recState(f[m])!=='tired').sort((a,b)=>f[a]-f[b]);
    slots=[];for(let i=0;slots.length<n&&i<20;i++)slots.push((ready.length?ready:big)[i%Math.max(1,(ready.length?ready:big).length)])}else slots=GEN_ZONES[o.zone][1];
  while(slots.length<n)slots=slots.concat(slots);slots=slots.slice(0,n);
  const used=new Set(),words=new Set(),out=[];
  slots.forEach((m,i)=>{const wantC=i<Math.ceil(n/2);let C=allEx().filter(x=>x.muscle===m&&eq.has(x.equip)&&!used.has(x.id)&&!x.rare&&x.type!=='c'&&x.type!=='t'||(x.muscle===m&&m==='Abdos'&&x.type==='t'&&eq.has(x.equip)&&!used.has(x.id)&&!x.rare));
    if(!C.length)return;const sc=x=>{let v=Math.random()*2.5;if(COMPOUND.test(norm(x.name))===wantC)v+=3;if(U[x.id])v+=2+Math.min(3,U[x.id]/4);if(F.has(x.id))v+=2.5;if(!x.edb)v+=3;if(words.has(firstWord(x.name)))v-=2.5;if(HYBRID.test(norm(x.name))&&!LEGS.has(m))v-=6;return v};
    C=C.map(x=>[sc(x),x]).sort((a,b)=>b[0]-a[0]);const X=C[0][1];used.add(X.id);words.add(firstWord(X.name));
    const comp=COMPOUND.test(norm(X.name));const reps=X.type==='t'?'45':comp?'8':'12';out.push({exId:X.id,rest:comp?150:75,sets:Array.from({length:comp&&n<=6?4:3},()=>({t:'n',a:'',b:reps}))})});
  return{name:'Séance générée · '+(o.zone==='auto'?'récup':GEN_ZONES[o.zone][0].split(' (')[0].toLowerCase()),exercises:out}}
function genDlg(zone){const g=S.settings.gen||{dur:60,zone:'full',eq:GEN_EQ.map(x=>x[0])};if(zone)g.zone=zone;
  openDlg({title:'Générer une séance',html:`<label class="fld"><span>Durée</span><select class="sel" id="g-dur">${[30,45,60,75,90].map(d=>`<option value="${d}" ${g.dur==d?'selected':''}>${d} min</option>`).join('')}</select></label>
    <label class="fld"><span>Zone</span><select class="sel" id="g-zone">${Object.entries(GEN_ZONES).map(([k,[l]])=>`<option value="${k}" ${g.zone===k?'selected':''}>${l}</option>`).join('')}</select></label>
    <div class="fld"><span>Matériel disponible</span><div class="gen-eq">${GEN_EQ.map(([l])=>`<label class="ck"><input type="checkbox" value="${esc(l)}" ${g.eq.includes(l)?'checked':''}>${esc(l)}</label>`).join('')}</div></div><p class="derr" id="g-err" hidden></p>`,
  buttons:[{label:'Générer',kind:'primary',fn:()=>{const o={dur:+$('#g-dur').value,zone:$('#g-zone').value,eq:[...document.querySelectorAll('.gen-eq input:checked')].map(i=>i.value)};
    if(!o.eq.length){const e=$('#g-err');e.textContent='Coche au moins un matériel.';e.hidden=false;return false}S.settings.gen=o;save();genShow(o,genWorkout(o))}},{label:'Annuler',kind:'soft'}]})}
function genShow(o,W){if(!W.exercises.length)return openDlg({title:'Aucun exercice trouvé',html:'<p class="dtext">Avec ce matériel, je ne trouve rien pour cette zone. Coche plus de matériel.</p>',buttons:[{label:'Modifier',kind:'primary',fn:()=>{genDlg();return false}},{label:'Fermer',kind:'soft'}]});
  ui.gen=W;openDlg({title:W.name,html:`<ol class="genl">${W.exercises.map((e,i)=>{const X=ex(e.exId);return`<li>${avHTML(X)}<span class="xt"><span class="t">${esc(X.name)}</span><span class="s">${e.sets.length} × ${e.sets[0].b}${X.type==='t'?' s':' reps'} · ${esc(X.muscle)}</span></span><button class="icon-btn" data-act="gen-swap:${i}" aria-label="Changer cet exercice">${icon('refresh')}</button></li>`}).join('')}</ol><p class="dtext" style="font-size:13px">Touche ↻ pour changer un exercice.</p>`,
  buttons:[{label:'Démarrer',kind:'primary',fn:()=>{ensureNoActive(()=>startFrom(ui.gen,null))}},{label:'Enregistrer comme routine',kind:'soft',fn:()=>{S.routines.push({id:uid(),name:ui.gen.name.replace('Séance générée · ','Générée · '),exercises:clone(ui.gen.exercises)});save();renderMain();flash('Routine enregistrée')}},{label:'Régénérer',kind:'soft',fn:()=>{genShow(o,genWorkout(o));return false}},{label:'Fermer',kind:'soft'}]})}

/* ================= Planning de la semaine ================= */
const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const dow=t=>(new Date(t).getDay()+6)%7;
function planToday(){const id=(S.plan||{})[dow(Date.now())];return id&&S.routines.find(r=>r.id===id)||null}
function doneOn(d){const a=new Date(d);a.setHours(0,0,0,0);const b=a.getTime()+864e5;return S.history.filter(w=>w.start>=a.getTime()&&w.start<b)}
function planCardHTML(){if(S.active)return'';const P=S.plan||{};const has=Object.values(P).some(Boolean);if(!has)return'';const wk=monday(Date.now()),today=dow(Date.now());
  const strip=DAYS.map((d,i)=>{const t=wk+i*864e5,r=S.routines.find(r=>r.id===P[i]),done=doneOn(t).length,past=i<today;
    return`<div class="pd ${i===today?'today':''} ${done?'done':r&&past?'miss':''}"><span class="pd-d notr">${EN?"MTWTFSS"[i]:d.slice(0,1)}</span><span class="pd-r">${done?'✓':r?esc(r.name.split(/[\s·\-]/)[0].slice(0,6)):'–'}</span></div>`}).join('');
  const r=planToday(),doneToday=doneOn(Date.now()).length;
  return`<section class="card planc"><div class="sec-in"><b class="sth">Ma semaine</b><button class="btn-ghost" data-act="plan-open">Modifier</button></div><div class="pstrip">${strip}</div>
  ${r&&!doneToday?`<div class="mini"><span class="k">Aujourd'hui</span><span class="v">${esc(r.name)}</span><span class="s">${r.exercises.length} exercice${r.exercises.length>1?'s':''}</span></div><button class="btn btn-primary block" data-act="start-routine:${r.id}">${icon('play')}Démarrer</button>`
   :doneToday?`<p class="okline">${icon('check')}Séance du jour faite</p>`:`<p class="dtext" style="font-size:14px">Jour de repos.${(()=>{for(let k=1;k<7;k++){const i=(today+k)%7,rr=S.routines.find(r=>r.id===P[i]);if(rr)return` Prochaine : <b>${esc(rr.name)}</b> ${k===1?'demain':DAYS[i].toLowerCase()}.`}return''})()}</p>`}</section>`}
function planHTML(){const P=S.plan||{};
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Planning</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap"><p class="dtext">Choisis la routine de chaque jour. La séance du jour s'affiche en haut de l'accueil.</p>
  ${S.routines.length?DAYS.map((d,i)=>`<div class="setrow"><span>${d}</span><select class="sel" data-f="plan:${i}"><option value="">Repos</option>${S.routines.map(r=>`<option value="${r.id}" ${P[i]===r.id?'selected':''}>${esc(r.name)}</option>`).join('')}</select></div>`).join('')
   :'<div class="empty"><b>Pas encore de routine</b>Crée d\'abord une routine, ou génère une séance et enregistre-la.</div>'}
  ${Object.values(P).some(Boolean)?'<button class="btn-ghost danger" data-act="plan-clear" style="align-self:flex-start">Vider le planning</button>':''}</div></div>`}

/* ================= Badges ================= */
function badgeDefs(){const H=S.history.slice().sort((a,b)=>a.start-b.start);const out=[];const add=(id,ic,name,desc,ok,t)=>out.push({id,ic,name,desc,ok:!!ok,t:t||0});
  const nth=k=>H[k-1]?H[k-1].start:0;for(const k of[1,10,25,50,100,250,500])add('n'+k,k>=100?'🏆':k>=25?'🥇':'🎖️',k===1?'Première séance':k+' séances',k===1?'Terminer ta première séance':`Terminer ${k} séances`,H.length>=k,nth(k));
  let cum=0,tv={};for(const w of H){cum+=wVolume(w);for(const k of[10,50,100,500,1000])if(cum>=k*1000&&!tv[k])tv[k]=w.start}
  for(const k of[10,50,100,500,1000])add('v'+k,'🏋️',`${k} tonnes`,`Soulever ${k} tonnes au total`,cum>=k*1000,tv[k]);
  const st=weekStreaks();for(const k of[4,8,12,26,52])add('s'+k,'🔥',`${k} semaines d'affilée`,`S'entraîner ${k} semaines de suite`,st.best>=k);
  const pr=H.reduce((a,w)=>a+(w.prs||[]).length,0);for(const k of[10,50,100])add('p'+k,'⭐',`${k} records`,`Battre ${k} records personnels`,pr>=k);
  const mx=ids=>{let m=0;for(const w of H)for(const e of w.exercises)if(ids.includes(e.exId))for(const s of e.sets)if(s.t!=='w'&&s.done!==false&&+s.b>0)m=Math.max(m,+s.a||0);return m};
  const lifts=[['bench','Couché',LIFTS[0][1],[60,80,100,120,140]],['squat','Squat',LIFTS[1][1],[60,100,140,180]],['dl','Soulevé de terre',LIFTS[2][1],[100,140,180,220]]];
  for(const[k,n,ids,steps]of lifts){const m=mx(ids);for(const v of steps)add(k+v,'💪',`${n} ${v} kg`,`Faire au moins une rep à ${v} kg au ${n.toLowerCase()}`,m>=v)}
  const bigS=H.find(w=>wVolume(w)>=10000);add('big','🦍','Grosse séance','Soulever 10 tonnes en une seule séance',bigS,bigS&&bigS.start);
  const early=H.find(w=>new Date(w.start).getHours()<7);add('early','🌅','Lève-tôt','Commencer une séance avant 7 h',early,early&&early.start);
  const late=H.find(w=>new Date(w.start).getHours()>=22);add('late','🌙','Noctambule','Commencer une séance après 22 h',late,late&&late.start);
  const longS=H.find(w=>w.end-w.start>=2*36e5);add('long','⏱️','Marathonien','Faire une séance de plus de 2 h',longS,longS&&longS.start);
  const nb=new Set(H.flatMap(w=>w.exercises.map(e=>e.exId))).size;for(const k of[25,50,100])add('x'+k,'🧭',`${k} exercices`,`Essayer ${k} exercices différents`,nb>=k);
  const wkMax=(()=>{const c={};for(const w of H){const m=monday(w.start);c[m]=(c[m]||0)+1}return Math.max(0,...Object.values(c))})();add('w5','⚡','Semaine de feu','Faire 5 séances dans la même semaine',wkMax>=5);
  add('friends','🤝','En équipe','Ajouter un pote au classement',(S.friends||[]).length>0);
  return out}
function badgesCardHTML(){if(!S.history.length)return'';const B=badgeDefs(),ok=B.filter(b=>b.ok);const last=ok.slice().sort((a,b)=>b.t-a.t)[0];
  return`<button class="card lbcard" data-act="badges-open"><span class="bdg-ic">${last?last.ic:'🎖️'}</span><span><b>Badges</b><span class="muted">${ok.length} sur ${B.length} débloqués${last?' · dernier : '+esc(last.name):''}</span></span>${icon('chevr')}</button>`}
function badgesHTML(){const B=badgeDefs();const ok=B.filter(b=>b.ok).length;
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Badges</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap"><p class="dtext"><b>${ok} sur ${B.length}</b> débloqués.</p><div class="bgrid">${B.map(b=>`<div class="bdg ${b.ok?'on':''}"><span class="bi">${b.ok?b.ic:'🔒'}</span><b>${esc(b.name)}</b><span>${esc(b.desc)}</span>${b.ok&&b.t?`<em>${esc(fmtShort(b.t))} ${new Date(b.t).getFullYear()}</em>`:''}</div>`).join('')}</div></div></div>`}
function checkBadges(silent){const B=badgeDefs().filter(b=>b.ok).map(b=>b.id);if(!Array.isArray(S.badges)){S.badges=B;save();return[]}
  const nw=B.filter(id=>!S.badges.includes(id));if(!nw.length)return[];S.badges=S.badges.concat(nw);save();if(silent)return nw;
  const D=badgeDefs().filter(b=>nw.includes(b.id));setTimeout(()=>{if(MODAL&&MODAL.title==='Séance enregistrée'){const d=$('#dlg .dlg');if(d){const el=document.createElement('div');el.className='prs bdgnew';el.innerHTML=`<p class="prs-h">🎉 Nouveau badge${D.length>1?'s':''}</p><ul>${D.map(b=>`<li><span>${b.ic} ${esc(b.name)}</span><b>${esc(b.desc)}</b></li>`).join('')}</ul>`;d.querySelector('.dbtns').before(el)}}else flash(`🎉 Nouveau badge : ${D[0].name}`)},400);return nw}


/* ================= Échauffement guidé ================= */
const WARM={gen:[['Jumping jacks',45,'Saute en écartant bras et jambes, puis reviens. Rythme régulier, respire.','saut-jumping-jack'],
  ['Montées de genoux sur place',30,'Monte les genoux à hauteur de hanches, bras qui accompagnent.','haut-genou-mur']],
 haut:[['Cercles de bras',30,'Bras tendus sur les côtés : 15 s de petits cercles vers l\'avant, 15 s vers l\'arrière, de plus en plus grands.','cercles-de-bras'],
  ['Rotations d\'épaules',30,'Haussements puis rotations lentes des épaules vers l\'arrière, nuque relâchée.',null],
  ['Chat-vache',40,'À quatre pattes : creuse le dos en inspirant, arrondis-le en expirant, lentement.','chat-vache'],
  ['Pompes inclinées lentes',40,'Mains sur un banc : 8 à 10 pompes en 3 s de descente, sans forcer.','pompes-inclinees'],
  ['Ouverture thoracique',40,'À quatre pattes, une main derrière la tête : ouvre le coude vers le plafond en suivant du regard. Change de côté à mi-temps.',null],
  ['Y-T-W au sol',40,'Allongé sur le ventre, bras tendus : lève-les en Y, puis en T, puis en W, 2 s en haut à chaque fois.',null],
  ['Rotation externe élastique',40,'Coude collé au corps, fais pivoter l\'avant-bras vers l\'extérieur. 12 reps par bras.','rotation-externe-elastique']],
 bas:[['Squats lents au poids du corps',40,'Descends en 3 s, poitrine haute, genoux dans l\'axe des pieds. 10 à 12 reps.','squat-poids-du-corps'],
  ['Balancier de jambe',40,'Appuyé au mur, balance une jambe d\'avant en arrière puis de côté. Change de jambe à mi-temps.','balancier-de-jambe-lateral'],
  ['Fentes arrière alternées',40,'Grand pas en arrière, genou arrière proche du sol, buste droit.','fentes-arriere-halteres'],
  ['Meilleur étirement du monde',40,'Fente avant, main au sol, coude vers la cheville puis rotation du buste bras au ciel. Alterne.','world-s-greatest-stretch'],
  ['Pont fessier',40,'Allongé, pieds à plat : monte le bassin en serrant les fessiers, 2 s en haut. 12 reps.','pont-fessier'],
  ['Cercles de chevilles',20,'Sur une jambe, fais tourner la cheville dans un sens puis dans l\'autre. Change de pied.','cercles-ankle']],
 tronc:[['Bird dog',40,'À quatre pattes, tends bras et jambe opposés, 2 s, puis change. Dos plat.','bird-dog'],
  ['Dead bug',40,'Sur le dos, bas du dos plaqué au sol : descends bras et jambe opposés lentement.','dead-bug']]};
const ZONE_OF={Pectoraux:'haut',Dos:'haut',Épaules:'haut',Trapèzes:'haut',Biceps:'haut',Triceps:'haut','Avant-bras':'haut',Quadriceps:'bas',Ischios:'bas',Fessiers:'bas',Mollets:'bas',Adducteurs:'bas',Abdos:'tronc',Lombaires:'tronc'};
function warmTarget(){const src=S.active||planToday()||(nextRoutine()||{}).r||null;const z={haut:0,bas:0,tronc:0};
  if(src)for(const e of src.exercises){const k=ZONE_OF[ex(e.exId).muscle];if(k)z[k]+=1}
  if(!z.haut&&!z.bas)z.haut=z.bas=1;return{src,z}}
function warmPlan(){const{src,z}=warmTarget();const pick=(L,n)=>L.slice(0,n);const tot=z.haut+z.bas||1;
  let nh=z.haut?Math.round(5*z.haut/tot):0,nb=z.bas?5-nh:0;if(z.haut&&!nh){nh=1;nb--}if(z.bas&&!nb){nb=1;nh--}
  const L=[...WARM.gen,...pick(WARM.haut,nh),...pick(WARM.bas,nb),...(z.tronc||(nh&&nb)?[WARM.tronc[0]]:[])];
  const pool=[...(nh?WARM.haut.slice(nh):[]),...(nb?WARM.bas.slice(nb):[]),...WARM.tronc.filter(x=>!L.includes(x))];let sec=L.reduce((a,x)=>a+x[1],0);while(sec<285&&pool.length){const x=pool.shift();if(!L.includes(x)){L.push(x);sec+=x[1]}}
  return{title:src?'Échauffement · '+src.name:'Échauffement complet',zone:nh&&nb?'haut et bas du corps':nh?'haut du corps':'bas du corps',moves:L.map(([n,sec,how,id])=>({n,sec,how,id}))}}
let WU=null;
function warmStart(){WU={...warmPlan(),i:0,left:0,paused:false,t:null};WU.left=WU.moves[0].sec;pushDetail({kind:'warm'});warmTick(true)}
function warmTick(first){clearInterval(WU&&WU.t);if(!WU)return;WU.t=setInterval(()=>{if(!WU||WU.paused)return;WU.left--;
  if(WU.left<=3&&WU.left>0)vib('tap');
  if(WU.left<=0){try{if(S.settings.sound){ensureAudio();beep()}}catch(e){}vib('heavy');warmGo(1);return}warmDraw()},1000);warmDraw()}
function warmGo(d){if(!WU)return;WU.i+=d;if(WU.i<0)WU.i=0;if(WU.i>=WU.moves.length){clearInterval(WU.t);WU.done=true;renderDetail();return}WU.left=WU.moves[WU.i].sec;renderDetail();warmTick()}
function warmDraw(){const c=$('#wu-left'),r=$('#wu-ring');if(!WU||!c)return;const m=WU.moves[WU.i];c.textContent=WU.left;if(r)r.style.strokeDashoffset=String(289*(1-WU.left/m.sec))}
function warmHTML(){if(!WU)return'';const head=`<div class="sheet-head"><button class="btn-ghost" data-act="wu-close">${icon('chev-down')}Fermer</button><div class="sh-title">Échauffement</div><span style="width:70px"></span></div>`;
  if(WU.done)return head+`<div class="sheet-body"><div class="wrapx dwrap"><div class="empty">${icon('check')}<b>Échauffement terminé</b>Fais ensuite 1 ou 2 séries légères du premier exercice avant les séries de travail.</div>
    ${S.active?`<button class="btn btn-primary block" data-act="wu-close">${icon('play')}Retour à la séance</button>`:planToday()&&!doneOn(Date.now()).length?`<button class="btn btn-primary block" data-act="start-routine:${planToday().id}">${icon('play')}Démarrer ${esc(planToday().name)}</button>`:''}</div></div>`;
  const m=WU.moves[WU.i],nx=WU.moves[WU.i+1],X=m.id&&EXI[m.id]?ex(m.id):null,tot=WU.moves.reduce((a,x)=>a+x.sec,0);
  return head+`<div class="sheet-body"><div class="wrapx dwrap wu">
    <p class="eyebrow">${esc(WU.title)} · ${Math.round(tot/60)} min · ${esc(WU.zone)}</p>
    <div class="wu-prog">${WU.moves.map((x,i)=>`<i class="${i<WU.i?'on':i===WU.i?'cur':''}"></i>`).join('')}</div>
    <h2 class="wu-name">${esc(m.n)}</h2>
    <div class="wu-row">${X?mediaHTML(X).replace(/<figcaption>[\s\S]*?<\/figcaption>/,''):''}
      <svg class="wu-timer" viewBox="0 0 100 100" aria-label="Temps restant"><circle cx="50" cy="50" r="46" class="wu-bg"/><circle id="wu-ring" cx="50" cy="50" r="46" class="wu-fg" style="stroke-dasharray:289;stroke-dashoffset:${289*(1-WU.left/m.sec)}"/><text x="50" y="58" text-anchor="middle" id="wu-left">${WU.left}</text></svg></div>
    <p class="dtext">${esc(m.how)}</p>
    ${nx?`<p class="wu-next">Ensuite : <b>${esc(nx.n)}</b> · ${nx.sec} s</p>`:'<p class="wu-next">Dernier mouvement</p>'}
    <div class="btnrow wu-btns"><button class="btn btn-soft" data-act="wu-go:-1" ${WU.i?'':'disabled'}>Précédent</button><button class="btn btn-primary" data-act="wu-pause">${WU.paused?'Reprendre':'Pause'}</button><button class="btn btn-soft" data-act="wu-go:1">Suivant</button></div>
  </div></div>`}

/* ================= Vidéos de démonstration ================= */
function videoUrl(X){const own=(S.vids||{})[X.id];if(own)return own;const q=X.name.replace(/\s*\(.*?\)/g,'')+' exercice musculation technique';return'https://www.youtube.com/results?search_query='+encodeURIComponent(q)}
function videoHTML(X){if(!X||!X.name||X.name==='Exercice supprimé')return'';const own=(S.vids||{})[X.id];
  return`<div class="vidrow"><a class="btn btn-soft" href="${esc(videoUrl(X))}" target="_blank" rel="noopener">${icon('play')}${own?'Ma vidéo de démo':'Voir des démos vidéo'}</a><button class="btn-ghost" data-act="vid-set:${X.id}">${own?'Changer':'Lier ma vidéo'}</button></div>`}
function vidDlg(id){const X=ex(id),cur=(S.vids||{})[id]||'';openDlg({title:'Vidéo de démo',html:`<p class="dtext">Colle le lien d'une vidéo YouTube (ou autre) qui montre bien <b>${esc(X.name)}</b>. Elle s'ouvrira à la place de la recherche.</p><input id="vid-u" class="ta" style="height:48px" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://youtu.be/…" value="${esc(cur)}" autofocus><p class="derr" id="vid-err" hidden></p>`,
  buttons:[{label:'Enregistrer',kind:'primary',fn:()=>{const v=$('#vid-u').value.trim();if(v&&!/^https?:\/\/\S+\.\S+/.test(v)){const e=$('#vid-err');e.textContent='Colle un lien complet qui commence par https://';e.hidden=false;return false}
    S.vids=S.vids||{};if(v)S.vids[id]=v;else delete S.vids[id];save();renderDetail();flash(v?'Vidéo liée':'Vidéo retirée')}},...(cur?[{label:'Retirer ma vidéo',kind:'danger',fn:()=>{delete S.vids[id];save();renderDetail()}}]:[]),{label:'Annuler',kind:'soft'}]})}


/* ================= Compte Google (Firebase) =================
   Connexion Google, sauvegarde de toutes les données dans Firestore (users/{uid}, découpée en morceaux),
   profil public du classement dans profiles/{uid}. Le SDK n'est chargé que si on s'en sert. */
const FB_CFG={apiKey:"AIzaSyB0fistX1NNnG_HcausCgfNKbSyRd13eZo",authDomain:"carnet-de-fonte-472c8.firebaseapp.com",projectId:"carnet-de-fonte-472c8",storageBucket:"carnet-de-fonte-472c8.firebasestorage.app",messagingSenderId:"812422167533",appId:"1:812422167533:web:3897c46ed8f069cc4a05e4"};
const FB_V='13.1.0',FB_CHUNK=700000;
let FB=null,fbUser=null,fbTimer=null,fbBusy=false,fbPending=false,fbReady=null;
const fbOn=()=>!!(fbUser&&S.settings.fbUid&&fbUser.uid===S.settings.fbUid);
function fbFlag(v){try{v?localStorage.setItem('fonte-fb','1'):localStorage.removeItem('fonte-fb')}catch(e){}}
function fbWanted(){try{return localStorage.getItem('fonte-fb')==='1'}catch(e){return false}}
function fbLoad(){if(fbReady)return fbReady;const b=`https://www.gstatic.com/firebasejs/${FB_V}/`;
  fbReady=Promise.all([import(b+'firebase-app.js'),import(b+'firebase-auth.js'),import(b+'firebase-firestore.js')]).then(([ap,au,fs])=>{const app=ap.initializeApp(FB_CFG);
    FB={au,fs,A:au.getAuth(app),D:fs.getFirestore(app)};try{FB.A.languageCode='fr'}catch(e){}
    return new Promise(ok=>{let first=true;au.onAuthStateChanged(FB.A,u=>{fbUser=u||null;if(first){first=false;ok(FB)}if(ui.tab==='reglages')renderMain()})})})
    .catch(e=>{fbReady=null;throw new Error('Impossible de joindre Google. Vérifie ta connexion internet.')});return fbReady}
const NATIVE_G=()=>!!(NATIVE&&CP.FirebaseAuthentication);
async function fbNativeCred(){const r=await CP.FirebaseAuthentication.signInWithGoogle();const t=r&&r.credential&&r.credential.idToken;if(!t)throw new Error('Connexion Google annulée.');return FB.au.GoogleAuthProvider.credential(t)}
async function fbSignIn(){const b=document.querySelector('[data-act="fb-login"]');
  if(NATIVE_G()){if(b){b.disabled=true;b.textContent='Connexion…'}try{await fbLoad();const c=await fbNativeCred();const r=await FB.au.signInWithCredential(FB.A,c);await fbAfterLogin(r.user)}catch(e){fbLoginErr(e)}return}
  /* iPhone : la fenêtre Google doit s'ouvrir directement au toucher, sinon Safari la bloque sans rien dire */
  if(FB)return fbPopup();
  if(b){b.disabled=true;b.textContent='Préparation…'}
  try{await fbLoad()}catch(e){return fbLoginErr(e)}
  if(b){b.disabled=false;b.textContent='Se connecter avec Google'}
  openDlg({title:'Connexion Google',html:'<p class="dtext">Tout est prêt. Touche le bouton pour choisir ton compte Google.</p>',buttons:[{label:'Continuer avec Google',kind:'primary',fn:()=>{fbPopup()}},{label:'Annuler',kind:'soft'}]})}
function fbPopup(){const p=new FB.au.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
  FB.au.signInWithPopup(FB.A,p).then(cred=>fbAfterLogin(cred.user)).catch(e=>{
    if(/popup-blocked/.test(e.code||''))return openDlg({title:'Fenêtre bloquée',html:'<p class="dtext">Ton téléphone a bloqué la fenêtre Google. Touche à nouveau le bouton.</p>',buttons:[{label:'Continuer avec Google',kind:'primary',fn:()=>{fbPopup()}},{label:'Annuler',kind:'soft'}]});
    fbLoginErr(e)})}
function fbLoginErr(e){const b=document.querySelector('[data-act="fb-login"]');if(b){b.disabled=false;b.textContent='Se connecter avec Google'}renderMain();if(/popup-closed|cancelled-popup/.test(e&&e.code||''))return;
  openDlg({title:'Connexion impossible',html:`<p class="dtext">${esc(fbErr(e))}</p><p class="muted" style="font-size:12px">${esc((e&&e.code)||'')}</p>`,buttons:[{label:'OK',kind:'primary'}]})}
function fbErr(e){const c=e&&e.code||'';if(/unauthorized-domain/.test(c))return'Ce site n\'est pas autorisé dans Firebase : ajoute baboulinet05.github.io dans Authentication → Paramètres → Domaines autorisés.';
  if(/operation-not-allowed/.test(c))return'La connexion Google n\'est pas activée dans Firebase (Authentication → Sign-in method → Google).';if(/permission-denied/.test(c))return'Firebase a refusé l\'accès : vérifie les règles Firestore.';
  if(/network/.test(c))return'Pas de connexion internet.';return(e&&e.message)||'Erreur inconnue.'}
async function fbAfterLogin(u){fbUser=u;S.settings.fbUid=u.uid;S.settings.fbEmail=u.email||'';S.settings.fbName=u.displayName||'';fbFlag(true);save();
  let d=null;try{d=await fbRead()}catch(e){if(!/introuvable/.test(e.message))throw e}
  if(!d){await fbPush(true);renderMain();return openDlg({title:'Compte Google connecté',html:`<p class="dtext">Connecté avec <b>${esc(u.email||'ton compte Google')}</b>. Tes données sont maintenant sauvegardées automatiquement après chaque modification.</p>`,buttons:[{label:'Super',kind:'primary'}]})}
  const n=(d.history||[]).length;if(!S.history.length){applyCloud(d);return flash(`${n} séance${n>1?'s':''} restaurée${n>1?'s':''}`)}
  openDlg({title:'Sauvegarde trouvée',html:`<p class="dtext">Ton compte Google contient déjà une sauvegarde : <b>${n} séance${n>1?'s':''}</b>. Ce téléphone en a <b>${S.history.length}</b>.</p>`,
    buttons:[{label:'Récupérer la sauvegarde',kind:'primary',fn:()=>{applyCloud(d);flash('Données récupérées')}},{label:'Garder ce téléphone',kind:'soft',fn:()=>{fbPush('force')}}]})}
async function fbPush(manual){if(!fbOn())return;if(manual==='force')fbConflictShown=false;if(fbBusy){fbPending=true;return}fbBusy=true;clearTimeout(fbTimer);
  try{const{fs,D}=FB,uid=fbUser.uid,txt=cloudPayload(),parts=[];for(let i=0;i<txt.length;i+=FB_CHUNK)parts.push(txt.slice(i,i+FB_CHUNK));
    const meta=await fs.getDoc(fs.doc(D,'users',uid));const oldN=meta.exists()?(meta.data().n||0):0;
    const cloudN=meta.exists()?(meta.data().sessions||0):0,locN=S.history.length;if(manual!=='force'&&cloudN>0&&(locN===0||(cloudN-locN>=3&&locN<cloudN/2))){fbBusy=false;fbPending=false;return fbConflict(cloudN)}
    const bt=fs.writeBatch(D);parts.forEach((p,i)=>bt.set(fs.doc(D,'users',uid,'chunks',String(i)),{d:p}));for(let i=parts.length;i<oldN;i++)bt.delete(fs.doc(D,'users',uid,'chunks',String(i)));
    bt.set(fs.doc(D,'users',uid),{n:parts.length,saved:Date.now(),ver:APP_VERSION,sessions:S.history.length});await bt.commit();
    S.settings.lastSync=Date.now();S.settings.lastExport=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(manual===true&&ui.tab==='reglages')renderMain();if(manual==='flash')flash('Sauvegardé sur ton compte Google')}
  catch(e){if(manual)openDlg({title:'Sauvegarde impossible',html:`<p class="dtext">${esc(fbErr(e))}</p>`,buttons:[{label:'OK',kind:'primary'}]})}
  finally{fbBusy=false;if(fbPending){fbPending=false;fbTimer=setTimeout(()=>fbPush(),3000)}}}
let fbConflictShown=false;
function fbConflict(cloudN){if(fbConflictShown)return;fbConflictShown=true;const n=S.history.length;
  openDlg({title:'Sauvegarde Google trouvée',html:`<p class="dtext">Ton compte Google contient <b>${cloudN} séance${cloudN>1?'s':''}</b>, ce téléphone <b>${n}</b>. Pour ne rien perdre, la sauvegarde Google n'a pas été remplacée.</p>`,
    buttons:[{label:'Récupérer mes séances',kind:'primary',fn:async()=>{try{const d=await fbRead();applyCloud(d);const k=(d.history||[]).length;flash(`${k} séance${k>1?'s':''} restaurée${k>1?'s':''}`)}catch(e){openDlg({title:'Récupération impossible',html:`<p class="dtext">${esc(fbErr(e))}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}},
      {label:'Plus tard',kind:'soft'},{label:'Remplacer par ce téléphone',kind:'soft',fn:()=>confirmDlg('Remplacer la sauvegarde Google ?',`Les ${cloudN} séances de ton compte Google seront remplacées par les ${n} de ce téléphone.`,'Remplacer',()=>{fbConflictShown=false;fbPush('force')})}]})}
async function fbRead(){await fbLoad();const{fs,D}=FB,uid=fbUser.uid;const m=await fs.getDoc(fs.doc(D,'users',uid));if(!m.exists())throw new Error('introuvable');
  const n=m.data().n||0;const P=await Promise.all(Array.from({length:n},(_,i)=>fs.getDoc(fs.doc(D,'users',uid,'chunks',String(i)))));const txt=P.map(x=>x.exists()?x.data().d:'').join('');const j=JSON.parse(txt);return j.data||j}
async function fbDeleteAccount(){if(!fbOn())return flash('Connecte-toi d\'abord avec Google');const{fs,D,au,A}=FB,uid=fbUser.uid;
  try{const m=await fs.getDoc(fs.doc(D,'users',uid));const n=m.exists()?(m.data().n||0):0;const bt=fs.writeBatch(D);for(let i=0;i<Math.max(n,8);i++)bt.delete(fs.doc(D,'users',uid,'chunks',String(i)));
    try{const L=await fs.getDocs(fs.collection(D,'users',uid,'days'));for(const d of L.docs){const n2=d.data().n||0;for(let i=0;i<Math.max(n2,8);i++)bt.delete(fs.doc(D,'users',uid,'days',d.id,'chunks',String(i)));bt.delete(fs.doc(D,'users',uid,'days',d.id))}}catch(e){}
    bt.delete(fs.doc(D,'users',uid));bt.delete(fs.doc(D,'profiles',uid));await bt.commit();
    for(const f of S.friends||[])if(!isGist(f.id))try{await fs.deleteDoc(fs.doc(D,'invites',f.id,'from',uid))}catch(e){}
    try{const L=await fs.getDocs(fs.collection(D,'invites',uid,'from'));for(const d of L.docs)try{await fs.deleteDoc(fs.doc(D,'invites',uid,'from',d.id))}catch(e){}}catch(e){}
    try{await au.deleteUser(fbUser)}catch(e){if(!/requires-recent-login/.test(e.code||''))throw e;
      const c=NATIVE_G()?await fbNativeCred():null;if(c)await au.reauthenticateWithCredential(fbUser,c);else{const p=new au.GoogleAuthProvider();await au.reauthenticateWithPopup(fbUser,p)}await au.deleteUser(fbUser)}
    S.settings.lbFb=false;await fbSignOut();openDlg({title:'Compte supprimé',html:'<p class="dtext">Ton compte et toutes tes données en ligne (sauvegarde et profil du classement) ont été supprimés. Tes séances restent sur ce téléphone : utilise <b>Tout effacer</b> si tu veux aussi les retirer.</p>',buttons:[{label:'OK',kind:'primary'}]})}
  catch(e){openDlg({title:'Suppression impossible',html:`<p class="dtext">${esc(fbErr(e))}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}
async function fbSignOut(){try{await fbLoad();await FB.au.signOut(FB.A)}catch(e){}try{if(NATIVE_G())await CP.FirebaseAuthentication.signOut()}catch(e){}fbUser=null;S.settings.fbUid='';S.settings.fbEmail='';S.settings.fbName='';fbFlag(false);save();renderMain()}
/* au démarrage : retrouver la session Google et finir une connexion par redirection */
if((!NATIVE||NATIVE_G())&&fbWanted())setTimeout(()=>{fbLoad().then(async()=>{try{const r=await FB.au.getRedirectResult(FB.A);if(r&&r.user)await fbAfterLogin(r.user)}catch(e){}
  if(fbUser&&!S.settings.fbUid){S.settings.fbUid=fbUser.uid;save()}if(fbOn()&&(!S.settings.lastSync||Date.now()-S.settings.lastSync>6*36e5))fbPush();if(fbOn())setTimeout(fbBackupDaily,5000)}).catch(()=>{})},1200);


/* ================= Accueil guidé : 4 questions → un programme ================= */
const ONB_Q=[
 ['goal','Ton objectif ?',[['muscle','💪 Prendre du muscle'],['force','🏋️ Gagner en force'],['seche','🔥 Perdre du gras'],['forme','🌿 Garder la forme']]],
 ['lvl','Ton niveau ?',[['deb','Débutant · moins de 6 mois'],['inter','Intermédiaire · 6 mois à 2 ans'],['conf','Confirmé · plus de 2 ans']]],
 ['where','Où t\'entraînes-tu ?',[['salle','Salle de sport complète'],['maison','Maison avec haltères'],['pdc','Au poids du corps']]],
 ['days','Combien de séances par semaine ?',[['2','2 séances'],['3','3 séances'],['4','4 séances'],['5','5 séances'],['6','6 séances']]]];
const ONB_EQ={salle:GEN_EQ.map(x=>x[0]),maison:['Haltères','Poids du corps','Élastique','Kettlebell'],pdc:['Poids du corps','Élastique']};
const ONB_DAYS={2:[0,3],3:[0,2,4],4:[0,1,3,4],5:[0,1,2,4,5],6:[0,1,2,3,4,5]};
function onbSplit(n,lvl){if(n<=2)return[['Full body A','full'],['Full body B','full']];if(n===3)return lvl==='deb'?[['Full body A','full'],['Full body B','full'],['Full body C','full']]:[['Haut du corps','haut'],['Bas du corps','bas'],['Full body','full']];
  if(n===4)return[['Haut A','haut'],['Bas A','bas'],['Haut B','haut'],['Bas B','bas']];if(n===5)return[['Push','push'],['Pull','pull'],['Jambes','jambes'],['Haut du corps','haut'],['Bas du corps','bas']];
  return[['Push A','push'],['Pull A','pull'],['Jambes A','jambes'],['Push B','push'],['Pull B','pull'],['Jambes B','jambes']]}
function onbProgram(o){const n=+o.days,eq=ONB_EQ[o.where],dur=o.lvl==='deb'?45:o.lvl==='inter'?60:75;
  const reps={force:[5,8,180,90],muscle:[8,12,150,75],seche:[12,15,75,45],forme:[10,12,90,60]}[o.goal];
  return onbSplit(n,o.lvl).map(([name,zone])=>{const W=genWorkout({dur,zone,eq});W.exercises.forEach(e=>{const X=ex(e.exId),comp=COMPOUND.test(norm(X.name));
      const nS=o.lvl==='deb'?3:comp&&o.goal==='force'?5:comp?4:3;e.rest=comp?reps[2]:reps[3];e.sets=Array.from({length:nS},()=>({t:'n',a:'',b:X.type==='t'?'40':String(comp?reps[0]:reps[1])}))});
    return{id:uid(),name,exercises:W.exercises}})}
function onbShouldShow(){if(S.settings.onboarded)return false;if(S.history.length||S.custom.length||S.routines.some(r=>!/· exemple$/.test(r.name))){S.settings.onboarded=1;save();return false}return true}
function onbHTML(){const o=ui.onb||(ui.onb={step:0,a:{}});const top=`<div class="sheet-head"><button class="btn-ghost" data-act="onb-skip">Passer</button><div class="sh-title">${o.step&&o.step<=ONB_Q.length?`${o.step} / ${ONB_Q.length}`:''}</div><span style="width:70px"></span></div>`;
  if(o.step===0)return top+`<div class="sheet-body"><div class="wrapx dwrap onb"><div class="onb-hero"><img src="media/logo.svg" alt="" class="onb-logo"><h1>Carnet de fonte</h1><p>Ton carnet de muscu : 1 600 exercices, tes records, ta progression. Gratuit, sans pub, sans abonnement.</p></div>
    <p class="dtext">Réponds à 4 questions et je te prépare un programme complet, avec ton planning de la semaine.</p>
    <button class="btn btn-primary block lg" data-act="onb-next">C'est parti</button><button class="btn btn-soft block" data-act="onb-restore">J'ai déjà une sauvegarde</button></div></div>`;
  if(o.step<=ONB_Q.length){const[k,q,opts]=ONB_Q[o.step-1];return top+`<div class="sheet-body"><div class="wrapx dwrap onb"><div class="wu-prog">${ONB_Q.map((_,i)=>`<i class="${i<o.step-1?'on':i===o.step-1?'cur':''}"></i>`).join('')}</div><h2 class="onb-q">${q}</h2>
    <div class="onb-opts">${opts.map(([v,l])=>`<button class="onb-opt ${o.a[k]===v?'on':''}" data-act="onb-pick:${k}:${v}">${l}</button>`).join('')}</div>
    ${o.step===ONB_Q.length?`<label class="fld"><span>Ton poids (facultatif, pour les calories)</span><input id="onb-kg" type="text" inputmode="decimal" placeholder="ex. 78" value="${esc(o.a.kg||'')}"></label><button class="btn btn-primary block lg" data-act="onb-build" ${o.a.days?'':'disabled'}>Créer mon programme</button>`:''}
    ${o.step>1?'<button class="btn-ghost" data-act="onb-back" style="align-self:flex-start">Retour</button>':''}</div></div>`}
  const R=o.prog||[];const d=ONB_DAYS[R.length]||[];
  return top+`<div class="sheet-body"><div class="wrapx dwrap onb"><h2 class="onb-q">Ton programme est prêt</h2><p class="dtext">${R.length} séances par semaine. Tu peux tout modifier ensuite dans tes routines.</p>
    ${R.map((r,i)=>`<section class="card onb-r"><div class="onb-rh"><b>${esc(r.name)}</b><span class="muted">${DAYS[d[i]]||''}</span></div><p class="rc-ex">${esc(r.exercises.map(e=>ex(e.exId).name).join(' · '))}</p><span class="rc-meta">${r.exercises.length} exercices · ${r.exercises[0]?r.exercises[0].sets.length+' × '+r.exercises[0].sets[0].b:''}</span></section>`).join('')}
    <button class="btn btn-primary block lg" data-act="onb-go">${icon('play')}Démarrer ma première séance</button><button class="btn btn-soft block" data-act="onb-done">Voir mes routines</button><button class="btn-ghost" data-act="onb-build" style="align-self:center">${icon('refresh')}Proposer d'autres exercices</button></div></div>`}
function onbSave(){const o=ui.onb,R=o.prog||[];S.routines=S.routines.filter(r=>!/· exemple$/.test(r.name)).concat(R);S.plan={};(ONB_DAYS[R.length]||[]).forEach((d,i)=>{if(R[i])S.plan[d]=R[i].id});
  S.settings.weekGoal=R.length;S.settings.onboarded=1;S.settings.profile={goal:o.a.goal,lvl:o.a.lvl,where:o.a.where};if(S.settings.profile.goal==='force'){S.settings.repLo=3;S.settings.repHi=6}else if(S.settings.profile.goal==='seche'){S.settings.repLo=12;S.settings.repHi=15}
  const kg=num(o.a.kg);if(kg>30&&kg<300)S.body=(S.body||[]).concat([{id:uid(),t:Date.now(),kg}]);save()}
function onbStart(){ui.onb={step:0,a:{}};pushDetail({kind:'onb'})}


/* ================= Semaine de décharge =================
   Proposée après 6 semaines d'affilée d'entraînement, ou quand 3 exercices ou plus stagnent. */
const deloadOn=()=>!!(S.settings.deloadUntil&&Date.now()<S.settings.deloadUntil);
function deloadWhy(){if(deloadOn()||(S.settings.deloadSnooze||0)>Date.now()||S.history.length<12)return null;
  const last=S.settings.deloadLast||0;if(Date.now()-last<35*864e5)return null;
  const ids=[...new Set(S.history.slice(0,25).flatMap(w=>w.exercises.map(e=>e.exId)))];const stuck=ids.filter(id=>plateauFor(id)).length;
  const run=weekStreaks().cur;if(stuck>=3)return{t:'stuck',n:stuck};if(run>=6&&Date.now()-last>42*864e5)return{t:'run',n:run};return null}
function deloadCardHTML(){if(S.active)return'';if(deloadOn()){const d=Math.ceil((S.settings.deloadUntil-Date.now())/864e5);
    return`<section class="card dlc on"><div><b>Semaine de décharge</b><span>Encore ${d} jour${d>1?'s':''} : charges proposées allégées d'environ 15 %, garde de la marge sur chaque série.</span></div><button class="btn-ghost" data-act="dl-stop">Arrêter</button></section>`}
  const w=deloadWhy();if(!w)return'';
  return`<section class="card dlc"><div><b>Une semaine plus légère ?</b><span>${w.t==='stuck'?`${w.n} exercices ne progressent plus depuis plusieurs séances.`:`Tu t'entraînes depuis ${w.n} semaines d'affilée.`} Une semaine à charges réduites aide à récupérer et à repartir plus fort.</span></div>
    <div class="btnrow"><button class="btn btn-primary sm" data-act="dl-start">Lancer la décharge</button><button class="btn btn-soft sm" data-act="dl-later">Plus tard</button></div></section>`}


/* ================= Sauvegardes datées (7 jours) =================
   Une copie par jour sur le téléphone (IndexedDB), et sur le compte Google si connecté.
   Une copie est aussi faite juste avant une opération qui remplace les données. */
const BK_DB='fonte-backups',BK_KEEP=7;
const dayKey=(t=Date.now())=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function bkOpen(){return new Promise((ok,ko)=>{try{const r=indexedDB.open(BK_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('snap');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}catch(e){ko(e)}})}
async function bkAll(){try{const db=await bkOpen();return await new Promise(ok=>{const out=[];const c=db.transaction('snap').objectStore('snap').openCursor();c.onsuccess=()=>{const r=c.result;if(r){out.push({k:r.key,...r.value,data:undefined});r.continue()}else ok(out.sort((a,b)=>b.t-a.t))};c.onerror=()=>ok([])})}catch(e){return[]}}
async function bkGet(k){const db=await bkOpen();return new Promise((ok,ko)=>{const r=db.transaction('snap').objectStore('snap').get(k);r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)})}
async function bkSave(tag){if(!S.history.length&&!S.routines.length)return;try{const db=await bkOpen();const k=tag?dayKey()+' '+tag:dayKey();
    const c=JSON.parse(JSON.stringify(S));c.active=null;const v={t:Date.now(),n:S.history.length,r:S.routines.length,tag:tag||'',data:JSON.stringify(c)};
    await new Promise((ok,ko)=>{const tx=db.transaction('snap','readwrite');tx.objectStore('snap').put(v,k);tx.oncomplete=ok;tx.onerror=()=>ko(tx.error)});
    const all=await bkAll();const days=[...new Set(all.map(x=>x.k.slice(0,10)))].sort().reverse();const old=all.filter(x=>!days.slice(0,BK_KEEP).includes(x.k.slice(0,10)));
    if(old.length)await new Promise(ok=>{const tx=db.transaction('snap','readwrite');old.forEach(x=>tx.objectStore('snap').delete(x.k));tx.oncomplete=ok;tx.onerror=ok})}catch(e){}}
async function bkOfferEmpty(){if(S.history.length||MODAL)return;const L=(await bkAll()).filter(x=>x.n>0);if(!L.length||S.history.length||MODAL)return;const x=L.sort((a,b)=>b.n-a.n||b.t-a.t)[0];
  openDlg({title:'Tes séances sont là',html:`<p class="dtext">Ce téléphone n'a plus de séances, mais une copie du <b>${esc(bkLabel(x))}</b> en contient <b>${x.n}</b>.</p>`,buttons:[{label:'Restaurer cette copie',kind:'primary',fn:()=>bkRestore('l',x.k)},{label:'Voir toutes les copies',kind:'soft',fn:()=>setTimeout(restoreDlg,50)},{label:'Non merci',kind:'soft'}]})}
async function bkDaily(){const all=await bkAll();if(!all.some(x=>x.k===dayKey()))await bkSave();if(fbOn())fbBackupDaily()}
async function fbBackupDaily(){if(!S.history.length)return;try{const{fs,D}=FB,uid=fbUser.uid,k=dayKey();const ref=fs.doc(D,'users',uid,'days',k);const ex=await fs.getDoc(ref);if(ex.exists())return;
    const txt=cloudPayload(),parts=[];for(let i=0;i<txt.length;i+=FB_CHUNK)parts.push(txt.slice(i,i+FB_CHUNK));const bt=fs.writeBatch(D);
    parts.forEach((p,i)=>bt.set(fs.doc(D,'users',uid,'days',k,'chunks',String(i)),{d:p}));bt.set(ref,{n:parts.length,t:Date.now(),sessions:S.history.length});await bt.commit();
    const L=await fs.getDocs(fs.collection(D,'users',uid,'days'));const keys=L.docs.map(d=>d.id).sort().reverse();
    for(const old of keys.slice(BK_KEEP)){const m=(L.docs.find(d=>d.id===old).data().n)||0;const b2=fs.writeBatch(D);for(let i=0;i<m;i++)b2.delete(fs.doc(D,'users',uid,'days',old,'chunks',String(i)));b2.delete(fs.doc(D,'users',uid,'days',old));await b2.commit()}}catch(e){}}
async function fbBackups(){try{const{fs,D}=FB,uid=fbUser.uid;const L=await fs.getDocs(fs.collection(D,'users',uid,'days'));return L.docs.map(d=>({k:d.id,...d.data()})).sort((a,b)=>b.t-a.t)}catch(e){return[]}}
async function fbBackupRead(k){const{fs,D}=FB,uid=fbUser.uid;const m=await fs.getDoc(fs.doc(D,'users',uid,'days',k));const n=m.data().n||0;
  const P=await Promise.all(Array.from({length:n},(_,i)=>fs.getDoc(fs.doc(D,'users',uid,'days',k,'chunks',String(i)))));const j=JSON.parse(P.map(x=>x.data().d).join(''));return j.data||j}
function bkLabel(x){const d=new Date(x.t);return`${cap(d.toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long'}))} · ${fmtHour(x.t)}`}
async function restoreDlg(){openDlg({title:'Revenir en arrière',html:'<p class="dtext">Chargement des sauvegardes…</p>',buttons:[{label:'Fermer',kind:'soft'}]});
  const L=await bkAll(),C=fbOn()?await fbBackups():[];if(!MODAL||MODAL.title!=='Revenir en arrière')return;
  const row=(x,src)=>`<button class="bk-row" data-act="bk-pick:${src}:${encodeURIComponent(x.k)}"><span><b>${esc(bkLabel(x))}</b><span class="muted">${x.n??x.sessions} séance${(x.n??x.sessions)>1?'s':''}${x.tag?' · avant '+esc(x.tag):''}</span></span>${icon('chevr')}</button>`;
  MODAL.html=`<p class="dtext">Tes données sont copiées automatiquement chaque jour (7 derniers jours gardés), et juste avant un import ou un effacement.</p>
    ${L.length?`<p class="bk-h">Sur ce téléphone</p>${L.map(x=>row(x,'l')).join('')}`:'<p class="dtext">Pas encore de copie sur ce téléphone : la première sera faite aujourd\'hui.</p>'}
    ${C.length?`<p class="bk-h">Sur ton compte Google</p>${C.map(x=>row(x,'c')).join('')}`:''}`;renderDialog()}
async function bkRestore(src,k){try{const d=src==='c'?await fbBackupRead(k):JSON.parse((await bkGet(k)).data);await bkSave('restauration');
    S={...defaultState(),...d,settings:{...defaultSettings(),...(d.settings||{}),fbUid:S.settings.fbUid,fbEmail:S.settings.fbEmail,fbName:S.settings.fbName,gistId:S.settings.gistId,ghLogin:S.settings.ghLogin,lbGist:S.settings.lbGist,lbFb:S.settings.lbFb}};
    rebuildIndex();save();ui.editorOpen=false;ui.picker=null;ui.detail=[];renderAll();flash('Données restaurées')}
  catch(e){openDlg({title:'Restauration impossible',html:`<p class="dtext">${esc(e&&e.message||'Copie illisible')}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}

/* ================= Classement entre potes =================
   Chacun publie un petit profil public (stats de la semaine, régularité, records) dans un gist public de son GitHub.
   Les potes s'ajoutent avec le code (identifiant du gist), par lien ou QR code. Aucune séance détaillée n'est partagée. */
const LB_FILE='carnet-fonte-profil.json',LB_DESC='Carnet de fonte : profil public (classement entre potes)';
const LIFTS=[['Développé couché',['developpe-couche-barre','developpe-couche-powerlifting']],['Squat',['squat-barre-haute','squat-barre-basse']],['Soulevé de terre',['souleve-de-terre','souleve-de-terre-sumo','souleve-de-terre-trap-bar']],['Développé militaire',['developpe-militaire-debout','developpe-militaire-barre','developpe-militaire-assis']]];
function lbAgg(L){const sets=w=>w.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.t!=='w'&&s.done!==false).length,0);
  return{n:L.length,vol:Math.round(L.reduce((a,w)=>a+wVolume(w),0)),kcal:Math.round(L.reduce((a,w)=>a+kcalFor(w),0)),min:Math.round(L.reduce((a,w)=>a+Math.max(0,(w.end||w.start)-w.start),0)/6e4),sets:L.reduce((a,w)=>a+sets(w),0)}}
function lbProfile(){const wk=monday(Date.now()),H=S.history,W=H.filter(w=>w.start>=wk),mk=mStart(mKey(Date.now())),M=H.filter(w=>w.start>=mk);
  const best={};for(const[n,ids]of LIFTS){let b=0;for(const w of H)for(const e of w.exercises)if(ids.includes(e.exId))for(const s of e.sets)if(s.t!=='w'&&s.done!==false&&+s.a>0&&+s.b>0)b=Math.max(b,e1rm(+s.a,+s.b));if(b)best[n]=Math.round(b)}
  return{app:'carnet-fonte-profil',v:1,name:(S.settings.lbName||S.settings.ghLogin||'Moi').slice(0,24),updated:Date.now(),week:wk,
    w:lbAgg(W),m:lbAgg(M),
    streak:weekStreaks().cur,total:H.length,best}}
let lbFriends={},lbBusy=false,lbLast=0;
const lbMyId=()=>S.settings.lbFb?S.settings.fbUid:S.settings.lbGist;
const lbOn=()=>!!(S.settings.lbFb||S.settings.lbGist);
const isGist=id=>/^[a-f0-9]{32}$/i.test(id);
async function lbPublish(){if(S.settings.lbFb){if(!fbOn())return;try{await FB.fs.setDoc(FB.fs.doc(FB.D,'profiles',fbUser.uid),lbProfile())}catch(e){}return}if(!ghToken()||!S.settings.lbGist)return;try{await gh('/gists/'+S.settings.lbGist,{method:'PATCH',body:JSON.stringify({files:{[LB_FILE]:{content:JSON.stringify(lbProfile())}}})})}catch(e){}}
async function lbFetch(id){if(!isGist(id)){await fbLoad();if(!fbUser)throw new Error('connecte-toi avec Google');const d=await FB.fs.getDoc(FB.fs.doc(FB.D,'profiles',id));if(!d.exists())throw new Error('introuvable');const p=d.data();if(p.app!=='carnet-fonte-profil')throw new Error('pas un profil');return p}
  const r=await fetch(GH_API+'/gists/'+id,{headers:Object.assign({'Accept':'application/vnd.github+json'},ghToken()?{'Authorization':'Bearer '+ghToken()}:{})});
  if(r.status===404)throw new Error('introuvable');if(!r.ok)throw new Error('GitHub '+r.status);const g=await r.json();const f=g.files&&g.files[LB_FILE];if(!f)throw new Error('pas un profil');
  let txt=f.content;if(f.truncated)txt=await (await fetch(f.raw_url)).text();const p=JSON.parse(txt);if(p.app!=='carnet-fonte-profil')throw new Error('pas un profil');return p}
async function lbRefresh(force){if(lbBusy||(!force&&Date.now()-lbLast<60000))return;lbBusy=true;lbLast=Date.now();if(S.settings.lbFb||(S.friends||[]).some(f=>!isGist(f.id))){try{await fbLoad()}catch(e){}}await lbPublish();await lbInbox();
  await Promise.all((S.friends||[]).map(f=>lbFetch(f.id).then(p=>{lbFriends[f.id]={p}}).catch(e=>{lbFriends[f.id]={err:e.message}})));lbBusy=false;
  if(ui.detail.length&&ui.detail[ui.detail.length-1].kind==='lb')renderDetail()}
function lbLinkFor(id,n){return SHARE_BASE+'#ami='+id+(n?'.'+n:'')}
function lbLink(){return SHARE_BASE+'#ami='+lbMyId()+'.'+b64e(S.settings.lbName||S.settings.fbName||S.settings.ghLogin||'')}

async function lbEnable(){const name=($('#lb-name')||{}).value;S.settings.lbName=String(name||S.settings.fbName||S.settings.ghLogin||'').trim().slice(0,24)||'Moi';save();
  try{if(fbOn()){S.settings.lbFb=true;save();await FB.fs.setDoc(FB.fs.doc(FB.D,'profiles',fbUser.uid),lbProfile())}
    else if(!S.settings.lbGist){const g=await gh('/gists',{method:'POST',body:JSON.stringify({description:LB_DESC,public:true,files:{[LB_FILE]:{content:JSON.stringify(lbProfile())}}})});S.settings.lbGist=g.id;save()}else await lbPublish();
    closeDlg();renderDetail();lbRefresh(true);flash('Classement activé')}
  catch(e){if(S.settings.lbFb&&!S.settings.lbGist){S.settings.lbFb=false;save()}const er=$('#lb-err');if(er){er.textContent=fbErr(e);er.hidden=false}}}

function lbSetupDlg(){if(!fbOn()&&!ghToken())return openDlg({title:'Classement entre potes',html:`<p class="dtext">Pour comparer vos stats, connecte-toi d'abord avec ton compte Google dans <b>Réglages → Synchro cloud</b>. Ça sauvegarde aussi tes séances.</p>`,buttons:[{label:'Aller aux réglages',kind:'primary',fn:()=>{ui.detail=[];renderDetail();ui.tab='reglages';renderMain()}},{label:'Annuler',kind:'soft'}]});
  openDlg({title:'Rejoindre le classement',html:`<p class="dtext">Ton pseudo et ces stats seront visibles par les potes qui ont ton code : séances et volume de la semaine et du mois, semaines d'affilée, total de séances et 1RM estimés (couché, squat, soulevé de terre, militaire). <b>Rien d'autre</b> : ni tes séances détaillées, ni ton poids, ni ton e-mail.</p><label class="fld"><span>Pseudo</span><input id="lb-name" type="text" maxlength="24" value="${esc(S.settings.lbName||S.settings.fbName||S.settings.ghLogin||'')}" autofocus></label><p class="derr" id="lb-err" hidden></p>`,
  buttons:[{label:'Activer',kind:'primary',fn:()=>{lbEnable();return false}},{label:'Annuler',kind:'soft'}]})}

const IS_IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const IN_SAFARI=IS_IOS&&!NATIVE&&!((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone);
async function lbNotify(id){if(isGist(id)||!fbOn()||!lbOn())return;try{await FB.fs.setDoc(FB.fs.doc(FB.D,'invites',id,'from',fbUser.uid),{name:String(S.settings.lbName||S.settings.fbName||'Pote').slice(0,24),t:Date.now()})}catch(e){}}
async function lbInbox(){if(!fbOn()||!lbOn())return;try{const L=await FB.fs.getDocs(FB.fs.collection(FB.D,'invites',fbUser.uid,'from'));let n=0;
  for(const d of L.docs){const id=d.id,v=d.data()||{};S.friends=S.friends||[];if(/^[A-Za-z0-9]{20,40}$/.test(id)&&id!==fbUser.uid&&!S.friends.some(f=>f.id===id)){S.friends.push({id,name:String(v.name||'').slice(0,24)});n++}
    try{await FB.fs.deleteDoc(FB.fs.doc(FB.D,'invites',fbUser.uid,'from',id))}catch(e){}}
  if(n){save();flash(n>1?`${n} potes t'ont ajouté au classement`:`${(S.friends[S.friends.length-1].name)||'Un pote'} t'a ajouté au classement`)}}catch(e){}}
function lbAddFriend(id,name){id=String(id||'').trim().replace(/^.*#ami=/,'').split('.')[0].replace(/[^A-Za-z0-9]/g,'');if(!/^[A-Za-z0-9]{20,40}$/.test(id))return'Code invalide : colle le lien complet envoyé par ton pote.';
  if(id===lbMyId()||id===S.settings.lbGist||id===S.settings.fbUid)return'C\'est ton propre code.';S.friends=S.friends||[];if(S.friends.some(f=>f.id===id))return'Ce pote est déjà dans ta liste.';
  S.friends.push({id,name:String(name||'').slice(0,24)});save();lbNotify(id);lbFetch(id).then(p=>{lbFriends[id]={p};const f=S.friends.find(f=>f.id===id);if(f&&p.name){f.name=p.name;save()}renderDetail()}).catch(e=>{lbFriends[id]={err:e.message};renderDetail()});return null}
function lbAddDlg(){const err=t=>{const e=$('#lba-err');e.textContent=t;e.hidden=false;return false};openDlg({title:'Ajouter un pote',html:`<p class="dtext">Colle le lien ou le code que ton pote t'a envoyé (Classement → Inviter).</p><input id="lba" class="ta" style="height:48px" autocomplete="off" autocapitalize="off" spellcheck="false" autofocus><p class="derr" id="lba-err" hidden></p>`,
  buttons:[...(navigator.clipboard&&navigator.clipboard.readText?[{label:'Coller le lien',kind:'soft',fn:()=>{navigator.clipboard.readText().then(t=>{const i=$('#lba');if(i){i.value=(t||'').trim();const e=lbAddFriend(i.value);if(e)err(e);else{closeDlg();flash('Pote ajouté');renderDetail()}}}).catch(()=>err('Colle le lien dans la case (appui long → Coller).'));return false}}]:[]),{label:'Ajouter',kind:'primary',fn:()=>{const e=lbAddFriend($('#lba').value);if(e)return err(e);flash('Pote ajouté')}},{label:'Annuler',kind:'soft'}]})}
function lbInviteDlg(){const link=lbLink();openDlg({title:'Inviter un pote',html:`<p class="dtext">Envoie ce lien à ton pote. Dans son appli : <b>Classement → Ajouter un pote → Coller le lien</b>. Vous apparaîtrez automatiquement l'un chez l'autre.</p><div class="qrbox" id="qrbox"><span class="muted">QR code…</span></div><textarea class="ta" rows="3" readonly id="lbl">${esc(link)}</textarea>`,
  buttons:[...(navigator.share?[{label:'Envoyer…',kind:'primary',fn:()=>{navigator.share({text:'Ajoute-moi dans Carnet de fonte 💪 Copie ce lien, puis dans l\'appli : Classement → Ajouter un pote → Coller le lien.\n'+link}).catch(()=>{});return false}}]:[]),{label:'Copier',kind:navigator.share?'soft':'primary',fn:()=>{try{navigator.clipboard.writeText(link).then(()=>flash('Lien copié'))}catch(e){}return false}},{label:'Fermer',kind:'soft'}]});
  loadQR().then(()=>{const b=$('#qrbox');if(b)b.innerHTML=qrSVG(link)}).catch(()=>{const b=$('#qrbox');if(b)b.remove()})}
function lbCrit(tab){const f=k=>(p,c)=>c&&c[k]!=null?c[k]:(c?0:0),pl=(n,w)=>n+' '+w+(n>1?'s':'');
  const min=v=>v>=60?Math.floor(v/60)+' h '+String(v%60).padStart(2,'0'):v+' min';
  const sub=(p,c)=>c?`${pl(c.n,'séance')} · ${fmtVol(c.vol)}`:'Rien pour l\'instant';
  if(tab==='w'||tab==='m')return[['n','Séances',(p,c)=>c?c.n*1e9+(c.vol||0):0,v=>pl(Math.floor(Math.max(0,v)/1e9),'séance'),(p,c)=>c?fmtVol(c.vol):'0 kg'],
    ['vol','Volume',f('vol'),v=>fmtVol(v),sub],['min','Temps',f('min'),min,sub],['sets','Séries',f('sets'),v=>pl(v,'série'),sub],['kcal','Calories',f('kcal'),v=>v.toLocaleString(LOC)+' kcal',sub]];
  if(tab==='s')return[['st','Semaines d\'affilée',p=>p.streak*1e6+p.total,v=>Math.floor(v/1e6)+' sem.',p=>pl(p.total,'séance')+' au total'],['tot','Total séances',p=>p.total,v=>pl(v,'séance'),p=>p.streak+' sem. d\'affilée']];
  const B=p=>p.best||{};const lifts=p=>LIFTS.map(([n])=>B(p)[n]?n.split(' ')[0].slice(0,4)+'. '+B(p)[n]:'').filter(Boolean).join(' · ')||'Aucun des 4 mouvements';
  return[['t','Total',p=>Object.values(B(p)).reduce((a,b)=>a+b,0),v=>v+' kg',lifts],...LIFTS.map(([n],i)=>['l'+i,n.replace('Développé','Dév.').replace('Soulevé de terre','Soulevé'),p=>B(p)[n]||0,v=>v+' kg',p=>B(p)[n]?'1RM estimé':'Pas encore fait'])]}
function lbHTML(){const on=lbOn(),me=lbProfile(),wk=monday(Date.now());const tab=ui.lbTab||'w';
  const rows=[{me:true,p:me,id:'moi'}].concat((S.friends||[]).map(f=>({id:f.id,name:f.name,...(lbFriends[f.id]||{})})));
  if(!ui.lbSort)try{ui.lbSort=JSON.parse(localStorage.getItem('fonte-lbsort')||'{}')}catch(e){ui.lbSort={}}
  const crit=lbCrit(tab),C=crit.find(c=>c[0]===ui.lbSort[tab])||crit[0];
  const cur=p=>tab==='w'?(p.week===wk?p.w:null):tab==='m'?(mKey(p.updated)===mKey(Date.now())?p.m:null):null;
  const num=p=>{if(!p)return-1;return C[2](p,cur(p))};
  const val=r=>num(r.p);
  rows.sort((a,b)=>val(b)-val(a));
  const show=r=>{const p=r.p;if(!p)return`<span class="muted">${r.err?(/introuvable/.test(r.err)?'Pas encore inscrit au classement':/connecte/.test(r.err)?'Connecte-toi avec Google':'Profil indisponible'):'Chargement…'}</span>`;
    const v=num(p);return`<b>${v>0||C[0]==='n'?C[3](v):'—'}</b><span class="muted">${C[4]?C[4](p,cur(p)):''}</span>`};
  const T=[['w','Semaine'],['m','Mois'],['s','Régularité'],['b','Force']];
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Classement</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap">
  ${on?`<div class="chips">${T.map(([k,l])=>`<button class="chip ${tab===k?'on':''}" data-act="lb-tab:${k}">${l}</button>`).join('')}</div>
    <div class="chips lb-crit">${crit.map(c=>`<button class="chip sm ${c===C?'on':''}" data-act="lb-sort:${tab}:${c[0]}">${c[1]}</button>`).join('')}</div>
    <ol class="lb">${rows.map((r,i)=>`<li class="${r.me?'me':''}"><span class="rk">${r.p&&val(r)>0&&i<3?['🥇','🥈','🥉'][i]:i+1}</span><span class="nm">${esc(r.me?(me.name+' (toi)'):(r.p&&r.p.name)||r.name||'Pote')}</span><span class="vl">${show(r)}</span>${r.me?'':`<button class="icon-btn" data-act="lb-del:${r.id}" aria-label="Retirer ce pote">${icon('x')}</button>`}</li>`).join('')}</ol>
    ${(S.friends||[]).length?'':`<p class="dtext">Ajoute tes potes pour vous comparer. Chacun doit avoir l'appli et activer le classement.</p>`}
    <p class="dtext" style="font-size:13px">${tab==='b'?(C[0]==='t'?'Somme des 1RM estimés (formule d\'Epley) sur les 4 grands mouvements.':'1RM estimé (formule d\'Epley) sur ce mouvement.'):tab==='s'?'Semaines d\'affilée avec au moins une séance.':'Remis à zéro chaque '+(tab==='w'?'lundi':'1er du mois')+'.'} Mis à jour quand chacun ouvre son appli.</p>
    <div class="btnrow"><button class="btn btn-primary" data-act="lb-invite">${icon('share')}Inviter</button><button class="btn btn-soft" data-act="lb-add">${icon('plus')}Ajouter un pote</button><button class="btn btn-soft" data-act="lb-refresh">Actualiser</button></div>
    <button class="btn-ghost danger" data-act="lb-off" style="align-self:flex-start">Quitter le classement</button>`
  :`<div class="empty">${icon('crown')}<b>Compare-toi à tes potes</b>Séances de la semaine, volume du mois, régularité et force : un classement rien qu'entre vous.</div><button class="btn btn-primary block" data-act="lb-setup">Rejoindre le classement</button>`}
  </div></div>`}
function checkFriendLink(){const h=location.hash;const m=h.match(/^#ami=([A-Za-z0-9]{20,40})(?:\.([A-Za-z0-9_-]*))?/);if(!m)return;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  let nm='';try{nm=m[2]?b64d(m[2]):''}catch(e){}
  const link=lbLinkFor(m[1],m[2]);
  if(!NATIVE&&/Android/i.test(navigator.userAgent))return openDlg({title:'Ajouter un pote',html:`<p class="dtext">Tu as l'appli <b>Carnet de fonte</b> sur ce téléphone ? Ouvre l'invitation de <b>${esc(nm||'ton pote')}</b> directement dedans.</p>`,
    buttons:[{label:'Ouvrir dans l\'appli',kind:'primary',fn:()=>{location.href=`intent://ami/${m[1]}${m[2]?'.'+m[2]:''}#Intent;scheme=carnetdefonte;package=fr.carnetdefonte.app;end`}},{label:'Ajouter ici (navigateur)',kind:'soft',fn:()=>{const e=lbAddFriend(m[1],nm);flash(e||'Pote ajouté')}},{label:'Plus tard',kind:'soft'}]});
  if(IN_SAFARI)return openDlg({title:'Ajouter un pote',html:`<p class="dtext">Ce lien s'est ouvert dans Safari. Si Carnet de fonte est sur ton écran d'accueil, ajoute <b>${esc(nm||'ce pote')}</b> depuis l'appli :</p><ol class="steps"><li>Touche <b>Copier le lien</b>.</li><li>Ouvre <b>Carnet de fonte</b> depuis ton écran d'accueil.</li><li><b>Classement → Ajouter un pote → Coller le lien</b>.</li></ol>`,
    buttons:[{label:'Copier le lien',kind:'primary',fn:()=>{try{navigator.clipboard.writeText(link).then(()=>flash('Lien copié : ouvre l\'appli'))}catch(e){}}},{label:'Ajouter ici (dans Safari)',kind:'soft',fn:()=>{const e=lbAddFriend(m[1],nm);flash(e||'Pote ajouté')}}]});
  openDlg({title:'Ajouter un pote',html:`<p class="dtext">Ajouter <b>${esc(nm||'ce pote')}</b> à ton classement ?</p>`,buttons:[{label:'Ajouter',kind:'primary',fn:()=>{const e=lbAddFriend(m[1],nm);flash(e||'Pote ajouté');if(!e){ui.tab='historique';renderMain();pushDetail({kind:'lb'});lbRefresh(true)}}},{label:'Plus tard',kind:'soft'}]})}
window.addEventListener('hashchange',checkFriendLink);

/* ================= Bilan du mois ================= */
const mKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')};
const mStart=k=>{const[y,m]=k.split('-').map(Number);return new Date(y,m-1,1).getTime()};
const mShift=(k,n)=>{const[y,m]=k.split('-').map(Number);return mKey(new Date(y,m-1+n,1))};
const mLabel=k=>new Date(mStart(k)).toLocaleDateString(LOC,{month:'long',year:'numeric'});
function monthStats(k){const a=mStart(k),b=mStart(mShift(k,1));const H=S.history.filter(w=>w.start>=a&&w.start<b);
  const mus={},exs={};let vol=0,dur=0,kcal=0,sets=0,prs=[];
  for(const w of H){vol+=wVolume(w);dur+=w.end-w.start;kcal+=kcalFor(w);sets+=wSets(w);prs=prs.concat((w.prs||[]).map(p=>({...p,t:w.start})));
    for(const e of w.exercises){const X=ex(e.exId),n=e.sets.filter(s=>s.t!=='w'&&s.done!==false).length;if(MAIN_M.includes(X.muscle))mus[X.muscle]=(mus[X.muscle]||0)+n;exs[e.exId]=(exs[e.exId]||0)+1}}
  const weeks=new Set(H.map(w=>monday(w.start))).size,days=Math.round((Math.min(b,Date.now())-a)/864e5);
  const topM=Object.entries(mus).sort((x,y)=>y[1]-x[1]),topE=Object.entries(exs).sort((x,y)=>y[1]-x[1]).slice(0,3);
  return{k,H,n:H.length,vol,dur,kcal,sets,prs,weeks,days,topM,topE,missing:MAIN_M.filter(m=>!mus[m]&&['Pectoraux','Dos','Épaules','Quadriceps','Ischios','Fessiers','Mollets','Abdos','Biceps','Triceps'].includes(m))}}
function pct(a,b){if(!b)return'';const p=Math.round((a-b)/b*100);return`<span class="dl ${p>=0?'up':'down'}">${p>=0?'+':''}${p} %</span>`}
function monthHTML(k){const M=monthStats(k),Pm=monthStats(mShift(k,-1)),cur=k===mKey(Date.now()),first=S.history.length?mKey(S.history[S.history.length-1].start):k;
  const tile=(lab,v,prev)=>`<div><span class="k">${lab}</span><span class="v">${v}</span>${prev||''}</div>`;
  return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Bilan</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap">
    <div class="mnav"><button class="icon-btn" data-act="month:${mShift(k,-1)}" ${k<=first?'disabled':''} aria-label="Mois précédent">${icon('chevl')}</button><h2>${esc(cap(mLabel(k)))}</h2><button class="icon-btn" data-act="month:${mShift(k,1)}" ${cur?'disabled':''} aria-label="Mois suivant">${icon('chevr')}</button></div>
    ${cur?`<p class="dtext" style="font-size:14px">Mois en cours : ${M.days} jour${M.days>1?'s':''} écoulé${M.days>1?'s':''}.</p>`:''}
    ${M.n?`<div class="sum sum4">${tile('Séances',M.n,pct(M.n,Pm.n))}${tile('Volume',M.vol>=1e5?fmt(Math.round(M.vol/100)/10)+' t':fmtVol(M.vol),pct(M.vol,Pm.vol))}${tile('Temps',Math.round(M.dur/36e5)+' h',pct(M.dur,Pm.dur))}${tile('Calories','≈ '+Math.round(M.kcal).toLocaleString(LOC),'')}</div>
    <p class="dtext" style="font-size:13px">Les pourcentages comparent au mois précédent${cur?' entier':''}.</p>
    <section class="dsec"><h2>Régularité</h2><p class="dtext">Tu t'es entraîné <b>${M.weeks} semaine${M.weeks>1?'s':''}</b> sur ${Math.max(1,Math.ceil(M.days/7))}, avec ${M.sets} séries au total.</p></section>
    <section class="dsec"><h2>${icon('trophy')}Records battus</h2>${M.prs.length?`<ul class="mlist">${M.prs.slice(0,8).map(p=>`<li><span>${esc(ex(p.exId).name)}</span><b>${esc(p.label)} · ${esc(p.value)}</b></li>`).join('')}</ul>${M.prs.length>8?`<p class="dtext" style="font-size:13px">+ ${M.prs.length-8} autres</p>`:''}`:'<p class="dtext">Pas de record ce mois-ci.</p>'}</section>
    <section class="dsec"><h2>Muscles</h2>${M.topM.length?`<ul class="mlist">${M.topM.slice(0,5).map(([m,n])=>`<li><span>${esc(m)}</span><b>${n} séries</b></li>`).join('')}</ul>`:''}${M.missing.length?`<p class="dtext" style="font-size:14px">Pas travaillé ce mois : <b>${M.missing.map(esc).join(', ')}</b>.</p>`:''}</section>
    <section class="dsec"><h2>Exercices les plus faits</h2><ul class="mlist">${M.topE.map(([id,n])=>`<li><span>${esc(ex(id).name)}</span><b>${n} séance${n>1?'s':''}</b></li>`).join('')}</ul></section>`
    :'<div class="empty"><b>Aucune séance ce mois-là</b></div>'}
    ${M.n?`<button class="btn btn-soft block" data-act="month-pdf:${k}">${icon('share')}Exporter le bilan en PDF</button>`:''}
  </div></div>`}
/* ================= Bilan du mois en PDF (pages dessinées puis assemblées en PDF, sans bibliothèque) ================= */
function pdfFromJpegs(pages){const enc=new TextEncoder(),parts=[],offs=[];let len=0;const push=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length};
  const obj=(n,body)=>{offs[n]=len;push(`${n} 0 obj\n`);for(const b of[].concat(body))push(b);push('\nendobj\n')};
  const W=595.28,H=841.89,N=pages.length;push('%PDF-1.4\n%\xE2\xE3\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,`<< /Type /Pages /Count ${N} /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
  pages.forEach((pg,i)=>{const o=3+i*3,c=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    obj(o,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${o+1} 0 R >> >> /Contents ${o+2} 0 R >>`);
    obj(o+1,[`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.data.length} >>\nstream\n`,pg.data,'\nendstream']);
    obj(o+2,`<< /Length ${c.length} >>\nstream\n${c}\nendstream`)});
  const xref=len,n=3+N*3;push(`xref\n0 ${n}\n0000000000 65535 f \n`);for(let i=1;i<n;i++)push(String(offs[i]).padStart(10,'0')+' 00000 n \n');
  push(`trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
async function monthPdf(k){flash('Création du PDF…');try{await document.fonts.ready}catch(e){}
  const M=monthStats(k),P=monthStats(mShift(k,-1)),Wd=1240,Hd=1754,mx=100;const pages=[];let cv,x,y;
  const red=accentHex('d'),fg='#14181D',mu='#5E6873',ln='#E3E6EA',D='"Barlow Condensed","Arial Narrow",sans-serif',B='"Figtree",system-ui,sans-serif';
  const page=()=>{if(cv)pages.push(cv);cv=document.createElement('canvas');cv.width=Wd;cv.height=Hd;x=trCtx(cv.getContext('2d'));x.fillStyle='#fff';x.fillRect(0,0,Wd,Hd);
    [[red,0],['#6A97F2',1],['#E5AE22',2],['#55C985',3]].forEach(([c,i])=>{x.fillStyle=c;x.fillRect(mx+i*262,60,250,10)});
    x.fillStyle=mu;x.font=`500 22px ${B}`;x.fillText('Carnet de fonte · '+cap(mLabel(k)),mx,Hd-60);x.textAlign='right';x.fillText('Page '+(pages.length+1),Wd-mx,Hd-60);x.textAlign='left';y=150};
  const need=h=>{if(y+h>Hd-120)page()};
  const h2=t=>{need(110);y+=70;x.fillStyle=red;x.font=`800 40px ${D}`;x.fillText(t.toUpperCase(),mx,y);y+=26};
  page();x.fillStyle=mu;x.font=`600 26px ${B}`;x.fillText((P.n?'BILAN DU MOIS · écarts par rapport au mois précédent':'BILAN DU MOIS')+(S.settings.lbName||S.settings.fbName?' · '+(S.settings.lbName||S.settings.fbName):''),mx,y);y+=78;
  x.fillStyle=fg;x.font=`800 92px ${D}`;x.fillText(cap(mLabel(k)).toUpperCase(),mx,y);y+=50;
  const tiles=[['Séances',String(M.n),M.n-P.n],['Volume',fmtVol(M.vol),P.vol?Math.round((M.vol-P.vol)/P.vol*100)+' %':null],['Temps',fmtDurLong(M.dur||0),null],['Séries',String(M.sets),M.sets-P.sets],['Calories','≈ '+Math.round(M.kcal).toLocaleString(LOC),null],['Semaines actives',String(M.weeks),null]];
  tiles.forEach(([k2,v,d],i)=>{const c=i%3,r=Math.floor(i/3),X0=mx+c*350,Y0=y+r*170;x.fillStyle='#F3F4F6';x.beginPath();x.roundRect(X0,Y0,330,150,22);x.fill();
    x.fillStyle=mu;x.font=`600 24px ${B}`;x.fillText(k2.toUpperCase(),X0+26,Y0+46);x.fillStyle=fg;let fs=58;x.font=`800 ${fs}px ${D}`;while(x.measureText(v).width>280&&fs>30){fs-=2;x.font=`800 ${fs}px ${D}`}x.fillText(v,X0+26,Y0+112);
    if(d!==null&&d!==undefined&&P.n){const sv=typeof d==='number'?(d>=0?'+':'')+d:(String(d)[0]==='-'?d:'+'+d);x.fillStyle=String(sv)[0]==='-'?'#C0392B':'#1E8E4E';x.font=`700 22px ${B}`;x.textAlign='right';x.fillText(sv,X0+306,Y0+46);x.textAlign='left'}});
  y+=350;
  if(M.topM.length){h2('Muscles travaillés (séries)');const mxv=M.topM[0][1];for(const[m,n]of M.topM){need(54);y+=44;x.fillStyle=fg;x.font=`600 28px ${B}`;x.fillText(m,mx,y);x.fillStyle='#F0F1F3';x.beginPath();x.roundRect(mx+290,y-26,700,30,8);x.fill();
    x.fillStyle=red;x.beginPath();x.roundRect(mx+290,y-26,Math.max(12,700*n/mxv),30,8);x.fill();x.fillStyle=mu;x.font=`600 26px ${B}`;x.textAlign='right';x.fillText(String(n),Wd-mx,y);x.textAlign='left'}
    if(M.missing.length){need(60);y+=54;x.fillStyle=mu;x.font=`500 24px ${B}`;x.fillText('Pas travaillé ce mois : '+M.missing.join(', '),mx,y)}}
  if(M.prs.length){h2(`Records battus (${M.prs.length})`);for(const p of M.prs){need(52);y+=48;x.fillStyle=fg;x.font=`600 28px ${B}`;let n=ex(p.exId).name;while(x.measureText(n).width>620&&n.length>4)n=n.slice(0,-2);x.fillText(n,mx,y);
    x.fillStyle=mu;x.font=`500 26px ${B}`;x.textAlign='right';x.fillText(`${p.label} · ${p.value} · ${fmtShort(p.t)}`,Wd-mx,y);x.textAlign='left';x.strokeStyle=ln;x.beginPath();x.moveTo(mx,y+16);x.lineTo(Wd-mx,y+16);x.stroke()}}
  h2('Séances');const L=M.H.slice().sort((a,b)=>a.start-b.start);for(const w of L){need(52);y+=48;x.fillStyle=mu;x.font=`600 26px ${B}`;x.fillText(cap(fmtShort(w.start)),mx,y);
    x.fillStyle=fg;x.font=`600 28px ${B}`;let n=w.name;while(x.measureText(n).width>520&&n.length>4)n=n.slice(0,-2);x.fillText(n,mx+190,y);
    x.fillStyle=mu;x.font=`500 26px ${B}`;x.textAlign='right';x.fillText(`${fmtDurLong(w.end-w.start)} · ${fmtVol(wVolume(w))} · ${wSets(w)} séries`,Wd-mx,y);x.textAlign='left';x.strokeStyle=ln;x.beginPath();x.moveTo(mx,y+16);x.lineTo(Wd-mx,y+16);x.stroke()}
  pages.push(cv);
  const J=[];for(const c of pages){const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));J.push({w:c.width,h:c.height,data:new Uint8Array(await b.arrayBuffer())})}
  const pdf=pdfFromJpegs(J),name=`bilan-${k}.pdf`;
  if(NATIVE&&CP.Filesystem&&CP.Share){try{const b64=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.readAsDataURL(pdf)});
    const f=await CP.Filesystem.writeFile({path:name,data:b64,directory:'CACHE'});await CP.Share.share({title:'Bilan '+mLabel(k),files:[f.uri],dialogTitle:'Enregistrer ou partager le PDF'});return}catch(e){if(/cancel/i.test(String(e&&e.message)))return}}
  try{const f=new File([pdf],name,{type:'application/pdf'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Bilan '+mLabel(k)});return}}catch(e){if(e&&e.name==='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(pdf);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1000)}
function checkMonthReport(){const now=mKey(Date.now());if(S.settings.lastReport===now)return;const prev=mShift(now,-1),had=S.settings.lastReport;S.settings.lastReport=now;save();
  if(!had||!monthStats(prev).n||S.active)return;
  setTimeout(()=>{if(MODAL)return;openDlg({title:`Ton bilan de ${new Date(mStart(prev)).toLocaleDateString(LOC,{month:'long'})} est prêt`,html:`<p class="dtext">${monthStats(prev).n} séances, tes records et les muscles travaillés.</p>`,buttons:[{label:'Voir le bilan',kind:'primary',fn:()=>pushDetail({kind:'month',id:prev})},{label:'Plus tard',kind:'soft'}]})},800)}

/* ================= Images hors connexion ================= */
const MEDIA_CACHE='fonte-media';
function mediaUrls(){const u=new Set();for(const id in INFO){const i=INFO[id];if(i.img){u.add(`media/img/${encodeURIComponent(i.img)}-0.webp`);u.add(`media/img/${encodeURIComponent(i.img)}-1.webp`);u.add(`media/thumb/${encodeURIComponent(i.img)}-0.webp`)}if(i.oe){u.add(`media/oei/${i.oe}-t.webp`);for(const t of i.oe1?['hold']:['start','end'])u.add(`media/oei/${i.oe}-${t}.webp`)}if(i.rp){u.add(`media/repdb/${i.rp}-t.webp`);for(const t of i.rp1?['main']:['start','peak'])u.add(`media/repdb/${i.rp}-${t}.webp`)}}return[...u]}
let dlBusy=false;
async function downloadMedia(){if(dlBusy||!window.caches)return;dlBusy=true;const urls=mediaUrls();let done=0,fail=0;const lbl=()=>{const e=$('#dl-lbl');if(e)e.textContent=`Téléchargement… ${Math.round(done/urls.length*100)} %`};
  try{const c=await caches.open(MEDIA_CACHE);let i=0;const worker=async()=>{while(i<urls.length){const u=urls[i++];try{if(!(await c.match(u))){const r=await fetch(u);if(r.ok)await c.put(u,r);else fail++}}catch(e){fail++}done++;if(done%25===0)lbl()}};
    await Promise.all(Array.from({length:6},worker));S.settings.mediaOffline=Date.now();save()}catch(e){fail++}
  dlBusy=false;renderMain();flash(fail?`Images téléchargées (${fail} en échec, réessaie plus tard)`:'Toutes les images sont disponibles hors connexion')}

/* ================= Partage de routine ================= */
const b64e=t=>btoa(unescape(encodeURIComponent(t))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=t=>decodeURIComponent(escape(atob(t.replace(/-/g,'+').replace(/_/g,'/'))));
function routineCode(r){const cus={};const e=r.exercises.map(x=>{const X=ex(x.exId);if(X.custom)cus[x.exId]={n:X.name,m:X.muscle,q:X.equip,t:X.type};return[x.exId,x.sets.map(z=>[z.t||'n',z.b===''||z.b==null?'':+z.b]),x.rest??S.settings.rest,x.ss||0]});
  return'FONTE1:'+b64e(JSON.stringify({v:1,n:r.name,e,c:cus}))}
const SHARE_BASE=NATIVE||!/^https?:$/.test(location.protocol)||/^(localhost|127\.)/.test(location.hostname)?'https://baboulinet05.github.io/MUSCUCYP/':location.origin+location.pathname;
function routineLink(r){return SHARE_BASE+'#r='+routineCode(r)}
function loadQR(){return window.qrcode?Promise.resolve(window.qrcode):new Promise((ok,ko)=>{const sc=document.createElement('script');sc.src='lib/qrcode.js';sc.onload=()=>ok(window.qrcode);sc.onerror=ko;document.head.append(sc)})}
function qrSVG(text){const q=qrcode(0,'L');q.addData(text);q.make();const n=q.getModuleCount(),m=2;let d='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(q.isDark(y,x))d+=`M${x+m} ${y+m}h1v1h-1z`;return`<svg viewBox="0 0 ${n+2*m} ${n+2*m}" shape-rendering="crispEdges" role="img" aria-label="QR code de la routine"><path d="${d}" fill="#000"/></svg>`}
function shareRoutine(r){const link=routineLink(r);const txt=`Routine « ${r.name} » pour Carnet de fonte : ${link}\n\nSi le lien ne s'ouvre pas dans l'appli : Séance → Importer, puis colle tout ce message.`;
  const copy=()=>{const t=$('#shr');try{navigator.clipboard.writeText(txt).then(()=>flash('Copié : colle-le dans un message'),()=>{t.focus();t.select();flash('Sélectionné : copie-le manuellement')})}catch(e){t.focus();t.select()}return false};
  openDlg({title:'Partager la routine',html:`<p class="dtext">Ton pote scanne le QR code avec l'appareil photo, ou ouvre le lien que tu lui envoies. Seuls les exercices, les séries et les reps visées sont partagés, pas tes charges.</p><div class="qrbox" id="qrbox"><span class="muted">QR code…</span></div><textarea id="shr" class="ta" rows="4" readonly>${esc(txt)}</textarea>`,
  buttons:[...(navigator.share?[{label:'Envoyer…',kind:'primary',fn:()=>{navigator.share({text:txt}).catch(()=>{});return false}}]:[]),{label:'Copier',kind:navigator.share?'soft':'primary',fn:copy},{label:'Fermer',kind:'soft'}]});
  loadQR().then(()=>{const b=$('#qrbox');if(b)b.innerHTML=qrSVG(link)}).catch(()=>{const b=$('#qrbox');if(b)b.remove()})}
function parseRoutineCode(txt){const m=String(txt).match(/FONTE1:([A-Za-z0-9_-]+)/);if(!m)return null;try{const d=JSON.parse(b64d(m[1]));return d&&Array.isArray(d.e)?d:null}catch(e){return null}}
function importRoutineData(d){const map={};for(const id in (d.c||{})){if(EXI[id]&&!EXI[id].custom)continue;const c=d.c[id]||{};const same=allEx().find(x=>norm(x.name)===norm(c.n||''));if(same){map[id]=same.id;continue}
      if(!c.n||!MUSCLES.includes(c.m)||!TYPES[c.t])continue;const nid='c-'+uid();S.custom.push({id:nid,name:String(c.n).slice(0,80),muscle:c.m,equip:EQUIP.includes(c.q)?c.q:'Autre',type:c.t});map[id]=nid;rebuildIndex()}
    let skip=0;const exs=d.e.map(([id,sets,rest,ss])=>{id=map[id]||EDB_REDIR[id]||id;if(!EXI[id]){skip++;return null}
      return{exId:id,ss:ss?String(ss):null,rest:Number.isFinite(+rest)?+rest:S.settings.rest,sets:(Array.isArray(sets)&&sets.length?sets:[['n','']]).slice(0,20).map(([t,b])=>({t:['n','w','d','f'].includes(t)?t:'n',a:'',b:b===''||b==null||!Number.isFinite(+b)?'':+b}))}}).filter(Boolean);
    if(!exs.length)return'Aucun exercice de cette routine n\'a été reconnu.';
    const base=String(d.n||'Routine partagée').slice(0,60);let name=base,k=2;while(S.routines.some(r=>r.name===name))name=`${base} (${k++})`;
    const R={id:uid(),name,exercises:exs};ssClean(R);S.routines.push(R);save();ui.tab='seance';renderAll();flash(skip?`Routine importée (${skip} exercice${skip>1?'s':''} ignoré${skip>1?'s':''})`:'Routine importée');return null}
function importRoutineDlg(prefill){const err=t=>{const e=$('#rimp-err');e.textContent=t;e.hidden=false;return false};
  openDlg({title:'Importer une routine',html:`<p class="dtext">Colle le message ou le lien reçu d'un pote : il contient un code qui commence par FONTE1.</p><textarea id="rimp" class="ta" rows="5" autofocus>${esc(prefill||'')}</textarea><p class="derr" id="rimp-err" hidden></p>`,
  buttons:[{label:'Importer',kind:'primary',fn:()=>{const d=parseRoutineCode($('#rimp').value);if(!d)return err('Code introuvable ou abîmé : vérifie que tout le message a été collé.');const e=importRoutineData(d);if(e)return err(e)}},{label:'Annuler',kind:'soft'}]})}
/* ouverture d'un lien de partage (#r=FONTE1…) */
function checkShareLink(){const h=location.hash;if(!/^#r=FONTE1:/.test(h))return;const code=decodeURIComponent(h.slice(3));try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  const d=parseRoutineCode(code);if(!d){flash('Lien de routine abîmé');return}
  const installed=NATIVE||navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  const n=d.e.length,html=`<p class="dtext"><b>${esc(d.n||'Routine partagée')}</b> · ${n} exercice${n>1?'s':''}</p>`+(installed?'':`<p class="dtext" style="font-size:13px">Si Carnet de fonte est sur ton écran d'accueil, ouvre-le plutôt et colle le code dans <b>Séance → Importer</b> : Safari et l'appli installée ne partagent pas leurs données.</p>`);
  openDlg({title:'Routine reçue',html,buttons:[{label:'Ajouter à mes routines',kind:'primary',fn:()=>{const e=importRoutineData(d);if(e){flash(e);return}}},
    ...(installed?[]:[{label:'Copier le code',kind:'soft',fn:()=>{try{navigator.clipboard.writeText(code).then(()=>flash('Code copié : colle-le dans l\'appli'))}catch(e){}return false}}]),{label:'Plus tard',kind:'soft'}]})}
window.addEventListener('hashchange',checkShareLink);

/* ================= Chrono des séries en durée ================= */
const fmtClock=t=>Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
function chronoStart(u,i){const E=findE(u);if(!E)return;const X=ex(E.exId);const st=E.sets[i];if(!st)return;const tgt=num(st.b)||num(ph(E,i).b)||0;
  ui.chrono={u,i,start:Date.now(),tgt,beeped:false};ensureAudio();
  openDlg({title:'Chrono',html:`<p class="dtext">${esc(X.name)} · série ${i+1}${tgt?` · objectif ${fmtSec(tgt)}`:''}</p><div class="chr" id="chr-t">0:00</div>${tgt?'<div class="chr-track"><div class="chr-fill" id="chr-f"></div></div>':''}`,
  buttons:[{label:'Arrêter et valider la série',kind:'primary',fn:()=>{const C=ui.chrono;ui.chrono=null;if(!C)return;const E2=findE(C.u);const s2=E2&&E2.sets[C.i];if(!s2)return;
      s2.b=String(Math.max(1,Math.round((Date.now()-C.start)/1000)));if(s2.done){save();renderEditor();return}toggleDone(C.u,C.i)}},{label:'Annuler',kind:'soft',fn:()=>{ui.chrono=null}}]})}
function chronoTick(){const C=ui.chrono;if(!C)return;if(!MODAL){ui.chrono=null;return}const sec=Math.floor((Date.now()-C.start)/1000);const el=$('#chr-t');if(el){const t=fmtClock(sec);if(el.textContent!==t)el.textContent=t}
  const f=$('#chr-f');if(f)f.style.transform=`scaleX(${Math.min(1,sec/C.tgt)})`;
  if(C.tgt&&!C.beeped&&sec>=C.tgt){C.beeped=true;beep();vib('end');if(el)el.classList.add('ok')}}
setInterval(chronoTick,250);

/* ================= Muscles négligés ================= */
const NEG_M=['Pectoraux','Dos','Épaules','Biceps','Triceps','Quadriceps','Ischios','Fessiers','Mollets','Abdos'];
function neglected(){const H=S.history;if(H.length<4||Date.now()-H[H.length-1].start<14*864e5)return[];const last={};
  for(const w of H)for(const e of w.exercises){const m=ex(e.exId).muscle;if(!(m in last)&&e.sets.some(z=>z.t!=='w'))last[m]=w.start}
  return NEG_M.map(m=>({m,d:last[m]?Math.floor((Date.now()-last[m])/864e5):null})).filter(x=>x.d===null||x.d>=10).sort((a,b)=>(b.d??1e9)-(a.d??1e9)).slice(0,5)}
function neglectHTML(){const L=neglected();if(!L.length)return'';
  return`<section class="card negc"><div class="mini"><span class="k">Muscles à travailler</span><span class="s">Pas entraînés depuis au moins 10 jours</span></div><div class="negl">${L.map(x=>`<button class="chip" data-act="neg-open:${esc(x.m)}">${esc(x.m)} · ${x.d===null?'jamais':x.d+' j'}</button>`).join('')}</div></section>`}

/* ================= Prochaine séance ================= */
const isRoutineW=(w,r)=>w.routineId?w.routineId===r.id:w.name===r.name;
function routineLast(r){const w=S.history.find(w=>isRoutineW(w,r));return w?w.start:0}
function nextRoutine(){const R=S.routines;if(R.length<2||!S.history.length)return null;
  const lw=S.history.find(w=>R.some(r=>isRoutineW(w,r)));if(!lw)return null;const lr=R.find(r=>isRoutineW(lw,r));
  const cyc=lr.prog?R.filter(r=>r.prog===lr.prog):R.filter(r=>!r.prog&&routineLast(r)>Date.now()-45*864e5);if(cyc.length<2)return null;
  let best=null,bt=Infinity;for(const r of cyc){if(r===lr)continue;const t=routineLast(r);if(t<bt){bt=t;best=r}}return best?{r:best,t:bt}:null}
function nextHTML(){if(S.active)return'';const n=nextRoutine();if(!n)return'';const r=n.r,d=n.t?Math.floor((Date.now()-n.t)/864e5):null;
  return`<section class="card nextc"><div class="mini"><span class="k">Prochaine séance</span><span class="v">${esc(r.name)}</span><span class="s">${d===null?'Pas encore faite':d===0?'Faite aujourd\'hui':`Dernière fois il y a ${d} jour${d>1?'s':''}`} · ${r.exercises.length} exercice${r.exercises.length>1?'s':''}</span></div><button class="btn btn-primary block" data-act="start-routine:${r.id}">${icon('play')}Démarrer</button></section>`}

/* ================= Programmes ================= */
const PROGRAMS=[
 {name:'Full body',desc:'3 séances par semaine, alterne A et B. Idéal pour débuter ou reprendre.',r:[['Full body A',[['Squat barre haute',3],['Développé couché barre',3],['Rowing barre buste penché',3],['Développé haltères assis',3],['Curl barre EZ',2],['Planche (gainage)',3]]],['Full body B',[['Soulevé de terre',3],['Développé incliné haltères',3],['Tractions pronation',3],['Fentes marchées haltères',3],['Extension triceps corde',2],['Relevés de jambes suspendu',3]]]]},
 {name:'Upper / Lower',desc:'4 séances par semaine : haut, bas, haut, bas. Le meilleur compromis force et volume.',r:[['Haut A',[['Développé couché barre',4],['Rowing barre buste penché',4],['Développé militaire debout',3],['Tirage vertical prise large',3],['Curl haltères alterné',3],['Extension triceps corde',3]]],['Bas A',[['Squat barre haute',4],['Soulevé de terre roumain barre',3],['Presse à cuisses',3],['Leg curl assis',3],['Mollets debout machine',4],['Crunch poulie',3]]],['Haut B',[['Développé incliné haltères',4],['Tirage vertical prise serrée',4],['Élévations latérales haltères',4],['Rowing assis poulie prise serrée',3],['Pec deck (butterfly)',3],['Curl marteau',3],['Extension au-dessus de la tête poulie',3]]],['Bas B',[['Hack squat',4],['Hip thrust barre',3],['Leg extension',3],['Leg curl allongé',3],['Squat bulgare haltères',3],['Mollets assis machine',4]]]]},
 {name:'Push / Pull / Legs',desc:'3 ou 6 séances par semaine. Chaque muscle travaillé à fond une ou deux fois.',r:[['Push',[['Développé couché barre',4],['Développé incliné haltères',3],['Développé haltères assis',3],['Élévations latérales poulie',4],['Extension triceps corde',3],['Extension au-dessus de la tête poulie',3]]],['Pull',[['Tractions pronation',4],['Rowing barre buste penché',3],['Tirage vertical prise serrée',3],['Face pull',3],['Curl incliné haltères',3],['Curl marteau corde',3]]],['Legs',[['Squat barre haute',4],['Soulevé de terre roumain barre',3],['Presse à cuisses',3],['Leg curl assis',3],['Leg extension',3],['Mollets debout machine',4]]]]},
 {name:'Jambes complète',desc:'Une séance jambes sur machines, pour combler le retard sans charger le dos.',r:[['Jambes machines',[['Presse à cuisses',4],['Hack squat',3],['Leg extension',3],['Leg curl assis',4],['Soulevé de terre roumain haltères',3],['Abduction machine',3],['Mollets debout machine',4]]]]},
 {name:'Bras',desc:'Une séance biceps, triceps et avant-bras en supersets possibles.',r:[['Bras',[['Curl barre EZ',3],['Barre au front (skull crusher)',3],['Curl incliné haltères',3],['Extension triceps corde',3],['Curl marteau corde',3],['Extension au-dessus de la tête poulie',3],['Curl poignets barre',2]]]]},
 {name:'Maison haltères',desc:'Deux haltères et un banc suffisent. 3 fois par semaine.',r:[['Maison haltères',[['Squat goblet haltère',4],['Développé haltères sol',3],['Rowing haltère unilatéral',3],['Développé haltères debout',3],['Soulevé de terre roumain haltères',3],['Curl marteau',3],['Pompes',3]]]]},
 {name:'Machines guidées',desc:'2 séances sur machines (Technogym, Matrix, Life Fitness…), alterne A et B. Idéal pour débuter en salle.',r:[['Machines A',[['Développé couché machine',3],['Vertical traction machine (tirage vertical guidé)',3],['Développé épaules machine',3],['Presse à cuisses horizontale',3],['Leg curl assis',3],['Rotation du buste machine (rotary torso)',2]]],['Machines B',[['Développé incliné machine',3],['Low row machine (rowing bas)',3],['Élévations latérales machine',3],['Leg extension',3],['Multi hip : extension de hanche',3],['Total abdominal machine',3]]]]},
 {name:'Fessiers et jambes',desc:'Une séance centrée sur les fessiers, avec ischios et moyen fessier.',r:[['Fessiers et jambes',[['Hip thrust barre',4],['Squat bulgare haltères',3],['Soulevé de terre roumain barre',3],['Abduction machine',3],['Kickback fessier poulie',3],['Fire hydrant',2]]]]},
 {name:'Dos et posture',desc:'Pour le haut du dos, les épaules et le cou. Bon complément si tu travailles assis.',r:[['Dos et posture',[['Face pull',3],['Upper back machine (rowing haut du dos)',3],['Rotation externe poulie',3],['Bird dog',2],['Cou isométrique avant et arrière',2],['Cou isométrique latéral',2]]]]},
 {name:'Mobilité 15 min',desc:'Étirements à faire après la séance ou les jours de repos. Note la durée tenue (30 à 45 s).',r:[['Mobilité',[["World's greatest stretch",2],['Chat-vache',2],['Étirement fléchisseurs de hanche à genou',2],['Étirement piriforme (cheville sur genou)',2],['Étirement ischios 90/90',2],['Étirement pectoraux et épaules au bâton',2],["Posture de l'enfant",1]]]]},
 {name:'Poids du corps',desc:'Sans matériel, juste une barre de traction.',r:[['Poids du corps',[['Pompes',4],['Tractions pronation',4],['Squat poids du corps',4],['Dips',3],['Fentes marchées poids du corps',3],['Planche (gainage)',3],['Relevés de genoux suspendu',3]]]]}];
function progRoutines(P){return P.r.map(([n,L])=>({id:uid(),name:n,prog:P.name,exercises:L.map(([e,k])=>({exId:slugify(e),rest:S.settings.rest,sets:Array.from({length:k},()=>({t:'n',a:'',b:''}))})).filter(e=>EXI[e.exId])}))}
function programsHTML(){return`<div class="sheet-head"><button class="btn-ghost" data-act="d-close">${icon('chev-down')}Fermer</button><div class="sh-title">Programmes</div><span style="width:70px"></span></div>
  <div class="sheet-body"><div class="wrapx dwrap"><p class="dtext">Ajoute un programme : ses séances deviennent des routines que tu peux modifier.</p>
  ${PROGRAMS.map((P,i)=>`<section class="card prog"><div class="rc-top"><h3>${esc(P.name)}</h3><span class="tag">${P.r.length} séance${P.r.length>1?'s':''}</span></div><p class="dtext">${esc(P.desc)}</p>
  ${P.r.map(([n,L])=>`<div class="pg-r"><b>${esc(n)}</b><span>${esc(L.map(x=>x[0]).join(' · '))}</span></div>`).join('')}
  <button class="btn btn-primary block" data-act="prog-add:${i}">${icon('plus')}Ajouter ${P.r.length>1?'ces '+P.r.length+' routines':'cette routine'}</button></section>`).join('')}
  </div></div>`}

/* ================= Glisser : supprimer une série, réordonner ================= */
let lastDeleted=null;
(function(){let st=null;
  document.addEventListener('touchstart',e=>{const row=e.target.closest&&e.target.closest('#ed .srow:not(.shead)');if(!row||e.touches.length>1)return;st={row,x:e.touches[0].clientX,y:e.touches[0].clientY,dx:0,on:false}},{passive:true});
  document.addEventListener('touchmove',e=>{if(!st)return;const dx=e.touches[0].clientX-st.x,dy=e.touches[0].clientY-st.y;if(!st.on){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.5&&dx<0){st.on=true;st.row.classList.add('swiping')}else if(Math.abs(dy)>12){st=null;return}}
    if(st&&st.on){st.dx=Math.max(-140,Math.min(0,dx));st.row.style.transform=`translateX(${st.dx}px)`;st.row.classList.toggle('arm',st.dx<-90)}},{passive:true});
  document.addEventListener('touchend',()=>{if(!st)return;const{row,dx,on}=st;st=null;if(!on)return;row.classList.remove('swiping','arm');
    if(dx<-90){const[u,i]=row.dataset.row.split(/-(?=\d+$)/);const E=findE(u);if(E){lastDeleted={u,i:+i,set:E.sets[+i]};E.sets.splice(+i,1);save();renderEditor();updateStats();flash('Série supprimée',{label:'Annuler',act:'undo-set'})}}
    else row.style.transform=''},{passive:true});
})();
(function(){let d=null;
  document.addEventListener('pointerdown',e=>{const h=e.target.closest&&e.target.closest('[data-drag]');if(!h)return;e.preventDefault();const card=h.closest('.excard');const cards=[...document.querySelectorAll('#ed .excard')];
    d={u:h.dataset.drag,card,cards,y0:e.clientY,from:cards.indexOf(card),to:cards.indexOf(card),rects:cards.map(c=>c.getBoundingClientRect())};card.classList.add('dragging');try{h.setPointerCapture(e.pointerId)}catch(_){}try{navigator.vibrate&&navigator.vibrate(10)}catch(_){}});
  document.addEventListener('pointermove',e=>{if(!d)return;const dy=e.clientY-d.y0;d.card.style.transform=`translateY(${dy}px)`;const mid=d.rects[d.from].top+d.rects[d.from].height/2+dy;
    let to=d.from;d.rects.forEach((r,i)=>{if(i<d.from&&mid<r.top+r.height/2)to=Math.min(to,i);if(i>d.from&&mid>r.top+r.height/2)to=Math.max(to,i)});
    if(to!==d.to){d.to=to;const sh=d.rects[d.from].height+14;d.cards.forEach((c,i)=>{if(c===d.card)return;let y=0;if(d.from<to&&i>d.from&&i<=to)y=-sh;if(d.from>to&&i<d.from&&i>=to)y=sh;c.style.transform=y?`translateY(${y}px)`:''})}});
  const end=()=>{if(!d)return;const{u,from,to}=d;d.cards.forEach(c=>{c.style.transform='';c.classList.remove('dragging')});d=null;if(from!==to){const T=edTarget();const[m]=T.exercises.splice(from,1);T.exercises.splice(to,0,m);ssClean(T);save()}renderEditor()};
  document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
})();

/* ================= Synchro cloud (GitHub Gist) ================= */
const GH_API='https://api.github.com',GIST_FILE='carnet-fonte.json',GIST_DESC='Carnet de fonte - sauvegarde';
function ghToken(){try{return localStorage.getItem('fonte-gh-token')||''}catch(e){return''}}
function setGhToken(t){try{t?localStorage.setItem('fonte-gh-token',t):localStorage.removeItem('fonte-gh-token')}catch(e){}}
async function gh(path,opt={}){const r=await fetch(GH_API+path,{...opt,headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+ghToken(),...(opt.body?{'Content-Type':'application/json'}:{})}});
  if(r.status===401)throw new Error('Jeton refusé par GitHub : vérifie-le ou crée-en un nouveau.');if(r.status===403||r.status===404)throw new Error('Ce jeton n\'a pas le droit « gist ». Recrée-le en cochant « gist ».');if(!r.ok)throw new Error('GitHub a répondu une erreur ('+r.status+'). Réessaie plus tard.');return r.status===204?null:r.json()}
function cloudPayload(){const c=JSON.parse(JSON.stringify(S));c.active=null;return JSON.stringify({app:'carnet-fonte',saved:Date.now(),data:c})}
let cloudTimer=null,cloudBusy=false,cloudPending=false;
function cloudDirty(){if(fbOn()){clearTimeout(fbTimer);fbTimer=setTimeout(()=>fbPush(),15000)}if(!ghToken()||!S.settings.gistId)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(()=>cloudPush(),15000)}
async function cloudPush(manual){if(!ghToken()||!S.settings.gistId)return;if(cloudBusy){cloudPending=true;return}cloudBusy=true;clearTimeout(cloudTimer);
  try{await gh('/gists/'+S.settings.gistId,{method:'PATCH',body:JSON.stringify({files:{[GIST_FILE]:{content:cloudPayload()}}})});S.settings.lastSync=Date.now();S.settings.lastExport=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(manual)flash('Sauvegardé dans le cloud');if(ui.tab==='reglages')renderMain()}
  catch(e){if(manual)openDlg({title:'Synchro impossible',html:`<p class="dtext">${esc(e.message||'Pas de connexion.')}</p>`,buttons:[{label:'OK',kind:'primary'}]})}
  finally{cloudBusy=false;if(cloudPending){cloudPending=false;cloudTimer=setTimeout(()=>cloudPush(),3000)}}}
async function cloudRead(id){const g=await gh('/gists/'+id);const f=g.files&&g.files[GIST_FILE];if(!f)throw new Error('Fichier de sauvegarde introuvable.');let txt=f.content;if(f.truncated){const r=await fetch(f.raw_url);txt=await r.text()}const j=JSON.parse(txt);return j.data||j}
function applyCloud(d){bkSave('synchro');const keep={gistId:S.settings.gistId,ghLogin:S.settings.ghLogin,lbGist:S.settings.lbGist,lbName:S.settings.lbName,lbFb:S.settings.lbFb,fbUid:S.settings.fbUid,fbEmail:S.settings.fbEmail,fbName:S.settings.fbName};S={...defaultState(),...d,settings:{...defaultSettings(),...(d.settings||{}),...keep,lastSync:Date.now()}};rebuildIndex();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}applyTheme();ui.editorOpen=false;ui.picker=null;ui.detail=[];renderAll()}
async function cloudConnect(tok){setGhToken(tok.trim());
  try{const me=await gh('/user');S.settings.ghLogin=me.login;let gist=null;let page=1;
    while(!gist&&page<=5){const L=await gh('/gists?per_page=100&page='+page);gist=L.find(g=>g.files&&g.files[GIST_FILE]&&g.description===GIST_DESC);if(L.length<100)break;page++}
    if(!gist){const g=await gh('/gists',{method:'POST',body:JSON.stringify({description:GIST_DESC,public:false,files:{[GIST_FILE]:{content:cloudPayload()}}})});S.settings.gistId=g.id;S.settings.lastSync=Date.now();S.settings.lastExport=Date.now();save();renderMain();closeDlg();
      return openDlg({title:'Synchro activée',html:`<p class="dtext">Connecté en tant que <b>@${esc(me.login)}</b>. Tes données sont sauvegardées dans un fichier privé de ton GitHub, puis à chaque modification.</p>`,buttons:[{label:'Super',kind:'primary'}]})}
    S.settings.gistId=gist.id;save();const d=await cloudRead(gist.id);const n=(d.history||[]).length;
    if(!S.history.length){applyCloud(d);return flash(`${n} séances restaurées depuis le cloud`)}
    openDlg({title:'Sauvegarde trouvée',html:`<p class="dtext">Ton GitHub contient déjà une sauvegarde : <b>${n} séance${n>1?'s':''}</b>. Ce téléphone en a <b>${S.history.length}</b>.</p>`,
      buttons:[{label:'Récupérer la sauvegarde du cloud',kind:'primary',fn:()=>{applyCloud(d);flash('Données récupérées')}},{label:'Garder ce téléphone et écraser le cloud',kind:'soft',fn:()=>{cloudPush(true)}},{label:'Annuler',kind:'soft',fn:()=>{S.settings.gistId='';setGhToken('');save();renderMain()}}]})}
  catch(e){setGhToken('');S.settings.gistId='';S.settings.ghLogin='';save();openDlg({title:'Connexion impossible',html:`<p class="dtext">${esc(e.message||'Vérifie ta connexion internet.')}</p>`,buttons:[{label:'OK',kind:'primary'}]})}}
function cloudDlg(){openDlg({title:'Connecter GitHub',html:`<ol class="steps"><li>Ouvre <a href="https://github.com/settings/tokens/new?scopes=gist&description=Carnet%20de%20fonte" target="_blank" rel="noopener">github.com/settings/tokens/new</a> (connecté à ton compte).</li><li>Dans « Expiration », choisis <b>No expiration</b>. Vérifie que <b>gist</b> est coché.</li><li>Touche <b>Generate token</b>, copie le code qui commence par <b>ghp_</b> et colle-le ici.</li></ol>
  <label class="fld"><span>Jeton GitHub</span><input id="gh-tok" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ghp_…"></label><p class="dtext" style="font-size:13px">Le jeton reste sur ce téléphone. Il ne sert qu'à lire et écrire ta sauvegarde, et n'est jamais inclus dans tes exports.</p><p class="derr" id="gh-err" hidden></p>`,
  buttons:[{label:'Connecter',kind:'primary',fn:()=>{const v=$('#gh-tok').value.trim();if(v.length<20){const e=$('#gh-err');e.textContent='Colle le jeton complet.';e.hidden=false;return false}const b=document.querySelector('#dlg .btn-primary');if(b){b.textContent='Connexion…';b.disabled=true}cloudConnect(v);return false}},{label:'Annuler',kind:'soft'}]})}
function cloudCardHTML(){const gOn=ghToken()&&S.settings.gistId;const ago=t=>{const m=Math.round((Date.now()-t)/6e4);return m<1?'à l\'instant':m<60?`il y a ${m} min`:m<1440?`il y a ${Math.round(m/60)} h`:`il y a ${Math.round(m/1440)} j`};
  const last=`Dernière sauvegarde : ${S.settings.lastSync?ago(S.settings.lastSync):'jamais'}.`;
  const gBlock=gOn?`<p class="okline">${icon('cloud')}GitHub : @${esc(S.settings.ghLogin||'GitHub')}</p><div class="btnrow"><button class="btn btn-soft sm" data-act="cloud-push">Synchroniser GitHub</button><button class="btn btn-soft sm" data-act="cloud-pull">Récupérer depuis GitHub</button></div><button class="btn-ghost danger" data-act="cloud-off" style="align-self:flex-start">Déconnecter GitHub</button>`
    :`<button class="btn-ghost" data-act="cloud-connect" style="align-self:flex-start">${icon('cloud')}Utiliser GitHub à la place</button>`;
  if(NATIVE&&!NATIVE_G())return`<section class="card setc"><h3>Synchro cloud</h3><p class="dtext">La connexion Google arrive bientôt dans l'appli Android. En attendant, tu peux sauvegarder avec GitHub.</p>${gBlock.replace('Utiliser GitHub à la place','Connecter GitHub')}</section>`;
  const fbW=fbWanted()&&S.settings.fbUid;
  const gg=`<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="stroke:none"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"/></svg>`;
  return`<section class="card setc"><h3>Synchro cloud</h3>${fbW?`<p class="okline">${gg}${esc(S.settings.fbEmail||'Compte Google')}${fbUser?'':' <span class="muted">(connexion…)</span>'}</p><p class="dtext">Sauvegarde automatique après chaque modification. ${last}</p>
    <div class="btnrow"><button class="btn btn-primary" data-act="fb-push">Sauvegarder maintenant</button><button class="btn btn-soft" data-act="fb-pull">Récupérer la sauvegarde</button></div><div class="btnrow"><button class="btn-ghost danger" data-act="fb-off">Se déconnecter de Google</button><button class="btn-ghost danger" data-act="fb-delete">Supprimer mon compte</button></div>`
    :`<p class="dtext">Sauvegarde automatique de tes séances sur ton compte Google. Pratique si tu changes de téléphone, et nécessaire pour le classement entre potes.</p><button class="btn btn-google" data-act="fb-login">${gg}Se connecter avec Google</button>`}
    ${gOn||!fbW?`<div class="sep"></div>${gBlock}`:''}</section>`}

document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&cloudTimer){clearTimeout(cloudTimer);cloudPush()}if(document.visibilityState==='hidden'&&fbTimer){clearTimeout(fbTimer);fbPush()}});

/* ================= Clavier iOS : garder la fenêtre visible ================= */
(function(){const vv=window.visualViewport;if(!vv)return;const fit=()=>{const d=document.getElementById('dlg');if(!d)return;d.style.top=vv.offsetTop+'px';d.style.height=vv.height+'px';d.style.bottom='auto'};vv.addEventListener('resize',fit);vv.addEventListener('scroll',fit);fit()})();
document.addEventListener('focusin',e=>{if(e.target.closest&&e.target.closest('#dlg')&&e.target.matches('input,select,textarea'))setTimeout(()=>{try{e.target.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}},300)});

/* ================= Invitation à installer ================= */
let deferredInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;maybeInstallPrompt()});
const isStandalone=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const SHARE_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const ADD_SVG='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
function installSnoozed(){try{return +localStorage.getItem('fonte-install-later')>Date.now()}catch(e){return false}}
function snoozeInstall(days){try{localStorage.setItem('fonte-install-later',String(Date.now()+days*864e5))}catch(e){}}
let installShown=false;
function maybeInstallPrompt(force){if(NATIVE||isStandalone()||!document.querySelector('link[rel="manifest"]'))return;if(!force&&(installShown||installSnoozed()||MODAL))return;
  const ios=isIOS();if(!ios&&!deferredInstall&&!force)return;installShown=true;
  const other=ios&&/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  const steps=ios?`<ol class="inst">
      <li><span class="ib">${SHARE_SVG}</span><span>Touche <b>Partager</b>${other?' (dans la barre d\'adresse)':' en bas de Safari'}</span></li>
      <li><span class="ib">${ADD_SVG}</span><span>Fais défiler et choisis <b>Sur l'écran d'accueil</b></span></li>
      <li><span class="ib inst-ok">${icon('check')}</span><span>Touche <b>Ajouter</b>, puis ouvre l'app depuis son icône</span></li></ol>`
    :`<p class="dtext">Ajoute-la à ton téléphone : elle s'ouvrira en plein écran, comme une vraie application.</p>`;
  openDlg({title:'Installe Carnet de fonte',html:`<div class="inst-top"><img src="apple-touch-icon.png" alt="" class="inst-ic" onerror="this.remove()"><p class="dtext">Ajoute l'app à ton écran d'accueil : plein écran, hors ligne, et <b>tes séances restent en sécurité</b> (dans Safari, iOS peut les effacer).</p></div>${steps}`,
    buttons:[...(deferredInstall&&!ios?[{label:'Installer l\'application',kind:'primary',fn:async()=>{try{deferredInstall.prompt();await deferredInstall.userChoice}catch(e){}deferredInstall=null}}]:[{label:'J\'ai compris',kind:'primary',fn:()=>snoozeInstall(3)}]),{label:'Plus tard',kind:'soft',fn:()=>snoozeInstall(7)}]})}

/* ================= Démarrage ================= */
function fitScreen(){try{const st=navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);if(!st)return;
  const portrait=window.innerHeight>=window.innerWidth;const full=portrait?Math.max(screen.height,screen.width):Math.min(screen.height,screen.width);
  const h=/iPhone|iPad|iPod/.test(navigator.userAgent)?Math.max(full,window.innerHeight):window.innerHeight;
  document.documentElement.style.setProperty('--app-h',h+'px')}catch(e){}}
fitScreen();window.addEventListener('resize',fitScreen);window.addEventListener('orientationchange',()=>setTimeout(fitScreen,300));
if(S.active&&S.active.rest&&S.active.rest.end<Date.now())S.active.rest=null;
if(S.active){ui.edMode='workout';ui.editorOpen=true}
applyTheme();renderAll();save();
setTimeout(()=>maybeInstallPrompt(),1200);
if(MEDIA_MODE==='packs'){new MutationObserver(hydrate).observe(document.body,{childList:true,subtree:true});hydrate()}
setTimeout(()=>{if(!location.hash&&onbShouldShow())onbStart()},250);setTimeout(checkShareLink,300);setTimeout(checkFriendLink,320);setTimeout(checkMonthReport,1200);setTimeout(()=>checkBadges(true),1500);setTimeout(bkDaily,4000);setTimeout(bkOfferEmpty,2500);
if('serviceWorker'in navigator&&!NATIVE&&document.querySelector('link[rel="manifest"]')){navigator.serviceWorker.register('sw.js').catch(()=>{})}
