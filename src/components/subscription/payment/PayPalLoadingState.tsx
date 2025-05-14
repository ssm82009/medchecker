
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

interface PayPalLoadingStateProps {
  language: string;
}

const PayPalLoadingState: React.FC<PayPalLoadingStateProps> = ({ language }) => {
  return (
    <div className="space-y-4">
      <div className="w-full p-4 bg-gray-100 rounded-md flex items-center justify-center gap-3">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {language === 'ar' ? 'جاري تحميل بوابة الدفع...' : 'Loading payment gateway...'}
      </div>
      <div className="text-center text-sm text-gray-500">
        {language === 'ar' 
          ? 'يرجى الانتظار، قد تستغرق هذه العملية بضع ثوان'
          : 'Please wait, this may take a few seconds'}
      </div>
    </div>
  );
};

export default PayPalLoadingState;
