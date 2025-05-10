
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useTranslation } from '@/hooks/useTranslation';
import { CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react';

interface PayPalPaymentButtonsProps {
  paypalSettings: any;
  paypalReady: boolean;
  paymentType: 'one_time' | 'recurring';
  proPlan: any;
  userId: string;
  onPaymentSuccess: (details: any) => Promise<void>;
  onPaymentError: (error: any) => void;
}

const PayPalPaymentButtons: React.FC<PayPalPaymentButtonsProps> = ({
  paypalSettings,
  paypalReady,
  paymentType,
  proPlan,
  userId,
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
  console.log("Payment type:", paymentType);
  console.log("User ID received in component:", userId, "Type:", typeof userId);
  
  // Early validation of userId to prevent issues
  if (!userId) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {language === 'ar' ? 'معرف المستخدم غير متوفر' : 'User ID not available'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
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

  // Ensure userId is a string
  const safeUserId = String(userId);

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
            components: 'buttons',
            disableFunding: 'card',
            enableFunding: 'paypal',
            vault: paymentType === 'recurring' ? true : undefined,
            intent: paymentType === 'one_time' ? 'capture' : undefined,
            buyerCountry: paypalSettings.mode === 'sandbox' ? 'US' : undefined
          }}
        >
          <PayPalButtons
            style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
            forceReRender={[paymentType, proPlan.price, paypalSettings.currency]}
            createOrder={async (data, actions) => {
              console.log("Creating PayPal order for payment type:", paymentType);
              console.log("User ID for createOrder:", safeUserId, "Type:", typeof safeUserId);
              
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
                      custom_id: safeUserId
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
                    console.log("User ID for createSubscription:", safeUserId, "Type:", typeof safeUserId);
                    const planId = paypalSettings.subscriptionPlanId || '';
                    if (!planId) {
                      onPaymentError(language === 'ar' 
                        ? 'لم يتم ضبط معرف خطة الاشتراك في إعدادات بايبال' 
                        : 'Subscription plan ID not set in PayPal settings');
                      return '';
                    }
                    
                    return actions.subscription.create({ 
                      plan_id: planId,
                      custom_id: safeUserId
                    });
                  }
                : undefined
            }
            onApprove={async (data, actions) => {
              console.log("Payment approved:", data);
              console.log("User ID for onApprove:", safeUserId, "Type:", typeof safeUserId);
              
              try {
                if (actions?.order) {
                  const details = await actions.order.capture();
                  console.log("Payment details:", details);
                  
                  // Create enhanced details object with user ID explicitly added
                  const enhancedDetails = {
                    ...details,
                    userId: safeUserId // Ensure consistent userId is passed
                  };
                  
                  await onPaymentSuccess(enhancedDetails);
                } else if (data.orderID) {
                  console.log("Subscription created with order ID:", data.orderID);
                  
                  // Create an object with the necessary details for a subscription
                  const subscriptionDetails = {
                    id: data.orderID,
                    userId: safeUserId, // Ensure consistent userId is passed
                    payer: { email_address: safeUserId }
                  };
                  
                  await onPaymentSuccess(subscriptionDetails);
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
