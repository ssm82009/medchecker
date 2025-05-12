
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { SearchHistory } from '@/types/index';
import { Transaction } from '@/types';

export const useAccountData = () => {
  const { user, logout, fetchLatestPlan } = useAuth();
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
  const [historyFetchAttempted, setHistoryFetchAttempted] = useState(false);
  const [planDataFetched, setPlanDataFetched] = useState(false);
  const [isRefreshingPlan, setIsRefreshingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
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
    if (!user || !isMountedRef.current || (planDataFetched && !shouldRefreshPlan)) return;
    
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
        setShouldRefreshPlan(false);
      }
    }
  }, [user, fetchLatestPlan, planDataFetched, shouldRefreshPlan]);

  // Only fetch data when the user or shouldRefreshPlan changes
  useEffect(() => {
    if (user && (shouldRefreshPlan || !planDataFetched)) {
      fetchPlanData();
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
  }, [user, language]);

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
            description: language === 'ar' ? 'خطأ في جلب سجل البحث' : 'Error fetching search history',
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
  }, [user, language]);

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

  const handleRefreshPlanOnly = async () => {
    if (isRefreshingPlan) return;
    
    setIsRefreshingPlan(true);
    toast({
      title: language === 'ar' ? 'جاري التحديث' : 'Refreshing',
      description: language === 'ar' ? 'جاري تحديث بيانات الباقة...' : 'Refreshing plan data...',
    });
    
    try {
      setPlanDataFetched(false);
      await fetchLatestPlan();
      setShouldRefreshPlan(true);
    } catch (error) {
      console.error('Error refreshing plan:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحديث البيانات' : 'Error refreshing data',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshingPlan(false);
    }
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

  return {
    user,
    plan,
    loading,
    showChangePassword,
    setShowChangePassword,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    changeStatus,
    transactions,
    fetchingTransactions,
    searchHistory,
    fetchingHistory,
    activeTab,
    setActiveTab,
    historyFetchAttempted,
    planDataFetched,
    isRefreshingPlan,
    handleChangePassword,
    handleRefreshTransactions,
    handleRefreshSearchHistory,
    handleRefreshPlanOnly,
    getBillingPeriodDisplay,
    formatExpiryDate,
    logout
  };
};
