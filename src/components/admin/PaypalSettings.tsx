
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaypalSettings = () => {
  const { toast } = useToast();
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox');
  const [sandboxClientId, setSandboxClientId] = useState('');
  const [sandboxSecret, setSandboxSecret] = useState('');
  const [liveClientId, setLiveClientId] = useState('');
  const [liveSecret, setLiveSecret] = useState('');
  const [savingPaypal, setSavingPaypal] = useState(false);
  const [paypalSettingsId, setPaypalSettingsId] = useState<string | null>(null);

  // جلب الإعدادات من قاعدة البيانات
  const fetchPaypalSettings = async () => {
    try {
      const { data, error } = await supabase.from('paypal_settings').select('*').single();
      if (error) {
        console.error('Error fetching PayPal settings:', error);
        return;
      }
      
      if (data) {
        setPaypalSettingsId(data.id);
        setPaypalMode(data.mode || 'sandbox');
        setSandboxClientId(data.sandbox_client_id || '');
        setSandboxSecret(data.sandbox_secret || '');
        setLiveClientId(data.live_client_id || '');
        setLiveSecret(data.live_secret || '');
      }
    } catch (error) {
      console.error('Error in fetchPaypalSettings:', error);
    }
  };
  
  useEffect(() => { 
    fetchPaypalSettings(); 
  }, []);

  // حفظ الإعدادات
  const savePaypalSettings = async () => {
    setSavingPaypal(true);
    try {
      const toSave = {
        id: paypalSettingsId,
        mode: paypalMode,
        sandbox_client_id: sandboxClientId,
        sandbox_secret: sandboxSecret,
        live_client_id: liveClientId,
        live_secret: liveSecret,
        currency: 'USD',
        payment_type: 'one_time' as const,
        updated_at: new Date().toISOString()
      };

      let error;
      if (paypalSettingsId) {
        // تحديث الإعدادات الموجودة
        const result = await supabase.from('paypal_settings').update(toSave).eq('id', paypalSettingsId);
        error = result.error;
      } else {
        // إدراج إعدادات جديدة
        const result = await supabase.from('paypal_settings').insert(toSave);
        error = result.error;
        
        // إعادة استرداد المعرف الجديد
        if (!error) {
          fetchPaypalSettings();
        }
      }

      if (error) {
        console.error('Error saving PayPal settings:', error);
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
      toast({ 
        title: 'خطأ في حفظ الإعدادات',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingPaypal(false);
    }
  };

  // Fix the type assignment issue with a more robust type check
  const handlePaypalModeChange = (value: string) => {
    // Type guard: only set state when value matches one of our allowed types
    if (value === 'sandbox' || value === 'live') {
      // Now TypeScript knows value can only be 'sandbox' or 'live'
      setPaypalMode(value);
    } else {
      // Log an error if an invalid value is passed
      console.error(`Invalid PayPal mode: ${value}. Expected 'sandbox' or 'live'.`);
    }
  };

  return (
    <Card className="mb-8 max-w-xl mx-auto">
      <CardHeader><CardTitle>إعدادات بوابة الدفع بايبال</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">وضع التشغيل</label>
            <select
              value={paypalMode}
              onChange={(e) => handlePaypalModeChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="sandbox">Sandbox (اختبار)</option>
              <option value="live">Live (مباشر)</option>
            </select>
          </div>
          {paypalMode === 'sandbox' ? (
            <>
              <div>
                <label className="block mb-1 font-medium">Sandbox Client ID</label>
                <input type="text" className="w-full p-2 border rounded" value={sandboxClientId} onChange={e => setSandboxClientId(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Sandbox Secret</label>
                <input type="password" className="w-full p-2 border rounded" value={sandboxSecret} onChange={e => setSandboxSecret(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block mb-1 font-medium">Live Client ID</label>
                <input type="text" className="w-full p-2 border rounded" value={liveClientId} onChange={e => setLiveClientId(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1 font-medium">Live Secret</label>
                <input type="password" className="w-full p-2 border rounded" value={liveSecret} onChange={e => setLiveSecret(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="block mb-1 font-medium">العملة</label>
            <input type="text" className="w-full p-2 border rounded bg-gray-100" value="USD" disabled />
          </div>
          <button
            onClick={savePaypalSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={savingPaypal}
          >
            {savingPaypal ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaypalSettings;
