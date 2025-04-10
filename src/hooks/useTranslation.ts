
import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, translations, TranslationKey } from '../i18n';

export const useTranslation = () => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
  }, [setLanguage]);

  // Apply RTL direction for Arabic language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Apply direction to document body
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  return { t, language, toggleLanguage, dir };
};
