
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { PlanType } from '@/types/plan';
import { CheckCircle } from 'lucide-react';

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
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-primary text-lg">
          {language === 'ar' ? 'المميزات المتاحة:' : 'Available Features:'}
        </h3>
        <ul className="space-y-2">
          {(language === 'ar' ? plan.featuresAr : plan.features)?.map((feature: string, i: number) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  );
};

export default PlanDetails;
