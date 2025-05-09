
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage, AISettingsType, safelyParseAISettings } from '@/hooks/useLocalStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Json } from '@/integrations/supabase/types';

const AISettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [aiSettings, setAiSettings] = useLocalStorage<AISettingsType>('aiSettings', { 
    apiKey: '', 
    model: 'gpt-4o-mini' 
  });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');

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

    fetchSettings();
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

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>{t('aiSettings')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('apiKey')}</Label>
            <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">{t('model')}</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
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
  );
};

export default AISettings;
