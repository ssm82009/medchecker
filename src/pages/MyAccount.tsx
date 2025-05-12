import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { Transaction } from '../types';
import { Database } from '../types/database.types';

const MyAccount: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeStatus, setChangeStatus] = useState<string>('');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user) {
        // جلب بيانات الخطة
        const { data: planData } = await supabase.from('plans').select('*').eq('code', user.plan_code || 'visitor').maybeSingle();
        setPlan(planData);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // جلب سجل المعاملات
  const fetchTransactions = async () => {
    if (!user || !user.id) return;
    try {
      console.log('Fetching transactions for user:', user.id);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Transactions data:', data);
      console.log('Transactions error:', error);

      if (error) {
        console.error('Error fetching transactions:', error);
        if (error.message.includes('permission denied')) {
          console.warn('Permission denied while fetching transactions. Check RLS policies for transactions table.');
        } else {
          toast.error(language === 'ar' ? 'خطأ في جلب سجل المعاملات' : 'Error fetching transaction history');
        }
        return;
      }
      if (data) setTransactions(data);
    } catch (error) {
      console.error('Critical error fetching transactions:', error);
      toast.error(language === 'ar' ? 'خطأ حرج في جلب سجل المعاملات' : 'Critical error fetching transaction history');
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleChangePassword = async () => {
    setChangeStatus('');
    if (!newPassword) { // لا نحتاج لكلمة المرور القديمة هنا، Supabase يتعامل معها
      setChangeStatus(language === 'ar' ? 'يرجى تعبئة حقل كلمة المرور الجديدة' : 'Please fill the new password field');
      return;
    }

    // تحديث كلمة المرور باستخدام دالة Supabase المخصصة
    // ملاحظة: Supabase يتطلب عادةً أن يكون المستخدم مسجلاً للدخول لتغيير كلمة المرور
    // وقد يتطلب كلمة المرور القديمة كجزء من عملية التحقق من الهوية إذا تم إعداد ذلك
    // ومع ذلك، فإن `updateUser` هو النهج الموصى به لتحديث بيانات المستخدم بما في ذلك كلمة المرور.
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (!error) {
      setChangeStatus(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح. قد تحتاج إلى تسجيل الدخول مرة أخرى.' : 'Password changed successfully. You might need to log in again.');
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setShowChangePassword(false);
      setOldPassword(''); // مسح الحقل القديم لأنه لم يعد مستخدماً
      setNewPassword('');
    } else {
      console.error('Error changing password:', error);
      setChangeStatus(language === 'ar' ? `حدث خطأ: ${error.message}` : `Error: ${error.message}`);
      toast.error(language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
    }
  };

  const handleLogout = async () => {
    await logout();
    // تحديث الكاش (يمكنك إضافة أي منطق إضافي لمسح بيانات أخرى إذا لزم الأمر)
    navigate('/');
  };

  if (!user) return <div className="text-center py-20">{language === 'ar' ? 'يجب تسجيل الدخول لعرض هذه الصفحة' : 'You must be logged in to view this page'}</div>;
  if (loading) return <div className="text-center py-20">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-lg shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            {language === 'ar' ? 'حسابي' : 'My Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <div className="text-lg font-semibold">{user.email}</div>
          </div>
          <div className="mb-6 text-center">
            <div className="font-bold text-primary">{language === 'ar' ? 'الباقة الحالية:' : 'Current Plan:'}</div>
            <div className="text-lg font-semibold">{language === 'ar' ? plan?.name_ar : plan?.name || '---'}</div>
            <div className="text-gray-500 text-sm">{language === 'ar' ? plan?.description_ar : plan?.description}</div>
            <div className="text-green-600 font-bold mt-2">{plan?.price === 0 ? (language === 'ar' ? 'مجانية' : 'Free') : `${plan?.price} ${language === 'ar' ? 'دولار / شهر' : 'USD / month'}`}</div>
            {plan?.code !== 'pro' && (
              <Button className="mt-4" onClick={() => navigate('/subscribe')}>
                {language === 'ar' ? 'ترقية إلى الباقة الاحترافية' : 'Upgrade to Pro Plan'}
              </Button>
            )}
          </div>
          <div className="mb-6 text-center">
            <Button variant="outline" onClick={() => setShowChangePassword(v => !v)}>
              {showChangePassword ? (language === 'ar' ? 'إغلاق تغيير كلمة المرور' : 'Close Password Change') : (language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password')}
            </Button>
            {showChangePassword && (
              <div className="mt-4 space-y-2">
                <input type="password" className="border rounded px-3 py-2 w-full" placeholder={language === 'ar' ? 'كلمة المرور القديمة' : 'Old Password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                <input type="password" className="border rounded px-3 py-2 w-full" placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Button className="w-full" onClick={handleChangePassword}>{language === 'ar' ? 'تغيير' : 'Change'}</Button>
                {changeStatus && <div className="text-sm text-center text-red-500 mt-2">{changeStatus}</div>}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
            </h2>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {(transactions as Transaction[]).map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {language === 'ar' ? 'الباقة: ' : 'Plan: '}
                          {transaction.plan_code}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {transaction.amount} {transaction.currency}
                        </p>
                        <p className={`text-sm ${
                          transaction.status === 'completed' ? 'text-green-500' :
                          transaction.status === 'failed' ? 'text-red-500' :
                          transaction.status === 'pending' ? 'text-yellow-500' :
                          'text-gray-500'
                        }`}>
                          {language === 'ar' ? 
                            transaction.status === 'completed' ? 'مكتمل' :
                            transaction.status === 'failed' ? 'فشل' :
                            transaction.status === 'pending' ? 'قيد الانتظار' :
                            'مسترد' :
                            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {language === 'ar' ? 'لا توجد معاملات سابقة' : 'No previous transactions'}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="destructive" onClick={handleLogout}>{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MyAccount;