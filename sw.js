// Vela Service Worker — offline cache
const CACHE='vela-v1';
const ASSETS=[
  '/Finance/',
  '/Finance/index.html',
  '/Finance/icon.svg',
  '/Finance/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap',
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // Only cache GET requests, skip Google API calls
  if(e.request.method!=='GET')return;
  if(e.request.url.includes('googleapis.com')||e.request.url.includes('accounts.google.com'))return;

  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(response=>{
        if(!response||response.status!==200)return response;
        const clone=response.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return response;
      }).catch(()=>cached);
    })
  );
});
