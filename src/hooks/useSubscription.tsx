
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentState } from '@/hooks/usePaymentState';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkAndGetSession } from '@/utils/paymentUtils';

export const useSubscription = () => {
  const { user, refreshUser, fetchLatestPlan } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { toast } = useToast();
  
  // Add isMounted ref to prevent state updates after unmounting
  const isMountedRef = useRef(true);
  
  // Add flag to prevent refetchLatestPlan from running in a loop
  const fetchingLatestPlanRef = useRef(false);
  
  // Default to monthly plan (pro)
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('pro');
  
  // Track if we have a valid Supabase session
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState<boolean>(true);
  const [sessionInitialized, setSessionInitialized] = useState<boolean>(false);
  
  useEffect(() => {
    // Set isMountedRef to true when component mounts
    isMountedRef.current = true;
    
    // Return cleanup function to set isMountedRef to false when component unmounts
    return () => {
      isMountedRef.current = false;
      fetchingLatestPlanRef.current = false;
    };
  }, []);
  
  // Use the improved function to check for active session - only once
  useEffect(() => {
    if (sessionInitialized) return;
    
    const initializeSession = async () => {
      try {
        if (!isMountedRef.current) return;
        setSessionChecking(true);
        const sessionCheck = await checkAndGetSession(language);
        
        if (!isMountedRef.current) return;
        
        if (sessionCheck.success) {
          console.log("Active Supabase session confirmed in useSubscription:", 
            sessionCheck.session.user.id);
          setSupabaseUserId(sessionCheck.session.user.id);
        } else {
          console.log("Session check failed:", sessionCheck.message);
          setSupabaseUserId(null);
          
          if (isMountedRef.current) {
            toast({
              title: language === 'ar' ? 'تنبيه بخصوص الجلسة' : 'Session Alert',
              description: sessionCheck.message,
              variant: 'destructive'
            });
          }
        }
      } catch (e) {
        if (!isMountedRef.current) return;
        console.error("Exception in Supabase auth check:", e);
        setSupabaseUserId(null);
      } finally {
        if (isMountedRef.current) {
          setSessionChecking(false);
          setSessionInitialized(true);
        }
      }
    };
    
    initializeSession();
    
    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;
      console.log("Auth state changed in useSubscription:", event);
      
      if (session) {
        setSupabaseUserId(session.user.id);
        console.log("Session updated from auth state change:", session.user.id);
      } else {
        setSupabaseUserId(null);
        console.log("No session from auth state change");
        
        // Try to refresh the session without redirecting
        if (isMountedRef.current) {
          const refreshCheck = await checkAndGetSession(language);
          if (refreshCheck.success) {
            setSupabaseUserId(refreshCheck.session.user.id);
            console.log("Session refreshed after auth state change:", 
              refreshCheck.session.user.id);
          }
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [language, toast, sessionInitialized]);
  
  // Use our hooks to fetch data and manage state
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
    if (!isMountedRef.current) return;
    setPaymentType('one_time');
  }, []);

  // Get the selected plan from the list of plans
  const selectedPlan = plans?.find(plan => plan.code === selectedPlanCode) || null;
  
  // If we have plans but the selected plan isn't found, select the first one
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (plans && plans.length > 0 && !selectedPlan) {
      console.log("No selected plan found, defaulting to first available plan:", plans[0].code);
      setSelectedPlanCode(plans[0].code);
    }
  }, [plans, selectedPlan]);

  // Get the effective user ID (either from supabase session or auth hook)
  const effectiveUserId = supabaseUserId || (user?.id ? String(user.id) : null);
  
  console.log("Effective user ID in useSubscription:", effectiveUserId);
  console.log("User from auth hook:", user?.id ? `${user.id} (${typeof user.id})` : "not available");
  console.log("User from Supabase session:", supabaseUserId || "not available");

  // Show login prompt if user is not logged in
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (!sessionChecking && !effectiveUserId && !loading) {
      setShowLoginPrompt(true);
      toast({
        title: language === 'ar' ? 'تسجيل دخول مطلوب' : 'Login Required',
        description: language === 'ar' 
          ? 'يرجى تسجيل الدخول لإكمال عملية الدفع' 
          : 'Please login to complete payment process',
        variant: 'destructive'
      });
    } else {
      setShowLoginPrompt(false);
    }
  }, [effectiveUserId, sessionChecking, loading, language, toast]);

  // Calculate the expiry date based on plan type
  const calculateExpiryDate = (planCode: string): string => {
    const now = new Date();
    if (planCode === 'pro12' || planCode === 'annual') {
      // Add 1 year for annual plans
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    } else {
      // Add 1 month for monthly plans
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  };

  // Enhanced payment success handler to include plan details, user ID, and expiry date
  const enhancedPaymentSuccess = async (details: any) => {
    try {
      // Check for active session before proceeding
      const sessionCheck = await checkAndGetSession(language);
      
      if (!sessionCheck.success) {
        console.error("No active session detected before payment processing");
        handlePaymentError(sessionCheck.message);
        return;
      }
      
      // Ensure we have a user ID
      if (!effectiveUserId) {
        console.error("No effective user ID available in useSubscription");
        handlePaymentError(language === 'ar' 
          ? 'معرف المستخدم غير متوفر' 
          : 'User ID not available');
        return;
      }
      
      const activeSession = sessionCheck.session;
      console.log("Enhanced payment success with effective user ID:", effectiveUserId);
      console.log("Active session confirmed before payment processing:", activeSession.user.id);
      
      // Calculate expiry date based on plan type
      const expiryDate = calculateExpiryDate(selectedPlan?.code || 'pro');
      
      // Add price, plan code, expiry date, and user ID to details object
      const enhancedDetails = {
        ...details,
        price: selectedPlan?.price,
        planCode: selectedPlan?.code,
        currency: paypalSettings?.currency,
        userId: effectiveUserId,
        sessionUserId: activeSession.user.id,
        expiryDate: expiryDate
      };
      
      if (!isMountedRef.current) return;
      
      await handlePaymentSuccess(enhancedDetails);
      
      // After successful payment, refresh user data and plan information
      if (refreshUser && fetchLatestPlan && isMountedRef.current) {
        await refreshUser();
        await fetchLatestPlan();
        console.log('User data and plan refreshed after successful subscription.');
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Error in enhancedPaymentSuccess:", error);
      handlePaymentError(String(error));
    }
  };

  return {
    paypalSettings,
    loading: loading || sessionChecking,
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
    userId: effectiveUserId,
    showLoginPrompt
  };
};
