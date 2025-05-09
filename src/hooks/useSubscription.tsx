
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
      const { data: paypalData } = await supabase.from('settings').select('value').eq('type', 'paypal').maybeSingle();
      setPaypalSettings(paypalData?.value || null);
      const { data: plans } = await supabase.from('plans').select('*').eq('code', 'pro').maybeSingle();
      setProPlan(plans || null);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (paypalSettings && paypalSettings.clientId) setPaypalReady(true);
  }, [paypalSettings]);

  const handlePaymentSuccess = async (details: any) => {
    try {
      if (!user?.id) return; // Ensure we have a user ID
      
      // تسجيل المعاملة في قاعدة البيانات
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: proPlan.price,
          currency: 'USD',
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

      if (transactionError) throw transactionError;

      // تحديث خطة المستخدم
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          plan_code: proPlan.code 
        })
        .eq('id', parseInt(user.id)); // Convert string ID to number for users table

      if (updateError) throw updateError;

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
