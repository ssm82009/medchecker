import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Admin: React.FC = () => {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  
  // AI Settings
  const [apiSettings, setApiSettings] = useLocalStorage<{ apiKey: string; model: string }>('aiSettings', { apiKey: '', model: 'gpt-4o-mini' });
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  
  // Advertisement Settings
  const [adHtml, setAdHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      logout();
      navigate('/login');
      return;
    }
    
    // Initialize form with local storage values
    setApiKey(apiSettings.apiKey || '');
    setModel(apiSettings.model || 'gpt-4o-mini');
    
    // Fetch advertisement HTML from Supabase
    const fetchAdvertisement = async () => {
      try {
        // Use type assertion to handle the type issue with Supabase client
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching advertisement:', error);
          return;
        }
        
        if (data && typeof data.value === 'object' && 'html' in data.value) {
          setAdHtml(data.value.html as string);
        }
      } catch (error) {
        console.error('Error in admin component:', error);
      }
    };
    
    fetchAdvertisement();
  }, [user, navigate, logout, isAdmin, apiSettings]);

  const saveApiSettings = () => {
    setApiSettings({ apiKey, model });
    toast({
      title: "Settings saved",
      description: "AI provider settings have been saved to local storage.",
    });
  };

  const saveAdvertisement = async () => {
    setIsSaving(true);
    
    try {
      // Use type assertion to handle the type issue with Supabase client
      const { error } = await supabase
        .from('settings')
        .upsert(
          { type: 'advertisement', value: { html: adHtml } },
          { onConflict: 'type' }
        );
      
      if (error) throw error;
      
      toast({
        title: "Advertisement saved",
        description: "The advertisement HTML has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "Error",
        description: "Failed to save advertisement HTML.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6" dir={dir}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('adminPanel')}</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button variant="outline" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t('aiSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t('apiKey')}
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t('model')}
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={saveApiSettings} className="w-full">
              {t('saveSettings')}
            </Button>
          </CardContent>
        </Card>
        
        {/* Advertisement HTML */}
        <Card>
          <CardHeader>
            <CardTitle>{t('advertisement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={adHtml}
              onChange={(e) => setAdHtml(e.target.value)}
              placeholder="<div>Your ad HTML here</div>"
              className="min-h-[200px]"
            />
            <Button onClick={saveAdvertisement} className="w-full" disabled={isSaving}>
              {isSaving ? '...' : t('saveAd')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
