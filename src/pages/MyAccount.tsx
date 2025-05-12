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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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
  const [fetchingTransactions, setFetchingTransactions] = useState(false);

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

  // جلب سجل المعاملات - تحسين الوظيفة
  const fetchTransactions = async () => {
    if (!user || !user.id) return;
    
    setFetchingTransactions(true);
    
    try {
      console.log('Fetching transactions for user:', user.id, 'Type:', typeof user.id);
      console.log('User auth_uid:', user.auth_uid, 'Type:', typeof user.auth_uid);
      
      // محاولة استعلام بواسطة auth_uid أولاً (إذا كان متوفرًا)
      if (user.auth_uid) {
        const { data: authData, error: authError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.auth_uid)
          .order('created_at', { ascending: false });
          
        console.log('Transactions by auth_uid query result:', { data: authData, error: authError });
        
        if (!authError && authData && authData.length > 0) {
          setTransactions(authData);
          console.log('Transactions found using auth_uid:', authData);
          setFetchingTransactions(false);
          return;
        }
      }
      
      // محاولة استعلام بواسطة id إذا لم ينجح auth_uid
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Transactions by regular id query result:', { data, error });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast.error(language === 'ar' ? 'خطأ في جلب سجل المعاملات' : 'Error fetching transaction history');
      } else if (data) {
        setTransactions(data);
        console.log('Transactions found using regular id:', data);
      }
      
      // إذا لم يتم العثور على معاملات، ابحث في metadata
      if ((!data || data.length === 0) && user.email) {
        console.log('Searching in metadata for email:', user.email);
        
        const { data: metadataTransactions, error: metadataError } = await supabase
          .from('transactions')
          .select('*')
          .textSearch('metadata', user.email);
          
        console.log('Metadata search results:', { data: metadataTransactions, error: metadataError });
        
        if (!metadataError && metadataTransactions && metadataTransactions.length > 0) {
          setTransactions(metadataTransactions);
          console.log('Transactions found in metadata:', metadataTransactions);
        }
      }
      
    } catch (error) {
      console.error('Critical error fetching transactions:', error);
      toast.error(language === 'ar' ? 'خطأ حرج في جلب سجل المعاملات' : 'Critical error fetching transaction history');
    } finally {
      setFetchingTransactions(false);
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

  const handleRefreshTransactions = () => {
    toast.success(language === 'ar' ? 'جاري تحديث سجل المعاملات...' : 'Refreshing transaction history...');
    fetchTransactions();
  };

  // Helper function to determine billing period display based on plan code
  const getBillingPeriodDisplay = (planCode: string) => {
    if (planCode === 'pro12' || planCode === 'annual') {
      return language === 'ar' ? 'سنة' : 'year';
    }
    return language === 'ar' ? 'شهر' : 'month';
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
            <div className="text-green-600 font-bold mt-2">
              {plan?.price === 0 
                ? (language === 'ar' ? 'مجانية' : 'Free') 
                : `${plan?.price} ${language === 'ar' ? 'دولار / ' + getBillingPeriodDisplay(plan?.code) : 'USD / ' + getBillingPeriodDisplay(plan?.code)}`
              }
            </div>
            {plan?.code !== 'pro' && plan?.code !== 'pro12' && plan?.code !== 'annual' && (
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshTransactions} 
                disabled={fetchingTransactions}
              >
                {fetchingTransactions 
                  ? (language === 'ar' ? 'جاري التحديث...' : 'Refreshing...') 
                  : (language === 'ar' ? 'تحديث' : 'Refresh')}
              </Button>
            </div>
            
            {fetchingTransactions ? (
              <div className="text-center py-4">
                {language === 'ar' ? 'جاري تحميل المعاملات...' : 'Loading transactions...'}
              </div>
            ) : transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الباقة' : 'Plan'}</TableHead>
                    <TableHead>{language === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
                    <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(transactions as Transaction[]).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.plan_code}</TableCell>
                      <TableCell>
                        {transaction.amount} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {language === 'ar' ? 
                            transaction.status === 'completed' ? 'مكتمل' :
                            transaction.status === 'failed' ? 'فشل' :
                            transaction.status === 'pending' ? 'قيد الانتظار' :
                            'مسترد' :
                            transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                          }
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {language === 'ar' ? 'لا توجد معاملات سابقة' : 'No previous transactions'}
                <div className="mt-2 text-sm">
                  {language === 'ar' 
                    ? 'معرف المستخدم: ' + user.id + (user.auth_uid ? ' | معرف المصادقة: ' + user.auth_uid : '')
                    : 'User ID: ' + user.id + (user.auth_uid ? ' | Auth ID: ' + user.auth_uid : '')}
                </div>
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
