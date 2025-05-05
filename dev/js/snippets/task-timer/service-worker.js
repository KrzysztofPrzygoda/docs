const START_URL = '/apps/task-timer/'; // zgodnie z manifestem
const CACHE_NAME = 'task-timer-cache';
const CACHE_URLS = [
    "./",
    "./index.html",
    "./task-timer.js",
    "./manifest.json",
    "./images/icons/favicon-dark.svg",
    "./images/icons/favicon-light.svg",
    "./images/icons/favicon-96-light.png",
    "./images/icons/favicon-96-dark.png",
    "./images/icons/icon__48.png",
    "./images/icons/icon__72.png",
    "./images/icons/icon__96.png",
    "./images/icons/icon__128.png",
    "./images/icons/icon__144.png",
    "./images/icons/icon__180.png",
    "./images/icons/icon__192.png",
    "./images/icons/icon__384.png",
    "./images/icons/icon__512.png",
    "./images/icons/icon-maskable__512.png",
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

// Obsługa kliknięcia w notyfikację
self.addEventListener('notificationclick', function (event) {
    const targetUrl = new URL(START_URL, self.location.origin).href;

    event.notification.close();
    console.log('Kliknięto w powiadomienie, otwieram:', targetUrl, event);

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    // Chrome czasami potrzebuje navigate + focus
                    return client.navigate(targetUrl).then(() => client.focus());
                }
            }

            // Jeśli brak otwartego okna – otwórz nowe (Chrome otworzy w przeglądarce)
            return clients.openWindow(targetUrl);
        })
    );
});
