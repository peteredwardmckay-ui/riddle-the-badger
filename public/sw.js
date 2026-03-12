const CACHE = 'rtb-v1';

// On install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        '/',
        '/manifest.json',
      ])
    )
  );
  self.skipWaiting();
});

// On activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, falling back to network, then caching the response
self.addEventListener('fetch', event => {
  // Only handle GET requests for same-origin or static assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache, refresh in background
        event.waitUntil(
          fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
              }
            })
            .catch(() => {})
        );
        return cached;
      }

      // Not in cache — fetch, cache, return
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
        return response;
      });
    })
  );
});
