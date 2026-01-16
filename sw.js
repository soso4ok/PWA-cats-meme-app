/**
 * Service Worker for Cat Memes PWA
 * Handles caching and offline functionality
 */

const CACHE_NAME = 'cat-memes-pwa-v1';

// Files to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/js/main.js',
    '/manifest.json',
    '/images/pwa-icon-192.png',
    '/images/pwa-icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network with dynamic caching
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if response is valid
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone response for caching
                        const responseToCache = networkResponse.clone();

                        // Add to cache dynamically
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('[Service Worker] Caching new resource:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // For navigation requests, return cached index.html
                        if (event.request.mode === 'navigate') {
                            console.log('[Service Worker] Returning cached index.html for offline navigation');
                            return caches.match('/index.html');
                        }

                        // For image requests, you could return a placeholder
                        if (event.request.destination === 'image') {
                            return caches.match('/images/pwa-icon-192.png');
                        }

                        // Return undefined to let the browser handle the error
                        return undefined;
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync triggered:', event.tag);
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        console.log('[Service Worker] Push received:', data);

        const options = {
            body: data.body || 'New cat meme available!',
            icon: '/images/pwa-icon-192.png',
            badge: '/images/pwa-icon-128.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                { action: 'view', title: 'View Meme' },
                { action: 'close', title: 'Close' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Cat Memes', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
