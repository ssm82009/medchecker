
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PaymentSecurityMessageProps {
  language: string;
}

const PaymentSecurityMessage: React.FC<PaymentSecurityMessageProps> = ({ language }) => (
  <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
    <div className="flex items-center gap-2 text-blue-700">
      <ShieldCheck className="h-5 w-5" />
      <span className="font-medium">
        {language === 'ar' ? 'الدفع آمن ومشفر' : 'Secure and encrypted payment'}
      </span>
    </div>
  </div>
);

export default PaymentSecurityMessage;
