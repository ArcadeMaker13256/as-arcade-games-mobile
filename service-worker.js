const CACHE='as-arcade-mobile-v10-1-logo-repair';
const CORE=['./','./index.html','./styles.css?v=10.1','./avatar.js?v=10.1','./games.js?v=10.1','./games.json?v=10.1','./game-engines.js?v=10.1','./extra-engines.js?v=10.1','./app.js?v=10.1','./manifest.webmanifest?v=10.1','./assets/arcade-logo.png?v=10.1','./icons/favicon-32.png?v=10.1','./icons/apple-touch-icon.png?v=10.1','./apple-touch-icon-v10.png','./icons/icon-192.png?v=10.1','./icons/icon-512.png?v=10.1','./icons/maskable-192.png?v=10.1','./icons/maskable-512.png?v=10.1'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(['document','script','style','image'].includes(event.request.destination)||url.pathname.endsWith('.json')||url.pathname.endsWith('.webmanifest')){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
  }
});
