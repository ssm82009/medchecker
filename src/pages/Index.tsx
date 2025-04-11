
import React, { useEffect } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
import { useTranslation } from '@/hooks/useTranslation';

const Index: React.FC = () => {
  const { dir } = useTranslation();
  
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
    <div className="min-h-screen bg-background" dir={dir}>
      <main className="container mx-auto py-8">
        <MedicationInteractionChecker />
      </main>
    </div>
  );
};

export default Index;
