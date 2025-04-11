
import React, { useEffect } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
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
      <main className="container mx-auto py-8">
        <MedicationInteractionChecker />
      </main>
    </div>
  );
};

export default Index;
