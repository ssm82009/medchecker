
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { PlanType } from '@/types/plan';

interface PlanDetailsProps {
  plan: PlanType;
  paypalSettings: any;
}

const PlanDetails: React.FC<PlanDetailsProps> = ({ plan, paypalSettings }) => {
  const { language } = useTranslation();
  
  if (!plan) return null;

  return (
    <CardContent>
      <div className="text-center text-lg mb-2 text-gray-700">
        {language === 'ar' ? plan.descriptionAr : plan.description}
      </div>
      <div className="text-center text-3xl font-bold text-green-600 mb-4">
        {plan.price} {paypalSettings?.currency || 'USD'} {language === 'ar' ? '/ شهر' : '/ month'}
      </div>
      <ul className="mb-6 text-gray-700 text-right pr-4 list-disc">
        {(language === 'ar' ? plan.featuresAr : plan.features)?.map((feature: string, i: number) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </CardContent>
  );
};

export default PlanDetails;
