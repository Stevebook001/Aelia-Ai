const CACHE = "aelia-admin-shell-v2";
const CORE = ["/", "/index.html", "/styles.css", "/app.js", "/public-enhancements.js", "/aelia-mark.svg", "/admin.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE).catch(() => {})).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("aelia-admin-shell-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.headers.has("authorization")) return;
  if (/^\/(api|v1|health|mcp)(\/|$)/.test(url.pathname)) return;
  if (url.searchParams.has("token")) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request, { cache: "no-store" }).catch(() => new Response("AELIA Admin is offline. Reconnect to access the protected administration console.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } })));
    return;
  }
  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(request, copy)); }
      return response;
    })));
  }
});
