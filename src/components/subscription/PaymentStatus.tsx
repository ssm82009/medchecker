
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

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
        <div className="flex justify-center mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
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
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div className="text-xl font-bold mb-2">
          {language === 'ar' ? 'حدث خطأ أثناء الدفع' : 'Payment Error'}
        </div>
        <div className="mb-2">{message || (language === 'ar' 
          ? 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.' 
          : 'Please try again or contact support.')}
        </div>
        {onRetry && (
          <Button className="mt-2 w-full" onClick={onRetry} variant="destructive">
            <RefreshCw className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentStatus;
