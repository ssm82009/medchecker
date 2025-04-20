
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// تعريف نوع إعدادات الذكاء الاصطناعي
export interface AISettingsType {
  apiKey: string;
  model: string;
}

// التحقق من أن القيمة تطابق نوع إعدادات الذكاء الاصطناعي
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

// تحويل القيمة إلى نوع إعدادات الذكاء الاصطناعي بشكل آمن
export const safelyParseAISettings = (value: Record<string, Json>): AISettingsType => {
  return {
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : '',
    model: typeof value.model === 'string' ? value.model : 'gpt-4o-mini'
  };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // This is a React hook, must be called within a React component
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from localStorage
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // For AI settings, also check the database
  useEffect(() => {
    const fetchFromDatabase = async () => {
      if (key === 'aiSettings') {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('type', 'ai_settings')
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings from database:', error);
            return;
          }
          
          if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
            // Safe type cast with validation
            const jsonValue = data.value as Record<string, Json>;
            
            // Create a proper object that matches type T
            const typedValue = safelyParseAISettings(jsonValue) as unknown as T;
            
            setStoredValue(typedValue);
            // Update localStorage with the database value
            window.localStorage.setItem(key, JSON.stringify(typedValue));
          }
        } catch (error) {
          console.error('Error fetching from database:', error);
        }
      }
    };
    
    fetchFromDatabase();
  }, [key]);

  // Update localStorage when the storedValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};
