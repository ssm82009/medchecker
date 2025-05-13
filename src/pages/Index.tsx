
import React, { useEffect, useCallback } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
import { useTranslation } from '@/hooks/useTranslation';
import { clearAllCache } from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { dir, language, isChanging } = useTranslation();
  
  // دالة لتنظيف الكاش
  const clearCache = useCallback(async () => {
    try {
      // محاولة تنظيف الكاش من خلال Service Worker إذا كان متاحاً
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('Cleaning cache via Service Worker');
        await clearAllCache();
        
        // إرسال رسالة إلى Service Worker لتنظيف الكاش
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_ALL_CACHE'
        });
        
        console.log('Cache cleaned successfully');
        
        // إعادة تحميل الصفحة بعد تنظيف الكاش
        toast({
          title: language === 'ar' ? 'تم تنظيف الكاش' : 'Cache Cleared',
          description: language === 'ar' 
            ? 'تم تنظيف ذاكرة التخزين المؤقت بنجاح' 
            : 'Application cache has been successfully cleared',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, [language]);
  
  // تحديث Service Worker عند تحميل التطبيق
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().catch(error => {
          console.error('فشل تحديث service worker:', error);
        });
      });
      
      // الاستماع للرسائل من Service Worker
      const messageHandler = (event) => {
        if (event.data && event.data.type === 'CACHE_CLEARED') {
          console.log('Received confirmation that cache was cleared');
        }
      };
      
      navigator.serviceWorker.addEventListener('message', messageHandler);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', messageHandler);
      };
    }
  }, []);
  
  // تطبيق اتجاه RTL على مستند HTML إذا لزم الأمر
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.setAttribute('lang', 'en');
    };
  }, [dir]);
  
  // تنفيذ تنظيف الكاش عند تحميل الصفحة الرئيسية
  useEffect(() => {
    // التحقق إذا كانت هناك حاجة لتنظيف الكاش
    const lastCacheClear = localStorage.getItem('lastCacheClear');
    const now = Date.now();
    
    // تنظيف الكاش إذا لم يتم تنظيفه منذ أكثر من 30 دقيقة أو لم يتم تنظيفه أبداً
    if (!lastCacheClear || now - parseInt(lastCacheClear) > 30 * 60 * 1000) {
      clearCache().then(() => {
        localStorage.setItem('lastCacheClear', now.toString());
      });
    }
  }, [clearCache]);

  return (
    <div 
      className={`min-h-screen bg-transparent flex items-center justify-center p-0 m-0 w-full content-wrapper mb-10 ${isChanging ? 'language-changing' : 'fade-content-in'}`} 
      dir={dir}
    >
      <MedicationInteractionChecker />
    </div>
  );
};

export default Index;
