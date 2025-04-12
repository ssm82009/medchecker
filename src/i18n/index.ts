
import { en } from './en';
import { ar } from './ar';

export const translations = {
  en,
  ar
};

export type Language = 'en' | 'ar';
export type TranslationKey = keyof typeof en;
