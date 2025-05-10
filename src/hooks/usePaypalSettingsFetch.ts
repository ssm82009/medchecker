
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePaypalSettingsFetch = () => {
  const [paypalSettings, setPaypalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    const fetchPaypalSettings = async () => {
      try {
        // Fetch paypal settings
        const { data: paypalData, error: paypalError } = await supabase
          .from('paypal_settings')
          .select('*')
          .maybeSingle();
        
        if (paypalError) {
          console.error("Error fetching PayPal settings:", paypalError);
          return null;
        }
        
        if (paypalData) {
          console.log("PayPal settings fetched:", paypalData);
          // Format settings with the correct property names for PayPal SDK
          const formattedSettings = {
            mode: paypalData.mode || 'sandbox',
            clientId: paypalData.mode === 'sandbox' ? paypalData.sandbox_client_id : paypalData.live_client_id,
            secret: paypalData.mode === 'sandbox' ? paypalData.sandbox_secret : paypalData.live_secret,
            currency: paypalData.currency || 'USD',
            subscriptionPlanId: paypalData.subscription_plan_id || '',
          };
          setPaypalSettings(formattedSettings);
          console.log("Formatted PayPal settings:", formattedSettings);
          return formattedSettings;
        }
        
        return null;
      } catch (error) {
        console.error("Error in fetchPaypalSettings:", error);
        return null;
      }
    };
    
    const initializePaypal = async () => {
      setLoading(true);
      const settings = await fetchPaypalSettings();
      setLoading(false);
      
      if (settings && settings.clientId) {
        console.log("PayPal is ready with client ID:", settings.clientId);
        setPaypalReady(true);
      } else {
        console.log("PayPal is not ready yet. Settings:", settings);
        setPaypalReady(false);
      }
    };
    
    initializePaypal();
  }, []);

  return {
    paypalSettings,
    loading,
    paypalReady
  };
};
