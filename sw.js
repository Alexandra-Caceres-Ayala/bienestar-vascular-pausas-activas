/* =================================================================
   BIENESTAR VASCULAR · sw.js  (Service Worker de la WEB/PWA)
   SOLO se usa en la versión web (lo registra index.html). La
   extensión de Chrome NO carga este archivo (usa background.js).
   Función: cachear la app para que cargue rápido y funcione offline,
   y permitir "Instalar" la web como app en móvil y PC.
   ================================================================= */

const CACHE = "bienestar-vascular-v4";

// Recursos mínimos para que la app funcione sin conexión.
const ASSETS = [
  "./",
  "./index.html",
  "./popup.css",
  "./popup.js",
  "./core.js",
  "./i18n.js",
  "./manifest.webmanifest",
  "./img/hero.webp",
  "./icons/icon16.png",
  "./icons/icon48.png",
  "./icons/icon128.png",
  "./icons/icon192.png",
  "./icons/icon512.png"
];

// Instalación: precachea los recursos.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpia versiones antiguas de la caché.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategia "network first" (contenido siempre fresco cuando hay red;
// si no hay conexión, sirve la copia cacheada -> funciona offline).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Para los archivos de la app (mismo origen) forzamos red SIN caché HTTP,
  // así nunca se sirve una versión vieja. Respaldo a la caché si no hay conexión.
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  const netReq = sameOrigin ? new Request(req.url, { cache: "no-store" }) : req;

  event.respondWith(
    fetch(netReq)
      .then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
