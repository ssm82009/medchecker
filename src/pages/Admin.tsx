
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
import { 
  Cog, 
  Palette, 
  MessageSquare, 
  Save,
  Settings,
  LogOut,
  Key
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Define interface for AI settings
interface AISettingsType {
  apiKey: string;
  model: string;
}

// Settings component for AI configuration
const AISettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchAISettings = async () => {
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
        
        if (data?.value && typeof data.value === 'object') {
          const settings = data.value as AISettingsType;
          setApiKey(settings.apiKey || '');
          setModel(settings.model || 'gpt-4o-mini');
        }
      } catch (error) {
        console.error('Error in fetching AI settings:', error);
      }
    };
    
    fetchAISettings();
  }, []);
  
  const saveApiSettings = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { type: 'ai_settings', value: { apiKey, model } },
          { onConflict: 'type' }
        );
      
      if (error) throw error;
      
      // Also save to local storage for immediate access in components
      localStorage.setItem('aiSettings', JSON.stringify({ apiKey, model }));
      
      toast({
        title: t('saveSettings'),
        description: "تم حفظ إعدادات مزود الذكاء الاصطناعي بنجاح",
      });
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات الذكاء الاصطناعي",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
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
        <Button 
          onClick={saveApiSettings} 
          className="w-full"
          variant="default"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {t('loading')}
            </span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('saveSettings')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Logo settings component
const LogoSettings = () => {
  const { toast } = useToast();
  const [logoText, setLogoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const [newLogoText, setNewLogoText] = useState('');
  
  useEffect(() => {
    setNewLogoText(logoText);
  }, [logoText]);
  
  const saveLogoText = () => {
    setLogoText(newLogoText);
    toast({
      title: "تم حفظ نص الشعار",
      description: "تم تحديث نص الشعار بنجاح",
    });
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>إعدادات الشعار</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            نص الشعار
          </label>
          <Input
            type="text"
            value={newLogoText}
            onChange={(e) => setNewLogoText(e.target.value)}
            placeholder="نص الشعار الذي سيظهر في النافبار"
          />
        </div>
        <Button onClick={saveLogoText} className="w-full" variant="default">
          <Save className="mr-2 h-4 w-4" />
          حفظ نص الشعار
        </Button>
      </CardContent>
    </Card>
  );
};

// Primary Advertisement settings component
const AdvertisementSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [adHtml, setAdHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching advertisement:', error);
          return;
        }
        
        if (data?.value && typeof data.value === 'object' && 'html' in data.value) {
          setAdHtml((data.value as any).html as string);
        }
      } catch (error) {
        console.error('Error in admin component:', error);
      }
    };
    
    fetchAdvertisement();
  }, []);
  
  const saveAdvertisement = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { type: 'advertisement', value: { html: adHtml } } as any,
          { onConflict: 'type' }
        );
      
      if (error) throw error;
      
      toast({
        title: "تم حفظ الإعلان",
        description: "تم تحديث HTML الإعلان بنجاح",
      });
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ HTML الإعلان",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
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
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {t('loading')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {t('saveAd')}
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Secondary Advertisement settings component
const SecondaryAdvertisementSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [adHtml, setAdHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'secondary_advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching secondary advertisement:', error);
          return;
        }
        
        if (data?.value && typeof data.value === 'object' && 'html' in data.value) {
          setAdHtml((data.value as any).html as string);
        }
      } catch (error) {
        console.error('Error in admin component:', error);
      }
    };
    
    fetchAdvertisement();
  }, []);
  
  const saveAdvertisement = async () => {
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { type: 'secondary_advertisement', value: { html: adHtml } } as any,
          { onConflict: 'type' }
        );
      
      if (error) throw error;
      
      toast({
        title: "تم حفظ الإعلان الثانوي",
        description: "تم تحديث HTML الإعلان الثانوي بنجاح",
      });
    } catch (error) {
      console.error('Error saving secondary advertisement:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ HTML الإعلان الثانوي",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>الإعلان الثانوي</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={adHtml}
          onChange={(e) => setAdHtml(e.target.value)}
          placeholder="<div>Your secondary ad HTML here</div>"
          className="min-h-[200px]"
        />
        <Button onClick={saveAdvertisement} className="w-full" disabled={isSaving}>
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {t('loading')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              حفظ الإعلان الثانوي
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Admin component
const Admin: React.FC = () => {
  const { t, dir } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check admin permissions
    if (!isAdmin()) {
      console.log("Not admin, redirecting...");
      logout();
      navigate('/login');
    }
  }, [user, navigate, logout, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50" dir={dir}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('adminPanel')}</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          {t('logout')}
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            المظهر
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            واجهات API
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <LogoSettings />
          <AdvertisementSettings />
          <SecondaryAdvertisementSettings />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>إعدادات المظهر</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">سيتم تطوير إعدادات المظهر قريباً.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <AISettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
