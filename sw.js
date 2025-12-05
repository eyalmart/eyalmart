// 🔥 NEW VERSION — bump this to force-update all users instantly
const CACHE_VERSION = "eyalmart-cache-v10";  
const CACHE_NAME = CACHE_VERSION;

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// --------------------------------------------------
// INSTALL — Cache new files immediately
// --------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing new version:", CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );

  self.skipWaiting(); // ⬅️ Instantly activate the new SW
});

// --------------------------------------------------
// ACTIVATE — Delete ALL previous caches for a clean start
// --------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating new version, clearing old caches.");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );

  self.clients.claim(); // ⬅️ Take control immediately
});

// --------------------------------------------------
// FETCH — Network-first fallback to cache
// --------------------------------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(resp => {
          return resp || caches.match("./index.html");
        });
      })
  );
});