
// اسم وإصدار الكاش
const CACHE_NAME = 'dawaa-amen-cache-v1';

// الملفات التي سيتم تخزينها في الكاش
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/',
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

// استراتيجية الكاش المحسنة: فقط طلبات GET
self.addEventListener('fetch', event => {
  // تجاهل طلبات غير GET مثل PATCH و POST
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // محاولة الحصول على الاستجابة من الكاش أولاً
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // إرجاع النسخة المخزنة مؤقتاً إذا كانت موجودة
        return cachedResponse;
      }

      // إذا لم تكن موجودة في الكاش، طلب من الشبكة
      return fetch(event.request).then(response => {
        // التحقق من أن الاستجابة صالحة
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // نسخ الاستجابة لأن الاستجابة هي تيار ويمكن استخدامه مرة واحدة فقط
        const responseToCache = response.clone();

        // تخزين الاستجابة في الكاش
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
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
