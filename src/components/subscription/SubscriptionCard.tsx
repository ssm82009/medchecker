
import React, { useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PlanDetails from '@/components/subscription/PlanDetails';
import PlanSelector from '@/components/subscription/PlanSelector';
import PaymentStatus from '@/components/subscription/PaymentStatus';
import PayPalPaymentButtons from '@/components/subscription/PayPalPaymentButtons';
import LoginPrompt from '@/components/subscription/LoginPrompt';
import { PlanType } from '@/types/plan';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionCardProps {
  language: string;
  paypalSettings: any;
  plans: PlanType[];
  selectedPlan: PlanType | null;
  selectedPlanCode: string;
  setSelectedPlanCode: (code: string) => void;
  paymentType: 'one_time' | 'recurring';
  paypalReady: boolean;
  paymentStatus: 'idle' | 'success' | 'error';
  paymentMessage: string;
  handlePaymentSuccess: (details: any) => Promise<void>;
  handlePaymentError: (error: any) => void;
  resetPaymentStatus: () => void;
  userId: string;
  showLoginPrompt?: boolean;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  language,
  paypalSettings,
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
  userId,
  showLoginPrompt = false,
}) => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  
  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Double-check Supabase session on component mount
  useEffect(() => {
    const checkSession = async () => {
      if (!isMountedRef.current) return;
      
      const { data } = await supabase.auth.getSession();
      console.log("[SubscriptionCard] Session check:", data.session ? "Active" : "None");
      
      if (data.session) {
        console.log("[SubscriptionCard] Session user ID:", data.session.user.id);
      }
    };
    
    checkSession();
  }, []);
  
  // Extra validation for user ID - always ensure it's a string
  const safeUserId = userId ? String(userId) : '';
  
  console.log("[SubscriptionCard] Rendered with user ID:", safeUserId, "Type:", typeof safeUserId);
  console.log("[SubscriptionCard] Show login prompt:", showLoginPrompt);
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {language === 'ar' ? 'اختر خطة الاشتراك' : 'Choose your subscription'}
          </CardTitle>
        </CardHeader>
        
        {/* عرض مكون تنبيه تسجيل الدخول إذا كان المستخدم غير مسجل */}
        {showLoginPrompt && (
          <div className="px-6 pt-6">
            <LoginPrompt language={language} />
          </div>
        )}
        
        {selectedPlan && (
          <>
            {/* Plan selector */}
            <div className="px-6 pt-6">
              <PlanSelector 
                plans={plans} 
                selectedPlanCode={selectedPlanCode} 
                onPlanChange={setSelectedPlanCode} 
                language={language}
              />
            </div>
            
            {/* Selected plan details */}
            <PlanDetails plan={selectedPlan} paypalSettings={paypalSettings} />
          </>
        )}
        
        <CardFooter className="flex flex-col gap-4 pt-4">
          <PaymentStatus 
            status={paymentStatus} 
            message={paymentMessage} 
            onRetry={resetPaymentStatus}
          />
          
          {/* عرض أزرار الدفع فقط إذا كان المستخدم مسجل دخول وفي حالة صالحة */}
          {paymentStatus === 'idle' && selectedPlan && !showLoginPrompt && (
            <PayPalPaymentButtons
              paypalSettings={paypalSettings}
              paypalReady={paypalReady}
              paymentType={paymentType}
              plan={selectedPlan}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              userId={safeUserId}
            />
          )}
          
          <Button variant="secondary" className="w-full" onClick={() => navigate(-1)}>
            {language === 'ar' ? 'عودة' : 'Back'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
