
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentStatusProps {
  status: 'idle' | 'success' | 'error';
  message: string;
  onRetry?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, message, onRetry }) => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  if (status === 'success') {
    return (
      <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 text-center mb-4">
        <div className="text-xl font-bold mb-2">
          {language === 'ar' ? '🎉 تم الاشتراك بنجاح!' : '🎉 Subscription successful!'}
        </div>
        <div>
          {language === 'ar' 
            ? 'تمت ترقية حسابك للباقة الاحترافية. يمكنك الآن الاستفادة من جميع المميزات.' 
            : 'Your account has been upgraded to the professional plan. You can now enjoy all premium features.'}
        </div>
        <Button className="mt-4 w-full" onClick={() => navigate('/dashboard')}>
          {language === 'ar' ? 'الانتقال للوحة التحكم' : 'Go to Dashboard'}
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 text-center mb-4">
        <div className="text-xl font-bold mb-2">
          {language === 'ar' ? 'حدث خطأ أثناء الدفع' : 'Payment Error'}
        </div>
        <div>{message || (language === 'ar' 
          ? 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.' 
          : 'Please try again or contact support.')}
        </div>
        {onRetry && (
          <Button className="mt-4 w-full" onClick={onRetry}>
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentStatus;
