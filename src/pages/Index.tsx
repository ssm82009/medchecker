
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

  // تطبيق إعدادات المظهر على الصفحة
  useEffect(() => {
    if (settings) {
      document.body.style.backgroundColor = settings.background_color;
      document.body.style.color = settings.text_color;
      document.body.style.fontFamily = settings.font_family;
      
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  return (
    <div 
      className="min-h-screen" 
      dir={dir}
      style={{ 
        backgroundColor: settings?.background_color 
      }}
    >
      <main className="container mx-auto py-8">
        <MedicationInteractionChecker />
      </main>
    </div>
  );
};

export default Index;
