
import { useCallback } from 'react';
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

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return { t, language, toggleLanguage, dir };
};
