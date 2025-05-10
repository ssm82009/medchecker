
import React from 'react';

interface PlanErrorProps {
  language: string;
}

const PlanError: React.FC<PlanErrorProps> = ({ language }) => (
  <div className="text-center text-red-500">
    {language === 'ar' ? 'لم يتم العثور على الباقة الاحترافية' : 'Professional plan not found'}
  </div>
);

export default PlanError;
