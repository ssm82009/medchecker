
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Advertisement: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // دالة لجلب بيانات الإعلانات مع إمكانية إعادة المحاولة
  const fetchAdvertisement = useCallback(async (bypass = false) => {
    try {
      // تجاوز الكاش عند الضرورة
      const options: RequestInit = bypass ? {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      } : {};
      
      // استخدام معامل عشوائي لتجنب الكاش
      const cacheParam = bypass ? `?_nocache=${Date.now()}` : '';
      
      // استخدام type assertion للتعامل مع مشكلة النوع في Supabase client
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('type', 'advertisement')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('خطأ في جلب الإعلانات:', error);
        return;
      }
      
      if (data && data.value && typeof data.value === 'object' && 'html' in data.value) {
        setHtmlContent(data.value.html as string);
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('خطأ في مكون الإعلانات:', error);
    }
  }, []);

  // تحميل الإعلان عند تحميل المكون وتحديث كل 15 دقيقة
  useEffect(() => {
    fetchAdvertisement();
    
    // تحديث كل 15 دقيقة (900,000 مللي ثانية)
    const intervalId = setInterval(() => {
      fetchAdvertisement(true); // تجاوز الكاش عند التحديث الدوري
    }, 900000);
    
    return () => clearInterval(intervalId);
  }, [fetchAdvertisement]);

  // Only render if there's content
  if (!htmlContent) return null;
  
  return (
    <div 
      className="mb-6 w-full overflow-hidden" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
      data-last-updated={lastUpdated} // إضافة سمة لتتبع وقت آخر تحديث
    />
  );
};

export default Advertisement;
