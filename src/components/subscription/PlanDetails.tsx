import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface PlanDetailsProps {
  plan: any;
  paypalSettings: any;
}

const PlanDetails = ({ plan, paypalSettings }) => {
  const { language } = useTranslation();
  
  if (!plan) return null;
  
  return (
    <div className="px-6 py-4 border-b">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">
          {language === 'ar' ? plan.nameAr : plan.name}
        </h2>
        <div className="text-2xl font-bold text-green-600 mt-1">
          {plan.price} {paypalSettings?.currency || 'USD'}
        </div>
        <p className="text-gray-500 mt-2">
          {language === 'ar' ? plan.descriptionAr : plan.description}
        </p>
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">
          {language === 'ar' ? 'المميزات المتضمنة:' : 'Features Included:'}
        </h3>
        <ul className="space-y-2">
          {(language === 'ar' ? plan.featuresAr : plan.features).map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="text-green-600 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlanDetails;
