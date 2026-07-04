const CACHE_NAME = 'av-notes-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './collection.html',
  './css/style.css',
  './js/db.js',
  './manifest.json'
];

// Install Event - Precache core pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network first, fallback to Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkRes) => {
        // Update cache with fresh version
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return networkRes;
      })
      .catch(() => {
        // If offline, serve from cache
        return caches.match(event.request).then((cachedRes) => {
          return cachedRes || caches.match('./index.html');
        });
      })
  );
});