
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    // Set document direction based on language
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="outline" 
      className="mb-4"
    >
      {t('language')}: {i18n.language === 'en' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageSwitcher;
