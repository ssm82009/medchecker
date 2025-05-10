
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plan';
import { defaultPlans } from '@/data/plans'; // Import default plans as fallback

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
        
        // Fetch both pro and annual plans explicitly
        console.log("Attempting to fetch plans from database...");
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .in('code', ['pro', 'annual'])
          .order('price', { ascending: true });
        
        if (plansError) {
          console.error("Error fetching plans:", plansError);
          throw plansError;
        }
        
        console.log("Fetched plans data:", plansData);
        
        if (plansData && plansData.length > 0) {
          console.log(`Plans fetched from DB: ${plansData.length} plans`);
          
          // Check if we have both plans
          const hasPro = plansData.some(plan => plan.code === 'pro');
          const hasAnnual = plansData.some(plan => plan.code === 'annual');
          
          console.log(`Has pro plan: ${hasPro}, Has annual plan: ${hasAnnual}`);
          
          let finalPlansData = [...plansData];
          
          // If missing plans, add them from defaults
          if (!hasPro || !hasAnnual) {
            console.warn(`Missing plans: ${!hasPro ? 'pro' : ''} ${!hasAnnual ? 'annual' : ''}`);
            
            if (!hasAnnual) {
              const defaultAnnualPlan = defaultPlans.find(plan => plan.code === 'annual');
              if (defaultAnnualPlan) {
                console.log("Adding default annual plan");
                finalPlansData.push({
                  id: 'annual-plan',
                  code: 'annual',
                  name: 'Annual Plan',
                  name_ar: 'الباقة السنوية',
                  description: 'Save with our annual subscription',
                  description_ar: 'وفر مع اشتراكنا السنوي',
                  price: 120, // 12 months x $10
                  features: defaultAnnualPlan.features,
                  features_ar: defaultAnnualPlan.features.map(f => f), // Copy English features if Arabic not available
                  is_default: false
                });
              }
            }
            
            if (!hasPro) {
              const defaultProPlan = defaultPlans.find(plan => plan.code === 'pro');
              if (defaultProPlan) {
                console.log("Adding default pro plan");
                finalPlansData.push({
                  id: 'pro-plan',
                  code: 'pro',
                  name: 'Pro Plan',
                  name_ar: 'الباقة الاحترافية',
                  description: 'Professional features for serious users',
                  description_ar: 'ميزات احترافية للمستخدمين الجادين',
                  price: 10,
                  features: defaultProPlan.features,
                  features_ar: defaultProPlan.features.map(f => f), // Copy English features if Arabic not available
                  is_default: false
                });
              }
            }
          }
          
          // Map DB fields to our PlanType interface (converting snake_case to camelCase)
          const formattedPlans: PlanType[] = finalPlansData.map(plan => ({
            id: plan.id,
            code: plan.code,
            name: plan.name,
            nameAr: plan.name_ar,
            description: plan.description,
            descriptionAr: plan.description_ar,
            price: plan.price,
            features: plan.features || [],
            featuresAr: plan.features_ar || [],
            isDefault: plan.is_default || false
          }));
          
          console.log("Final formatted plans:", formattedPlans);
          setPlans(formattedPlans);
        } else {
          console.warn("No plans found in database, using default plans");
          
          // Filter default plans to only include pro and annual
          const defaultPaidPlans = defaultPlans.filter(plan => 
            plan.code === 'pro' || plan.code === 'annual'
          );
          
          console.log("Using default paid plans:", defaultPaidPlans);
          setPlans(defaultPaidPlans);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        
        // Fallback to default plans if something goes wrong
        const defaultPaidPlans = defaultPlans.filter(plan => 
          plan.code === 'pro' || plan.code === 'annual'
        );
        
        console.log("Using default paid plans as fallback after error:", defaultPaidPlans);
        setPlans(defaultPaidPlans);
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
