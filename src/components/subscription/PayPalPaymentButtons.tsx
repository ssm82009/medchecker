
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePayPalPayment } from '@/hooks/usePayPalPayment';
import PaymentSecurityMessage from './payment/PaymentSecurityMessage';
import PaymentButton from './payment/PaymentButton';
import PayPalButtonsContainer from './payment/PayPalButtonsContainer';
import PayPalLoadingState from './payment/PayPalLoadingState';
import UserIdError from './payment/UserIdError';

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
  const { handlePayButtonClick, handlePayPalApprove } = usePayPalPayment(onPaymentSuccess, onPaymentError);
  
  console.log("PayPal settings in component:", paypalSettings);
  console.log("Payment type:", paymentType);
  console.log("User ID received in component:", userId, "Type:", typeof userId);
  
  // Early validation of userId to prevent issues
  if (!userId) {
    return <UserIdError language={language} />;
  }
  
  if (!paypalReady || !paypalSettings || !paypalSettings.clientId) {
    return <PayPalLoadingState language={language} />;
  }

  // Ensure userId is a string
  const safeUserId = String(userId);

  return (
    <div className="space-y-4">
      <PaymentSecurityMessage language={language} />
      <PaymentButton 
        paymentType={paymentType} 
        language={language} 
        onClick={handlePayButtonClick} 
      />

      <div id="paypal-buttons" className="pt-4 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500 mb-3">
          {language === 'ar' ? 'اختر طريقة الدفع أدناه' : 'Select payment method below'}
        </div>
        <PayPalButtonsContainer
          paymentType={paymentType}
          paypalSettings={paypalSettings}
          proPlan={proPlan}
          userId={safeUserId}
          language={language}
          onApprove={async (data, actions) => {
            // Add userId to the data object before calling the handler
            const enhancedData = {...data, userId: safeUserId};
            await handlePayPalApprove(enhancedData, actions);
          }}
          onError={onPaymentError}
        />
      </div>
    </div>
  );
};

export default PayPalPaymentButtons;
