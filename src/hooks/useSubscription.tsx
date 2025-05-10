
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentState } from '@/hooks/usePaymentState';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkAndGetSession } from '@/utils/paymentUtils';

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { toast } = useToast();
  
  // Default to monthly plan (pro)
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>('pro');
  
  // Track if we have a valid Supabase session
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [sessionChecking, setSessionChecking] = useState<boolean>(true);
  
  // استخدام الوظيفة المحسنة للتحقق من وجود جلسة نشطة
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setSessionChecking(true);
        const sessionCheck = await checkAndGetSession(language);
        
        if (sessionCheck.success) {
          console.log("Active Supabase session confirmed in useSubscription:", 
            sessionCheck.session.user.id);
          setSupabaseUserId(sessionCheck.session.user.id);
        } else {
          console.log("Session check failed:", sessionCheck.message);
          setSupabaseUserId(null);
          
          // إظهار رسالة فقط دون إعادة توجيه
          toast({
            title: language === 'ar' ? 'تنبيه بخصوص الجلسة' : 'Session Alert',
            description: sessionCheck.message,
            variant: 'destructive'
          });
        }
      } catch (e) {
        console.error("Exception in Supabase auth check:", e);
        setSupabaseUserId(null);
      } finally {
        setSessionChecking(false);
      }
    };
    
    initializeSession();
    
    // إعداد مستمع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in useSubscription:", event);
      
      if (session) {
        setSupabaseUserId(session.user.id);
        console.log("Session updated from auth state change:", session.user.id);
      } else {
        setSupabaseUserId(null);
        console.log("No session from auth state change");
        
        // محاولة تحديث الجلسة دون إعادة توجيه
        const refreshCheck = await checkAndGetSession(language);
        if (refreshCheck.success) {
          setSupabaseUserId(refreshCheck.session.user.id);
          console.log("Session refreshed after auth state change:", 
            refreshCheck.session.user.id);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [language, toast]);
  
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

  // Get the effective user ID (either from supabase session or auth hook)
  const effectiveUserId = supabaseUserId || (user?.id ? String(user.id) : null);
  
  console.log("Effective user ID in useSubscription:", effectiveUserId);
  console.log("User from auth hook:", user?.id ? `${user.id} (${typeof user.id})` : "not available");
  console.log("User from Supabase session:", supabaseUserId || "not available");

  // نعرض للمستخدم خيار تسجيل الدخول إذا كانوا غير مسجلين ولكن بدون إعادة توجيه تلقائية
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  useEffect(() => {
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

  // تحسين معالج نجاح الدفع ليشمل تفاصيل الخطة ومعرف المستخدم
  const enhancedPaymentSuccess = async (details: any) => {
    try {
      // التحقق من وجود جلسة نشطة قبل المتابعة
      const sessionCheck = await checkAndGetSession(language);
      
      if (!sessionCheck.success) {
        console.error("No active session detected before payment processing");
        handlePaymentError(sessionCheck.message);
        return;
      }
      
      // التأكد من وجود معرف مستخدم
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
      
      // إضافة السعر ورمز الخطة ومعرف المستخدم إلى كائن التفاصيل
      const enhancedDetails = {
        ...details,
        price: selectedPlan?.price,
        planCode: selectedPlan?.code,
        currency: paypalSettings?.currency,
        userId: effectiveUserId,
        sessionUserId: activeSession.user.id
      };
      
      await handlePaymentSuccess(enhancedDetails);
    } catch (error) {
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
    userId: effectiveUserId, // إرجاع معرف المستخدم الفعلي
    showLoginPrompt // إضافة مؤشر لعرض نافذة تسجيل الدخول
  };
};
