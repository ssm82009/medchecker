
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
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeyMasked, setApiKeyMasked] = useState<boolean>(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    // Fetch AI settings from the database when component mounts
    const fetchSettings = async () => {
      setIsLoading(true);
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
          // Ensure data.value is an object with our expected properties
          const value = data.value;
          
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Use our safe parsing function
            const parsedSettings = safelyParseAISettings(value as Record<string, Json>);
            
            // Never log the API key
            console.log('Fetched AI settings from database');
            
            // Only store if API key exists, never display the actual key
            if (parsedSettings.apiKey) {
              setHasApiKey(true);
              setApiKey('•'.repeat(16)); // Masked placeholder for UI
            } else {
              setApiKey('');
              setHasApiKey(false);
            }
            
            setModel(parsedSettings.model || 'gpt-4o-mini');
          }
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveAISettings = async () => {
    // If the API key is masked and we already have one, don't update it
    const keyToSave = apiKeyMasked && hasApiKey ? null : apiKey;
    
    try {
      // First fetch the current settings to avoid overwriting the API key if it's masked
      let currentSettings: AISettingsType = { apiKey: '', model };
      
      if (apiKeyMasked && hasApiKey) {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (!error && data?.value) {
          currentSettings = safelyParseAISettings(data.value as Record<string, Json>);
        }
      }
      
      // Create new settings object
      const newSettings: AISettingsType = {
        apiKey: keyToSave || currentSettings.apiKey,
        model
      };
      
      // Update in database
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
      
      // If we successfully saved a new API key, update the UI
      if (!apiKeyMasked && apiKey) {
        setHasApiKey(true);
        setApiKey('•'.repeat(16));
        setApiKeyMasked(true);
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

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value !== '•'.repeat(16)) {
      setApiKeyMasked(false);
      setApiKey(value);
    }
  };

  const handleApiKeyFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Clear the field when focused if it contains the masked value
    if (apiKeyMasked) {
      setApiKey('');
      setApiKeyMasked(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>{t('aiSettings')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2">{t('loading')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="apiKey">{t('apiKey')}</Label>
                <Input 
                  id="apiKey" 
                  type="password" 
                  value={apiKey} 
                  onChange={handleApiKeyChange}
                  onFocus={handleApiKeyFocus}
                  placeholder="sk-..." 
                />
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AISettings;
