// sw.js
const CACHE_NAME = 'erd-canvas-shell-v1';
const PRECACHE_URLS = [
  '/',                 // will serve index.html
  '/index.html',
  '/index.js',
  '/Router.js',
  '/styles/layout.css',
  '/styles/editor.css',
  '/assets/svg-icon.svg',
  // pre-cache your view modules too:
  '/views/LandingView.js',
  '/views/AppView.js',
  '/views/App.js',
  // plus all diagram scripts:
  '/views/diagram/EventBus.js',
  '/views/diagram/Editor.js',
  '/views/diagram/Parser.js',
  '/views/diagram/DiagramBuilder.js',
  '/views/diagram/TableBuilder.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  // clean up old caches if you bump CACHE_NAME
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // For navigation (i.e. the app shell), always return index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(res => res || fetch(req))
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(networkRes => {
        // and cache it for next time
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkRes.clone());
          return networkRes;
        });
      });
    })
  );
});
