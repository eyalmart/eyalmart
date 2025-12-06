// ------------------------------------------------------------
// 🚀 FORCE VERSION UPDATE — change this to refresh all devices
// ------------------------------------------------------------
const CACHE_VERSION = "eyalmart-v27";
const CACHE_NAME = CACHE_VERSION;

// ------------------------------------------------------------
// ❗ NEVER CACHE THESE URLs (especially Razorpay checkout.js)
// ------------------------------------------------------------
const NEVER_CACHE = [
  "checkout.razorpay.com",
  "razorpay.com",
  "/sw.js"
];

// ------------------------------------------------------------
// FILES SAFE TO CACHE (app shell only)
// ------------------------------------------------------------
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ------------------------------------------------------------
// INSTALL — Cache app shell immediately
// ------------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installing:", CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE).catch(err => {
        console.warn("[SW] Cache install failed:", err);
      });
    })
  );

  self.skipWaiting(); // activate immediately
});

// ------------------------------------------------------------
// ACTIVATE — Remove all OLD caches
// ------------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating & cleaning old caches…");

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

  self.clients.claim(); // take control immediately
});

// ------------------------------------------------------------
// FETCH HANDLER — Hybrid caching strategy
// ------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = request.url;

  // 🔥 1) Never cache Razorpay or dynamic scripts
  if (NEVER_CACHE.some(blocked => url.includes(blocked))) {
    return event.respondWith(fetch(request));
  }

  // 🔵 2) Always network-first for HTML (ensures latest UI)
  if (request.headers.get("accept")?.includes("text/html")) {
    return event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }

  // 🟢 3) Cache-first for static assets (fast loading)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => {
          // fallback to index.html for offline mode
          return caches.match("./index.html");
        });
    })
  );
});
