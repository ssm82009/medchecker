
import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

interface PayPalButtonsContainerProps {
  paymentType: 'one_time' | 'recurring';
  paypalSettings: any;
  proPlan: any;
  userId: string;
  language: string;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError: (err: any) => void;
}

const PayPalButtonsContainer: React.FC<PayPalButtonsContainerProps> = ({
  paymentType,
  paypalSettings,
  proPlan,
  userId,
  language,
  onApprove,
  onError
}) => {
  // Ensure userId is a string
  const safeUserId = String(userId);
  
  return (
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
                  onError(language === 'ar' 
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
        onApprove={onApprove}
        onError={(err) => {
          console.error('PayPal error:', err);
          onError(language === 'ar' 
            ? 'فشل الدفع: ' + String(err)
            : 'Payment failed: ' + String(err));
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButtonsContainer;
