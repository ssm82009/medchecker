
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PaymentStatusProps {
  status: 'idle' | 'success' | 'error';
  message: string;
  onRetry?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, message, onRetry }) => {
  const navigate = useNavigate();

  if (status === 'success') {
    return (
      <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-4 text-center mb-4">
        <div className="text-xl font-bold mb-2">🎉 تم الاشتراك بنجاح!</div>
        <div>تمت ترقية حسابك للباقة الاحترافية. يمكنك الآن الاستفادة من جميع المميزات.</div>
        <Button className="mt-4 w-full" onClick={() => navigate('/dashboard')}>
          الانتقال للوحة التحكم
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 text-center mb-4">
        <div className="text-xl font-bold mb-2">حدث خطأ أثناء الدفع</div>
        <div>{message || 'يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'}</div>
        {onRetry && (
          <Button className="mt-4 w-full" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default PaymentStatus;
