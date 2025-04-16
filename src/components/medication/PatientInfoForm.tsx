
import React from 'react';
import { Input } from '@/components/ui/input';
import { User, Weight, ActivitySquare } from 'lucide-react';
import { PatientInfo } from '@/types/medication';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';

interface PatientInfoFormProps {
  patientInfo: PatientInfo;
  onUpdate: (field: keyof PatientInfo, value: string) => void;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({ patientInfo, onUpdate }) => {
  const { t, dir } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <div className={`mt-6 pt-4 pb-3 border-t border-gray-100 bg-gray-50/50 rounded-md ${isMobile ? 'px-2' : 'px-3'}`}>
      <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700">
        <User className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4 text-primary/70`} />
        {t('patientInfo')}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-600">
            <User className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
            {t('age')}
          </div>
          <Input 
            value={patientInfo.age} 
            onChange={(e) => onUpdate('age', e.target.value)} 
            placeholder={t('enterAge')}
            type="number"
            className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
            dir={dir}
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-600">
            <Weight className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
            {t('weight')}
          </div>
          <Input 
            value={patientInfo.weight} 
            onChange={(e) => onUpdate('weight', e.target.value)} 
            placeholder={t('selectWeight')}
            type="number"
            className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
            dir={dir}
          />
        </div>
      </div>
      
      <div className={`${isMobile ? 'grid-cols-1' : 'grid-cols-2'} grid mt-2 gap-3`}>
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-600">
            <ActivitySquare className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
            {t('allergies')}
          </div>
          <Input 
            value={patientInfo.allergies} 
            onChange={(e) => onUpdate('allergies', e.target.value)} 
            placeholder={t('enterAllergies')}
            className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
            dir={dir}
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center text-xs text-gray-600">
            <ActivitySquare className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
            {t('healthCondition')}
          </div>
          <Input 
            value={patientInfo.healthCondition}
            onChange={(e) => onUpdate('healthCondition', e.target.value)}
            placeholder={t('enterHealthCondition')}
            className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
            dir={dir}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInfoForm;
