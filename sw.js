// The Service Worker: The 'Invisible' Proxy
const CACHE_NAME = 'veck-mod-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    console.log("SERVICE WORKER INSTALLED");
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log("SERVICE WORKER ACTIVATED");
});

// THE INTERCEPTOR: This catches the game's files and forces them to load
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // If the game is asking for its 'Brain' or Assets, we ensure they aren't blocked
    if (url.href.includes('veck.io')) {
        event.respondWith(
            fetch(event.request, {
                mode: 'no-cors', // Bypass strict security checks
                credentials: 'omit'
            }).then(response => {
                return response;
            }).catch(err => {
                // Fallback to a public proxy if the direct connection fails
                return fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url.href));
            })
        );
    }
});
