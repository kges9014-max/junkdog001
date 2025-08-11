const CACHE = 'pill-gate-v1';
const ASSETS = [
  '/', '/manifest.webmanifest',
  '/data/items.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/data/')) {
    // Stale-While-Revalidate for data
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        const fetcher = fetch(e.request).then(res => {
          c.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fetcher;
      })
    );
    return;
  }
  // Cache-first for others
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
