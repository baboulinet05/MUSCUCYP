// Carnet de fonte : cache hors ligne
const CACHE='fonte-v13';
const CORE=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];
const MEDIA=['./media/thumbs.json','./media/p0.json','./media/p1.json','./media/p2.json','./media/p3.json','./media/p4.json','./media/p5.json','./media/p6.json','./media/p7.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{caches.open(CACHE).then(c=>Promise.all(MEDIA.map(u=>c.match(u).then(h=>h||c.add(u).catch(()=>{}))))).catch(()=>{});
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;if(!req.url.startsWith(self.location.origin))return;
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})))});
