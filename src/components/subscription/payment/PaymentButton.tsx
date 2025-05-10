
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  paymentType: 'one_time' | 'recurring';
  language: string;
  onClick: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ paymentType, language, onClick }) => {
  const paymentText = language === 'ar' ? 'اشترك الآن' : 'Subscribe Now';

  return (
    <Button 
      className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 py-6" 
      onClick={onClick}
    >
      <CreditCard />
      {paymentText}
    </Button>
  );
};

export default PaymentButton;
