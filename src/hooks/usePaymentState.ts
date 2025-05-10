import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { recordTransaction, updateUserPlan, safeParsePrice, validatePrice } from '@/utils/paymentUtils';

export const usePaymentState = (language: string) => {
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<'one_time' | 'recurring'>('recurring');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  const handlePaymentSuccess = async (details: any) => {
    console.log("Payment success handler called with details:", details);
    try {
      // Get the user ID from the details
      const userId = details.userId;
      
      if (!userId) {
        console.error("No user ID available in payment details:", details);
        setPaymentStatus('error');
        setPaymentMessage(language === 'ar' 
          ? 'لم يتم العثور على معرف المستخدم في تفاصيل الدفع.' 
          : 'User ID not found in payment details.');
        return;
      }
      
      console.log("Processing payment for user ID:", userId, "Type:", typeof userId);
      
      // Validate the userId is a valid UUID or numeric ID before using it
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) && 
          !/^\d+$/.test(userId)) {
        console.error("Invalid user ID format:", userId, "Type:", typeof userId);
        setPaymentStatus('error');
        setPaymentMessage(language === 'ar' 
          ? 'تنسيق معرف المستخدم غير صالح.' 
          : 'Invalid user ID format.');
        return;
      }
      
      // Get the plan details from the details object
      const planCode = details.planCode;
      const price = safeParsePrice(details.price);
      validatePrice(price);
      const currency = details.currency || 'USD';
      
      // Record transaction and update user plan
      await recordTransaction(userId, price, currency, paymentType, planCode, details, language);
      await updateUserPlan(userId, planCode);
      
      toast({
        title: language === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscription successful!',
        variant: 'default'
      });
      
      setPaymentStatus('success');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع' : 'Error processing payment',
        variant: 'destructive'
      });
      setPaymentStatus('error');
      setPaymentMessage(language === 'ar' 
        ? 'حدث خطأ أثناء معالجة الدفع: ' + String(error)
        : 'Error processing payment: ' + String(error));
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error("Payment error:", errorMessage);
    setPaymentStatus('error');
    setPaymentMessage(errorMessage);
  };

  const resetPaymentStatus = () => {
    setPaymentStatus('idle');
    setPaymentMessage('');
  };

  return {
    paymentType,
    setPaymentType,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus
  };
};
