const CACHE_NAME = 'herp-cache-v1';
const urlsToCache = ['/app/', '/app/index.html', '/app/styles.css', '/app/db.js', '/app/core.js'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
