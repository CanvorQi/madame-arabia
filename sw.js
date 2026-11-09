/*
 * Madame Arabia service worker.
 * Caches the app shell on install and Google Fonts on first use, so the app works offline.
 * Bump CACHE_NAME after changing files so users receive the new version.
 */
const CACHE_PREFIX = "madame-arabia-";
const CACHE_NAME = CACHE_PREFIX + "v1";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/util.js",
    "./js/content/themes.js",
    "./js/content/words-content.js",
    "./js/content/words-function.js",
    "./js/content/sentences.js",
    "./js/content/paragraphs.js",
    "./js/linker.js",
    "./js/data.js",
    "./js/exam.js",
    "./js/pages-words.js",
    "./js/pages-texts.js",
    "./js/pages-exam.js",
    "./js/pages-manage.js",
    "./js/app.js",
    "./icons/icon.svg",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-maskable-512.png",
];
const CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
            // Install even if one file is missing; the fetch handler fills the cache later.
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map((k) => caches.delete(k))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    const sameOrigin = url.origin === self.location.origin;
    if (!sameOrigin && !CDN_HOSTS.includes(url.hostname)) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            const fromNetwork = () => fetch(event.request).then((res) => {
                if (res && (res.ok || res.type === "opaque")) cache.put(event.request, res.clone());
                return res;
            });
            if (sameOrigin) {
                // Own files: network first for freshness, cache when offline.
                return fromNetwork().catch(() =>
                    cache.match(event.request, { ignoreSearch: true }).then((c) => c || cache.match("./index.html"))
                );
            }
            // Fonts are versioned and immutable: cache first.
            return cache.match(event.request).then((c) => c || fromNetwork());
        })
    );
});
