
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { t, toggleLanguage, language } = useTranslation();
  
  return (
    <Button variant="ghost" onClick={toggleLanguage}>
      <Globe className="h-4 w-4 mr-2" />
      {language === 'en' ? 'العربية' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;
