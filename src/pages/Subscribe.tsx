
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

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
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

  // Check for Supabase session directly on component mount
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        console.log("Checking Supabase session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Supabase session error:", error);
          setSessionValid(false);
        } else if (data.session) {
          console.log("Active Supabase session found:", data.session.user.id);
          setSessionValid(true);
        } else {
          console.log("No active Supabase session");
          setSessionValid(false);
        }
      } catch (e) {
        console.error("Exception in Supabase session check:", e);
        setSessionValid(false);
      } finally {
        setSessionChecked(true);
      }
    };
    
    checkSupabaseSession();
  }, []);

  // Monitor Supabase session changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event, "Session:", session ? "exists" : "none");
      setSessionValid(!!session);
      setSessionChecked(true);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Only redirect to login if we've finished checking and found no valid session or user
  useEffect(() => {
    if (sessionChecked && !sessionValid && !user) {
      console.log("No valid session or user, redirecting to login");
      navigate('/login', { state: { returnUrl: '/subscribe' } });
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

  // Don't show authentication error if we're still checking
  if (!sessionValid && !user) {
    return <AuthenticationError language={language} user={user} />;
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
