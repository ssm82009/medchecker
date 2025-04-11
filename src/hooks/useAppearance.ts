
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppearanceSettings {
  id: number;
  theme: 'light' | 'dark' | 'purple' | 'blue' | 'green';
  primary_color: string;
  secondary_color: string;
  background_color: string;
  navbar_color: string;
  footer_color: string;
  text_color: string;
  font_family: string;
  logo_text: string;
  logo_icon: string;
}

const defaultSettings: AppearanceSettings = {
  id: 1,
  theme: 'light',
  primary_color: '#4B5563',
  secondary_color: '#9b87f5',
  background_color: '#F8F9FA',
  navbar_color: '#FFFFFF',
  footer_color: '#FFFFFF',
  text_color: '#1A1F2C',
  font_family: 'Tajawal, sans-serif',
  logo_text: 'دواء آمن',
  logo_icon: 'pill'
};

export const useAppearance = () => {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // أولاً، نحاول الحصول على النمط الحالي
      const { data: themeData, error: themeError } = await supabase
        .from('settings')
        .select('value')
        .eq('type', 'current_theme')
        .maybeSingle();
      
      if (themeError && themeError.code !== 'PGRST116') {
        console.error('Error fetching current theme:', themeError);
      }
      
      if (themeData?.value && typeof themeData.value === 'object' && 'theme' in themeData.value) {
        setCurrentTheme((themeData.value as any).theme);
      }
      
      // الآن نحاول الحصول على إعدادات المظهر من الوظيفة المخصصة
      const { data, error } = await supabase
        .rpc('get_current_appearance_settings');
      
      if (error) {
        console.error('Error fetching appearance settings:', error);
        
        // في حالة الخطأ، نستخدم الإعدادات الافتراضية
        setSettings(defaultSettings);
        return;
      }
      
      if (data && Array.isArray(data) && data.length > 0) {
        setSettings(data[0] as AppearanceSettings);
      } else {
        // استخدام الإعدادات الافتراضية إذا لم تكن هناك بيانات
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error in useAppearance hook:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };
  
  const updateTheme = async (theme: string) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { type: 'current_theme', value: { theme } } as any,
          { onConflict: 'type' }
        );
      
      if (error) throw error;
      
      setCurrentTheme(theme);
      await fetchSettings();
      
      return true;
    } catch (error) {
      console.error('Error updating theme:', error);
      return false;
    }
  };
  
  const applyStyles = (settings: AppearanceSettings) => {
    // تطبيق خطوط Google
    if (settings.font_family) {
      const fontName = settings.font_family.split(',')[0].trim();
      
      if (!document.getElementById(`font-${fontName}`)) {
        const link = document.createElement('link');
        link.id = `font-${fontName}`;
        link.rel = 'stylesheet';
        
        // تحديد رابط الخط المناسب حسب اسم الخط
        switch (fontName) {
          case 'Tajawal':
            link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
            break;
          case 'Cairo':
            link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap';
            break;
          case 'Poppins':
            link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap';
            break;
          case 'IBM Plex Sans Arabic':
            link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';
            break;
          default:
            link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
        }
        
        document.head.appendChild(link);
      }
    }
    
    // تطبيق متغيرات CSS المخصصة
    document.documentElement.style.setProperty('--primary', settings.primary_color);
    document.documentElement.style.setProperty('--secondary', settings.secondary_color);
    document.documentElement.style.setProperty('--background', settings.background_color);
    document.documentElement.style.setProperty('--navbar-color', settings.navbar_color);
    document.documentElement.style.setProperty('--footer-color', settings.footer_color);
    document.documentElement.style.setProperty('--text-color', settings.text_color);
    document.documentElement.style.setProperty('--font-family', settings.font_family);
    
    // تطبيق نمط الألوان (فاتح/داكن)
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // تطبيق نوع الخط على عنصر الجسم
    document.body.style.fontFamily = settings.font_family;
  };
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  useEffect(() => {
    if (!loading && settings) {
      applyStyles(settings);
    }
  }, [settings, loading]);
  
  return { 
    settings, 
    loading, 
    fetchSettings, 
    updateTheme,
    currentTheme
  };
};
