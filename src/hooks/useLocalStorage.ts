
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from localStorage first
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      
      // If this is the AI settings key, we'll try to fetch from database in useEffect
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
            // This ensures we have the right shape before setting it
            if ('apiKey' in jsonValue && 'model' in jsonValue) {
              const typedValue = {
                apiKey: String(jsonValue.apiKey || ''),
                model: String(jsonValue.model || 'gpt-4o-mini')
              } as unknown as T;
              
              setStoredValue(typedValue);
              // Update localStorage with the database value
              window.localStorage.setItem(key, JSON.stringify(typedValue));
            }
          }
        } catch (error) {
          console.error('Error fetching from database:', error);
        }
      }
    };
    
    fetchFromDatabase();
  }, [key]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      
      // For AI settings, also update the database
      if (key === 'aiSettings') {
        // Don't update the database here, as it should be done explicitly
        // in the Admin component to avoid unwanted updates
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};
