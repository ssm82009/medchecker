
import { en } from './en';
import ar from './ar';

export const translations = {
  en,
  ar
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof en;

// Add helper function to check if a key exists in translations
export const hasTranslation = (key: string, language: Language = 'en'): boolean => {
  const translationSet = language === 'ar' ? ar : en;
  return key in translationSet;
};
