// Carnet de fonte : cache hors ligne
const CACHE='fonte-3.5';
const MEDIA_CACHE='fonte-media'; // photos et animations : gardées d'une version à l'autre
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./lib/qrcode.js','./media/logo.svg','./css/app.css?v=3.5','./js/data.js?v=3.5','./js/app.js?v=3.5'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE&&x!==MEDIA_CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;if(!req.url.startsWith(self.location.origin))return;
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));return}
  const media=new URL(req.url).pathname.includes('/media/');
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(media?MEDIA_CACHE:CACHE).then(c=>c.put(req,cp))}return r})))});
