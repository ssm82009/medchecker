
import { useCallback, useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Language, translations, TranslationKey } from '../i18n';

export const useTranslation = () => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'ar'); // جعل العربية هي اللغة الافتراضية
  const [isChanging, setIsChanging] = useState(false);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setIsChanging(true);
    setLanguage(prevLang => (prevLang === 'en' ? 'ar' : 'en'));
    
    // Add a small timeout to allow the transition to complete before setting isChanging back to false
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
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
        document.querySelector('html')?.setAttribute('dir', 'rtl');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
        document.querySelector('html')?.setAttribute('dir', 'ltr');
      }
      
      // Animate all elements with data-i18n attributes for smooth transition
      const updateElements = () => {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach((element, index) => {
          const key = element.getAttribute('data-i18n');
          if (key && translations[language][key as TranslationKey]) {
            // Add a small staggered delay for a more natural transition
            setTimeout(() => {
              element.textContent = translations[language][key as TranslationKey];
              element.classList.add('fade-content-in');
              
              // Remove animation class after it completes
              setTimeout(() => {
                element.classList.remove('fade-content-in');
              }, 400);
            }, index * 20); // Stagger effect
          }
        });
      };
      
      // Update elements with a small delay to ensure direction is applied first
      setTimeout(updateElements, 50);
      
      // Remove transition class after animation completes
      const timer = setTimeout(() => {
        document.body.classList.remove('language-transition');
        setIsChanging(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [language, dir, isChanging]);

  // تطبيق الاتجاه RTL مباشرة عند تحميل التطبيق
  useEffect(() => {
    // تطبيق اتجاه RTL على عنصر html
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // تطبيق الصفوف المناسبة
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
      document.querySelector('html')?.setAttribute('dir', 'rtl');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
      document.querySelector('html')?.setAttribute('dir', 'ltr');
    }
  }, []);

  return { t, language, toggleLanguage, dir, isChanging };
};
