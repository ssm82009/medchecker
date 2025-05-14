
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { Transaction } from '@/types';
import { SearchHistory } from '@/types/index';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, Search } from 'lucide-react';

const MyAccount: React.FC = () => {
  const { user, logout, fetchLatestPlan } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeStatus, setChangeStatus] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetchingTransactions, setFetchingTransactions] = useState(false);
  const [shouldRefreshPlan, setShouldRefreshPlan] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [historyFetchAttempted, setHistoryFetchAttempted] = useState(false);
  const [planDataFetched, setPlanDataFetched] = useState(false);
  
  // Add a reference to track mounted state and timer reference
  const isMountedRef = useRef(true);
  const refreshTimerRef = useRef<number | null>(null);

  // Clear any pending timers when component unmounts
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const fetchPlanData = useCallback(async () => {
    if (!user || !isMountedRef.current || planDataFetched) return;
    
    setLoading(true);
    try {
      console.log("Fetching plan data for user:", user.id);
      
      // Fetch plan data using auth hook's fetchLatestPlan
      await fetchLatestPlan();
      
      // Then get the plan details
      const { data: planData, error } = await supabase
        .from('plans')
        .select('*')
        .eq('code', user.plan_code || 'visitor')
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching plan:", error);
      } else if (planData && isMountedRef.current) {
        console.log("Fetched plan data:", planData);
        setPlan(planData);
        setPlanDataFetched(true);
      }
    } catch (error) {
      console.error("Error in fetchPlanData:", error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, fetchLatestPlan, planDataFetched]);

  // Only fetch data when the user or shouldRefreshPlan changes
  useEffect(() => {
    if (user && (shouldRefreshPlan || !planDataFetched)) {
      fetchPlanData();
      setShouldRefreshPlan(false);
    }
  }, [user, shouldRefreshPlan, fetchPlanData, planDataFetched]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) return;
    
    setFetchingTransactions(true);
    
    try {
      console.log('Fetching transactions for user:', user.id, 'Type:', typeof user.id);
      
      // Try to find transactions by user id (auth_uid)
      const { data: authData, error: authError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      console.log('Transactions by auth_uid query result:', { data: authData, error: authError });
      
      if (!authError && authData && authData.length > 0 && isMountedRef.current) {
        setTransactions(authData as Transaction[]);
        console.log('Transactions found using auth_uid:', authData);
        setFetchingTransactions(false);
        return;
      }
      
      // If no transactions found by id, try looking by email in metadata
      if (user.email && isMountedRef.current) {
        console.log('Searching in metadata for email:', user.email);
        
        const { data: metadataTransactions, error: metadataError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!metadataError && metadataTransactions && isMountedRef.current) {
          // Filter transactions by user email in metadata
          const userTransactions = metadataTransactions.filter(tx => {
            // Safely check if metadata exists and has user_email or payer.email_address property
            if (tx.metadata && typeof tx.metadata === 'object') {
              // Check if user_email exists in metadata
              const metadataObj = tx.metadata as Record<string, any>;
              
              // Check for direct user_email property
              if (typeof metadataObj.user_email === 'string' && metadataObj.user_email === user.email) {
                return true;
              }
              
              // Check for payer.email_address property
              if (metadataObj.payer && typeof metadataObj.payer === 'object' && 
                  typeof metadataObj.payer.email_address === 'string' && 
                  metadataObj.payer.email_address === user.email) {
                return true;
              }
            }
            return false;
          });
          
          if (userTransactions.length > 0 && isMountedRef.current) {
            setTransactions(userTransactions as Transaction[]);
            console.log('Transactions found in metadata:', userTransactions);
            setFetchingTransactions(false);
            return;
          }
        }
      }
      
      if (isMountedRef.current) {
        setTransactions([]);
        console.log('No transactions found for this user');
      }
      
    } catch (error) {
      console.error('Critical error fetching transactions:', error);
      if (isMountedRef.current) {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'خطأ حرج في جلب سجل المعاملات' : 'Critical error fetching transaction history',
          variant: 'destructive'
        });
      }
    } finally {
      if (isMountedRef.current) {
        setFetchingTransactions(false);
      }
    }
  }, [user, language, toast]);

  // Fetch search history
  const fetchSearchHistory = useCallback(async () => {
    if (!user?.id || !isMountedRef.current) return;
    
    setFetchingHistory(true);
    
    try {
      console.log('Fetching search history for user:', user.id);
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error('Error fetching search history:', error);
        if (isMountedRef.current) {
          toast({
            title: language === 'ar' ? 'خطأ' : 'Error',
            description: language === 'ar' ? 'خ��أ في جلب سجل البحث' : 'Error fetching search history',
            variant: 'destructive'
          });
        }
      } else if (data && isMountedRef.current) {
        console.log('Search history data received:', data);
        if (Array.isArray(data) && data.length === 0) {
          console.log('No search history found for this user');
        }
        setSearchHistory(data as SearchHistory[]);
      }
    } catch (error) {
      console.error('Error in fetchSearchHistory:', error);
    } finally {
      if (isMountedRef.current) {
        setFetchingHistory(false);
        setHistoryFetchAttempted(true);
      }
    }
  }, [user, language, toast]);

  // Fetch transactions when user is available, but only once
  useEffect(() => {
    if (user && transactions.length === 0 && !fetchingTransactions) {
      fetchTransactions();
    }
  }, [user, transactions.length, fetchingTransactions, fetchTransactions]);

  // Only fetch search history when actively viewing that tab
  useEffect(() => {
    if (user && activeTab === 'history' && !fetchingHistory && !historyFetchAttempted) {
      console.log('Triggering search history fetch for tab:', activeTab);
      fetchSearchHistory();
    }
  }, [user, activeTab, fetchSearchHistory, historyFetchAttempted]);

  useEffect(() => {
    if (activeTab === 'history' && user?.plan_code && user.plan_code !== 'visitor') {
      console.log('Tab changed to history, refreshing data if needed');
      if (!fetchingHistory && searchHistory.length === 0) {
        fetchSearchHistory();
      }
    }
  }, [activeTab, user, fetchSearchHistory, fetchingHistory, searchHistory.length]);

  const handleChangePassword = async () => {
    setChangeStatus('');
    if (!newPassword) { 
      setChangeStatus(language === 'ar' ? 'يرجى تعبئة حقل كلمة المرور الجديدة' : 'Please fill the new password field');
      return;
    }

    // Update password using Supabase
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (!error) {
      setChangeStatus(language === 'ar' ? 'تم تغيير كلمة المرور بنجاح. قد تحتاج إلى تسجيل الدخول مرة أخرى.' : 'Password changed successfully. You might need to log in again.');
      toast({
        title: language === 'ar' ? 'نجاح' : 'Success',
        description: language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully',
        variant: 'default'
      });
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
    } else {
      console.error('Error changing password:', error);
      setChangeStatus(language === 'ar' ? `حدث خطأ: ${error.message}` : `Error: ${error.message}`);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleRefreshTransactions = () => {
    toast({
      title: language === 'ar' ? 'جاري التحديث' : 'Refreshing',
      description: language === 'ar' ? 'جاري تحديث سجل المعاملات...' : 'Refreshing transaction history...',
    });
    fetchTransactions();
    setShouldRefreshPlan(true);
  };

  const handleRefreshSearchHistory = () => {
    toast({
      title: language === 'ar' ? 'جاري التحديث' : 'Refreshing',
      description: language === 'ar' ? 'جاري تحديث سجل البحث...' : 'Refreshing search history...',
    });
    setHistoryFetchAttempted(false);
    fetchSearchHistory();
  };

  const handleRefreshPlanOnly = () => {
    toast({
      title: language === 'ar' ? 'جاري التحديث' : 'Refreshing',
      description: language === 'ar' ? 'جاري تحديث بيانات الباقة...' : 'Refreshing plan data...',
    });
    setPlanDataFetched(false);
    setShouldRefreshPlan(true);
  };

  // Helper function to determine billing period display based on plan code
  const getBillingPeriodDisplay = (planCode: string) => {
    if (planCode === 'pro12' || planCode === 'annual') {
      return language === 'ar' ? 'سنة' : 'year';
    }
    return language === 'ar' ? 'شهر' : 'month';
  };

  // Format expiry date
  const formatExpiryDate = (date: string | null | undefined) => {
    if (!date) return language === 'ar' ? 'غير محدد' : 'Not specified';
    
    try {
      const expiryDate = new Date(date);
      if (isNaN(expiryDate.getTime())) {
        return language === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
      }
      
      const timeRemaining = formatDistanceToNow(expiryDate, { addSuffix: true });
      return `${expiryDate.toLocaleDateString()} (${timeRemaining})`;
    } catch (error) {
      console.error('Error formatting expiry date:', error);
      return language === 'ar' ? 'خطأ في التاريخ' : 'Date error';
    }
  };

  if (!user) return <div className="text-center py-20">{language === 'ar' ? 'يجب تسجيل الدخول لعرض هذه الصفحة' : 'You must be logged in to view this page'}</div>;
  if (loading && !plan) return <div className="text-center py-20">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 p-4">
      <Card className="w-full max-w-4xl shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            {language === 'ar' ? 'حسابي' : 'My Account'}
          </CardTitle>
          <div className="mt-2">
            <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger 
                  value="account" 
                  className="w-1/3"
                >
                  {language === 'ar' ? 'معلومات الحساب' : 'Account'}
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions" 
                  className="w-1/3" 
                >
                  {language === 'ar' ? 'المعاملات' : 'Transactions'}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="w-1/3"
                  disabled={!user?.plan_code || user.plan_code === 'visitor'}
                >
                  {language === 'ar' ? 'سجل البحث' : 'Search History'}
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="account">
                <div className="space-y-6">
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
                    {/* Display expiry date information */}
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {language === 'ar' ? 'تاريخ الانتهاء:' : 'Expires:'} {formatExpiryDate(user.plan_expiry_date)}
                      </span>
                    </div>
                    {plan?.code !== 'pro' && plan?.code !== 'pro12' && plan?.code !== 'annual' && (
                      <Button className="mt-4" onClick={() => navigate('/subscribe')}>
                        {language === 'ar' ? 'ترقية إلى الباقة الاحترافية' : 'Upgrade to Pro Plan'}
                      </Button>
                    )}
                    <div className="mt-4">
                      <Button variant="outline" size="sm" onClick={handleRefreshPlanOnly} disabled={loading}>
                        {loading 
                          ? (language === 'ar' ? 'جاري التحديث...' : 'Refreshing...') 
                          : (language === 'ar' ? 'تحديث بيانات الباقة' : 'Refresh Plan Data')}
                      </Button>
                    </div>
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
                </div>
              </TabsContent>

              <TabsContent value="transactions">
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
                        {transactions.map((transaction) => (
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
              </TabsContent>
              
              <TabsContent value="history">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {language === 'ar' ? 'سجل البحث' : 'Search History'}
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshSearchHistory} 
                      disabled={fetchingHistory}
                    >
                      {fetchingHistory 
                        ? (language === 'ar' ? 'جاري التحديث...' : 'Refreshing...') 
                        : (language === 'ar' ? 'تحديث' : 'Refresh')}
                    </Button>
                  </div>
                  
                  {!user?.plan_code || user.plan_code === 'visitor' ? (
                    <div className="bg-amber-50 border border-amber-300 rounded p-4 text-center">
                      <p className="font-medium text-amber-800">
                        {language === 'ar' 
                          ? 'هذه الميزة متاحة فقط للباقات المدفوعة' 
                          : 'This feature is only available for paid plans'}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-2" 
                        onClick={() => navigate('/subscribe')}
                      >
                        {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                      </Button>
                    </div>
                  ) : fetchingHistory ? (
                    <div className="text-center py-4">
                      {language === 'ar' ? 'جاري تحميل سجل البحث...' : 'Loading search history...'}
                    </div>
                  ) : searchHistory.length > 0 ? (
                    <div className="space-y-4">
                      {searchHistory.map(record => (
                        <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Search className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{record.search_query}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(record.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          {record.search_results && (
                            <div className="mt-2 text-sm">
                              <div className="flex flex-wrap gap-2 mt-2">
                                {Array.isArray(record.search_results) ? (
                                  record.search_results.map((result: any, idx: number) => (
                                    <Badge key={idx} variant="secondary">
                                      {typeof result === 'string' ? result : (result?.name || 'Result')}
                                    </Badge>
                                  ))
                                ) : (
                                  <div className="text-xs text-gray-600 italic">
                                    {language === 'ar' ? 'نتائج متاحة' : 'Results available'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">
                      <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>{language === 'ar' ? 'لا يوجد سجل بحث' : 'No search history'}</p>
                      <p className="text-sm mt-2">
                        {language === 'ar' 
                          ? 'ستظهر عمليات البحث الخاصة بك هنا' 
                          : 'Your searches will appear here'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* المحتوى الآن سيظهر داخل TabsContent */}
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
