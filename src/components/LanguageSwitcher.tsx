
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translations, TranslationKey } from '@/i18n';

const LanguageSwitcher: React.FC = () => {
  const { t, toggleLanguage, language } = useTranslation();
  const { toast } = useToast();
  
  const handleLanguageChange = () => {
    // Add a smooth transition class to the body before changing language
    document.body.classList.add('language-changing');
    
    // Short delay before actually changing the language to allow transition to start
    setTimeout(() => {
      toggleLanguage();
      
      // Show notification for language change
      toast({
        title: language === 'en' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
        description: language === 'en' ? 'تم تطبيق التغييرات بنجاح' : 'Changes applied successfully',
        duration: 3000,
      });
      
      // Apply transition end class
      document.body.classList.remove('language-changing');
      document.body.classList.add('language-changed');
      
      // Force immediate update on all relevant content
      updatePageContent(language === 'en' ? 'ar' : 'en');
      
      // Remove the transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove('language-changed');
      }, 500);
    }, 50);
  };
  
  // Helper function to update content without page reload
  const updatePageContent = (newLanguage: 'en' | 'ar') => {
    // Apply data-i18n attributes to elements that need translation
    const applyDataI18nAttributes = () => {
      // Find elements with text that matches translation keys and add data-i18n attribute
      Object.keys(translations[newLanguage]).forEach(key => {
        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, label').forEach(element => {
          if (element.textContent?.trim() === translations[language === 'en' ? 'en' : 'ar'][key as TranslationKey]) {
            element.setAttribute('data-i18n', key);
          }
        });
      });
    };
    
    // Apply data-i18n attributes if they don't exist yet
    applyDataI18nAttributes();
    
    // Force re-render by triggering a small state change in the document
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 10);
  };
  
  // Apply data-i18n attributes on initial load
  useEffect(() => {
    updatePageContent(language);
  }, []);
  
  return (
    <Button 
      onClick={handleLanguageChange} 
      className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg text-xs px-2 py-1 h-8"
      size="sm"
    >
      <Globe className="h-3 w-3" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
