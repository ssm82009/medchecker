
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import { checkAndGetSession } from '@/utils/paymentUtils';
import PaymentSecurityMessage from './payment/PaymentSecurityMessage';
import PaymentButton from './payment/PaymentButton';
import PayPalButtonsContainer from './payment/PayPalButtonsContainer';
import PayPalLoadingState from './payment/PayPalLoadingState';
import UserIdError from './payment/UserIdError';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  const { handlePayButtonClick, handlePayPalApprove } = usePayPalPayment(onPaymentSuccess, onPaymentError);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  
  // التحقق من وجود جلسة نشطة عند تحميل المكون
  useEffect(() => {
    const verifySession = async () => {
      setSessionStatus('checking');
      
      const sessionCheck = await checkAndGetSession(language);
      
      if (!sessionCheck.success) {
        console.error("[PayPalPaymentButtons] No active session:", sessionCheck.message);
        setSessionStatus('inactive');
        
        toast({
          title: language === 'ar' ? 'تحذير: جلسة غير نشطة' : 'Warning: Session not active',
          description: language === 'ar' 
            ? 'يرجى تسجيل الدخول للمتابعة' 
            : 'Please login to continue',
          variant: 'destructive'
        });
      } else {
        console.log("[PayPalPaymentButtons] Active session verified for user:", 
          sessionCheck.session?.user.id);
        setSessionStatus('active');
      }
    };
    
    verifySession();
  }, [language, toast]);
  
  console.log("[PayPalPaymentButtons] Rendering with userId:", userId, "Type:", typeof userId);
  console.log("[PayPalPaymentButtons] Session status:", sessionStatus);
  
  // التحقق الدقيق من معرف المستخدم
  if (!userId) {
    console.error("[PayPalPaymentButtons] No userId provided!");
    return <UserIdError language={language} />;
  }
  
  // عرض حالة التحميل إذا كانت عملية التحقق من الجلسة جارية
  if (sessionStatus === 'checking') {
    return <PayPalLoadingState language={language} />;
  }
  
  // عرض رسالة جلسة غير نشطة مع زر تسجيل الدخول
  if (sessionStatus === 'inactive') {
    return (
      <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
        <div className="text-amber-700 font-medium mb-2">
          {language === 'ar' ? 'جلسة غير نشطة' : 'Session not active'}
        </div>
        <div className="text-amber-600 text-sm mb-4">
          {language === 'ar' 
            ? 'يجب عليك تسجيل الدخول للمتابعة' 
            : 'You need to login to continue'}
        </div>
        <div className="flex justify-center">
          <Button 
            variant="secondary" 
            size="sm" 
            asChild
          >
            <Link to="/login" state={{ returnUrl: '/subscribe' }}>
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  if (!paypalReady || !paypalSettings || !paypalSettings.clientId) {
    return <PayPalLoadingState language={language} />;
  }

  // التأكد من أن معرف المستخدم هو سلسلة نصية
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
              // التحقق من وجود جلسة نشطة قبل المتابعة
              const sessionCheck = await checkAndGetSession(language);
              if (!sessionCheck.success) {
                console.error("[PayPalPaymentButtons] Session not active during payment approval");
                throw new Error(sessionCheck.message);
              }
              
              const activeSession = sessionCheck.session;
              
              // التأكد دائمًا من وجود معرف المستخدم في كائن البيانات
              const enhancedData = {
                ...data, 
                userId: safeUserId,
                sessionUserId: activeSession?.user?.id
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
