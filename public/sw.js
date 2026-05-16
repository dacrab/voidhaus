const CACHE = 'voidhaus-v1';
const PRECACHE = ['/', '/collection', '/about', '/contact'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only cache http/https GET requests from our origin
  if (request.method !== 'GET') return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return;

  e.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      });
      return cached || fetched;
    })
  );
});
