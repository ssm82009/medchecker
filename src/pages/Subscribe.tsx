
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import PlanDetails from '@/components/subscription/PlanDetails';
import PaymentTypeSelector from '@/components/subscription/PaymentTypeSelector';
import PaymentStatus from '@/components/subscription/PaymentStatus';
import PayPalPaymentButtons from '@/components/subscription/PayPalPaymentButtons';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertTriangle } from 'lucide-react';

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const {
    paypalSettings,
    loading,
    proPlan,
    paymentType,
    setPaymentType,
    paypalReady,
    paymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus
  } = useSubscription();

  // التحقق من تسجيل الدخول وتوجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مسجلاً
  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login page");
      navigate('/login', { state: { returnUrl: '/subscribe' } });
    }
  }, [user, navigate]);

  // Debug logs to help identify issues
  React.useEffect(() => {
    console.log("Subscribe page - PayPal settings:", paypalSettings);
    console.log("Subscribe page - PayPal ready:", paypalReady);
    console.log("Subscribe page - Pro plan:", proPlan);
    console.log("Subscribe page - Current user:", user);
    if (user) {
      console.log("User ID:", user.id, "Type:", typeof user.id);
    }
  }, [paypalSettings, paypalReady, proPlan, user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
        <Card className="w-full max-w-lg shadow-xl border-primary/10">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-2xl font-bold text-primary">
              {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6">
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-amber-800 mb-1">
                  {language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}
                </h3>
                <p className="text-amber-700 text-sm">
                  {language === 'ar' 
                    ? 'يجب عليك تسجيل الدخول أو إنشاء حساب جديد للاشتراك في الباقة الاحترافية.' 
                    : 'You need to login or create an account to subscribe to the professional plan.'}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button 
              className="w-full" 
              onClick={() => navigate('/login', { state: { returnUrl: '/subscribe' } })}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/signup')}
            >
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[40vh]">
      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
    </div>
  );
  
  if (!proPlan) return (
    <div className="text-center text-red-500">
      {language === 'ar' ? 'لم يتم العثور على الباقة الاحترافية' : 'Professional plan not found'}
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {language === 'ar' ? 'الباقة الاحترافية' : 'Professional Plan'}
          </CardTitle>
        </CardHeader>
        
        <PlanDetails plan={proPlan} paypalSettings={paypalSettings} />
        
        <CardFooter className="flex flex-col gap-4 pt-4">
          <PaymentTypeSelector paymentType={paymentType} onValueChange={setPaymentType} />
          
          <PaymentStatus 
            status={paymentStatus} 
            message={paymentMessage} 
            onRetry={resetPaymentStatus}
          />
          
          {paymentStatus === 'idle' && (
            <PayPalPaymentButtons
              paypalSettings={paypalSettings}
              paypalReady={paypalReady}
              paymentType={paymentType}
              proPlan={proPlan}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
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

export default Subscribe;
