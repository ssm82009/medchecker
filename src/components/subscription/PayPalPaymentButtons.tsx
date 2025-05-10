
import React from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useTranslation } from '@/hooks/useTranslation';
import { CreditCard, ShieldCheck } from 'lucide-react';

interface PayPalPaymentButtonsProps {
  paypalSettings: any;
  paypalReady: boolean;
  paymentType: 'one_time' | 'recurring';
  proPlan: any;
  onPaymentSuccess: (details: any) => Promise<void>;
  onPaymentError: (error: any) => void;
}

const PayPalPaymentButtons: React.FC<PayPalPaymentButtonsProps> = ({
  paypalSettings,
  paypalReady,
  paymentType,
  proPlan,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { language } = useTranslation();
  
  if (!paypalReady) {
    return (
      <div className="space-y-4">
        <Button disabled className="w-full flex items-center gap-2">
          <ShieldCheck />
          {language === 'ar' ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}
        </Button>
        <div className="text-center text-sm text-gray-500">
          {language === 'ar' 
            ? 'بوابة الدفع غير متوفرة حالياً، يرجى المحاولة لاحقاً' 
            : 'Payment gateway is currently unavailable, please try again later'}
        </div>
      </div>
    );
  }

  const paymentText = language === 'ar' 
    ? (paymentType === 'recurring' ? 'اشترك الآن' : 'ادفع الآن') 
    : (paymentType === 'recurring' ? 'Subscribe Now' : 'Pay Now');

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
        <div className="flex items-center gap-2 text-blue-700">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">
            {language === 'ar' ? 'الدفع آمن ومشفر' : 'Secure and encrypted payment'}
          </span>
        </div>
      </div>

      <Button className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 py-6" onClick={() => {
        document.getElementById('paypal-buttons')?.scrollIntoView({ behavior: 'smooth' });
      }}>
        <CreditCard />
        {paymentText}
      </Button>

      <div id="paypal-buttons" className="pt-4">
        <PayPalScriptProvider
          options={{
            'client-id': paypalSettings.clientId,
            currency: paypalSettings.currency || 'USD',
            intent: paymentType === 'recurring' ? 'subscription' : 'capture',
            components: 'buttons',
            'disable-funding': 'card',
            'enable-funding': 'paypal',
            'data-sdk-integration-source': 'button',
            ...(paypalSettings.mode === 'sandbox' ? { 'buyer-country': 'US' } : {}),
          }}
        >
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
            forceReRender={[paymentType, proPlan.price, paypalSettings.currency]}
            createOrder={async (data, actions) => {
              if (paymentType === 'one_time') {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      amount: {
                        value: proPlan.price.toString(),
                        currency_code: paypalSettings.currency || 'USD',
                      },
                      description: proPlan.name,
                    },
                  ],
                });
              }
              return '';
            }}
            createSubscription={
              paymentType === 'recurring'
                ? async (data, actions) => {
                    const planId = paypalSettings.subscriptionPlanId || '';
                    if (!planId) {
                      onPaymentError(language === 'ar' 
                        ? 'لم يتم ضبط معرف خطة الاشتراك في إعدادات بايبال' 
                        : 'Subscription plan ID not set in PayPal settings');
                      return '';
                    }
                    return actions.subscription.create({ plan_id: planId });
                  }
                : undefined
            }
            onApprove={async (data, actions) => {
              try {
                if (actions?.order) {
                  const details = await actions.order.capture();
                  await onPaymentSuccess(details);
                } else if (data.orderID) {
                  await onPaymentSuccess({
                    id: data.orderID,
                    payer: { email_address: "subscriber@example.com" }
                  });
                }
              } catch (error) {
                console.error('Payment approval error:', error);
                onPaymentError(String(error));
              }
            }}
            onError={(err) => {
              console.error('PayPal error:', err);
              onPaymentError(language === 'ar' 
                ? 'فشل الدفع: ' + String(err)
                : 'Payment failed: ' + String(err));
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

export default PayPalPaymentButtons;
