
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const LogoSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [logoText, setLogoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const [logoTextInput, setLogoTextInput] = useState('');

  useEffect(() => {
    setLogoTextInput(logoText);
  }, [logoText]);

  const saveLogo = () => {
    setLogoText(logoTextInput);
    toast({
      title: t('saveSuccess'),
      description: t('logoSaved'),
      duration: 3000,
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>{t('logoSettings')}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoText">{t('logoText')}</Label>
            <Input id="logoText" type="text" value={logoTextInput} onChange={(e) => setLogoTextInput(e.target.value)} placeholder="دواء آمن" />
          </div>
          <Button onClick={saveLogo}>{t('saveLogo')}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogoSettings;
