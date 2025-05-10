
import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { PlanType } from '@/types/plan';

interface PayPalButtonsContainerProps {
  paymentType: 'one_time' | 'recurring';
  paypalSettings: any;
  plan: PlanType;
  userId: string;
  language: string;
  onApprove: (data: any, actions: any) => Promise<void>;
  onError: (err: any) => void;
}

const PayPalButtonsContainer: React.FC<PayPalButtonsContainerProps> = ({
  paymentType,
  paypalSettings,
  plan,
  userId,
  language,
  onApprove,
  onError
}) => {
  // تأكد إضافي من توفر معرف المستخدم وأنه نص
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
  console.log("Selected plan:", plan);
  
  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalSettings.clientId,
        currency: paypalSettings.currency || 'USD',
        components: 'buttons',
        disableFunding: 'card',
        enableFunding: 'paypal',
        intent: 'capture', // دائما نستخدم الدفع لمرة واحدة الآن
        buyerCountry: paypalSettings.mode === 'sandbox' ? 'US' : undefined
      }}
    >
      <PayPalButtons
        style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
        forceReRender={[paymentType, plan.price, paypalSettings.currency, safeUserId, plan.code]}
        createOrder={async (data, actions) => {
          console.log("Creating PayPal order for payment type:", paymentType);
          console.log("User ID for createOrder:", safeUserId, "Type:", typeof safeUserId);
          console.log("Selected plan:", plan.name, "Price:", plan.price);
          
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  value: plan.price.toString(),
                  currency_code: paypalSettings.currency || 'USD',
                },
                description: language === 'ar' ? plan.nameAr : plan.name,
                custom_id: safeUserId // هذا صالح في purchase_units
              },
            ],
            application_context: {
              user_action: "PAY_NOW"
            }
          });
        }}
        onApprove={async (data, actions) => {
          // تأكد دائمًا من وجود معرف المستخدم في بيانات المرسلة إلى معالج الموافقة
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
