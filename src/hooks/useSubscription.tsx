
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
    // جلب إعدادات بايبال وخطة pro
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
            subscriptionPlanId: paypalData.subscription_plan_id,
          };
          setPaypalSettings(formattedSettings);
          console.log("Formatted PayPal settings:", formattedSettings);
          
          // Debugging log to check client ID specifically
          console.log("PayPal Client ID:", formattedSettings.clientId);
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
      if (!user?.id) {
        console.error("No user ID found");
        return; 
      }
      
      console.log("Recording transaction for user:", user.id);
      
      // تسجيل المعاملة في قاعدة البيانات
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: proPlan.price,
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

      // تحديث خطة المستخدم
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          plan_code: proPlan.code 
        })
        .eq('id', parseInt(user.id)); // Convert string ID to number for users table

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
      setPaymentMessage('حدث خطأ أثناء معالجة الدفع');
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
