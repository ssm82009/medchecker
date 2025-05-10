
import React, { useEffect } from 'react';
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
  
  // Scroll to PayPal buttons on component mount
  useEffect(() => {
    const paypalButtonsElement = document.getElementById('paypal-buttons');
    if (paypalButtonsElement) {
      setTimeout(() => {
        paypalButtonsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [paypalReady]);

  console.log("PayPal settings in component:", paypalSettings);
  
  if (!paypalReady || !paypalSettings || !paypalSettings.clientId) {
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

  const handlePayButtonClick = () => {
    console.log("Payment button clicked");
    const paypalButtonsElement = document.getElementById('paypal-buttons');
    if (paypalButtonsElement) {
      paypalButtonsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the PayPal buttons
      paypalButtonsElement.classList.add('animate-pulse');
      setTimeout(() => {
        paypalButtonsElement.classList.remove('animate-pulse');
      }, 2000);
    }
  };

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

      <Button 
        className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 py-6" 
        onClick={handlePayButtonClick}
      >
        <CreditCard />
        {paymentText}
      </Button>

      <div id="paypal-buttons" className="pt-4 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500 mb-3">
          {language === 'ar' ? 'اختر طريقة الدفع أدناه' : 'Select payment method below'}
        </div>
        <PayPalScriptProvider
          options={{
            clientId: paypalSettings.clientId,
            currency: paypalSettings.currency || 'USD',
            intent: paymentType === 'recurring' ? 'subscription' : 'capture',
            components: 'buttons',
            disableFunding: 'card',
            enableFunding: 'paypal',
            dataClientToken: 'abc123xyz==',
            ...(paypalSettings.mode === 'sandbox' ? { 'buyer-country': 'US' } : {}),
          }}
          deferLoading={false}
        >
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
            forceReRender={[paymentType, proPlan.price, paypalSettings.currency]}
            createOrder={async (data, actions) => {
              console.log("Creating PayPal order for payment type:", paymentType);
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
                    console.log("Creating PayPal subscription");
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
              console.log("Payment approved:", data);
              try {
                if (actions?.order) {
                  const details = await actions.order.capture();
                  console.log("Payment details:", details);
                  await onPaymentSuccess(details);
                } else if (data.orderID) {
                  console.log("Subscription created with order ID:", data.orderID);
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
