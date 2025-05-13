
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define AI settings type
export interface AISettingsType {
  apiKey: string;
  model: string;
}

// Validate value against AISettingsType
export const isAISettingsType = (value: any): value is AISettingsType => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'apiKey' in value &&
    'model' in value &&
    typeof value.apiKey === 'string' &&
    typeof value.model === 'string'
  );
};

// Safely parse AI settings
export const safelyParseAISettings = (value: Record<string, Json>): AISettingsType => {
  return {
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : '',
    model: typeof value.model === 'string' ? value.model : 'gpt-4o-mini'
  };
};

// محاولات إعادة محاولة الاتصال بالشبكة
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// تحديث localStorage للنافذة الحالية
export const updateLocalStorageCache = (key: string, value: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
      console.log(`تم تحديث التخزين المحلي لـ ${key}`);
    }
  } catch (error) {
    console.error('خطأ في تحديث التخزين المحلي:', error);
  }
};

// مسح كل ذاكرة التخزين المؤقت
export const clearAllCache = async () => {
  try {
    // مسح localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      console.log('تم مسح التخزين المحلي بنجاح');
    }
    
    // مسح كاش Service Worker إذا كان متاحًا
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.active) {
        return new Promise<void>((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data && event.data.type === 'CACHE_CLEARED') {
              console.log('تم استلام تأكيد مسح الكاش');
              resolve();
            }
          };
          
          navigator.serviceWorker.controller.postMessage(
            { type: 'CLEAR_ALL_CACHE' },
            [messageChannel.port2]
          );
          
          // تعيين مهلة في حالة عدم استلام الرد
          setTimeout(() => {
            console.log('انتهت مهلة انتظار تأكيد مسح الكاش');
            resolve();
          }, 1000);
        });
      }
    }
  } catch (error) {
    console.error('خطأ في مسح الكاش:', error);
  }
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // Do not store sensitive data in localStorage
  const isSensitiveKey = key === 'aiSettings';
  
  // Make sure this useState is called within a React component
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    // For AI settings, never use localStorage
    if (isSensitiveKey) {
      return initialValue;
    }
    
    try {
      // Get from localStorage for non-sensitive data
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // تنفيذ وظيفة لجلب البيانات من الخادم مع دعم إعادة المحاولة
  const fetchFromDatabase = async (retries = 0): Promise<void> => {
    if (key === 'aiSettings') {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
          // Safe type cast with validation
          const jsonValue = data.value as Record<string, Json>;
          
          // Create a proper object that matches type T but never expose API key in state
          // We're only storing model in client state
          const sanitizedSettings = {
            model: typeof jsonValue.model === 'string' ? jsonValue.model : 'gpt-4o-mini',
            apiKey: '' // Never store the API key in client state
          } as unknown as T;
          
          setStoredValue(sanitizedSettings);
        }
      } catch (error) {
        console.error(`فشل الاتصال (محاولة ${retries + 1}/${MAX_RETRIES}):`, error);
        
        // إعادة المحاولة إذا لم نتجاوز الحد الأقصى
        if (retries < MAX_RETRIES) {
          setTimeout(() => {
            fetchFromDatabase(retries + 1);
          }, RETRY_DELAY * Math.pow(2, retries)); // زيادة وقت الانتظار تصاعديًا
        }
      }
    }
  };
  
  // For AI settings, fetch from database
  useEffect(() => {
    if (key === 'aiSettings') {
      fetchFromDatabase();
    }
  }, [key]);

  // تحديث القيمة وتنفيذ تأثيرات جانبية (مثل تحديث localStorage)
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Only update localStorage for non-sensitive data
      if (typeof window !== 'undefined' && !isSensitiveKey) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('خطأ في تحديث البيانات المخزنة:', error);
    }
  };

  return [storedValue, setValue] as const;
};
