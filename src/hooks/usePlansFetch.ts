
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plan';
import { defaultPlans } from '@/data/plans';

export const usePlansFetch = () => {
  const [plans, setPlans] = useState<PlanType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        // Fetch both pro and pro12 plans explicitly (monthly and yearly plans)
        console.log("Attempting to fetch plans from database...");
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .in('code', ['pro', 'pro12'])
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
          const hasYearly = plansData.some(plan => plan.code === 'pro12');
          
          console.log(`Has pro plan: ${hasPro}, Has yearly plan: ${hasYearly}`);
          
          let finalPlansData = [...plansData];
          
          // If missing plans, add them from defaults
          if (!hasPro || !hasYearly) {
            console.warn(`Missing plans: ${!hasPro ? 'pro' : ''} ${!hasYearly ? 'pro12' : ''}`);
            
            if (!hasYearly) {
              const defaultYearlyPlan = defaultPlans.find(plan => plan.code === 'annual');
              if (defaultYearlyPlan) {
                console.log("Adding default yearly plan");
                finalPlansData.push({
                  id: 'pro12-plan',
                  code: 'pro12',
                  name: 'Yearly Pro Plan',
                  name_ar: 'الباقة الاحترافية السنوية',
                  description: 'Save with our annual subscription',
                  description_ar: 'وفر مع اشتراكنا السنوي',
                  price: 39, // yearly price as shown in the screenshot
                  features: [
                    'Check up to 10 medications',
                    'Full access for 12 months',
                    'AI-powered image search'
                  ],
                  features_ar: [
                    'فحص حتى 10 أدوية',
                    'وصول كامل لمدة 12 شهر',
                    'البحث بالصور بالذكاء الاصطناعي'
                  ],
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
                  name: 'Monthly Pro Plan',
                  name_ar: 'الباقة الاحترافية الشهرية',
                  description: 'Professional features for monthly subscribers',
                  description_ar: 'ميزات احترافية للمشتركين الشهريين',
                  price: 3.99,
                  features: [
                    'Check up to 10 medications',
                    'AI-powered image search',
                    'Advanced patient history'
                  ],
                  features_ar: [
                    'فحص حتى 10 أدوية',
                    'البحث بالصور بالذكاء الاصطناعي',
                    'سجل متقدم للمريض'
                  ],
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
          
          // Filter default plans to only include pro and pro12
          const defaultPaidPlans = defaultPlans
            .filter(plan => plan.code === 'pro')
            .concat(
              // Add a modified annual plan with code='pro12'
              [{
                ...defaultPlans.find(plan => plan.code === 'annual'),
                code: 'pro12',
                name: 'Yearly Pro Plan',
                nameAr: 'الباقة الاحترافية السنوية',
                price: 39
              }].filter(Boolean)
            ) as PlanType[];
          
          console.log("Using default paid plans:", defaultPaidPlans);
          setPlans(defaultPaidPlans);
        }
      } catch (error) {
        console.error("Error in fetchPlans:", error);
        
        // Fallback to default plans if something goes wrong
        const defaultPaidPlans = defaultPlans
          .filter(plan => plan.code === 'pro')
          .concat(
            // Add a modified annual plan with code='pro12'
            [{
              ...defaultPlans.find(plan => plan.code === 'annual'),
              code: 'pro12',
              name: 'Yearly Pro Plan',
              nameAr: 'الباقة الاحترافية السنوية',
              price: 39
            }].filter(Boolean)
          ) as PlanType[];
        
        console.log("Using default paid plans as fallback after error:", defaultPaidPlans);
        setPlans(defaultPaidPlans);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  return {
    plans,
    loading
  };
};
