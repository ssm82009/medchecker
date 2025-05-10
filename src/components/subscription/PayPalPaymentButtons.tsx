
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import PaymentSecurityMessage from './payment/PaymentSecurityMessage';
import PaymentButton from './payment/PaymentButton';
import PayPalButtonsContainer from './payment/PayPalButtonsContainer';
import PayPalLoadingState from './payment/PayPalLoadingState';
import UserIdError from './payment/UserIdError';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PayPalPaymentButtonsProps {
  paypalSettings: any;
  paypalReady: boolean;
  paymentType: 'one_time' | 'recurring';
  plan: PlanType;
  userId: string;
  onPaymentSuccess: (details: any) => Promise<void>;
  onPaymentError: (error: any) => void;
}

const PayPalPaymentButtons: React.FC<PayPalPaymentButtonsProps> = ({
  paypalSettings,
  paypalReady,
  paymentType,
  plan,
  userId,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSessionValid, setIsSessionValid] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const { handlePayButtonClick, handlePayPalApprove } = usePayPalPayment(onPaymentSuccess, onPaymentError);
  
  // Enhanced session check when component mounts
  useEffect(() => {
    const verifySession = async () => {
      setIsCheckingSession(true);
      try {
        // Try to get the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[PayPalPaymentButtons] Supabase session error:", error);
          setIsSessionValid(false);
          toast({
            title: language === 'ar' ? 'خطأ في الجلسة' : 'Session Error',
            description: language === 'ar' 
              ? 'حدث خطأ في جلسة المستخدم. يرجى إعادة تسجيل الدخول.' 
              : 'Session error occurred. Please login again.',
            variant: 'destructive'
          });
          
          // Redirect to login
          setTimeout(() => navigate('/login', { state: { returnUrl: '/subscribe' } }), 2000);
        } else if (!data.session) {
          console.error("[PayPalPaymentButtons] No active Supabase session: session is null");
          setIsSessionValid(false);
          
          // Try to refresh the session
          try {
            console.log("[PayPalPaymentButtons] Attempting to refresh session...");
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error("[PayPalPaymentButtons] Session refresh failed:", refreshError);
              toast({
                title: language === 'ar' ? 'جلسة غير صالحة' : 'Invalid Session',
                description: language === 'ar' 
                  ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة.' 
                  : 'Please login again to continue.',
                variant: 'destructive'
              });
              
              // Redirect to login
              setTimeout(() => navigate('/login', { state: { returnUrl: '/subscribe' } }), 2000);
            } else if (refreshData.session) {
              console.log("[PayPalPaymentButtons] Session refreshed successfully:", refreshData.session.user.id);
              setIsSessionValid(true);
            } else {
              console.error("[PayPalPaymentButtons] Session refresh returned no session");
              setIsSessionValid(false);
              
              // Redirect to login
              toast({
                title: language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please Login',
                description: language === 'ar' 
                  ? 'يرجى تسجيل الدخول للمتابعة مع الدفع.' 
                  : 'Please login to continue with payment.',
                variant: 'destructive'
              });
              setTimeout(() => navigate('/login', { state: { returnUrl: '/subscribe' } }), 2000);
            }
          } catch (refreshError) {
            console.error("[PayPalPaymentButtons] Error refreshing session:", refreshError);
            setIsSessionValid(false);
          }
        } else {
          console.log("[PayPalPaymentButtons] Active session verified for user:", data.session.user.id);
          setIsSessionValid(true);
        }
      } catch (e) {
        console.error("[PayPalPaymentButtons] Exception in session verification:", e);
        setIsSessionValid(false);
      } finally {
        setIsCheckingSession(false);
      }
    };
    
    verifySession();
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[PayPalPaymentButtons] Auth state changed:", event);
      setIsSessionValid(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [language, toast, navigate]);
  
  console.log("[PayPalPaymentButtons] Rendering with userId:", userId, "Type:", typeof userId);
  console.log("[PayPalPaymentButtons] Session state:", isSessionValid ? "Valid" : "Invalid");
  
  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse flex flex-col items-center p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="mt-4 text-sm text-gray-400">
            {language === 'ar' ? 'جاري التحقق من حالة الجلسة...' : 'Verifying session status...'}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if session is invalid
  if (!isSessionValid) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-md text-center">
          <div className="text-amber-800 font-medium mb-2">
            {language === 'ar' ? 'جلسة غير صالحة' : 'Session Invalid'}
          </div>
          <div className="text-sm text-amber-700">
            {language === 'ar' 
              ? 'يرجى تسجيل الدخول مرة أخرى للمتابعة مع الدفع.' 
              : 'Please login again to continue with payment.'}
          </div>
          <button 
            onClick={() => navigate('/login', { state: { returnUrl: '/subscribe' } })}
            className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-md text-sm"
          >
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </button>
        </div>
      </div>
    );
  }
  
  // Strict validation of userId
  if (!userId) {
    console.error("[PayPalPaymentButtons] No userId provided!");
    return <UserIdError language={language} />;
  }
  
  if (!paypalReady || !paypalSettings || !paypalSettings.clientId) {
    return <PayPalLoadingState language={language} />;
  }

  // Ensure userId is a string
  const safeUserId = String(userId);

  return (
    <div className="space-y-4">
      <PaymentSecurityMessage language={language} />
      <PaymentButton 
        paymentType={paymentType} 
        language={language} 
        onClick={handlePayButtonClick} 
      />

      <div id="paypal-buttons" className="pt-4 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500 mb-3">
          {language === 'ar' ? 'اختر طريقة الدفع أدناه' : 'Select payment method below'}
        </div>
        <PayPalButtonsContainer
          paymentType={paymentType}
          paypalSettings={paypalSettings}
          plan={plan}
          userId={safeUserId}
          language={language}
          onApprove={async (data, actions) => {
            try {
              // Double-check that session is still active before proceeding
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              
              if (sessionError || !sessionData.session) {
                console.error("[PayPalPaymentButtons] Session not active during payment approval");
                throw new Error(language === 'ar' 
                  ? 'لا توجد جلسة نشطة للمستخدم. يرجى تسجيل الدخول مرة أخرى.' 
                  : 'No active user session. Please login again.');
              }
              
              console.log("[PayPalPaymentButtons] Active session confirmed for payment:", sessionData.session.user.id);
              
              // Always ensure the userId is in the data object
              const enhancedData = {
                ...data, 
                userId: safeUserId,
                // Use session user ID instead of session.id which doesn't exist
                sessionId: sessionData.session.user.id
              };
              console.log("[PayPalPaymentButtons] Enhanced PayPal approval data with userId:", enhancedData);
              await handlePayPalApprove(enhancedData, actions);
            } catch (error) {
              console.error("[PayPalPaymentButtons] Error during payment approval:", error);
              onPaymentError(String(error));
            }
          }}
          onError={onPaymentError}
        />
      </div>
    </div>
  );
};

export default PayPalPaymentButtons;
