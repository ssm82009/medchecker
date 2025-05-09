
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useTranslation } from '@/hooks/useTranslation';

const Subscribe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [paypalSettings, setPaypalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proPlan, setProPlan] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'one_time' | 'recurring'>('recurring');
  const [paypalReady, setPaypalReady] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>("idle");
  const [paymentMessage, setPaymentMessage] = useState<string>("");

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

  if (loading) return <div className="flex justify-center items-center min-h-[40vh]">جاري التحميل...</div>;
  if (!proPlan) return <div className="text-center text-red-500">لم يتم العثور على الباقة الاحترافية</div>;

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
      navigate('/my-account');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع' : 'Error processing payment',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">{proPlan.name_ar || proPlan.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-lg mb-2 text-gray-700">{proPlan.description_ar || proPlan.description}</div>
          <div className="text-center text-3xl font-bold text-green-600 mb-4">{proPlan.price} {paypalSettings?.currency || 'USD'} / شهر</div>
          <ul className="mb-6 text-gray-700 text-right pr-4 list-disc">
            {proPlan.features_ar?.map((f: string, i: number) => <li key={i}>{f}</li>)}
          </ul>
          <div className="mb-6">
            <Label className="block mb-2">اختر نوع الدفع</Label>
            <Select value={paymentType} onValueChange={v => setPaymentType(v as 'one_time' | 'recurring')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">اشتراك شهري متكرر</SelectItem>
                <SelectItem value="one_time">دفع لمرة واحدة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            {paymentStatus === 'success' && (
              <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 text-center mb-4">
                <div className="text-xl font-bold mb-2">🎉 تم الاشتراك بنجاح!</div>
                <div>تمت ترقية حسابك للباقة الاحترافية. يمكنك الآن الاستفادة من جميع المميزات.</div>
                <Button className="mt-4 w-full" onClick={() => navigate('/dashboard')}>الانتقال للوحة التحكم</Button>
              </div>
            )}
            {paymentStatus === 'error' && (
              <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 text-center mb-4">
                <div className="text-xl font-bold mb-2">حدث خطأ أثناء الدفع</div>
                <div>{paymentMessage || 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'}</div>
                <Button className="mt-4 w-full" onClick={() => setPaymentStatus('idle')}>إعادة المحاولة</Button>
              </div>
            )}
            {paymentStatus === 'idle' && paypalReady && (
              // @ts-ignore
              <PayPalScriptProvider
                options={{
                  'client-id': paypalSettings.clientId,
                  currency: paypalSettings.currency || 'USD',
                  intent: paymentType === 'recurring' ? 'subscription' : 'capture',
                  'data-client-token': undefined,
                  components: 'buttons',
                  'disable-funding': 'card',
                  'enable-funding': 'paypal',
                  'data-sdk-integration-source': 'button',
                  ...(paypalSettings.mode === 'sandbox' ? { 'buyer-country': 'US' } : {}),
                }}
              >
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'blue', shape: 'pill', label: 'paypal' }}
                  forceReRender={[paymentType, proPlan.price, paypalSettings.currency]}
                  createOrder={async (data, actions) => {
                    if (paymentType === 'one_time') {
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [
                          {
                            amount: {
                              value: proPlan.price.toString(),
                              currency_code: paypalSettings.currency || 'USD',
                            },
                            description: proPlan.name,
                          },
                        ],
                      });
                    }
                    return '';
                  }}
                  createSubscription={paymentType === 'recurring' ? async (data, actions) => {
                    const planId = paypalSettings.subscriptionPlanId || '';
                    if (!planId) {
                      setPaymentStatus('error');
                      setPaymentMessage('لم يتم ضبط معرف خطة الاشتراك في إعدادات بايبال');
                      return '';
                    }
                    return actions.subscription.create({ plan_id: planId });
                  } : undefined}
                  onApprove={async (data, actions) => {
                    if (!user) return;
                    if (actions.order) {
                      const details = await actions.order.capture();
                      await handlePaymentSuccess(details);
                    } else if (data.orderID) {
                      // التعامل مع حالة الاشتراك
                      await handlePaymentSuccess({
                        id: data.orderID,
                        payer: { email_address: "subscriber@example.com" }
                      });
                    }
                  }}
                  onError={(err) => {
                    setPaymentStatus('error');
                    setPaymentMessage('فشل الدفع: ' + String(err));
                  }}
                />
              </PayPalScriptProvider>
            )}
            {paymentStatus === 'idle' && !paypalReady && (
              paymentType === 'recurring' ? (
                <Button disabled className="w-full">اشترك شهرياً عبر PayPal (قريباً)</Button>
              ) : (
                <Button disabled className="w-full">ادفع مرة واحدة عبر PayPal (قريباً)</Button>
              )
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="secondary" className="w-full" onClick={() => navigate(-1)}>عودة</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Subscribe;
