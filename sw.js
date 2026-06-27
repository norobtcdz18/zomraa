const CACHE_NAME = 'zomraa-v2-cache-v1';

const PRECACHE_URLS = [
  '/zomraa/',
  '/zomraa/index.html',
  '/zomraa/manifest.json',
  '/zomraa/icon-72x72.png',
  '/zomraa/icon-96x96.png',
  '/zomraa/icon-128x128.png',
  '/zomraa/icon-144x144.png',
  '/zomraa/icon-152x152.png',
  '/zomraa/icon-192x192.png',
  '/zomraa/icon-384x384.png',
  '/zomraa/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some precache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('firestore') || url.includes('googleapis') || url.includes('gstatic.com/firebasejs') || url.includes('identitytoolkit') || url.includes('firebaseapp.com') || !url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === 'GET' && response.status === 200 && !url.includes('firebase')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/zomraa/index.html');
          }
          return new Response('Offline - غير متاح', { status: 503 });
        });
      })
  );
});
