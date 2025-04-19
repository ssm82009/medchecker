
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LanguageSwitcher: React.FC = () => {
  const { t, toggleLanguage, language } = useTranslation();
  const { toast } = useToast();
  
  const handleLanguageChange = () => {
    // Add a smooth transition class to the body before changing language
    document.body.classList.add('language-changing');
    
    // Short delay before actually changing the language to allow transition to start
    setTimeout(() => {
      // Change the language in localStorage
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
      
      // Reload the page to ensure all components update properly
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }, 50);
  };
  
  return (
    <Button 
      onClick={handleLanguageChange} 
      className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg text-xs px-2 py-1 h-8"
      size="sm"
    >
      <Globe className="h-3 w-3" />
      <RefreshCw className="h-3 w-3" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
