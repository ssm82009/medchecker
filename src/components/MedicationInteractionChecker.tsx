
import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Heart, Pill, Stethoscope, Baby, Weight, Activity } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Advertisement from './Advertisement';

interface Medication {
  id: string;
  name: string;
}

interface InteractionResult {
  hasInteractions: boolean;
  interactions?: string[];
  alternatives?: string[];
}

interface PatientInfo {
  age: string;
  weight: string;
  allergies: string;
  healthCondition: string;
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
  const [apiSettings] = useLocalStorage<{ apiKey: string; model: string }>('aiSettings', { apiKey: '', model: 'gpt-4o-mini' });

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
  
  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const checkInteractions = async () => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const medicationNames = validMedications.map(med => med.name);
      
      // Create patient context string including new fields
      const patientContext = [
        patientInfo.age ? `${language === 'ar' ? 'العمر:' : 'Age:'} ${patientInfo.age}` : '',
        patientInfo.weight ? `${language === 'ar' ? 'الوزن:' : 'Weight:'} ${patientInfo.weight} kg` : '',
        patientInfo.allergies ? `${language === 'ar' ? 'الحساسية:' : 'Allergies:'} ${patientInfo.allergies}` : '',
        patientInfo.healthCondition ? `${language === 'ar' ? 'الحالة الصحية:' : 'Health condition:'} ${patientInfo.healthCondition}` : ''
      ].filter(Boolean).join(', ');
      
      // منطق مختلف حسب اللغة المحددة
      let prompt = "";
      if (language === 'ar') {
        prompt = `تحقق من التفاعلات المحتملة بين هذه الأدوية: ${medicationNames.join(', ')}${patientContext ? `. معلومات المريض: ${patientContext}` : ''}. الرجاء الرد بتنسيق JSON بالهيكل التالي: { "hasInteractions": boolean, "interactions": ["شرح تفصيلي لكل تفاعل باللغة العربية"], "alternatives": ["بدائل مقترحة لكل دواء مشكل باللغة العربية"] }. إذا لم تكن هناك تفاعلات، قم بإرجاع { "hasInteractions": false }.`;
      } else {
        prompt = `Check for potential interactions between these medications: ${medicationNames.join(', ')}${patientContext ? `. Patient information: ${patientContext}` : ''}. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives for each problematic medication"] }. If there are no interactions, return { "hasInteractions": false }.`;
      }
      
      // تعيين لغة النظام بناءً على لغة الواجهة
      let systemMessage = language === 'ar' 
        ? 'أنت مساعد صحي مفيد متخصص في تفاعلات الأدوية. يرجى تقديم الإجابات باللغة العربية.'
        : 'You are a helpful healthcare assistant specializing in medication interactions.';
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiSettings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: apiSettings.model,
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
        
        // Extract JSON if it's wrapped in markdown
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        
        parsedResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback to basic response
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

  // Generate weight options from 1 to 150 kg
  const weightOptions = Array.from({ length: 150 }, (_, i) => (i + 1).toString());

  return (
    <div className={`w-full max-w-4xl mx-auto p-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={dir}>
      <Advertisement />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Medications Card */}
        <Card className="md:col-span-2 shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center text-primary">
              <Pill className="mr-2 h-5 w-5" />
              {t('appTitle')}
            </CardTitle>
            <CardDescription>{t('enterMedication')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {medications.map((med, index) => (
              <div key={med.id} className="flex items-center gap-2 group">
                <div className="flex-1 transition-all duration-200 hover:scale-102">
                  <Input 
                    value={med.name} 
                    onChange={(e) => updateMedication(med.id, e.target.value)} 
                    placeholder={`${t('medication')} ${index + 1}`}
                    className="border-primary/20 focus:border-primary/60"
                  />
                </div>
                {medications.length > 2 && (
                  <Button variant="ghost" size="icon" onClick={() => removeMedication(med.id)} 
                    className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button variant="outline" onClick={addMedication} className="w-full group hover:bg-primary/5 hover:text-primary transition-colors">
              <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              {t('addMedication')}
            </Button>
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
        
        {/* Patient Info Card */}
        <Card className="shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="bg-secondary/5 rounded-t-lg">
            <CardTitle className="flex items-center text-secondary">
              <Baby className="mr-2 h-5 w-5" />
              {t('patientInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('age')}</label>
              <Input 
                value={patientInfo.age} 
                onChange={(e) => handlePatientInfoChange('age', e.target.value)} 
                placeholder={t('enterAge')}
                type="number"
                className="border-secondary/20 focus:border-secondary/60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('weight')}</label>
              <Select 
                value={patientInfo.weight}
                onValueChange={(value) => handlePatientInfoChange('weight', value)}
              >
                <SelectTrigger className="border-secondary/20 focus:border-secondary/60">
                  <SelectValue placeholder={t('selectWeight')} />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {weightOptions.map((weight) => (
                    <SelectItem key={weight} value={weight}>
                      {weight} kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('allergies')}</label>
              <Input 
                value={patientInfo.allergies} 
                onChange={(e) => handlePatientInfoChange('allergies', e.target.value)} 
                placeholder={t('enterAllergies')}
                className="border-secondary/20 focus:border-secondary/60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('healthCondition')}</label>
              <Textarea 
                value={patientInfo.healthCondition}
                onChange={(e) => handlePatientInfoChange('healthCondition', e.target.value)}
                placeholder={t('enterHealthCondition')}
                className="w-full border-secondary/20 focus:border-secondary/60"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Results Card */}
      {result && (
        <Card className="animate-fade-in shadow-lg transition-all duration-300">
          <CardHeader className={result.hasInteractions ? "bg-red-50 rounded-t-lg" : "bg-green-50 rounded-t-lg"}>
            <CardTitle className="flex items-center">
              {result.hasInteractions ? (
                <>
                  <Activity className="mr-2 h-5 w-5 text-red-500" />
                  <span className="text-red-700">{t('results')}</span>
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5 text-green-500" />
                  <span className="text-green-700">{t('results')}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!result.hasInteractions ? (
              <p className="text-green-600 font-medium">{t('noInteractions')}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-red-700">{t('interactionsFound')}</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {result.interactions?.map((interaction, i) => (
                      <li key={i} className="mb-2">{interaction}</li>
                    ))}
                  </ul>
                </div>
                
                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-700">{t('alternativeSuggestion')}</h3>
                    <ul className="list-disc pl-5 space-y-2">
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
