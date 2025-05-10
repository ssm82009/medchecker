
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { checkAndGetSession } from '@/utils/paymentUtils';

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

  // التحقق من وجود جلسة نشطة عند تحميل المكون
  useEffect(() => {
    const checkSession = async () => {
      const sessionCheck = await checkAndGetSession(language);
      console.log("Initial session check in usePayPalPayment:", 
        sessionCheck.success ? "Active" : "Inactive");
      
      if (!sessionCheck.success) {
        console.warn(sessionCheck.message);
      }
    };
    
    checkSession();
  }, [language]);

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
      // التحقق من وجود جلسة نشطة بطريقة موثوقة
      const sessionCheck = await checkAndGetSession(language);
      
      if (!sessionCheck.success) {
        console.error(sessionCheck.message);
        onPaymentError(sessionCheck.message);
        return;
      }
      
      const activeSession = sessionCheck.session;
      console.log("Active session confirmed in handlePayPalApprove:", activeSession.user.id);
      
      // التحقق من وجود معرف المستخدم في البيانات
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
        
        // إضافة معرف المستخدم من البيانات إلى التفاصيل
        const enhancedDetails = {
          ...details,
          userId: data.userId,
          sessionUserId: activeSession?.user?.id
        };
        
        await onPaymentSuccess(enhancedDetails);
      } else if (data.orderID) {
        console.log("Subscription created with order ID:", data.orderID);
        
        // إنشاء كائن بالتفاصيل اللازمة للاشتراك
        const subscriptionDetails = {
          id: data.orderID,
          payer: { email_address: 'subscription' },
          userId: data.userId,
          sessionUserId: activeSession?.user?.id
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
