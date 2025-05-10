
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaymentData } from '@/hooks/usePaymentData';
import { usePaymentState } from '@/hooks/usePaymentState';

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  // Use our new hooks to fetch data and manage state
  const { 
    paypalSettings, 
    proPlan, 
    loading, 
    paypalReady 
  } = usePaymentData();
  
  const { 
    paymentType,
    setPaymentType,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus
  } = usePaymentState(language);

  // Augment the payment success handler to include the plan details and user ID
  const enhancedPaymentSuccess = async (details: any) => {
    // Make sure we have a user ID
    if (!user || !user.id) {
      console.error("No user ID available in useSubscription");
      handlePaymentError(language === 'ar' 
        ? 'معرف المستخدم غير متوفر' 
        : 'User ID not available');
      return;
    }
    
    console.log("Enhanced payment success with user ID:", user.id);
    
    // Add price, plan code, and user ID to the details object
    const enhancedDetails = {
      ...details,
      price: proPlan?.price,
      planCode: proPlan?.code,
      currency: paypalSettings?.currency,
      userId: String(user.id) // Ensure it's a string
    };
    
    await handlePaymentSuccess(enhancedDetails);
  };

  return {
    paypalSettings,
    loading,
    proPlan,
    paymentType,
    setPaymentType,
    paypalReady,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess: enhancedPaymentSuccess,
    handlePaymentError,
    resetPaymentStatus,
    userId: user?.id ? String(user.id) : null // Ensure we return the user ID as a string
  };
};
