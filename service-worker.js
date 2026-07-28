const CACHE='as-arcade-mobile-v10.2-75-levels-accessibility';
const CORE=['./','./index.html','./styles.css?v=10.2','./avatar.js?v=10.2','./games.js?v=10.2','./games.json?v=10.2','./game-engines.js?v=10.2','./extra-engines.js?v=10.2','./app.js?v=10.2','./manifest.webmanifest?v=10.2','./arcade-logo.png?v=10.2','./favicon-32.png?v=10.2','./apple-touch-icon.png?v=10.2','./apple-touch-icon-v10.png?v=10.2','./icon-192.png?v=10.2','./icon-512.png?v=10.2','./maskable-192.png?v=10.2','./maskable-512.png?v=10.2'];
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
