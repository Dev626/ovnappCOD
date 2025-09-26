var base_href = "/";

var RUNTIME = "runtime-v1.0.0";
RUNTIME_URLS = [];

var PRECACHE = "precache-v1.0.0";
PRECACHE_URLS = [

];
var CURREMT = "cache-v1";
CURREMT_URLS = [];

var WHILE_LIST = [];

var processList = function(url, origin) {
    if (url && origin) {
        var count = 0;
        for (var i = 0; i < WHILE_LIST.length; i++) {
            if (url.indexOf(origin + "/" + WHILE_LIST[i] + "/") !== -1) {
                count++;
            }
        }
        return (count == 0) ? true : false;
    } else {
        return true;
    }
};

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(RUNTIME).then(cache => cache.addAll(RUNTIME_URLS)).then(self.skipWaiting())
    );
    event.waitUntil(
        caches.open(CURREMT).then(cache => cache.addAll(CURREMT_URLS)).then(self.skipWaiting())
    );
    event.waitUntil(
        caches.open(CURREMT).then(cache => cache.addAll(CURREMT_URLS)).then(self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [PRECACHE, CURREMT, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {

    if (!processList(event.request.url, self.location.origin)) {
        return false;
    }

    var cond_assets = event.request.url.startsWith(self.location.origin + base_href + "/assets");
    var cond_main = event.request.url.startsWith(self.location.origin);

    if (cond_assets || cond_main) {

        var cache_base = cond_assets ? PRECACHE : RUNTIME;

        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return caches.open(cache_base).then(cache => {
                    return fetch(event.request).then(response => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});