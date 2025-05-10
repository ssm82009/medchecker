
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export const useSubscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useTranslation();
  const [paypalSettings, setPaypalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proPlan, setProPlan] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'one_time' | 'recurring'>('recurring');
  const [paypalReady, setPaypalReady] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  useEffect(() => {
    // Fetch PayPal settings and pro plan
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch paypal settings
        const { data: paypalData, error: paypalError } = await supabase.from('paypal_settings').select('*').maybeSingle();
        
        if (paypalError) {
          console.error("Error fetching PayPal settings:", paypalError);
        }
        
        if (paypalData) {
          console.log("PayPal settings fetched:", paypalData);
          // Format settings with the correct property names for PayPal SDK
          const formattedSettings = {
            mode: paypalData.mode || 'sandbox',
            clientId: paypalData.mode === 'sandbox' ? paypalData.sandbox_client_id : paypalData.live_client_id,
            secret: paypalData.mode === 'sandbox' ? paypalData.sandbox_secret : paypalData.live_secret,
            currency: paypalData.currency || 'USD',
            subscriptionPlanId: paypalData.subscription_plan_id || '',
          };
          setPaypalSettings(formattedSettings);
          console.log("Formatted PayPal settings:", formattedSettings);
        }
        
        // Fetch pro plan with all fields
        const { data: plans, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .eq('code', 'pro')
          .maybeSingle();
        
        if (plansError) {
          console.error("Error fetching pro plan:", plansError);
        }
        
        if (plans) {
          console.log("Pro plan fetched:", plans);
          setProPlan(plans);
        } else {
          console.warn("No pro plan found in database");
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (paypalSettings && paypalSettings.clientId) {
      console.log("PayPal is ready with client ID:", paypalSettings.clientId);
      setPaypalReady(true);
    } else {
      console.log("PayPal is not ready yet. Settings:", paypalSettings);
    }
  }, [paypalSettings]);

  const handlePaymentSuccess = async (details: any) => {
    console.log("Payment success handler called with details:", details);
    try {
      // Check if userId is available in the details
      const userId = details.userId;
      
      if (!userId) {
        console.error("No user ID available in payment details:", details);
        setPaymentStatus('error');
        setPaymentMessage(language === 'ar' 
          ? 'لم يتم العثور على معرف المستخدم في تفاصيل الدفع.' 
          : 'User ID not found in payment details.');
        return;
      }
      
      // Validate the userId is a valid UUID before using it
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) && 
          !/^\d+$/.test(userId)) {
        console.error("Invalid user ID format:", userId, "Type:", typeof userId);
        setPaymentStatus('error');
        setPaymentMessage(language === 'ar' 
          ? 'تنسيق معرف المستخدم غير صالح.' 
          : 'Invalid user ID format.');
        return;
      }
      
      console.log("Recording transaction for user:", userId);
      
      // Ensure we have a valid numeric price value
      // Make sure to handle the case where price might be a string or a number
      let price: number;
      
      if (typeof proPlan.price === 'string') {
        price = parseFloat(proPlan.price);
      } else {
        price = Number(proPlan.price);
      }
      
      // Verify that price is a valid number
      if (isNaN(price)) {
        throw new Error('Invalid price value');
      }
      
      // Record the transaction in the database
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: String(userId), // Ensure user_id is stored as string
          amount: price, // Now properly converted to a number
          currency: paypalSettings.currency || 'USD',
          status: 'completed',
          payment_type: paymentType,
          payment_provider: 'paypal',
          provider_transaction_id: details.id,
          plan_code: proPlan.code,
          metadata: {
            payer: details.payer,
            payment_details: details
          }
        });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        throw transactionError;
      }

      console.log("Transaction recorded successfully, updating user plan");
      
      // Fix for line 156 - Convert user ID to string type for comparison
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          plan_code: proPlan.code 
        })
        .eq('id', Number(userId)); // Convert userId to number since users table uses numeric IDs

      if (updateError) {
        console.error("User update error:", updateError);
        throw updateError;
      }

      console.log("User plan updated successfully to:", proPlan.code);

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
    paypalSettings,
    loading,
    proPlan,
    paymentType,
    setPaymentType,
    paypalReady,
    paymentStatus,
    setPaymentStatus,
    paymentMessage,
    handlePaymentSuccess,
    handlePaymentError,
    resetPaymentStatus
  };
};
