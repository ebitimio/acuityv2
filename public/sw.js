const CACHE = "acuity-v7";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Only handle same-origin GET
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // Never cache or intercept API, auth, Next.js internals, JSON, HTML, or JS
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.endsWith(".json") ||
    req.destination === "document" ||
    req.destination === "script"
  ) {
    return;
  }

  // Only cache images, fonts, and svg icons
  if (
    req.destination === "image" ||
    req.destination === "font" ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2")
  ) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
  // Everything else — network only, no SW interference
});