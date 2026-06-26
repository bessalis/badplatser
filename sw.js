const CACHE = 'badplatskollen-1782499504';
const ASSETS = [
  '/badplatser/',
  '/badplatser/index.html',
  '/badplatser/manifest.json',
  '/badplatser/icon-192.png',
  '/badplatser/icon-512.png',
  '/badplatser/apple-touch-icon.png',
];

// Install – cache core assets
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// Activate – delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch – network first, fall back to cache
self.addEventListener('fetch', e => {
  // Don't intercept HaV API calls – always fresh
  if (e.request.url.includes('havochvatten.se')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with fresh response
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
