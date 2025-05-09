import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pill, AlertTriangle, Loader } from 'lucide-react';
import Advertisement from './Advertisement';
import { useIsMobile } from '@/hooks/use-mobile';
import { Medication, PatientInfo } from '@/types/medication';
import MedicationInputRow from './medication/MedicationInputRow';
import PatientInfoForm from './medication/PatientInfoForm';
import InteractionResults from './medication/InteractionResults';
import { useInteractionChecker } from '@/hooks/useInteractionChecker';
import ImageToTextScanner from './medication/ImageToTextScanner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

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
  
  const resultRef = useRef<HTMLDivElement>(null);
  
  const { result, loading, apiKeyError, checkInteractions } = useInteractionChecker();
  
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<'visitor' | 'basic' | 'pro'>('visitor');
  const [maxMedications, setMaxMedications] = useState(2);

  const navigate = useNavigate();
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      let planCode = user?.plan_code || 'visitor';
      // جلب الخطة من Supabase للتأكد من وجودها
      const { data, error } = await supabase.from('plans').select('code').eq('code', planCode).maybeSingle();
      if (data && data.code) planCode = data.code;
      setUserPlan(planCode as 'visitor' | 'basic' | 'pro');
      if (planCode === 'pro') setMaxMedications(10);
      else if (planCode === 'basic') setMaxMedications(5);
      else setMaxMedications(2);
    };
    fetchPlan();
  }, [user]);

  const handlePatientInfo = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const addMedication = () => {
    if (medications.length >= maxMedications) {
      setShowLimitDialog(true);
      return;
    }
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

  const handleMedicationsDetected = (medicationText: string) => {
    if (!medicationText) return;
    
    const detectedMedications = medicationText.split(/[,،]/).map(med => med.trim()).filter(Boolean);
    
    if (detectedMedications.length === 0) return;
    
    const newMeds = detectedMedications.map(name => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name
    }));
    
    const emptyInputs = medications.filter(med => !med.name.trim());
    
    if (emptyInputs.length >= newMeds.length) {
      const filledMeds = [...medications];
      let filledCount = 0;
      
      for (let i = 0; i < filledMeds.length && filledCount < newMeds.length; i++) {
        if (!filledMeds[i].name.trim()) {
          filledMeds[i].name = newMeds[filledCount].name;
          filledCount++;
        }
      }
      
      setMedications(filledMeds);
    } else {
      const nonEmptyMeds = medications.filter(med => med.name.trim());
      const updatedMeds = [
        ...nonEmptyMeds,
        ...newMeds
      ];
      
      setMedications(updatedMeds);
    }
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

  const handleImageScanClick = () => {
    if (userPlan !== 'pro') {
      setShowUpgradeDialog(true);
      return;
    }
    // trigger image scan (ImageToTextScanner will handle it)
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

              <div className="mb-4 pt-1 pb-4 border-b border-gray-100">
                <p className="text-sm font-medium mb-2 flex items-center text-gray-700">
                  {t('scanMedicationsFromImage')}
                </p>
                <div onClick={handleImageScanClick} style={{ cursor: userPlan === 'pro' ? 'pointer' : 'not-allowed', opacity: userPlan === 'pro' ? 1 : 0.7 }}>
                  <ImageToTextScanner onTextDetected={handleMedicationsDetected} canUse={userPlan === 'pro'} />
                </div>
              </div>

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
              {loading ? (
                <>
                  <Loader className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
                  <span>{t('loading')}</span>
                </>
              ) : (
                t('checkInteractions')
              )}
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

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user
                ? (language === 'ar' ? 'تحتاج إلى ترقية الباقة' : 'Upgrade Required')
                : (language === 'ar' ? 'تحتاج إلى تسجيل حساب' : 'You need to register')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-center text-red-500">
            {user
              ? (language === 'ar'
                ? `لا يمكنك إضافة أكثر من ${maxMedications} أدوية في هذه الباقة. للترقية إلى الباقة الاحترافية اضغط زر الترقية.`
                : `You can't add more than ${maxMedications} medications in this plan. To upgrade, click the upgrade button.`)
              : (language === 'ar'
                ? `لا يمكنك إضافة أكثر من ${maxMedications} أدوية في هذه الباقة. لإضافة المزيد يرجى تسجيل حساب أو الترقية إلى باقة أعلى.`
                : `You can't add more than ${maxMedications} medications in this plan. To add more, please register or upgrade your plan.`)
            }
          </div>
          <DialogFooter>
            {user ? (
              <Button onClick={() => { setShowLimitDialog(false); navigate('/subscribe'); }}>
                {language === 'ar' ? 'ترقية الباقة' : 'Upgrade Plan'}
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')}>
                {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowLimitDialog(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'هذه الميزة متاحة في الباقة الاحترافية فقط' : 'Pro Feature Only'}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-center">
            {language === 'ar'
              ? 'للاستفادة من البحث بالصور، يرجى الترقية إلى الباقة الاحترافية.'
              : 'To use image search, please upgrade to the Pro plan.'}
          </div>
          <DialogFooter>
            {user ? (
              <Button onClick={() => { setShowUpgradeDialog(false); navigate('/subscribe'); }}>
                {language === 'ar' ? 'ترقية الباقة' : 'Upgrade Plan'}
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')}>
                {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Register'}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowUpgradeDialog(false)}>{language === 'ar' ? 'إغلاق' : 'Close'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicationInteractionChecker;
