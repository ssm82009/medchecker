
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pill, AlertTriangle } from 'lucide-react';
import Advertisement from './Advertisement';
import { useIsMobile } from '@/hooks/use-mobile';
import { Medication, PatientInfo } from '@/types/medication';
import MedicationInputRow from './medication/MedicationInputRow';
import PatientInfoForm from './medication/PatientInfoForm';
import InteractionResults from './medication/InteractionResults';
import { useInteractionChecker } from '@/hooks/useInteractionChecker';

const MedicationInteractionChecker: React.FC = () => {
  const { t, dir, language } = useTranslation();
  const isMobile = useIsMobile();
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: '' },
    { id: '2', name: '' }
  ]);
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: '',
    weight: '',
    allergies: '',
    healthCondition: ''
  });
  
  const [showPatientInfo, setShowPatientInfo] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const { result, loading, apiKeyError, checkInteractions } = useInteractionChecker();
  
  const handlePatientInfo = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    setMedications([...medications, { id: Date.now().toString(), name: '' }]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 2) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, name: string) => {
    setMedications(medications.map(med => med.id === id ? { ...med, name } : med));
  };

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }, 300);
    }
  }, [result]);

  const handleCheckInteractions = () => {
    checkInteractions(medications, patientInfo);
  };

  return (
    <div className={`w-full px-4 ${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto ${dir === 'rtl' ? 'text-right' : 'text-left'} bg-transparent flex flex-col items-center justify-center`} dir={dir}>
      <Advertisement />
      
      <h1 className="text-2xl sm:text-3xl font-bold text-center my-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {language === 'ar' ? 'أداة سريعة للتحقق من التفاعلات الدوائية' : 'Quick Medication Interaction Checker'}
      </h1>
      
      <div className="w-full bg-transparent mt-4">
        <Card className={`shadow-lg transition-all duration-300 hover:shadow-xl bg-white/90 backdrop-blur-md mb-6 border-0`}>
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-700">
              <Pill className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {t('appTitle')}
            </CardTitle>
            <CardDescription className="text-gray-500">{t('enterMedication')}</CardDescription>
          </CardHeader>
          <CardContent className={`space-y-4 pt-6 ${isMobile ? 'px-3' : 'px-6'}`}>
            <div className="space-y-4">
              {medications.map((med, index) => (
                <MedicationInputRow
                  key={med.id}
                  medication={med}
                  index={index}
                  canDelete={medications.length > 2}
                  onUpdate={updateMedication}
                  onRemove={removeMedication}
                />
              ))}
              
              <Button 
                variant="outline" 
                onClick={addMedication} 
                className="w-full group hover:bg-primary/5 hover:text-primary transition-colors text-gray-600"
              >
                <Plus className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} />
                {t('addMedication')}
              </Button>

              <PatientInfoForm 
                patientInfo={patientInfo}
                onUpdate={handlePatientInfo}
              />
            </div>
          </CardContent>
          <CardFooter className={`${isMobile ? 'px-3 flex-col items-stretch' : ''}`}>
            {apiKeyError && (
              <div className={`w-full mb-3 p-2 bg-gray-800 text-white rounded-md flex items-center text-xs ${isMobile ? 'text-center justify-center' : ''}`}>
                <AlertTriangle className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} text-yellow-300`} />
                {language === 'ar' 
                  ? 'لم يتم العثور على مفتاح API. يتم استخدام بيانات تجريبية للتوضيح.'
                  : 'No API key found. Using demo data for illustration.'}
              </div>
            )}
            <Button 
              onClick={handleCheckInteractions} 
              disabled={loading || medications.filter(m => m.name.trim() !== '').length < 2}
              className={`${isMobile ? 'w-full mt-2' : 'w-full'} bg-primary hover:bg-primary/90 transition-colors`}
            >
              {loading ? t('loading') : t('checkInteractions')}
            </Button>
          </CardFooter>
        </Card>
        
        {result && (
          <div ref={resultRef}>
            <InteractionResults 
              result={result}
              apiKeyError={apiKeyError}
              scrollToResults={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationInteractionChecker;
