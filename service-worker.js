const CACHE='as-arcade-mobile-v11-6';
const CORE=['./','./index.html','./styles.css?v=11.6','./avatar.js?v=11.6','./games.js?v=11.6','./games.json?v=11.6','./game-engines.js?v=11.6','./extra-engines.js?v=11.6','./v11-engines.js?v=11.6','./app.js?v=11.6','./manifest.webmanifest?v=11.6','./arcade-logo.png?v=11.6','./favicon-32.png?v=11.6','./apple-touch-icon.png?v=11.6','./apple-touch-icon-v10.png?v=11.6','./icon-192.png?v=11.6','./icon-512.png?v=11.6','./maskable-192.png?v=11.6','./maskable-512.png?v=11.6'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));return}
  event.respondWith(fetch(event.request).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
