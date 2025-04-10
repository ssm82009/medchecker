
import React, { useEffect } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

const Index: React.FC = () => {
  const { dir } = useTranslation();
  
  // Apply RTL direction to the whole document if needed
  useEffect(() => {
    document.documentElement.dir = dir;
    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, [dir]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-end">
          <LanguageSwitcher />
        </div>
      </header>
      <main className="container mx-auto py-8">
        <MedicationInteractionChecker />
      </main>
    </div>
  );
};

export default Index;
