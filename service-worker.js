// ============================================================
// 🔥 Service Worker – शब्दलोक (Offline + Speed)
// ============================================================

const CACHE_NAME = 'shabdalok-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/all-poems.html',
    '/category.html',
    '/categories.html',
    '/author.html',
    '/about.html',
    '/contact.html',
    '/privacy.html',
    '/terms.html',
    '/dmca.html',
    '/schedule.html',
    '/poem_love.html',
    '/poem_mother.html',
    '/poem_father.html',
    '/poem_family.html',
    '/poem_struggle.html',
    '/poem_inspiration.html',
    '/poem_loneliness.html',
    '/poem_philosophy.html',
    '/poem_nature.html',
    '/poem_patriotism.html',
    '/poem_time.html',
    '/flower-rain.js',
    '/style.css',
    '/manifest.json',
    '/images/sabdalock.webp',
    '/images/deepak-chauhan.webp'
];

// ===== INSTALL – Cache में Files Save करें =====
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('❌ Cache install error:', err))
    );
});

// ===== ACTIVATE – पुराना Cache हटाएँ =====
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Old cache removed:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// ===== FETCH – पहले Cache से दिखाएँ =====
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    }
                ).catch(() => {
                    return caches.match('/index.html');
                });
            })
    );
});

// ===== SKIP WAITING =====
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
