
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; // Added missing import
import AuthenticationError from '@/components/subscription/AuthenticationError';
import SubscriptionLoader from '@/components/subscription/SubscriptionLoader';
import PlanError from '@/components/subscription/PlanError';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
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

  // Check if user is logged in and has ID
  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login page");
      navigate('/login', { state: { returnUrl: '/subscribe' } });
      return;
    }

    if (!user.id) {
      console.error("User found but no ID available:", user);
      toast({
        title: language === 'ar' ? 'خطأ في بيانات المستخدم' : 'User data error',
        description: language === 'ar' 
          ? 'تعذر العثور على معرف المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول.' 
          : 'User ID not found. Please log out and log in again.',
        variant: 'destructive'
      });
    } else {
      console.log("User ID is available and valid:", user.id, "Type:", typeof user.id);
    }
  }, [user, navigate, toast, language]);

  // Always make sure we have an auth session
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log("No active session found, redirecting to login");
        navigate('/login', { state: { returnUrl: '/subscribe' } });
      } else {
        console.log("Active session confirmed:", data.session.user.id);
      }
    };
    
    if (user) {
      checkSession();
    }
  }, [user, navigate]);

  // Debug logs to help identify issues
  React.useEffect(() => {
    console.log("Subscribe page - Current user:", user);
    if (user) {
      console.log("User ID:", user.id, "Type:", typeof user.id);
    }
  }, [user]);

  if (!user || !user.id) {
    return <AuthenticationError language={language} user={user} />;
  }

  if (loading) {
    return <SubscriptionLoader language={language} />;
  }
  
  if (!plans || plans.length === 0) {
    return <PlanError language={language} />;
  }

  // Make sure user.id is a string
  const safeUserId = String(user.id);

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
