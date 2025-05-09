import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ar from '@/i18n/ar';
import { en } from '@/i18n/en';

export type Language = 'ar' | 'en';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const [isChanging, setIsChanging] = useState(false);
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');

  useEffect(() => {
    const fetchLanguageSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'language')
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching language settings:', error);
        } else if (data?.value) {
          const lang = typeof data.value === 'string' ? data.value : 'ar';
          setLanguage(lang as Language);
          setDir(lang === 'ar' ? 'rtl' : 'ltr');
        }
      } catch (error) {
        console.error('Error in fetchLanguageSettings:', error);
      }
    };

    fetchLanguageSettings();
  }, []);

  const changeLanguage = async (newLang: Language) => {
    setIsChanging(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'language',
          value: newLang
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }

      setLanguage(newLang);
      setDir(newLang === 'ar' ? 'rtl' : 'ltr');
    } catch (error) {
      console.error('Error saving language settings:', error);
    } finally {
      setTimeout(() => setIsChanging(false), 300);
    }
  };

  const t = (key: keyof typeof ar) => {
    return language === 'ar' ? ar[key] : en[key];
  };

  return {
    t,
    language,
    dir,
    isChanging,
    changeLanguage
  };
};
