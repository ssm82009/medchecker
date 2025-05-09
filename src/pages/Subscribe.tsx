
import React from 'react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import PlanDetails from '@/components/subscription/PlanDetails';
import PaymentTypeSelector from '@/components/subscription/PaymentTypeSelector';
import PaymentStatus from '@/components/subscription/PaymentStatus';
import PayPalPaymentButtons from '@/components/subscription/PayPalPaymentButtons';

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
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

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">جاري التحميل...</div>;
  if (!proPlan) return <div className="text-center text-red-500">لم يتم العثور على الباقة الاحترافية</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">{proPlan.name_ar || proPlan.name}</CardTitle>
        </CardHeader>
        
        <PlanDetails plan={proPlan} paypalSettings={paypalSettings} />
        
        <CardFooter className="flex flex-col gap-4">
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
            عودة
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Subscribe;
