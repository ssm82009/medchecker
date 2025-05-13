
// اسم وإصدار الكاش
const CACHE_NAME = 'dawaa-amen-cache-v2';

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
  // تفعيل مباشرة بدون انتظار
  self.skipWaiting();
});

// استراتيجية الكاش المحسنة: استخدام النسخة الأحدث من الشبكة وتجنب الكاش للبيانات الديناميكية
self.addEventListener('fetch', event => {
  // تجاهل طلبات غير GET مثل PATCH و POST
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);
  
  // تحديد ما إذا كان الطلب للحصول على بيانات ديناميكية (API calls)
  const isDynamicRequest = url.pathname.includes('/rest/v1/') || 
                         url.pathname.includes('/auth/') ||
                         url.pathname.includes('/storage/');
  
  if (isDynamicRequest) {
    // استراتيجية "الشبكة أولاً" للبيانات الديناميكية - دائمًا استخدام البيانات المحدثة من الخادم
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.error('فشل الطلب الديناميكي:', error);
          // محاولة استخدام الكاش فقط إذا فشل الاتصال بالشبكة
          return caches.match(event.request);
        })
    );
  } else {
    // استراتيجية "الكاش ثم الشبكة" للأصول الثابتة
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // إعادة النسخة المخزنة مؤقتًا إذا كانت موجودة
          const fetchPromise = fetch(event.request)
            .then(networkResponse => {
              // تحديث الكاش بالنسخة الجديدة
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              console.log('استخدام الكاش بسبب فشل الاتصال بالشبكة');
              return cachedResponse;
            });
          
          // إعادة النسخة المخزنة أولاً ثم تحديثها بنسخة الشبكة
          return cachedResponse || fetchPromise;
        })
    );
  }
});

// تنظيف الكاش القديم عند تحديث Service Worker وتفعيل مباشر
self.addEventListener('activate', event => {
  console.log('تم تنشيط Service Worker الجديد');
  
  // مسح جميع الكاش القديم
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // المطالبة بالسيطرة على جميع الصفحات المفتوحة دون الحاجة إلى تحديث
      return self.clients.claim();
    })
  );
});

// استمع إلى رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_ALL_CACHE') {
    console.log('تم استلام طلب مسح الكاش');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('تم مسح جميع الكاش بنجاح');
        // إرسال تأكيد إلى التطبيق
        if (event.source && event.source.postMessage) {
          event.source.postMessage({ type: 'CACHE_CLEARED' });
        }
      })
    );
  }
});
