
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400" dir={dir}>
      <main className="w-full py-8">
        <div className="glass-card p-4 sm:p-8 mb-8 w-full max-w-none">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-indigo-900">
            آداة سريعة للتحقق من التفاعلات الدوائية
          </h1>
          <MedicationInteractionChecker />
        </div>
      </main>
    </div>
  );
};

export default Index;
