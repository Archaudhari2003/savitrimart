/**
 * SavitriMart Service Worker
 * Provides basic offline support and caching
 * Version: 1.0.0
 */

const CACHE_NAME = 'savitrimart-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/gallery.html',
    '/main.css',
    '/gallery.css',
    '/main.js',
    '/contact.js',
    '/gallery.js',
    '/offline.html'
];

// Install event - cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Cache installation failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests and analytics
    if (event.request.method !== 'GET' || 
        requestUrl.hostname.includes('plausible') ||
        requestUrl.hostname.includes('google-analytics')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Don't cache large video files
                                const isVideo = event.request.url.match(/\.(mp4|webm|ogg)$/i);
                                if (!isVideo) {
                                    cache.put(event.request, responseToCache);
                                }
                            })
                            .catch(err => console.error('Cache put failed:', err));
                        
                        return response;
                    })
                    .catch(() => {
                        // If fetch fails (offline), return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        // Return a simple error response for other resources
                        return new Response('Offline - content unavailable', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for form submissions (optional)
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForms());
    }
});

async function syncContactForms() {
    // Implementation for offline form submission sync
    console.log('Syncing offline contact forms...');
}