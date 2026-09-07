const CACHE_NAME = 'nutrition-dashboard-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/nutrition-192.svg',
  './icons/nutrition-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isApprovedStaticAsset(request) {
  const url = new URL(request.url);
  return [
    'cdn.tailwindcss.com',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ].includes(url.hostname);
}

function isPrivateOrNetworkApi(request) {
  const url = new URL(request.url);
  if (/\/rest\/v1\//.test(url.pathname) ||
    /\/functions\/v1\//.test(url.pathname) ||
    /supabase|gemini|googleapis/i.test(url.hostname + url.pathname)) return true;
  return url.origin !== self.location.origin && !isApprovedStaticAsset(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || isPrivateOrNetworkApi(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok && (new URL(request.url).origin === self.location.origin || isApprovedStaticAsset(request))) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
