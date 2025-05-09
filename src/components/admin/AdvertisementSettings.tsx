
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

const AdvertisementSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [adHTML, setAdHTML] = useState('');
  const [secondaryAdHTML, setSecondaryAdHTML] = useState('');

  useEffect(() => {
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

    fetchAdSettings();
  }, []);

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

  return (
    <>
      <Card className="mb-8">
        <CardHeader><CardTitle>{t('advertisement')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea value={adHTML} onChange={(e) => setAdHTML(e.target.value)} placeholder="<div>Your ad HTML here</div>" className="min-h-[120px] font-mono" />
            <Button onClick={saveAd}>{t('saveAd')}</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader><CardTitle>{t('secondaryAdvertisement')}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea value={secondaryAdHTML} onChange={(e) => setSecondaryAdHTML(e.target.value)} placeholder="<div>Your secondary ad HTML here</div>" className="min-h-[120px] font-mono" />
            <Button onClick={saveSecondaryAd}>{t('saveSecondaryAd')}</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default AdvertisementSettings;
