
// اسم وإصدار الكاش
const CACHE_NAME = 'dawaa-amen-cache-v1';

// الملفات التي سيتم تخزينها في الكاش
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/lovable-uploads/29abcb36-507a-440e-b78a-ab8c08b596f7.png',
  '/lovable-uploads/824e3d1f-eb0a-4fbd-b507-771e74f9d4f3.png',
  '/lovable-uploads/3177a7d1-0b87-48fd-8c05-8398e232e7e1.png',
  '/lovable-uploads/3d2cd062-f87e-4cfe-88b0-86eb3059089c.png',
  '/lovable-uploads/0a1e8a0d-5362-4027-b17c-7aac53e5ae78.png'
];

// تثبيت Service Worker وتخزين الملفات في الكاش
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// استراتيجية الكاش: الشبكة أولاً مع التخزين في الكاش (Network First with Cache Fallback)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // تخزين النسخة الجديدة في الكاش
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // استخدام الكاش في حال فشل الاتصال بالإنترنت
        return caches.match(event.request);
      })
  );
});

// حذف الكاش القديم عند تحديث Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
