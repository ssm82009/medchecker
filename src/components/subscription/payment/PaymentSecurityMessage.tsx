
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PaymentSecurityMessageProps {
  language: string;
}

const PaymentSecurityMessage: React.FC<PaymentSecurityMessageProps> = ({ language }) => (
  <div className="bg-green-50 p-3 rounded-md border border-green-100 mb-4">
    <div className="flex items-center gap-2 text-green-700">
      <ShieldCheck className="h-5 w-5" />
      <span className="font-medium">
        {language === 'ar' ? 'الدفع آمن ومشفر' : 'Secure and encrypted payment'}
      </span>
    </div>
  </div>
);

export default PaymentSecurityMessage;
