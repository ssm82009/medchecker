
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentTypeSelectorProps {
  paymentType: 'one_time' | 'recurring';
  onValueChange: (value: 'one_time' | 'recurring') => void;
}

const PaymentTypeSelector: React.FC<PaymentTypeSelectorProps> = ({ paymentType, onValueChange }) => {
  return (
    <div className="mb-6">
      <Label className="block mb-2">اختر نوع الدفع</Label>
      <Select value={paymentType} onValueChange={(v) => onValueChange(v as 'one_time' | 'recurring')}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="اختر نوع الدفع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recurring">اشتراك شهري متكرر</SelectItem>
          <SelectItem value="one_time">دفع لمرة واحدة</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentTypeSelector;
