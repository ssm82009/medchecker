
import React, { useEffect } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
import { useTranslation } from '@/hooks/useTranslation';

const Index: React.FC = () => {
  const { dir, language, isChanging } = useTranslation();
  
  // Apply RTL direction to the whole document if needed
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    
    return () => {
      document.documentElement.dir = 'ltr';
      document.documentElement.setAttribute('lang', 'en');
    };
  }, [dir]);

  return (
    <div 
      className={`min-h-screen bg-transparent flex items-center justify-center p-0 m-0 w-full content-wrapper mb-10 ${isChanging ? 'language-changing' : 'fade-content-in'}`} 
      dir={dir}
    >
      <MedicationInteractionChecker />
    </div>
  );
};

export default Index;
