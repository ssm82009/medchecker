
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentState } from '@/hooks/usePaymentState';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  // Default to monthly plan (pro)
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('pro');
  
  // Track if we have a valid Supabase session
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  
  // Check for active Supabase session when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting Supabase session:", error);
          setSupabaseUserId(null);
          return;
        }
        
        if (data.session) {
          const userId = data.session.user.id;
          console.log("Active Supabase session confirmed in useSubscription:", userId);
          setSupabaseUserId(userId);
        } else {
          console.log("No active Supabase session found in useSubscription");
          setSupabaseUserId(null);
        }
      } catch (e) {
        console.error("Exception in Supabase auth check:", e);
        setSupabaseUserId(null);
      }
    };
    
    checkAuth();
    
    // Also set up a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in useSubscription:", event);
      if (session) {
        setSupabaseUserId(session.user.id);
      } else {
        setSupabaseUserId(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Use our new hooks to fetch data and manage state
  const { 
    paypalSettings, 
    plans,
    loading, 
    paypalReady 
  } = usePaymentData();
  
  const { 
    paymentType,
    setPaymentType,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus
  } = usePaymentState(language);

  // Always use one-time payments
  useEffect(() => {
    setPaymentType('one_time');
  }, []);

  // Get the selected plan from the list of plans
  const selectedPlan = plans?.find(plan => plan.code === selectedPlanCode) || null;
  
  // If we have plans but the selected plan isn't found, select the first one
  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlan) {
      console.log("No selected plan found, defaulting to first available plan:", plans[0].code);
      setSelectedPlanCode(plans[0].code);
    }
  }, [plans, selectedPlan]);

  // Log plan details for debugging
  useEffect(() => {
    console.log("Available plans:", plans);
    console.log("Selected plan code:", selectedPlanCode);
    console.log("Selected plan details:", selectedPlan);
  }, [plans, selectedPlanCode, selectedPlan]);

  // Get the effective user ID (either from supabase session or auth hook)
  const effectiveUserId = supabaseUserId || (user?.id ? String(user.id) : null);
  
  console.log("Effective user ID in useSubscription:", effectiveUserId);
  console.log("User from auth hook:", user?.id ? `${user.id} (${typeof user.id})` : "not available");
  console.log("User from Supabase session:", supabaseUserId || "not available");

  // Augment the payment success handler to include the plan details and user ID
  const enhancedPaymentSuccess = async (details: any) => {
    // Make sure we have a user ID
    if (!effectiveUserId) {
      console.error("No effective user ID available in useSubscription");
      handlePaymentError(language === 'ar' 
        ? 'معرف المستخدم غير متوفر' 
        : 'User ID not available');
      return;
    }
    
    console.log("Enhanced payment success with effective user ID:", effectiveUserId);
    
    // Add price, plan code, and user ID to the details object
    const enhancedDetails = {
      ...details,
      price: selectedPlan?.price,
      planCode: selectedPlan?.code,
      currency: paypalSettings?.currency,
      userId: effectiveUserId // Use the effective user ID
    };
    
    await handlePaymentSuccess(enhancedDetails);
  };

  return {
    paypalSettings,
    loading,
    plans,
    selectedPlan,
    selectedPlanCode,
    setSelectedPlanCode,
    paymentType,
    setPaymentType,
    paypalReady,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess: enhancedPaymentSuccess,
    handlePaymentError,
    resetPaymentStatus,
    userId: effectiveUserId // Return the effective user ID
  };
};
