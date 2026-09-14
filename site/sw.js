const CACHE = 'angel-shell-v1';
const SHELL = ['/', '/app.html', '/app.css', '/logo-motion.css', '/angel-logo.svg', '/manifest.webmanifest'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); return r;
  }).catch(() => caches.match('/app.html'))));
});
