
// اسم وإصدار الكاش
const CACHE_NAME = 'dawaa-amen-cache-v1';

// الملفات التي سيتم تخزينها في الكاش
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/lovable-uploads/00603cfc-b55d-4982-9bdd-816a020d0dd6.png',
  '/lovable-uploads/ee383530-07ca-46df-b565-919c083ae6be.png',
  '/lovable-uploads/79bd3aec-827d-4235-8d65-98981645d628.png',
  '/lovable-uploads/e761e37c-1c08-4a2b-8ad1-5bf00b094fa1.png',
  '/lovable-uploads/da09156a-50c4-49ac-9007-7cb081465785.png'
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
