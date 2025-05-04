const CACHE_NAME = "task-timer-cache";
const CACHE_URLS = [
    "./",
    "./index.html",
    "./task-timer.js",
    "./manifest.json",
    "./images/icon__48.png",
    "./images/icon__72.png",
    "./images/icon__96.png",
    "./images/icon__128.png",
    "./images/icon__144.png",
    "./images/icon__192.png",
    "./images/icon__384.png",
    "./images/icon__512.png",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
];

// Instalacja - cache'owanie plików
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Otwieram cache i dodaję pliki");
            return cache.addAll(CACHE_URLS);
        })
    );
});

// Aktywacja - czyszczenie starego cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Usuwam stary cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch - serwowanie plików offline
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Jeśli plik jest w cache, zwróć go
            if (response) {
                return response;
            }
            // W przeciwnym razie pobierz z sieci
            return fetch(event.request);
        })
    );
});
