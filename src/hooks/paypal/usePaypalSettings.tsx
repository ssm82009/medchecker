
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const usePaypalSettings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox');
  const [sandboxClientId, setSandboxClientId] = useState('');
  const [sandboxSecret, setSandboxSecret] = useState('');
  const [liveClientId, setLiveClientId] = useState('');
  const [liveSecret, setLiveSecret] = useState('');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSettingsId, setPaypalSettingsId] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [loading, setLoading] = useState(true);

  // التحقق من صلاحيات المستخدم
  useEffect(() => {
    if (!user) {
      console.log("No user logged in, redirecting to login");
      navigate('/login');
    } else if (!isAdmin()) {
      console.log("User is not admin:", user);
      setIsPermissionError(true);
    }
    setLoading(false);
  }, [user, navigate, isAdmin]);

  // جلب الإعدادات من قاعدة البيانات
  const fetchPaypalSettings = async () => {
    try {
      console.log("Fetching PayPal settings...");
      const { data, error } = await supabase.from('paypal_settings').select('*').maybeSingle();
      if (error) {
        console.error('Error fetching PayPal settings:', error);
        return;
      }
      
      if (data) {
        console.log("PayPal settings found:", data);
        setPaypalSettingsId(data.id);
        // التحقق من القيمة قبل تعيينها للتأكد من سلامة النوع
        const modeValue = data.mode || 'sandbox';
        if (modeValue === 'sandbox' || modeValue === 'live') {
          setPaypalMode(modeValue as 'sandbox' | 'live');
        }
        setSandboxClientId(data.sandbox_client_id || '');
        setSandboxSecret(data.sandbox_secret || '');
        setLiveClientId(data.live_client_id || '');
        setLiveSecret(data.live_secret || '');
      } else {
        console.log("No PayPal settings found");
      }
    } catch (error) {
      console.error('Error in fetchPaypalSettings:', error);
    }
  };

  useEffect(() => { 
    if (user) fetchPaypalSettings(); 
  }, [user]);

  // حفظ الإعدادات
  const savePaypalSettings = async () => {
    // التحقق من صلاحيات المستخدم
    if (!user) {
      console.log("No user logged in");
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      console.log("User is not admin:", user);
      toast({ 
        title: 'غير مسموح',
        description: 'فقط المشرفون يمكنهم حفظ الإعدادات',
        variant: 'destructive' 
      });
      setIsPermissionError(true);
      return;
    }

    setSavingPaypal(true);
    setIsError(false);
    setErrorMessage('');
    
    try {
      const toSave = {
        mode: paypalMode,
        sandbox_client_id: sandboxClientId,
        sandbox_secret: sandboxSecret,
        live_client_id: liveClientId,
        live_secret: liveSecret,
        currency: 'USD',
        payment_type: 'one_time' as const,
        updated_at: new Date().toISOString()
      };

      console.log("Saving PayPal settings:", paypalSettingsId ? "UPDATE" : "INSERT", toSave);
      console.log("Current user:", user, "isAdmin:", isAdmin());

      let error;
      if (paypalSettingsId) {
        // تحديث الإعدادات الموجودة
        const result = await supabase.from('paypal_settings').update(toSave).eq('id', paypalSettingsId);
        error = result.error;
        console.log("Update result:", result);
      } else {
        // إدراج إعدادات جديدة
        const result = await supabase.from('paypal_settings').insert(toSave);
        error = result.error;
        console.log("Insert result:", result);
        
        // إعادة استرداد المعرف الجديد
        if (!error) {
          fetchPaypalSettings();
        }
      }

      if (error) {
        console.error('Error saving PayPal settings:', error);
        setIsError(true);
        
        // التحقق مما إذا كانت المشكلة متعلقة بالصلاحيات
        if (error.message.includes('permission') || error.message.includes('policy')) {
          setErrorMessage('ليس لديك الصلاحية الكافية لحفظ إعدادات PayPal. تأكد من أن حسابك له صلاحيات المشرف.');
          setIsPermissionError(true);
        } else {
          setErrorMessage(error.message || 'حدث خطأ أثناء حفظ الإعدادات');
        }
        
        toast({ 
          title: 'خطأ في حفظ الإعدادات',
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'تم حفظ الإعدادات بنجاح',
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Exception in savePaypalSettings:', error);
      setIsError(true);
      setErrorMessage(error.message || 'حدث خطأ غير متوقع');
      toast({ 
        title: 'خطأ في حفظ الإعدادات',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingPaypal(false);
    }
  };

  // التعامل مع تغيير وضع بايبال مع التحقق القوي من النوع
  const handlePaypalModeChange = (value: string) => {
    // فقط تعيين الحالة عندما تكون القيمة من الأنواع المسموح بها
    if (value === 'sandbox' || value === 'live') {
      // الآن تعرف TypeScript أن القيمة يمكن أن تكون فقط 'sandbox' أو 'live'
      setPaypalMode(value as 'sandbox' | 'live');
    } else {
      // تسجيل خطأ إذا تم تمرير قيمة غير صالحة
      console.error(`قيمة وضع PayPal غير صالحة: ${value}. يجب أن تكون 'sandbox' أو 'live'.`);
    }
  };

  return {
    paypalMode,
    sandboxClientId,
    sandboxSecret,
    liveClientId,
    liveSecret,
    savingPaypal,
    isError,
    errorMessage,
    isPermissionError,
    loading,
    handlePaypalModeChange,
    setSandboxClientId,
    setSandboxSecret,
    setLiveClientId,
    setLiveSecret,
    savePaypalSettings,
    setIsError
  };
};
