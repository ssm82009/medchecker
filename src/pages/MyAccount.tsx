
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { AccountTab } from '@/components/account/AccountTab';
import { TransactionsTab } from '@/components/account/TransactionsTab';
import { SearchHistoryTab } from '@/components/account/SearchHistoryTab';
import { useAccountData } from '@/hooks/useAccountData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  
  const {
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
    isRefreshingPlan,
    handleChangePassword,
    handleRefreshTransactions,
    handleRefreshSearchHistory,
    handleRefreshPlanOnly,
    getBillingPeriodDisplay,
    formatExpiryDate,
    logout
  } = useAccountData();

  const handleLogout = async () => {
    await logout();
    navigate('/');
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
                <AccountTab 
                  user={user}
                  plan={plan}
                  showChangePassword={showChangePassword}
                  setShowChangePassword={setShowChangePassword}
                  oldPassword={oldPassword}
                  setOldPassword={setOldPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  changeStatus={changeStatus}
                  handleChangePassword={handleChangePassword}
                  isRefreshingPlan={isRefreshingPlan}
                  handleRefreshPlanOnly={handleRefreshPlanOnly}
                  formatExpiryDate={formatExpiryDate}
                  getBillingPeriodDisplay={getBillingPeriodDisplay}
                />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionsTab 
                  user={user}
                  transactions={transactions}
                  fetchingTransactions={fetchingTransactions}
                  handleRefreshTransactions={handleRefreshTransactions}
                />
              </TabsContent>
              
              <TabsContent value="history">
                <SearchHistoryTab 
                  user={user}
                  searchHistory={searchHistory}
                  fetchingHistory={fetchingHistory}
                  handleRefreshSearchHistory={handleRefreshSearchHistory}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* Content is now in TabsContent components */}
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
