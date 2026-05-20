/**
 * HERP Service Worker — يدعم PWA والتخزين المؤقت للملفات الأساسية
 */

const CACHE_NAME = 'herp-v0.1.0';
const urlsToCache = [
  './',
  './index.html',
  './landing.html',
  './app/index.html',
  './app/boot.js',
  './app/main.js',
  './app/events/bus.js',
  './app/events/event-types.js',
  './app/events/middleware.js',
  './app/crypto/encryption.js',
  './app/crypto/key-manager.js',
  './app/storage/adapters/local.adapter.js',
  './app/core/kernel.js',
  './app/core/registry.js',
  './app/core/health/health-check.js',
  './app/core/health/status-report.js',
  './app/core/health/alerting.js',
  './app/permissions/roles.js',
  './app/permissions/guard.js',
  './app/permissions/rule-engine.js',
  './app/permissions/session-manager.js',
  './app/permissions/audit-hooks.js',
  './app/sdk/module-sdk.js',
  './app/ui/router.js',
  './app/ui/state.js',
  './app/ui/renderer.js',
  './app/ui/screens.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // نسمح فقط بطلبات من نفس المصدر
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/app/index.html');
    })
  );
});
