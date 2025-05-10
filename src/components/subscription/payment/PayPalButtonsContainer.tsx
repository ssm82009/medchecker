
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
  // Extra validation to ensure userId is always available and is a string
  const safeUserId = userId ? String(userId) : '';
  
  if (!safeUserId) {
    console.error("No user ID available in PayPalButtonsContainer");
    return (
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
        <div className="text-amber-700">
          {language === 'ar' ? 'معرف المستخدم غير متوفر' : 'User ID not available'}
        </div>
      </div>
    );
  }
  
  console.log("PayPalButtonsContainer initialized with user ID:", safeUserId);
  
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
        forceReRender={[paymentType, proPlan.price, paypalSettings.currency, safeUserId]}
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
              application_context: {
                user_action: "PAY_NOW",
              },
              // Store the user ID in the metadata
              custom_id: safeUserId
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
                  custom_id: safeUserId,
                  application_context: {
                    user_action: "SUBSCRIBE_NOW",
                  }
                });
              }
            : undefined
        }
        onApprove={async (data, actions) => {
          // Always include the user ID in the data we send to the approval handler
          const enhancedData = { ...data, userId: safeUserId };
          console.log("Payment approved with enhanced data:", enhancedData);
          await onApprove(enhancedData, actions);
        }}
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
