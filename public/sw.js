/**
 * Service Worker for PDF Flipbook Viewer
 * Handles persistent caching for flipbook images and core assets.
 */

const CACHE_NAME = 'pdf-flipbook-v1';
const IMAGE_CACHE_NAME = 'pdf-flipbook-images-v1';

// Assets to cache on installation
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/src/css/styles.css',
    '/src/js/app.js',
    '/src/js/utils.js',
    '/src/js/config.js'
];

// Install event - precache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precaching core assets');
            return cache.addAll(PRECACHE_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Cache-first for images, Network-first otherwise
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Strategy for Images (Cache-First)
    if (event.request.method === 'GET' && url.pathname.includes('/assets/') && (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png'))) {
        event.respondWith(
            caches.open(IMAGE_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // Return cached response if found
                    if (response) {
                        return response;
                    }

                    // Otherwise fetch from network, cache it, and return
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch((err) => {
                        console.error('[SW] Fetch failed for image:', url.pathname, err);
                        // We could return a heartbeat/placeholder here
                    });
                });
            })
        );
        return;
    }

    // Default strategy: Stale-while-revalidate for core assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse.ok && PRECACHE_ASSETS.includes(url.pathname)) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Fallback for failed fetches
                return cachedResponse;
            });

            return cachedResponse || fetchPromise;
        })
    );
});
