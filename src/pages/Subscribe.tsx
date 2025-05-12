
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AuthenticationError from '@/components/subscription/AuthenticationError';
import SubscriptionLoader from '@/components/subscription/SubscriptionLoader';
import PlanError from '@/components/subscription/PlanError';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
// Removed: import { checkAndGetSession } from '@/utils/paymentUtils'; // No longer directly used here in the old way

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  // New states for more robust session checking
  const [initialSessionApiCallDone, setInitialSessionApiCallDone] = useState(false);
  const [authStateListenerProcessedInitial, setAuthStateListenerProcessedInitial] = useState(false);

  const {
    paypalSettings,
    loading,
    plans,
    selectedPlan,
    selectedPlanCode,
    setSelectedPlanCode,
    paymentType,
    paypalReady,
    paymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus,
    userId
  } = useSubscription();

  // Debug logs
  useEffect(() => {
    console.log("Subscribe component mounting with user state:", user);
    
    return () => {
      console.log("Subscribe component unmounting");
    };
  }, []);

  // Unified session checking logic
  useEffect(() => {
    let isMounted = true;

    // 1. Initial check with supabase.auth.getSession()
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error("Error getting initial session:", error);
        // Do not set sessionValid to false here yet, let onAuthStateChange be the primary source
      }
      // If session exists from getSession, we can tentatively set sessionValid
      // but onAuthStateChange will confirm or override.
      if (session) {
        setSessionValid(true);
      }
      setInitialSessionApiCallDone(true);
    });

    // 2. Listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      console.log("Auth state change event:", event, "Session:", session ? "exists" : "none");
      setSessionValid(!!session);
      setAuthStateListenerProcessedInitial(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Runs once on mount

  // Determine overall sessionChecked status
  useEffect(() => {
    // We consider the session check complete if:
    // A) The user object from useAuth is populated (fastest positive confirmation)
    // OR
    // B) Both the initial getSession API call has finished AND the onAuthStateChange listener has processed at least once.
    if (user || (initialSessionApiCallDone && authStateListenerProcessedInitial)) {
      setSessionChecked(true);
    }
  }, [user, initialSessionApiCallDone, authStateListenerProcessedInitial]);

  // Only redirect to login if we've finished checking and found no valid session or user
  useEffect(() => {
    const supabaseUserId = user ? String(user.id) : null;

    if (sessionChecked && !sessionValid) {
      console.log("No valid session, checking user context...");
      const shouldRedirect = !user || 
        (user && (!user.id || (supabaseUserId && supabaseUserId !== String(user.id))));
      if (shouldRedirect) {
        console.log("Session/user mismatch, redirecting to login");
        navigate('/login', { 
          state: { 
            returnUrl: '/subscribe',
            sessionStatus: 'expired'
          } 
        });
      }
    }
  }, [sessionChecked, sessionValid, user, navigate]);

  // Debug logs for render
  console.log("Subscribe page render state:", {
    user: user ? `${user.id} (${typeof user.id})` : "none",
    sessionChecked,
    sessionValid,
    path: location.pathname,
    selectedPlan: selectedPlan?.code
  });

  // Show loading state until session check completes
  if (!sessionChecked) {
    return <SubscriptionLoader language={language} />;
  }

  // Show authentication error only if session check is complete and no user is found
  if (sessionChecked && !user) {
    return <AuthenticationError language={language} user={user} sessionValid={sessionValid} />;
  }

  // If session is not yet valid but a user object exists (e.g. from local state),
  // and we are still loading plans or PayPal settings, show loader.
  // This prevents showing auth error prematurely if session validation is slow.
  if ((!sessionValid && user && loading) || loading) {
    return <SubscriptionLoader language={language} />;
  }

  if (loading) {
    return <SubscriptionLoader language={language} />;
  }
  
  if (!plans || plans.length === 0) {
    return <PlanError language={language} />;
  }

  // Make sure user.id is a string
  const safeUserId = user?.id ? String(user.id) : '';
  console.log("Using safeUserId for subscription:", safeUserId);

  return (
    <SubscriptionCard
      language={language}
      paypalSettings={paypalSettings}
      plans={plans}
      selectedPlan={selectedPlan}
      selectedPlanCode={selectedPlanCode}
      setSelectedPlanCode={setSelectedPlanCode}
      paymentType={paymentType}
      paypalReady={paypalReady}
      paymentStatus={paymentStatus}
      paymentMessage={paymentMessage}
      handlePaymentSuccess={handlePaymentSuccess}
      handlePaymentError={handlePaymentError}
      resetPaymentStatus={resetPaymentStatus}
      userId={safeUserId}
    />
  );
};

export default Subscribe;
