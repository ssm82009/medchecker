
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppearance, AppearanceSettings } from '@/hooks/useAppearance';
import { 
  Palette, 
  Save, 
  Undo2, 
  Eye, 
  Check,
  Pill, 
  HeartPulse, 
  Stethoscope, 
  Leaf
} from 'lucide-react';

// أيقونات الشعار المتاحة
const logoIcons = [
  { value: 'pill', label: 'Pill', icon: <Pill className="h-5 w-5" /> },
  { value: 'heart-pulse', label: 'Heart', icon: <HeartPulse className="h-5 w-5" /> },
  { value: 'stethoscope', label: 'Stethoscope', icon: <Stethoscope className="h-5 w-5" /> },
  { value: 'leaf', label: 'Leaf', icon: <Leaf className="h-5 w-5" /> },
];

// خطوط جوجل المتاحة
const fontFamilies = [
  { value: 'Tajawal, sans-serif', label: 'Tajawal' },
  { value: 'Cairo, sans-serif', label: 'Cairo' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'IBM Plex Sans Arabic, sans-serif', label: 'IBM Plex Sans Arabic' },
];

const AppearanceSettingsComponent = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings, loading, fetchSettings, updateTheme, currentTheme } = useAppearance();
  
  const [editedSettings, setEditedSettings] = useState<AppearanceSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  useEffect(() => {
    if (!loading && settings) {
      setEditedSettings(settings);
    }
  }, [settings, loading]);
  
  const handleInputChange = (field: keyof AppearanceSettings, value: string) => {
    if (!editedSettings) return;
    
    setEditedSettings({
      ...editedSettings,
      [field]: value
    });
  };
  
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    
    if (!previewMode && editedSettings) {
      // تطبيق الإعدادات مؤقتاً للمعاينة
      document.documentElement.style.setProperty('--primary', editedSettings.primary_color);
      document.documentElement.style.setProperty('--secondary', editedSettings.secondary_color);
      document.documentElement.style.setProperty('--background', editedSettings.background_color);
      document.documentElement.style.setProperty('--navbar-color', editedSettings.navbar_color);
      document.documentElement.style.setProperty('--footer-color', editedSettings.footer_color);
      document.documentElement.style.setProperty('--text-color', editedSettings.text_color);
      document.documentElement.style.setProperty('--font-family', editedSettings.font_family);
      
      // تطبيق نوع الخط للمعاينة
      document.body.style.fontFamily = editedSettings.font_family;
    } else {
      // استعادة الإعدادات الأصلية
      document.documentElement.style.setProperty('--primary', settings.primary_color);
      document.documentElement.style.setProperty('--secondary', settings.secondary_color);
      document.documentElement.style.setProperty('--background', settings.background_color);
      document.documentElement.style.setProperty('--navbar-color', settings.navbar_color);
      document.documentElement.style.setProperty('--footer-color', settings.footer_color);
      document.documentElement.style.setProperty('--text-color', settings.text_color);
      document.documentElement.style.setProperty('--font-family', settings.font_family);
      
      // استعادة نوع الخط الأصلي
      document.body.style.fontFamily = settings.font_family;
    }
  };
  
  const resetToDefault = () => {
    if (settings) {
      setEditedSettings(settings);
      
      // استعادة الإعدادات الأصلية إذا كانت المعاينة مفعلة
      if (previewMode) {
        togglePreviewMode();
      }
      
      toast({
        title: t("resetTheme"),
        description: "تم إعادة تعيين الإعدادات إلى القيم الأصلية"
      });
    }
  };
  
  const applyTheme = async (theme: string) => {
    if (await updateTheme(theme)) {
      toast({
        title: t("applyTheme"),
        description: `تم تطبيق النمط ${t(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`) as string}`
      });
    }
  };
  
  const saveAppearance = async () => {
    if (!editedSettings) return;
    
    setIsSaving(true);
    
    try {
      // تحديث إعدادات المظهر
      await supabase
        .from('appearance_settings')
        .update({
          primary_color: editedSettings.primary_color,
          secondary_color: editedSettings.secondary_color,
          background_color: editedSettings.background_color,
          navbar_color: editedSettings.navbar_color,
          footer_color: editedSettings.footer_color,
          text_color: editedSettings.text_color,
          font_family: editedSettings.font_family,
          logo_text: editedSettings.logo_text,
          logo_icon: editedSettings.logo_icon
        })
        .eq('id', editedSettings.id);
      
      // تحديث النمط الحالي
      await updateTheme(editedSettings.theme);
      
      // إعادة تحديث الإعدادات
      await fetchSettings();
      
      // إيقاف وضع المعاينة إذا كان مفعلاً
      if (previewMode) {
        setPreviewMode(false);
      }
      
      toast({
        title: t("appearanceUpdated"),
        description: "تم تحديث إعدادات المظهر بنجاح",
      });
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: t("error"),
        description: "حدث خطأ أثناء حفظ إعدادات المظهر",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading || !editedSettings) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t("appearanceSettings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          {t("appearanceSettings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="theme">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="theme">{t("theme")}</TabsTrigger>
            <TabsTrigger value="colors">{t("primaryColor")}</TabsTrigger>
            <TabsTrigger value="logo">{t("logoSettings")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['light', 'dark', 'purple', 'blue', 'green'] as const).map((themeName) => (
                <div 
                  key={themeName}
                  className={`
                    relative rounded-md p-3 border cursor-pointer transition-all transform hover:scale-105
                    ${currentTheme === themeName ? 'border-primary shadow-md' : 'border-gray-200'}
                  `}
                  onClick={() => applyTheme(themeName)}
                >
                  <div className={`
                    h-12 rounded-md w-full mb-2
                    ${themeName === 'light' ? 'bg-white' : ''}
                    ${themeName === 'dark' ? 'bg-gray-900' : ''}
                    ${themeName === 'purple' ? 'bg-purple-200' : ''}
                    ${themeName === 'blue' ? 'bg-blue-200' : ''}
                    ${themeName === 'green' ? 'bg-green-200' : ''}
                  `}></div>
                  <div className="text-center text-sm">
                    {t(`theme${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`) as string}
                  </div>
                  {currentTheme === themeName && (
                    <div className="absolute top-1 right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="font-family mt-6">
              <label className="block text-sm font-medium mb-2">
                {t("fontFamily")}
              </label>
              <Select 
                value={editedSettings.font_family} 
                onValueChange={(value) => handleInputChange('font_family', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الخط" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem 
                      key={font.value} 
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("primaryColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.primary_color}
                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("secondaryColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.secondary_color}
                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("backgroundColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.background_color}
                    onChange={(e) => handleInputChange('background_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("textColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.text_color}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.text_color}
                    onChange={(e) => handleInputChange('text_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("navbarColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.navbar_color}
                    onChange={(e) => handleInputChange('navbar_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.navbar_color}
                    onChange={(e) => handleInputChange('navbar_color', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("footerColor")}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={editedSettings.footer_color}
                    onChange={(e) => handleInputChange('footer_color', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={editedSettings.footer_color}
                    onChange={(e) => handleInputChange('footer_color', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="logo" className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("logoText")}
              </label>
              <Input
                type="text"
                value={editedSettings.logo_text}
                onChange={(e) => handleInputChange('logo_text', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("logoIcon")}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {logoIcons.map((icon) => (
                  <div 
                    key={icon.value}
                    className={`
                      flex flex-col items-center justify-center p-3 rounded-md border cursor-pointer hover:border-primary
                      ${editedSettings.logo_icon === icon.value ? 'border-primary bg-primary/5' : 'border-gray-200'}
                    `}
                    onClick={() => handleInputChange('logo_icon', icon.value)}
                  >
                    {icon.icon}
                    <span className="text-xs mt-1">{icon.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-wrap gap-2 justify-end mt-6">
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            {t("resetTheme")}
          </Button>
          
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={togglePreviewMode}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? t("resetTheme") : t("previewTheme")}
          </Button>
          
          <Button 
            onClick={saveAppearance} 
            className="gap-2" 
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                {t("loading")}
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("saveAppearance")}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettingsComponent;
