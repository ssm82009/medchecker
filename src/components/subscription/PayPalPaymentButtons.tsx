
import React, { useEffect } from 'react';
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
  const { handlePayButtonClick, handlePayPalApprove } = usePayPalPayment(onPaymentSuccess, onPaymentError);
  
  // Check for active session when component mounts
  useEffect(() => {
    const verifySession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error("[PayPalPaymentButtons] No active Supabase session:", error || "session is null");
        toast({
          title: language === 'ar' ? 'تحذير: جلسة غير نشطة' : 'Warning: Session not active',
          description: language === 'ar' 
            ? 'قد تواجه مشاكل في إكمال الدفع. يرجى تسجيل الخروج وإعادة تسجيل الدخول.' 
            : 'You may have issues completing payment. Please logout and login again.',
          variant: 'destructive'
        });
      } else {
        console.log("[PayPalPaymentButtons] Active session verified for user:", data.session.user.id);
      }
    };
    
    verifySession();
  }, [language, toast]);
  
  console.log("[PayPalPaymentButtons] Rendering with userId:", userId, "Type:", typeof userId);
  
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
              // Verify session is active before proceeding
              const { data: sessionData } = await supabase.auth.getSession();
              if (!sessionData.session) {
                console.error("[PayPalPaymentButtons] Session not active during payment approval");
                throw new Error(language === 'ar' 
                  ? 'لا توجد جلسة نشطة للمستخدم. يرجى تسجيل الدخول مرة أخرى.' 
                  : 'No active user session. Please login again.');
              }
              
              // Always ensure the userId is in the data object
              const enhancedData = {
                ...data, 
                userId: safeUserId,
                sessionId: sessionData.session.id
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
