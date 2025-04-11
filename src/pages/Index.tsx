
import React, { useEffect } from 'react';
import MedicationInteractionChecker from '@/components/MedicationInteractionChecker';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppearance } from '@/hooks/useAppearance';

const Index: React.FC = () => {
  const { dir } = useTranslation();
  const { settings, fetchSettings } = useAppearance();
  
  // تحميل إعدادات المظهر عند تحميل الصفحة
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div 
      className="min-h-screen py-6 px-4" 
      dir={dir}
      style={{ 
        backgroundColor: settings?.background_color,
        color: settings?.text_color,
        fontFamily: settings?.font_family
      }}
    >
      <main className="container mx-auto">
        <MedicationInteractionChecker />
      </main>
    </div>
  );
};

export default Index;
