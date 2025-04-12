
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
          
          if (data?.value && typeof data.value === 'object') {
            // Ensure we're setting the correct type
            setStoredValue(data.value as T);
            // Update localStorage with the database value
            window.localStorage.setItem(key, JSON.stringify(data.value));
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
