/* ---------------------------------------------------------
   Service Worker — macht die App offline nutzbar.

   WICHTIG: Nach jeder Änderung an index.html die Zahl in
   VERSION um eins erhöhen. Sonst zeigt dein iPhone weiter
   die alte, zwischengespeicherte Fassung an.
   --------------------------------------------------------- */
const VERSION = 4;
const CACHE = `training-v${VERSION}`;

const FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// Beim Installieren alles in den Cache legen
self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Beim Aktivieren alte Versionen aufräumen
self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: online immer die frische Fassung, offline aus dem Cache.
// So bekommst du Updates ohne Neuinstallation, funktionierst aber im Keller
// ohne Empfang trotzdem.
self.addEventListener('fetch', ev => {
  // Nur den App-Shell-Origin cachen — API-Aufrufe an das Backend
  // (anderer Origin) sollen immer live gehen, nie aus dem Cache.
  if (ev.request.method !== 'GET' || new URL(ev.request.url).origin !== self.location.origin) return;
  ev.respondWith(
    fetch(ev.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(ev.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match('./index.html')))
  );
});
