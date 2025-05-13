// اسم وإصدار الكاش
const CACHE_NAME = 'dawaa-amen-cache-v5';

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
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache).then(() => {
          console.log('[Service Worker] All resources have been cached');
        });
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// تنظيف الكاش القديم عند التفعيل
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// معالجة طلبات الشبكة
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  
  // تحديد ما إذا كان الطلب للحصول على بيانات ديناميكية
  const isDynamicRequest = requestUrl.pathname.includes('/rest/v1/') || 
                         requestUrl.pathname.includes('/auth/') ||
                         requestUrl.pathname.includes('/storage/') ||
                         requestUrl.pathname.includes('/admin') ||
                         requestUrl.pathname.includes('/dashboard');

  if (isDynamicRequest) {
    // استراتيجية "الشبكة فقط" للطلبات الديناميكية
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('[Service Worker] Dynamic request failed:', error);
          return new Response('Network error', {
            status: 408,
            statusText: 'Network error'
          });
        })
    );
  } else {
    // استراتيجية "الكاش ثم الشبكة" للمحتوى الثابت
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // حاول الحصول من الشبكة أولاً
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // تحديث الكاش إذا كانت الاستجابة صالحة
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache))
                  .catch(error => {
                    console.error('[Service Worker] Cache update failed:', error);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // استخدم الكاش إذا فشل الاتصال بالشبكة
              return cachedResponse || new Response('Offline content', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });

          // إرجاع الكاش الموجود إذا كان متاحاً، أو انتظر الاستجابة من الشبكة
          return cachedResponse || fetchPromise;
        })
    );
  }
});

// معالجة رسائل التطبيق
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    console.log('[Service Worker] Received cache clear request');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] All caches cleared');
        if (event.source) {
          event.source.postMessage({ type: 'CACHE_CLEARED' });
        }
      })
    );
  }
});

// تسجيل الأخطاء
self.addEventListener('error', event => {
  console.error('[Service Worker] Error:', event.error);
});