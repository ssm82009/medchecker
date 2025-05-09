
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface PlanDetailsProps {
  plan: any;
  paypalSettings: any;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, paypalSettings }) => {
  const { language } = useTranslation();
  
  if (!plan) return null;

  return (
    <CardContent>
      <div className="text-center text-lg mb-2 text-gray-700">
        {plan.description_ar || plan.description}
      </div>
      <div className="text-center text-3xl font-bold text-green-600 mb-4">
        {plan.price} {paypalSettings?.currency || 'USD'} / شهر
      </div>
      <ul className="mb-6 text-gray-700 text-right pr-4 list-disc">
        {plan.features_ar?.map((feature: string, i: number) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </CardContent>
  );
};

export default PlanDetails;
