
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface PayPalLoadingStateProps {
  language: string;
}

const PayPalLoadingState: React.FC<PayPalLoadingStateProps> = ({ language }) => {
  return (
    <div className="space-y-4">
      <Button disabled className="w-full flex items-center gap-2">
        <ShieldCheck />
        {language === 'ar' ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}
      </Button>
      <div className="text-center text-sm text-gray-500">
        {language === 'ar' 
          ? 'بوابة الدفع غير متوفرة حالياً، يرجى المحاولة لاحقاً' 
          : 'Payment gateway is currently unavailable, please try again later'}
      </div>
    </div>
  );
};

export default PayPalLoadingState;
