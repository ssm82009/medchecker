
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plan';

export const usePaymentData = () => {
  const [paypalSettings, setPaypalSettings] = useState<any>(null);
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    // Fetch PayPal settings and plans
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch paypal settings
        const { data: paypalData, error: paypalError } = await supabase.from('paypal_settings').select('*').maybeSingle();
        
        if (paypalError) {
          console.error("Error fetching PayPal settings:", paypalError);
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
        }
        
        // Fetch all paid plans (pro and annual)
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .in('code', ['pro', 'annual'])
          .order('price', { ascending: true });
        
        if (plansError) {
          console.error("Error fetching plans:", plansError);
        }
        
        if (plansData) {
          console.log("Plans fetched:", plansData);
          setPlans(plansData);
        } else {
          console.warn("No plans found in database");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (paypalSettings && paypalSettings.clientId) {
      console.log("PayPal is ready with client ID:", paypalSettings.clientId);
      setPaypalReady(true);
    } else {
      console.log("PayPal is not ready yet. Settings:", paypalSettings);
    }
  }, [paypalSettings]);

  return {
    paypalSettings,
    plans,
    loading,
    paypalReady
  };
};
