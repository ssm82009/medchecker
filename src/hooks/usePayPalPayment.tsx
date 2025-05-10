
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export const usePayPalPayment = (
  onPaymentSuccess: (details: any) => Promise<void>,
  onPaymentError: (error: any) => void
) => {
  const { language } = useTranslation();
  
  // Scroll to PayPal buttons on component mount
  useEffect(() => {
    const paypalButtonsElement = document.getElementById('paypal-buttons');
    if (paypalButtonsElement) {
      setTimeout(() => {
        paypalButtonsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

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

  const handlePayPalApprove = async (data: any, actions: any) => {
    console.log("Payment approved with data:", data);
    
    try {
      // Verify that we have a userId in the data
      if (!data.userId) {
        console.error("No userId in PayPal approval data:", data);
        onPaymentError(language === 'ar' 
          ? 'معرف المستخدم غير متوفر في بيانات الدفع' 
          : 'User ID not available in payment data');
        return;
      }
      
      if (actions?.order) {
        const details = await actions.order.capture();
        console.log("Payment details:", details);
        
        // Add the user ID from data to details
        const enhancedDetails = {
          ...details,
          userId: data.userId
        };
        
        await onPaymentSuccess(enhancedDetails);
      } else if (data.orderID) {
        console.log("Subscription created with order ID:", data.orderID);
        
        // Create an object with the necessary details for a subscription
        const subscriptionDetails = {
          id: data.orderID,
          payer: { email_address: 'subscription' },
          userId: data.userId // Include user ID here
        };
        
        await onPaymentSuccess(subscriptionDetails);
      }
    } catch (error) {
      console.error('Payment approval error:', error);
      onPaymentError(String(error));
    }
  };

  return {
    language,
    handlePayButtonClick,
    handlePayPalApprove
  };
};
