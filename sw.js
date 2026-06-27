const CACHE_NAME = 'zomraa-v2-cache-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch((e) => console.warn('[SW] precache partial:', e)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firestore') || event.request.url.includes('googleapis') || event.request.url.includes('gstatic.com/firebasejs') || event.request.url.includes('identitytoolkit') || !event.request.url.startsWith('http')) return;
  event.respondWith(
    fetch(event.request).then((res) => {
      if (event.request.method === 'GET' && res.status === 200 && !event.request.url.includes('firebase')) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return res;
    }).catch(() => {
      return caches.match(event.request).then((cached) => cached || (event.request.headers.get('accept')?.includes('text/html') ? caches.match('/index.html') : new Response('غير متاح', { status: 503 })));
    })
  );
});
