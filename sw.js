/* ============================================
   YoSoy222 — Service Worker
   Offline caching for PWA
   ============================================ */

const CACHE_NAME = 'yosoy222-v17';

// Assets to precache on install (offline shell + LCP images)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/css/style.css?v=17',
  '/css/dashboard.css?v=17',
  '/js/analytics.js?v=17',
  '/js/app.js?v=17',
  '/js/dashboard.js?v=17',
  '/manifest.json',
  '/icons/icon-192x192.png?v=15',
  '/icons/icon-512x512.png?v=15',
  '/icons/icon-maskable-192x192.png?v=15',
  '/icons/icon-maskable-512x512.png?v=15',
  '/images/thumbs/hero-rosas-3.jpg',
  '/images/thumbs/hero-escaparate.jpg'
];

// Dedicated marker used to know the full catalog is already cached
const CATALOG_MARKER = '/__catalog_precached__';

// Install event — precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event — Network-first for navigation, Cache-first/Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (fonts, WhatsApp, analytics, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // 1. Navigation requests: Network-First with Cache fallback (ensures online users get fresh HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 2. Static subresources: Cache-First / Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate JS and CSS in background
          const url = new URL(event.request.url);
          if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            event.waitUntil(
              fetch(event.request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                  }
                })
                .catch(() => {})
            );
          }
          return cachedResponse;
        }

        // Not in cache — fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            return networkResponse;
          })
          .catch(() => new Response('Offline', { status: 503, statusText: 'Service Unavailable' }));
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (data.type === 'PRECACHE_IMAGES' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(async (cache) => {
          // Idempotent: skip if the catalog was already precached in this cache
          if (await cache.match(CATALOG_MARKER)) return;

          // Download in batches of 6 to avoid network saturation on mobile devices
          const BATCH_SIZE = 6;
          for (let i = 0; i < data.urls.length; i += BATCH_SIZE) {
            const batch = data.urls.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (url) => {
              try {
                const abs = new URL(url, self.location.origin).href;
                const existing = await cache.match(abs);
                if (!existing) {
                  const res = await fetch(abs);
                  if (res && res.ok) await cache.put(abs, res);
                }
              } catch (err) { /* ignore individual network failure */ }
            }));
          }

          // Mark catalog precache as completed only AFTER all batches have processed
          await cache.put(new Request(CATALOG_MARKER), new Response('ok', { status: 200 }));
        })
    );
  }
});
