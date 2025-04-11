
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, translations, TranslationKey } from '../i18n';

export const useTranslation = () => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [isChanging, setIsChanging] = useState(false);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setIsChanging(true);
    setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
  }, [setLanguage]);

  // Apply RTL direction for Arabic language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Apply direction to document body with a smoother transition
  useEffect(() => {
    if (isChanging) {
      // Add transition class
      document.body.classList.add('language-transition');
      
      // Apply new language direction and attributes
      document.documentElement.dir = dir;
      document.documentElement.lang = language;
      
      // Apply language-specific classes
      if (language === 'ar') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      
      // Force application rerender by updating the DOM
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && translations[language][key as TranslationKey]) {
          element.textContent = translations[language][key as TranslationKey];
        }
      });
      
      // Remove transition class after animation completes
      const timer = setTimeout(() => {
        document.body.classList.remove('language-transition');
        setIsChanging(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [language, dir, isChanging]);

  return { t, language, toggleLanguage, dir, isChanging };
};
