
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LanguageSwitcher: React.FC = () => {
  const { t, toggleLanguage, language } = useTranslation();
  const { toast } = useToast();
  
  const handleLanguageChange = () => {
    toggleLanguage();
    
    // Show notification for language change
    toast({
      title: language === 'en' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
      description: language === 'en' ? 'تم تطبيق التغييرات بنجاح' : 'Changes applied successfully',
      duration: 3000,
    });
  };
  
  return (
    <Button variant="ghost" onClick={handleLanguageChange} className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
