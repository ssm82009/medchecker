
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Heart, Pill, User, Weight, ActivitySquare } from 'lucide-react';
import Advertisement from './Advertisement';

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

const MedicationInteractionChecker: React.FC = () => {
  const { t, dir, language } = useTranslation();
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

  const checkInteractions = async () => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const medicationNames = validMedications.map(med => med.name);
      
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
          'Authorization': `Bearer ${localStorage.getItem('apiKey') || ''}`,
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
      setResult({
        hasInteractions: false
      });
    } finally {
      setLoading(false);
    }
  };

  const weightOptions = Array.from({ length: 150 }, (_, i) => (i + 1).toString());

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <Advertisement />
      
      <Card className="shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-slate-50 mb-6">
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

            {/* Compact Patient Information Section with improved styling */}
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
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm"
                    dir={dir}
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Weight className={`${dir === 'rtl' ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                    {t('weight')}
                  </div>
                  <Select 
                    value={patientInfo.weight}
                    onValueChange={(value) => handlePatientInfo('weight', value)}
                  >
                    <SelectTrigger className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm" dir={dir}>
                      <SelectValue placeholder={t('selectWeight')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto" dir={dir}>
                      {weightOptions.map((weight) => (
                        <SelectItem key={weight} value={weight}>
                          {weight} kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm"
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
                    className="border border-gray-200 focus:border-secondary/60 focus:ring-1 focus:ring-secondary/20 h-8 text-sm"
                    dir={dir}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
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
        <Card className="animate-fade-in shadow-lg transition-all duration-300">
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
