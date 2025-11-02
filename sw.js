const CACHE_NAME = 'co2-pwa-v1';
const ASSETS = [
'/',
'/index.html',
'/styles.css',
'/app.js',
'/push.js',
'/public/manifest.webmanifest',
'/public/icons/icon-192.png',
'/public/icons/icon-512.png'
];
self.addEventListener('install', (e) => {
e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});
self.addEventListener('activate', (e) => {
e.waitUntil(
caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))))
);
});
self.addEventListener('fetch', (e) => {
e.respondWith(
caches.match(e.request).then((cached) => cached || fetch(e.request))
);
});