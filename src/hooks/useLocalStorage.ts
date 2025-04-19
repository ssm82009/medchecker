
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

// Define AI settings type
export interface AISettingsType {
  apiKey: string;
  model: string;
}

// Type validation function
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

// Safe parsing function
export const safelyParseAISettings = (value: Record<string, Json>): AISettingsType => {
  return {
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : '',
    model: typeof value.model === 'string' ? value.model : 'gpt-4o-mini'
  };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // This useState call must be used inside a React component
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

  // Update localStorage when storedValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};
