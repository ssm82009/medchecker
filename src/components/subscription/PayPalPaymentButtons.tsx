
import React from 'react';
import { Button } from '@/components/ui/button';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

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
  if (!paypalReady) {
    return paymentType === 'recurring' ? (
      <Button disabled className="w-full">
        اشترك شهرياً عبر PayPal (قريباً)
      </Button>
    ) : (
      <Button disabled className="w-full">
        ادفع مرة واحدة عبر PayPal (قريباً)
      </Button>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': paypalSettings.mode === 'live' ? paypalSettings.clientId : paypalSettings.clientId,
        currency: paypalSettings.currency || 'USD',
        intent: paymentType === 'recurring' ? 'subscription' : 'capture',
        'data-client-token': undefined,
        components: 'buttons',
        'disable-funding': 'card',
        'enable-funding': 'paypal',
        'data-sdk-integration-source': 'button',
        ...(paypalSettings.mode === 'sandbox' ? { 'buyer-country': 'US' } : {}),
        clientId: paypalSettings.clientId, // Required property
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
                  onPaymentError('لم يتم ضبط معرف خطة الاشتراك في إعدادات بايبال');
                  return '';
                }
                return actions.subscription.create({ plan_id: planId });
              }
            : undefined
        }
        onApprove={async (data, actions) => {
          if (actions?.order) {
            const details = await actions.order.capture();
            await onPaymentSuccess(details);
          } else if (data.orderID) {
            // التعامل مع حالة الاشتراك
            await onPaymentSuccess({
              id: data.orderID,
              payer: { email_address: "subscriber@example.com" }
            });
          }
        }}
        onError={(err) => {
          onPaymentError('فشل الدفع: ' + String(err));
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalPaymentButtons;
