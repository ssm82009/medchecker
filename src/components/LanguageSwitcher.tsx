
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe, RefreshCw } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { t, toggleLanguage, language } = useTranslation();
  
  const handleLanguageChange = () => {
    toggleLanguage();
    // تحديث الصفحة بعد تغيير اللغة
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  return (
    <Button variant="ghost" onClick={handleLanguageChange} className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
      <RefreshCw className="h-3 w-3" />
    </Button>
  );
};

export default LanguageSwitcher;
