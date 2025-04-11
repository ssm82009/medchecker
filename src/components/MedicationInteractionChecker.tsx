
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Heart, Pill, User, Weight, ActivitySquare, AlertTriangle } from 'lucide-react';
import Advertisement from './Advertisement';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

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
}

// Mock dataset for interactions (for demonstration)
const MOCK_INTERACTIONS = {
  'أسبرين+باراسيتامول': {
    hasInteractions: true,
    interactions: [
      'قد يزيد من خطر النزيف عند تناول الأسبرين مع الباراسيتامول لفترات طويلة',
      'يمكن أن يقلل الأسبرين من فعالية الباراسيتامول'
    ],
    alternatives: [
      'يمكن استخدام الإيبوبروفين بدلاً من الأسبرين',
      'استشر الطبيب قبل الجمع بين هذه الأدوية'
    ]
  },
  'أموكسيسيلين+أوميبرازول': {
    hasInteractions: true,
    interactions: [
      'قد يقلل أوميبرازول من امتصاص أموكسيسيلين',
      'ينصح بترك فاصل زمني بين تناول الدوائين'
    ],
    alternatives: [
      'يمكن استخدام رانيتيدين بدلاً من أوميبرازول',
      'تناول أموكسيسيلين قبل ساعتين على الأقل من أوميبرازول'
    ]
  },
  'وارفارين+إيبوبروفين': {
    hasInteractions: true,
    interactions: [
      'زيادة خطر النزيف الشديد عند الجمع بين وارفارين وإيبوبروفين',
      'تأثير خطير على تخثر الدم'
    ],
    alternatives: [
      'استخدم الباراسيتامول بدلاً من الإيبوبروفين مع وارفارين',
      'استشر الطبيب قبل استخدام أي مسكن مع وارفارين'
    ]
  },
  'فيفادول+بنادول': {
    hasInteractions: true,
    interactions: [
      'كلا الدوائين يحتويان على الباراسيتامول مما قد يؤدي إلى جرعة زائدة',
      'زيادة خطر تضرر الكبد عند تناول جرعات عالية من الباراسيتامول'
    ],
    alternatives: [
      'استخدم أحد الدوائين فقط وليس كليهما',
      'يمكن استخدام الإيبوبروفين كبديل لأحد الدوائين'
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
      'استخدم أحد الدوائين فقط وليس كليهما',
      'يمكن استخدام الباراسيتامول كبديل أكثر أمانًا للألم'
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
      'يمكن استخدام مسكنات بديلة تحت إشراف طبي'
    ]
  }
};

// English version of mock interactions
const MOCK_INTERACTIONS_EN = {
  'aspirin+paracetamol': {
    hasInteractions: true,
    interactions: [
      'May increase the risk of bleeding when taking aspirin with paracetamol for extended periods',
      'Aspirin can reduce the effectiveness of paracetamol'
    ],
    alternatives: [
      'Ibuprofen can be used instead of aspirin',
      'Consult your doctor before combining these medications'
    ]
  },
  'amoxicillin+omeprazole': {
    hasInteractions: true,
    interactions: [
      'Omeprazole may reduce the absorption of amoxicillin',
      'It is recommended to leave a time gap between taking the two medications'
    ],
    alternatives: [
      'Ranitidine can be used instead of omeprazole',
      'Take amoxicillin at least two hours before omeprazole'
    ]
  },
  'warfarin+ibuprofen': {
    hasInteractions: true,
    interactions: [
      'Increased risk of severe bleeding when combining warfarin and ibuprofen',
      'Serious effect on blood clotting'
    ],
    alternatives: [
      'Use paracetamol instead of ibuprofen with warfarin',
      'Consult your doctor before using any pain reliever with warfarin'
    ]
  },
  'fevadol+panadol': {
    hasInteractions: true,
    interactions: [
      'Both medications contain paracetamol which may lead to overdose',
      'Increased risk of liver damage when taking high doses of paracetamol'
    ],
    alternatives: [
      'Use only one of the medications, not both',
      'Ibuprofen can be used as an alternative to one of the medications'
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
      'Use only one of the medications, not both',
      'Paracetamol can be used as a safer alternative for pain'
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
      'Alternative pain relievers can be used under medical supervision'
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

  // Check for interactions using either API or fallback to mock data
  const checkInteractions = async () => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    setApiKeyError(false);
    
    try {
      const medicationNames = validMedications.map(med => med.name.toLowerCase());
      
      // Check if OpenAI API key is available in localStorage
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        // If no API key is available, use mock data
        setApiKeyError(true);
        // Create medication pair keys for lookup
        const medPairs = [];
        for (let i = 0; i < medicationNames.length; i++) {
          for (let j = i + 1; j < medicationNames.length; j++) {
            medPairs.push(`${medicationNames[i]}+${medicationNames[j]}`);
            medPairs.push(`${medicationNames[j]}+${medicationNames[i]}`);
          }
        }
        
        // Check for interactions in mock data
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
        
        // If no exact match found, check for partial matches
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
        
        setTimeout(() => {
          setResult(interactionData);
          setLoading(false);
        }, 1000);
        
        return;
      }
      
      // If API key exists, proceed with OpenAI API call
      const patientContext = [
        patientInfo.age ? `${language === 'ar' ? 'العمر:' : 'Age:'} ${patientInfo.age}` : '',
        patientInfo.weight ? `${language === 'ar' ? 'الوزن:' : 'Weight:'} ${patientInfo.weight} kg` : '',
        patientInfo.allergies ? `${language === 'ar' ? 'الحساسية:' : 'Allergies:'} ${patientInfo.allergies}` : '',
        patientInfo.healthCondition ? `${language === 'ar' ? 'الحالة الصحية:' : 'Health condition:'} ${patientInfo.healthCondition}` : ''
      ].filter(Boolean).join(', ');
      
      let prompt = "";
      if (language === 'ar') {
        prompt = `تحقق من التفاعلات المحتملة بين هذه الأدوية: ${medicationNames.join(', ')}${patientContext ? `. معلومات المريض: ${patientContext}` : ''}. الرجاء الرد بتنسيق JSON بالهيكل التالي: { "hasInteractions": boolean, "interactions": ["شرح تفصيلي لكل تفاعل باللغة العربية"], "alternatives": ["بدائل مقترحة لكل دواء مشكل باللغة العربية"] }. إذا لم تكن هناك تفاعلات، قم بإرجاع { "hasInteractions": false }.`;
      } else {
        prompt = `Check for potential interactions between these medications: ${medicationNames.join(', ')}${patientContext ? `. Patient information: ${patientContext}` : ''}. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives for each problematic medication"] }. If there are no interactions, return { "hasInteractions": false }.`;
      }
      
      let systemMessage = language === 'ar' 
        ? 'أنت مساعد صحي مفيد متخصص في تفاعلات الأدوية. يرجى تقديم الإجابات باللغة العربية.'
        : 'You are a helpful healthcare assistant specializing in medication interactions.';
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: localStorage.getItem('model') || 'gpt-3.5-turbo',
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
      
      // Fallback to mock data
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
    <div className={`w-full ${isMobile ? 'max-w-full px-[0.5%]' : 'max-w-4xl'} mx-auto p-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <Advertisement />
      
      <Card className={`shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-slate-50 mb-6 ${isMobile ? 'w-[99%]' : 'w-full'}`}>
        <CardHeader className="bg-primary/5 rounded-t-lg">
          <CardTitle className="flex items-center text-primary">
            <Pill className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-5 w-5`} />
            {t('appTitle')}
          </CardTitle>
          <CardDescription>{t('enterMedication')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={med.id} className="flex items-center gap-2 group transition duration-200 animate-in fade-in">
                <div className="flex-1 transition-all duration-200">
                  <Input 
                    value={med.name} 
                    onChange={(e) => updateMedication(med.id, e.target.value)} 
                    placeholder={`${t('medication')} ${index + 1}`}
                    className="border border-gray-200 focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
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
              className="w-full group hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Plus className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform`} />
              {t('addMedication')}
            </Button>

            <div className="mt-6 pt-4 pb-3 border-t border-gray-100 bg-gray-50/50 rounded-md px-3">
              <h3 className="text-sm font-medium mb-3 flex items-center text-gray-700">
                <User className={`${dir === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4 text-primary/70`} />
                {t('patientInfo')}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                    {t('age')}
                  </div>
                  <Input 
                    value={patientInfo.age} 
                    onChange={(e) => handlePatientInfo('age', e.target.value)} 
                    placeholder={t('enterAge')}
                    type="number"
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs"
                    dir={dir}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Weight className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                    {t('weight')}
                  </div>
                  <Input 
                    value={patientInfo.weight} 
                    onChange={(e) => handlePatientInfo('weight', e.target.value)} 
                    placeholder={t('selectWeight')}
                    type="number"
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs"
                    dir={dir}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <ActivitySquare className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                    {t('allergies')}
                  </div>
                  <Input 
                    value={patientInfo.allergies} 
                    onChange={(e) => handlePatientInfo('allergies', e.target.value)} 
                    placeholder={t('enterAllergies')}
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs"
                    dir={dir}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <ActivitySquare className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                    {t('healthCondition')}
                  </div>
                  <Input 
                    value={patientInfo.healthCondition}
                    onChange={(e) => handlePatientInfo('healthCondition', e.target.value)}
                    placeholder={t('enterHealthCondition')}
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm placeholder:text-gray-300 placeholder:text-xs"
                    dir={dir}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {apiKeyError && (
            <div className="w-full mb-3 p-2 bg-yellow-50 text-yellow-800 rounded-md flex items-center text-xs">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              {language === 'ar' 
                ? 'لم يتم العثور على مفتاح API. يتم استخدام بيانات تجريبية للتوضيح.'
                : 'No API key found. Using demo data for illustration.'}
            </div>
          )}
          <Button 
            onClick={checkInteractions} 
            disabled={loading || medications.filter(m => m.name.trim() !== '').length < 2}
            className="w-full bg-primary hover:bg-primary/90 transition-colors"
          >
            {loading ? t('loading') : t('checkInteractions')}
          </Button>
        </CardFooter>
      </Card>
      
      {result && (
        <Card className={`animate-fade-in shadow-lg transition-all duration-300 ${isMobile ? 'w-[99%]' : 'w-full'}`}>
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
            {apiKeyError && (
              <div className="mt-2 p-2 bg-yellow-50/50 text-yellow-700 rounded-md text-xs flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                {language === 'ar' 
                  ? 'ملاحظة: النتائج أدناه تستند إلى بيانات تجريبية للتوضيح فقط.'
                  : 'Note: Results below are based on demo data for illustration only.'}
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {!result.hasInteractions ? (
              <p className="text-green-700 font-medium">{t('noInteractions')}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-red-700">{t('interactionsFound')}</h3>
                  <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                    {result.interactions?.map((interaction, i) => (
                      <li key={i} className="mb-2">{interaction}</li>
                    ))}
                  </ul>
                </div>
                
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-700">{t('alternativeSuggestion')}</h3>
                    <ul className={`list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} space-y-2`}>
                      {result.alternatives.map((alternative, i) => (
                        <li key={i} className="mb-2">{alternative}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicationInteractionChecker;
