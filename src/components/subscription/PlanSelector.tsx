import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlanType } from '@/types/plan';

interface PlanSelectorProps {
  plans: PlanType[];
  selectedPlanCode: string;
  onPlanChange: (planCode: string) => void;
  language: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, selectedPlanCode, onPlanChange, language }) => {
  if (!plans || plans.length === 0) {
    console.error("No plans provided to PlanSelector");
    return null;
  }
  
  console.log("PlanSelector rendering with plans:", plans);
  console.log("Selected plan code:", selectedPlanCode);

  return (
    <div className="mb-6">
      <h3 className="font-bold text-lg mb-3 text-center">
        {language === 'ar' ? 'اختر الباقة المناسبة لك' : 'Choose your plan'}
      </h3>
      <RadioGroup
        value={selectedPlanCode}
        onValueChange={onPlanChange}
        className="flex flex-col gap-4"
      >
        {plans.map((plan) => (
          <div key={plan.code} className={`
            flex items-center rounded-lg border p-4 
            ${selectedPlanCode === plan.code ? 'border-primary bg-primary/5' : 'border-gray-200'}
            cursor-pointer hover:bg-gray-50 transition-colors
          `}
          onClick={() => onPlanChange(plan.code)}
          >
            <RadioGroupItem value={plan.code} id={plan.code} className={`mr-3 ${language === 'ar' ? 'ml-3' : ''}`} />
            <Label htmlFor={plan.code} className="flex flex-col flex-1 cursor-pointer">
              <span className="font-medium text-lg text-center">
                {language === 'ar' ? plan.nameAr : plan.name}
              </span>
              <span className="text-gray-500 text-sm text-center">
                {language === 'ar' ? plan.descriptionAr : plan.description}
              </span>
            </Label>
            <div className={`text-xl font-bold text-green-600 ${language === 'ar' ? 'text-right mr-auto' : 'text-left ml-auto'}`}>
              {language === 'ar' ? (
                <>
                  <span dir="rtl">{plan.price}</span>&nbsp;$
                </>
              ) : (
                <>
                  <span dir="ltr">{plan.price}</span>&nbsp;$
                </>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default PlanSelector;
