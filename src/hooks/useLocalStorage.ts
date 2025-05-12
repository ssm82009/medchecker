
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

  // For AI settings, fetch from database
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
            console.log('Found AI settings in database');
            
            // Safe type cast with validation
            const jsonValue = data.value as Record<string, Json>;
            
            // Create a proper object that matches type T but never expose API key in state
            // We're only storing model in client state
            const sanitizedSettings = {
              model: typeof jsonValue.model === 'string' ? jsonValue.model : 'gpt-4o-mini',
              apiKey: '' // Never store the API key in client state
            } as unknown as T;
            
            setStoredValue(sanitizedSettings);
          } else {
            console.log('No AI settings found in database or invalid format');
          }
        } catch (error) {
          console.error('Error fetching from database:', error);
        }
      }
    };
    
    fetchFromDatabase();
  }, [key]);

  // Only update localStorage for non-sensitive data
  useEffect(() => {
    if (typeof window !== 'undefined' && !isSensitiveKey) {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue, isSensitiveKey]);

  return [storedValue, setStoredValue] as const;
};
