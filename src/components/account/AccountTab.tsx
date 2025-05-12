
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface AccountTabProps {
  user: any;
  plan: any;
  showChangePassword: boolean;
  setShowChangePassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  oldPassword: string;
  setOldPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  changeStatus: string;
  handleChangePassword: () => Promise<void>;
  isRefreshingPlan: boolean;
  handleRefreshPlanOnly: () => void;
  formatExpiryDate: (date: string | null | undefined) => string;
  getBillingPeriodDisplay: (planCode: string) => string;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  plan,
  showChangePassword,
  setShowChangePassword,
  oldPassword,
  setOldPassword,
  newPassword, 
  setNewPassword,
  changeStatus,
  handleChangePassword,
  isRefreshingPlan,
  handleRefreshPlanOnly,
  formatExpiryDate,
  getBillingPeriodDisplay,
}) => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  return (
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshPlanOnly} 
            disabled={isRefreshingPlan}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingPlan ? 'animate-spin' : ''}`} />
            {isRefreshingPlan 
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
  );
};
