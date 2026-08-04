const CACHE='as-arcade-mobile-v12-1';
const CORE=["./","./index.html","./styles.css?v=12.1","./avatar.js?v=12.1","./games.js?v=12.1","./games.json?v=12.1","./v12-core.js?v=12.1","./game-engines.js?v=12.1","./extra-engines.js?v=12.1","./v11-engines.js?v=12.1","./v12-chess.js?v=12.1","./app.js?v=12.1","./manifest.webmanifest?v=12.1","./arcade-logo.png?v=12.1","./favicon-32.png?v=12.1","./apple-touch-icon.png?v=12.1","./apple-touch-icon-v10.png?v=12.1","./icon-192.png?v=12.1","./icon-512.png?v=12.1","./maskable-192.png?v=12.1","./maskable-512.png?v=12.1"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));return}
  event.respondWith(fetch(event.request).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
