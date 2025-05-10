
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentState } from '@/hooks/usePaymentState';
import { PlanType } from '@/types/plan';

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  // Default to monthly plan (pro)
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('pro');
  
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

  // Augment the payment success handler to include the plan details and user ID
  const enhancedPaymentSuccess = async (details: any) => {
    // Make sure we have a user ID
    if (!user || !user.id) {
      console.error("No user ID available in useSubscription");
      handlePaymentError(language === 'ar' 
        ? 'معرف المستخدم غير متوفر' 
        : 'User ID not available');
      return;
    }
    
    console.log("Enhanced payment success with user ID:", user.id);
    
    // Add price, plan code, and user ID to the details object
    const enhancedDetails = {
      ...details,
      price: selectedPlan?.price,
      planCode: selectedPlan?.code,
      currency: paypalSettings?.currency,
      userId: String(user.id) // Ensure it's a string
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
    userId: user?.id ? String(user.id) : null // Ensure we return the user ID as a string
  };
};
