
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage, AISettingsType, safelyParseAISettings } from '@/hooks/useLocalStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Json } from '@/integrations/supabase/types';

const Admin: React.FC = () => {
  const { t, dir } = useTranslation();
  const { toast } = useToast();
  const [aiSettings, setAiSettings] = useLocalStorage<AISettingsType>('aiSettings', { 
    apiKey: '', 
    model: 'gpt-4o-mini' 
  });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [adHTML, setAdHTML] = useState('');
  const [secondaryAdHTML, setSecondaryAdHTML] = useState('');
  const [logoText, setLogoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const [logoTextInput, setLogoTextInput] = useState('');
  
  useEffect(() => {
    // الحصول على إعدادات الذكاء الاصطناعي عند تحميل الصفحة
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching AI settings:', error);
          return;
        }
        
        if (data?.value) {
          // التحقق من أن البيانات مناسبة لنوع AISettingsType
          const value = data.value;
          
          if (typeof value === 'object' && !Array.isArray(value)) {
            // استخدام وظيفة التحويل الآمن
            const parsedSettings = safelyParseAISettings(value as Record<string, Json>);
            
            setApiKey(parsedSettings.apiKey || '');
            setModel(parsedSettings.model || 'gpt-4o-mini');
          }
        } else {
          // استخدام القيم من localStorage إذا لم تكن متوفرة في قاعدة البيانات
          setApiKey(aiSettings.apiKey || '');
          setModel(aiSettings.model || 'gpt-4o-mini');
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };
    
    // الحصول على إعدادات الإعلانات
    const fetchAdSettings = async () => {
      try {
        const { data: adData, error: adError } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'advertisement')
          .maybeSingle();
          
        if (adError && adError.code !== 'PGRST116') {
          console.error('Error fetching advertisement:', adError);
        } else if (adData?.value) {
          setAdHTML(typeof adData.value === 'string' ? adData.value : '');
        }
        
        const { data: secondaryAdData, error: secondaryAdError } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'secondary_advertisement')
          .maybeSingle();
          
        if (secondaryAdError && secondaryAdError.code !== 'PGRST116') {
          console.error('Error fetching secondary advertisement:', secondaryAdError);
        } else if (secondaryAdData?.value) {
          setSecondaryAdHTML(typeof secondaryAdData.value === 'string' ? secondaryAdData.value : '');
        }
      } catch (error) {
        console.error('Error in fetchAdSettings:', error);
      }
    };
    
    // تعيين قيمة logoTextInput
    setLogoTextInput(logoText);
    
    fetchSettings();
    fetchAdSettings();
  }, []);
  
  const saveAISettings = async () => {
    // تعيين القيم الحالية
    const newSettings: AISettingsType = {
      apiKey,
      model
    };
    
    try {
      // تحديث في localStorage
      setAiSettings(newSettings);
      
      // تحديث في قاعدة البيانات
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'ai_settings',
          value: newSettings as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('settingsSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'advertisement',
          value: adHTML as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('adSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveSecondaryAd = async () => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          type: 'secondary_advertisement',
          value: secondaryAdHTML as unknown as Json
        }, {
          onConflict: 'type'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('saveSuccess'),
        description: t('secondaryAdSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving secondary advertisement:', error);
      toast({
        title: t('error'),
        description: String(error),
        variant: 'destructive',
        duration: 5000,
      });
    }
  };
  
  const saveLogo = () => {
    setLogoText(logoTextInput);
    toast({
      title: t('saveSuccess'),
      description: t('logoSaved'),
      duration: 3000,
    });
  };
  
  return (
    <div className="space-y-6" dir={dir}>
      <h1 className="text-3xl font-bold">{t('adminPanel')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('aiSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('apiKey')}</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">{t('model')}</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={saveAISettings}>{t('saveSettings')}</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('logoSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoText">{t('logoText')}</Label>
              <Input
                id="logoText"
                type="text"
                value={logoTextInput}
                onChange={(e) => setLogoTextInput(e.target.value)}
                placeholder="دواء آمن"
              />
            </div>
            
            <Button onClick={saveLogo}>{t('saveLogo')}</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('advertisement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={adHTML}
              onChange={(e) => setAdHTML(e.target.value)}
              placeholder="<div>Your ad HTML here</div>"
              className="min-h-[200px] font-mono"
            />
            
            <Button onClick={saveAd}>{t('saveAd')}</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('secondaryAdvertisement')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={secondaryAdHTML}
              onChange={(e) => setSecondaryAdHTML(e.target.value)}
              placeholder="<div>Your secondary ad HTML here</div>"
              className="min-h-[200px] font-mono"
            />
            
            <Button onClick={saveSecondaryAd}>{t('saveSecondaryAd')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
