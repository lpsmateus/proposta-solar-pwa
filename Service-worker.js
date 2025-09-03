// Base path do GitHub Pages para este repositório
const BASE = '/proposta-solar-pwa';
const CACHE = 'proposta-solar-v1';

// App shell + libs CDN para funcionar offline
const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`,
  // libs (mantidas via CDN)
  'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
];

self.addEventListener('install', (e)=>{
  e.waitUntil((async()=>{
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Cache-first para o app shell (arquivos locais no BASE); network-first para o resto
  if (url.origin === location.origin && url.pathname.startsWith(BASE)) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  } else if (ASSETS.includes(url.href)) {
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  } else {
    e.respondWith(fetch(e.request).catch(()=> caches.match(e.request)));
  }
});
