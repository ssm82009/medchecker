
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
        
        // Try to fetch both pro and annual plans explicitly
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .in('code', ['pro', 'annual'])
          .order('price', { ascending: true });
        
        if (plansError) {
          console.error("Error fetching plans:", plansError);
        }
        
        if (plansData && plansData.length > 0) {
          console.log("Plans fetched from DB:", plansData);
          console.log("Number of plans fetched:", plansData.length);
          
          // Make sure we're getting both plans
          if (plansData.length < 2) {
            console.warn("Not all expected plans were fetched. Expected 'pro' and 'annual', got:", 
              plansData.map(plan => plan.code).join(', '));
            
            // Check if we're missing the annual plan
            if (!plansData.some(plan => plan.code === 'annual')) {
              console.log("Annual plan is missing, creating one from default plans");
              
              // Find the annual plan from default plans
              const defaultAnnualPlan = defaultPlans.find(plan => plan.code === 'annual');
              
              if (defaultAnnualPlan) {
                // Add it to the plans data for display
                plansData.push({
                  ...defaultAnnualPlan,
                  id: 'annual-plan',  // Temporary ID
                  price: 120,  // Set annual price (12 months x $10)
                  name: 'Annual Plan', 
                  nameAr: 'الباقة السنوية',
                  description: 'Save with our annual subscription',
                  descriptionAr: 'وفر مع اشتراكنا السنوي',
                });
                console.log("Added default annual plan:", defaultAnnualPlan);
              }
            }
            
            // Check if we're missing the pro plan
            if (!plansData.some(plan => plan.code === 'pro')) {
              console.log("Pro plan is missing, creating one from default plans");
              
              // Find the pro plan from default plans
              const defaultProPlan = defaultPlans.find(plan => plan.code === 'pro');
              
              if (defaultProPlan) {
                // Add it to the plans data for display
                plansData.push(defaultProPlan);
                console.log("Added default pro plan:", defaultProPlan);
              }
            }
          }
          
          // Map DB fields to our PlanType interface
          const formattedPlans: PlanType[] = plansData.map(plan => ({
            id: plan.id,
            code: plan.code,
            name: plan.name,
            nameAr: plan.name_ar, // Map name_ar to nameAr
            description: plan.description,
            descriptionAr: plan.description_ar, // Map description_ar to descriptionAr
            price: plan.price,
            features: plan.features || [],
            featuresAr: plan.features_ar || [], // Map features_ar to featuresAr
            isDefault: plan.is_default
          }));
          
          console.log("Formatted plans:", formattedPlans);
          setPlans(formattedPlans);
        } else {
          console.warn("No plans found in database, using default plans");
          
          // Filter default plans to only include pro and annual
          const defaultPaidPlans = defaultPlans.filter(plan => 
            plan.code === 'pro' || plan.code === 'annual'
          );
          
          // If there's no annual plan in the default plans, create one
          if (!defaultPaidPlans.some(plan => plan.code === 'annual')) {
            const proPrice = defaultPaidPlans.find(p => p.code === 'pro')?.price || 15;
            defaultPaidPlans.push({
              id: 'annual-plan',
              code: 'annual',
              name: 'Annual Plan',
              nameAr: 'الباقة السنوية',
              description: 'Save with our annual subscription',
              descriptionAr: 'وفر مع اشتراكنا السنوي',
              price: proPrice * 12, // Annual price is 12 times the monthly price
              features: defaultPaidPlans.find(p => p.code === 'pro')?.features || [],
              featuresAr: defaultPaidPlans.find(p => p.code === 'pro')?.featuresAr || []
            });
          }
          
          console.log("Using default paid plans:", defaultPaidPlans);
          setPlans(defaultPaidPlans);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
        
        // Fallback to default plans if something goes wrong
        const defaultPaidPlans = defaultPlans.filter(plan => 
          plan.code === 'pro' || plan.code === 'annual'
        );
        
        // Ensure we have an annual plan
        if (!defaultPaidPlans.some(plan => plan.code === 'annual')) {
          const proPrice = defaultPaidPlans.find(p => p.code === 'pro')?.price || 15;
          defaultPaidPlans.push({
            id: 'annual-plan',
            code: 'annual',
            name: 'Annual Plan',
            nameAr: 'الباقة السنوية',
            description: 'Save with our annual subscription',
            descriptionAr: 'وفر مع اشتراكنا السنوي',
            price: proPrice * 12, // Annual price is 12 times the monthly price
            features: defaultPaidPlans.find(p => p.code === 'pro')?.features || [],
            featuresAr: defaultPaidPlans.find(p => p.code === 'pro')?.featuresAr || []
          });
        }
        
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
