
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

  // Get the appropriate plan name and description based on language
  const planName = language === 'ar' ? plan.nameAr || plan.name : plan.name;
  const planDescription = language === 'ar' ? plan.descriptionAr || plan.description : plan.description;
  const planFeatures = language === 'ar' ? plan.features_ar || plan.featuresAr || plan.features : plan.features;

  return (
    <CardContent className="py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">{planName}</h2>
        <p className="text-lg mb-3 text-gray-700">{planDescription}</p>
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-1">
            <span>{plan.price}</span>
            <span className="text-xl">{paypalSettings?.currency || 'USD'}</span>
          </div>
          <span className="text-lg text-gray-600">/ {language === 'ar' ? 'شهر' : 'month'}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border border-blue-100/50 mb-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-primary text-lg border-b pb-2 border-primary/20">
          {language === 'ar' ? 'المميزات المتاحة:' : 'Available Features:'}
        </h3>
        <ul className="space-y-3">
          {planFeatures && Array.isArray(planFeatures) && planFeatures.map((feature: string, i: number) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
          
          {(!planFeatures || !Array.isArray(planFeatures) || planFeatures.length === 0) && (
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">
                {language === 'ar' ? 'باقة احترافية كاملة المميزات' : 'Full featured professional plan'}
              </span>
            </li>
          )}
        </ul>
      </div>
    </CardContent>
  );
};

export default PlanDetails;
