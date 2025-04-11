import React, { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Heart, Pill, User, Weight, ActivitySquare, AlertTriangle, Info, Copy, Printer, CheckCircle } from 'lucide-react';
import Advertisement from './Advertisement';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Medication {
  id: string;
  name: string;
}

interface PatientInfo {
  age: string;
  weight: string;
  allergies: string;
  healthCondition: string;
}

interface InteractionResult {
  hasInteractions: boolean;
  interactions?: string[];
  alternatives?: string[];
  ageWarnings?: string[];
}

const MOCK_INTERACTIONS = {
  'أسبرين+باراسيتامول': {
    hasInteractions: true,
    interactions: [
      'قد يزيد من خطر النزيف عند تناول الأسبرين مع الباراسيتامول لفترات طويلة',
      'يمكن أن يقلل الأسبرين من فعالية الباراسيتامول'
    ],
    alternatives: [
      'يمكن استخدام الإيبوبروفين (الاسم التجاري: بروفين، أدفيل) بدلاً من الأسبرين',
      'استشر الطبيب قبل الجمع بين هذه الأدوية'
    ],
    ageWarnings: [
      'الأسبرين غير مناسب للأطفال تحت سن 12 سنة بسبب خطر متلازمة راي',
      'باراسيتامول: يجب تعديل الجرعة حسب العمر والوزن'
    ]
  },
  'أموكسيسيلين+أوميبرازول': {
    hasInteractions: true,
    interactions: [
      'قد يقلل أوميبرازول من امتصاص أموكسيسيلين',
      'ينصح بترك فاصل زمني بين تناول الدوائين'
    ],
    alternatives: [
      'يمكن استخدام رانيتيدين (الاسم التجاري: زانتاك) بدلاً من أوميبرازول (الاسم التجاري: بريلوسيك)',
      'تناول أموكسيسيلين (الاسم التجاري: موكسيبين، أموكسيل) قبل ساعتين على الأقل من أوميبرازول'
    ],
    ageWarnings: [
      'أموكسيسيلين: يجب تعديل الجرعة للأطفال حسب الوزن والعمر',
      'أوميبرازول: غير موصى به عادة للأطفال أقل من سنة واحدة'
    ]
  },
  'وارفارين+إيبوبروفين': {
    hasInteractions: true,
    interactions: [
      'زيادة خطر النزيف الشديد عند الجمع بين وارفارين وإيبوبروفين',
      'تأثير خطير على تخثر الدم'
    ],
    alternatives: [
      'استخدم الباراسيتامول (الاسم التجاري: بنادول، تايلينول) بدلاً من الإيبوبروفين مع وارفارين',
      'استشر الطبيب قبل استخدام أي مسكن مع وارفارين (الاسم التجاري: كومادين)'
    ],
    ageWarnings: [
      'وارفارين: يتطلب مراقبة دقيقة لتخثر الدم وغير مناسب للأطفال إلا تحت إشراف طبي صارم',
      'إيبوبروفين: غير مناسب للأطفال أقل من 6 أشهر'
    ]
  },
  'فيفادول+بنادول': {
    hasInteractions: true,
    interactions: [
      'كلا الدوائين يحتويان على الباراسيتامول مما قد يؤدي إلى جرعة زائدة',
      'زي��دة خطر تضرر الكبد عند تناول جرعات عالية من الباراسيتامول'
    ],
    alternatives: [
      'استخدم أحد الدوائين فقط وليس كليهما (فيفادول أو بنادول)',
      'يمكن استخدام الإيبوبروفين (الاسم التجاري: بروفين، أدفيل) كبديل لأحد الدوائين'
    ],
    ageWarnings: [
      'باراسيتامول: يجب تعديل الجرعة للأطفال حسب العمر والوزن',
      'تجنب استخدام جرعات عالية من الباراسيتامول للأطفال'
    ]
  },
  'روفيناك+كاتافاست': {
    hasInteractions: true,
    interactions: [
      'كلا الدوائين ينتميان إلى مضادات الالتهاب غير الستيرويدية مما يزيد من الآثار الجانبية',
      'زيادة خطر مشاكل المعدة والنزيف الهضمي',
      'قد يؤثر سلبًا على وظائف الكلى خاصة لمرضى السكري'
    ],
    alternatives: [
      'استخدم أحد الدوائين فقط وليس كليهما (روفيناك أو كاتافاست)',
      'يمكن استخدام الباراسيتامول (الاسم التجاري: بنادول، تايلينول) كبديل أكثر أمانًا للألم'
    ],
    ageWarnings: [
      'مضادات الالتهاب غير الستيرويدية غير موصى بها عادة للأطفال أقل من 12 سنة إلا بوصفة طبية',
      'لا ينصح باستخدام روفيناك للأطفال تحت سن 14 سنة'
    ]
  },
  'روفيناك+بنادول': {
    hasInteractions: true,
    interactions: [
      'قد يزيد من خطر حدوث آثار جانبية على الجهاز الهضمي',
      'قد يكون له تأثير على مرضى السكري'
    ],
    alternatives: [
      'استشر الطبيب حول الجرعة المناسبة',
      'يمكن استخدام مسكنات بديلة مثل الاسيتامينوفين فقط (الاسم التجاري: تايلينول) تحت إشراف طبي'
    ],
    ageWarnings: [
      'روفيناك (الاسم التجاري: فولتارين): غير مناسب للأطفال تحت سن 14 سنة',
      'بنادول: يجب تعديل الجرعة للأطفال حسب العمر والوزن'
    ]
  }
};

const MOCK_INTERACTIONS_EN = {
  'aspirin+paracetamol': {
    hasInteractions: true,
    interactions: [
      'May increase the risk of bleeding when taking aspirin with paracetamol for extended periods',
      'Aspirin can reduce the effectiveness of paracetamol'
    ],
    alternatives: [
      'Ibuprofen (Brand names: Advil, Motrin) can be used instead of aspirin',
      'Consult your doctor before combining these medications'
    ],
    ageWarnings: [
      'Aspirin is not suitable for children under 12 years due to the risk of Reye\'s syndrome',
      'Paracetamol: Dosage should be adjusted according to age and weight'
    ]
  },
  'amoxicillin+omeprazole': {
    hasInteractions: true,
    interactions: [
      'Omeprazole may reduce the absorption of amoxicillin',
      'It is recommended to leave a time gap between taking the two medications'
    ],
    alternatives: [
      'Ranitidine (Brand name: Zantac) can be used instead of omeprazole (Brand name: Prilosec)',
      'Take amoxicillin (Brand names: Amoxil, Moxatag) at least two hours before omeprazole'
    ],
    ageWarnings: [
      'Amoxicillin: Dosage should be adjusted for children based on weight and age',
      'Omeprazole: Not usually recommended for children under one year'
    ]
  },
  'warfarin+ibuprofen': {
    hasInteractions: true,
    interactions: [
      'Increased risk of severe bleeding when combining warfarin and ibuprofen',
      'Serious effect on blood clotting'
    ],
    alternatives: [
      'Use paracetamol (Brand names: Tylenol, Panadol) instead of ibuprofen with warfarin',
      'Consult your doctor before using any pain reliever with warfarin (Brand name: Coumadin)'
    ],
    ageWarnings: [
      'Warfarin: Requires careful monitoring of blood clotting and not suitable for children except under strict medical supervision',
      'Ibuprofen: Not suitable for children under 6 months'
    ]
  },
  'fevadol+panadol': {
    hasInteractions: true,
    interactions: [
      'Both medications contain paracetamol which may lead to overdose',
      'Increased risk of liver damage when taking high doses of paracetamol'
    ],
    alternatives: [
      'Use only one of the medications, not both (Fevadol or Panadol)',
      'Ibuprofen (Brand names: Advil, Motrin) can be used as an alternative to one of the medications'
    ],
    ageWarnings: [
      'Paracetamol: Dosage should be adjusted for children based on age and weight',
      'Avoid high doses of paracetamol for children'
    ]
  },
  'roufinac+catafast': {
    hasInteractions: true,
    interactions: [
      'Both drugs belong to NSAIDs which increases side effects',
      'Increased risk of stomach problems and gastrointestinal bleeding',
      'May negatively affect kidney function especially for diabetic patients'
    ],
    alternatives: [
      'Use only one of the medications, not both (Roufinac or Catafast)',
      'Paracetamol (Brand names: Tylenol, Panadol) can be used as a safer alternative for pain'
    ],
    ageWarnings: [
      'NSAIDs are not usually recommended for children under 12 years unless prescribed',
      'Roufinac not recommended for children under 14 years'
    ]
  },
  'roufinac+panadol': {
    hasInteractions: true,
    interactions: [
      'May increase the risk of gastrointestinal side effects',
      'May have an effect on diabetic patients'
    ],
    alternatives: [
      'Consult your doctor about the appropriate dosage',
      'Alternative pain relievers such as acetaminophen only (Brand name: Tylenol) can be used under medical supervision'
    ],
    ageWarnings: [
      'Roufinac (Brand name: Voltaren): Not suitable for children under 14 years',
      'Panadol: Dosage should be adjusted for children based on age and weight'
    ]
  }
};

const MedicationInteractionChecker: React.FC = () => {
  const { t, dir, language } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
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
  
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const [aiSettings] = useLocalStorage<{ apiKey: string; model: string }>('aiSettings', { apiKey: '', model: 'gpt-4o-mini' });
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
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

  const copyResults = () => {
    if (!resultRef.current) return;
    
    const resultText = resultRef.current.innerText;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopied(true);
      toast({
        title: language === 'ar' ? 'تم النسخ' : 'Copied',
        description: language === 'ar' ? 'تم نسخ النتائج بنجاح' : 'Results copied successfully',
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const printResults = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = resultRef.current?.innerHTML || '';
    
    printContent.style.fontFamily = 'Arial, sans-serif';
    printContent.style.padding = '20px';
    printContent.style.direction = dir;
    
    const windowPrint = window.open('', '', 'height=600,width=800');
    
    if (windowPrint) {
      windowPrint.document.write('<html><head><title>');
      windowPrint.document.write(language === 'ar' ? 'نتائج التفاعلات الدوائية' : 'Medication Interaction Results');
      windowPrint.document.write('</title>');
      windowPrint.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>');
      windowPrint.document.write('</head><body>');
      windowPrint.document.write(printContent.innerHTML);
      windowPrint.document.write('</body></html>');
      windowPrint.document.close();
      windowPrint.focus();
      
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 250);
    }
  };

  const checkInteractions = async () => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    setApiKeyError(false);
    
    try {
      const medicationNames = validMedications.map(med => med.name.toLowerCase());
      
      const apiKey = aiSettings.apiKey;
      if (!apiKey) {
        setApiKeyError(true);
        const medPairs = [];
        for (let i = 0; i < medicationNames.length; i++) {
          for (let j = i + 1; j < medicationNames.length; j++) {
            medPairs.push(`${medicationNames[i]}+${medicationNames[j]}`);
            medPairs.push(`${medicationNames[j]}+${medicationNames[i]}`);
          }
        }
        
        let foundInteraction = false;
        let interactionData: InteractionResult = { hasInteractions: false };
        
        const mockData = language === 'ar' ? MOCK_INTERACTIONS : MOCK_INTERACTIONS_EN;
        
        for (const pair of medPairs) {
          if (mockData[pair]) {
            foundInteraction = true;
            interactionData = mockData[pair];
            break;
          }
        }
        
        if (!foundInteraction) {
          for (const pair of medPairs) {
            for (const mockPair in mockData) {
              if (mockPair.includes(medicationNames[0]) || mockPair.includes(medicationNames[1])) {
                foundInteraction = true;
                interactionData = {
                  hasInteractions: false
                };
                break;
              }
            }
            if (foundInteraction) break;
          }
        }
        
        if (patientInfo.age && interactionData.ageWarnings) {
          const age = parseInt(patientInfo.age);
          const relevantAgeWarnings = interactionData.ageWarnings.filter(warning => {
            if ((warning.includes('أطفال') || warning.includes('children')) && age < 18) {
              if (warning.includes('12') && age < 12) return true;
              if (warning.includes('14') && age < 14) return true;
              if ((warning.includes('6 أشهر') || warning.includes('6 months')) && age < 1) return true;
              if ((warning.includes('سنة واحدة') || warning.includes('one year')) && age < 1) return true;
              return true;
            }
            return warning.toLowerCase().includes('all ages') || !warning.includes('year');
          });
          
          interactionData.ageWarnings = relevantAgeWarnings;
        }
        
        setTimeout(() => {
          setResult(interactionData);
          setLoading(false);
        }, 1000);
        
        return;
      }
      
      const patientContext = [
        patientInfo.age ? `${language === 'ar' ? 'العمر:' : 'Age:'} ${patientInfo.age}` : '',
        patientInfo.weight ? `${language === 'ar' ? 'الوزن:' : 'Weight:'} ${patientInfo.weight} kg` : '',
        patientInfo.allergies ? `${language === 'ar' ? 'الحساسية:' : 'Allergies:'} ${patientInfo.allergies}` : '',
        patientInfo.healthCondition ? `${language === 'ar' ? 'الحالة الصحية:' : 'Health condition:'} ${patientInfo.healthCondition}` : ''
      ].filter(Boolean).join(', ');
      
      let prompt = "";
      if (language === 'ar') {
        prompt = `تحقق من التفاعلات المحتملة بين هذه الأدوية: ${medicationNames.join(', ')}${patientContext ? `. معلومات المريض: ${patientContext}` : ''}. قم بتقييم مناسبة الأدوية للعمر المقدم إن وجد. أضف الأسماء التجارية للأدوية البديلة المقترحة. الرجاء الرد بتنسيق JSON بالهيكل التالي: { "hasInteractions": boolean, "interactions": ["شرح تفصيلي لكل تفاعل باللغة العربية"], "alternatives": ["بدائل مقترحة مع الأسماء التجارية لكل دواء مشكل باللغة العربية"], "ageWarnings": ["تحذيرات متعلقة بالعمر إن وجدت"] }. إذا لم تكن هناك تفاعلات، قم بإرجاع { "hasInteractions": false }.`;
      } else {
        prompt = `Check for potential interactions between these medications: ${medicationNames.join(', ')}${patientContext ? `. Patient information: ${patientContext}` : ''}. Evaluate the age-appropriateness of the medications if age is provided. Include brand names for suggested alternatives. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives with brand names for each problematic medication"], "ageWarnings": ["age-related warnings if any"] }. If there are no interactions, return { "hasInteractions": false }.`;
      }
      
      let systemMessage = language === 'ar' 
        ? 'أنت مساعد صحي مفيد متخصص في تفاعلات الأدوية. يرجى تقديم الإجابات باللغة العربية وتضمين الأسماء التجارية للأدوية البديلة وتحذيرات متعلقة بالعمر.'
        : 'You are a helpful healthcare assistant specializing in medication interactions. Include brand names for alternatives and age-related warnings.';
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiSettings.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Error checking interactions');
      }
      
      let parsedResult: InteractionResult;
      try {
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('No response from AI');
        
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        parsedResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        parsedResult = {
          hasInteractions: false
        };
      }
      
      setResult(parsedResult);
    } catch (error) {
      console.error('Error checking interactions:', error);
      setApiKeyError(true);
      toast({
        title: t('error'),
        description: language === 'ar' 
          ? 'حدث خطأ أثناء التحقق من التفاعلات. استخدام بيانات تجريبية بدلاً من ذلك.' 
          : 'Error checking interactions. Using mock data instead.',
        variant: "destructive"
      });
      
      setTimeout(() => {
        setResult({
          hasInteractions: false
        });
        setLoading(false);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full px-4 ${isMobile ? 'max-w-full' : 'max-w-5xl'} mx-auto ${dir === 'rtl' ? 'text-right' : 'text-left'} bg-transparent flex flex-col items-center justify-center`} dir={dir}>
      <Advertisement />
      
      <h1 className="text-2xl sm:text-3xl font-bold text-center my-6 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
        {language === 'ar' ? 'آداة سريعة للتحقق من التفاعلات الدوائية' : 'Quick Medication Interaction Checker'}
      </h1>
      
      <div className="w-full bg-transparent mt-8">
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
                <div key={med.id} className="flex items-center gap-2 group transition duration-200 animate-in fade-in">
                  <div className="flex-1 transition-all duration-200">
                    <Input 
                      value={med.name} 
                      onChange={(e) => updateMedication(med.id, e.target.value)} 
                      placeholder={`${t('medication')} ${index + 1}`}
                      className="border border-gray-200 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 text-gray-700"
                      dir={dir}
                    />
                  </div>
                  {medications.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeMedication(med.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addMedication} 
                className="w-full group hover:bg-primary/5 hover:text-primary transition-colors text-gray-600"
              >
                <Plus className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} />
                {t('addMedication')}
              </Button>

              <div className={`mt-6 pt-4 pb-3 border-t border-gray-100 bg-gray-50/50 rounded-md ${isMobile ? 'px-2' : 'px-3'}`}>
                <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700">
                  <User className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4 text-primary/70`} />
                  {t('patientInfo')}
                </h3>
                
                <div className={`${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} grid`}>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <User className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                      {t('age')}
                    </div>
                    <Input 
                      value={patientInfo.age} 
                      onChange={(e) => handlePatientInfo('age', e.target.value)} 
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
                      onChange={(e) => handlePatientInfo('weight', e.target.value)} 
                      placeholder={t('selectWeight')}
                      type="number"
                      className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
                      dir={dir}
                    />
                  </div>
                </div>
                
                <div className={`${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-3'} grid mt-2`}>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <ActivitySquare className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                      {t('allergies')}
                    </div>
                    <Input 
                      value={patientInfo.allergies} 
                      onChange={(e) => handlePatientInfo('allergies', e.target.value)} 
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
                      onChange={(e) => handlePatientInfo('healthCondition', e.target.value)}
                      placeholder={t('enterHealthCondition')}
                      className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs text-gray-700"
                      dir={dir}
                    />
                  </div>
                </div>
              </div>
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
              onClick={checkInteractions} 
              disabled={loading || medications.filter(m => m.name.trim() !== '').length < 2}
              className={`${isMobile ? 'w-full mt-2' : 'w-full'} bg-primary hover:bg-primary/90 transition-colors`}
            >
              {loading ? t('loading') : t('checkInteractions')}
            </Button>
          </CardFooter>
        </Card>
        
        {result && (
          <Card className="animate-fade-in shadow-lg transition-all duration-300 w-full border-0">
            <CardHeader className={result.hasInteractions ? "bg-red-50 rounded-t-lg" : "bg-green-50 rounded-t-lg"}>
              <CardTitle className="flex items-center">
                {result.hasInteractions ? (
                  <>
                    <ActivitySquare className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5 text-red-500`} />
                    <span className="text-red-700">{t('results')}</span>
                  </>
                ) : (
                  <>
                    <Heart className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5 text-green-500`} />
                    <span className="text-green-700">{t('results')}</span>
                  </>
                )}
              </CardTitle>
              <div className="flex items-center justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyResults}
                  className="bg-white/70 hover:bg-white/90 border-gray-200 text-gray-600"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <Copy className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  )}
                  <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={printResults}
                  className="bg-white/70 hover:bg-white/90 border-gray-200 text-gray-600"
                >
                  <Printer className={`h-4 w-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
                </Button>
              </div>
              {apiKeyError && (
                <div className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1 text-yellow-300" />
                  {language === 'ar' 
                    ? 'ملاحظة: النتائج أدناه تستند إلى بيانات تجريبية للتوضيح فقط.'
                    : 'Note: Results below are based on demo data for illustration only.'}
                </div>
              )}
            </CardHeader>
            <CardContent className={`pt-6 ${isMobile ? 'px-3' : 'px-6'}`} ref={resultRef}>
              {!result.hasInteractions ? (
                <p className="text-green-700 font-medium">{t('noInteractions')}</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-red-700">{t('interactionsFound')}</h3>
                    <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                      {result.interactions?.map((interaction, i) => (
                        <li key={i} className="mb-2 text-sm">{interaction}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {result.ageWarnings && result.ageWarnings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-amber-700">{t('ageWarnings')}</h3>
                      <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                        {result.ageWarnings.map((warning, i) => (
                          <li key={i} className="mb-2 text-sm">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.alternatives && result.alternatives.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-blue-700">{t('alternatives')}</h3>
                      <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                        {result.alternatives.map((alternative, i) => (
                          <li key={i} className="mb-2 text-sm">{alternative}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Alert className="mt-6 bg-amber-50 border border-amber-300 text-amber-800 shadow-sm">
                    <AlertTriangle className="h-4 w-4 inline-block mr-2 text-amber-500" />
                    <AlertDescription className="text-xs">{t('disclaimer')}</AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MedicationInteractionChecker;
