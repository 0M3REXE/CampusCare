// Minimal stub service worker to silence repeated 404 fetch errors.
// Currently this does no caching; it's a pass-through layer.
// You can expand with real caching strategies later.

self.addEventListener('install', () => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients so the SW starts controlling pages without reload
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Bypass non-GET or cross-origin requests
  const { request } = event;
  if (request.method !== 'GET') return;
  // Simple pass-through; could add cache logic here.
  event.respondWith(fetch(request).catch(() => new Response('Service Unavailable', { status: 503 })));
});
