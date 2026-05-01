const CACHE_NAME = "vxnn-life-v1";
const FILES = ["./","index.html","style.css","script.js","firebase-config.js","manifest.json","assets/charan_vxnn.jpg"];
self.addEventListener("install", e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES))));
self.addEventListener("fetch", e=>e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request))));
