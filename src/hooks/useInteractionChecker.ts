
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { AISettingsType, Medication, PatientInfo, InteractionResult, MedicationInput } from '@/types/medication';
import { MOCK_INTERACTIONS, MOCK_INTERACTIONS_EN } from '@/data/mockInteractions';
// import { useAuth } from '@/hooks/useAuth'; // isPremium is no longer used from here
import { useAuth } from '@/hooks/useAuth'; // Still need user for user.id

export const useInteractionChecker = () => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const [apiSettings, setApiSettings] = useLocalStorage<AISettingsType>('aiSettings', { apiKey: '', model: 'gpt-4o-mini' });
  const { user } = useAuth(); // Removed isPremium, only user for user.id is needed now for history recording
  const [localPatientInfo, setLocalPatientInfo] = useState<PatientInfo>({
    age: '',
    weight: '',
    allergies: '',
    healthCondition: ''
  });

  // Fetch API settings from Supabase
  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching AI settings:', error);
          return;
        }
        
        if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
          const jsonValue = data.value as Record<string, Json>;
          
          if ('apiKey' in jsonValue && 'model' in jsonValue) {
            const settings: AISettingsType = {
              apiKey: String(jsonValue.apiKey || ''),
              model: String(jsonValue.model || 'gpt-4o-mini')
            };
            
            localStorage.setItem('aiSettings', JSON.stringify(settings));
            setApiSettings(settings);
          }
        }
      } catch (error) {
        console.error('Error fetching AI settings:', error);
      }
    };
    
    fetchAISettings();
  }, []);

  const checkInteractions = async (medications: MedicationInput[], patientInfo?: PatientInfo, isUserPremium?: boolean) => {
    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length < 2) return;
    
    setLoading(true);
    setResult(null);
    setApiKeyError(false);
    
    // Update local patient info state if provided
    if (patientInfo) {
      setLocalPatientInfo(patientInfo);
    }
    
    try {
      const medicationNames = validMedications.map(med => med.name.toLowerCase());
      
      let apiKey = apiSettings.apiKey;
      
      if (!apiKey) {
        try {
          const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('type', 'ai_settings')
            .maybeSingle();
          
          if (!error && data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
            const jsonValue = data.value as Record<string, Json>;
            
            if ('apiKey' in jsonValue && 'model' in jsonValue) {
              const settings: AISettingsType = {
                apiKey: String(jsonValue.apiKey || ''),
                model: String(jsonValue.model || 'gpt-4o-mini')
              };
              
              apiKey = settings.apiKey;
              setApiSettings(settings);
            }
          }
        } catch (dbError) {
          console.error('Error fetching API key from database:', dbError);
        }
      }
      
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
        
        if (localPatientInfo.age && interactionData.ageWarnings) {
          const age = parseInt(localPatientInfo.age);
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
        localPatientInfo.age ? `${language === 'ar' ? 'العمر:' : 'Age:'} ${localPatientInfo.age}` : '',
        localPatientInfo.weight ? `${language === 'ar' ? 'الوزن:' : 'Weight:'} ${localPatientInfo.weight} kg` : '',
        localPatientInfo.allergies ? `${language === 'ar' ? 'الحساسية:' : 'Allergies:'} ${localPatientInfo.allergies}` : '',
        localPatientInfo.healthCondition ? `${language === 'ar' ? 'الحالة الصحية:' : 'Health condition:'} ${localPatientInfo.healthCondition}` : ''
      ].filter(Boolean).join(', ');
      
      let prompt = "";
      if (language === 'ar') {
        prompt = `حلّل التفاعلات بين الأدوية التالية: ${medicationNames.join(', ')}${patientContext ? `. معلومات المريض: ${patientContext}` : ''}, مع توضيح أي تشابه أو تكرار في المواد الفعالة قد يؤدي إلى جرعة زائدة، تأكد بدقة من أن كل عنصر مدخل هو دواء معروف أو مادة دوائية حقيقية فقط، تجاهل أو ارفض معالجة أي محتوى ساخر أو غذائي أو غير طبي مثل "برجر" أو "سلطة" أو أسماء ليست ضمن الأدوية المعترف بها، ثم قدم النتائج بلغة واضحة تتضمن مستوى الخطورة، بدائل آمنة إن وُجدت، الأسماء التجارية لكل دواء، وروابط أو مراجع طبية موثوقة مثل Mayo Clinic أو WebMD لدعم المعلومات. الرجاء الرد بتنسيق JSON بالهيكل التالي: { "hasInteractions": boolean, "interactions": ["شرح تفصيلي لكل تفاعل باللغة العربية"], "alternatives": ["بدائل مقترحة مع الأسماء التجارية لكل دواء مشكل باللغة العربية"], "ageWarnings": ["تحذيرات متعلقة بالعمر إن وجدت"] }. إذا لم تكن هناك تفاعلات، قم بإرجاع { "hasInteractions": false }.`;
      } else {
        prompt = `Analyze the interactions between the following drugs: ${medicationNames.join(', ')}${patientContext ? `. Patient information: ${patientContext}` : ''}, highlight any overlapping or repeated active ingredients that may risk overdose, strictly ensure that each input is a recognized drug or pharmaceutical substance only, reject or ignore any humorous, non-medical, or food-related terms such as "burger" or "salad", and then return a clear summary including risk level, safer alternatives if applicable, brand names, and trusted medical references such as Mayo Clinic or WebMD. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives with brand names for each problematic medication"], "ageWarnings": ["age-related warnings if any"] }. If there are no interactions, return { "hasInteractions": false }.`;
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
          model: apiSettings.model || 'gpt-4o-mini',
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
      
      // After successful check, store search history if user is premium
      if (user?.id && isUserPremium) { // Use the passed isUserPremium argument
        try {
          // Extract medication names for the search history
          const medicationNames = medications
            .filter(med => med.name && med.name.trim() !== '')
            .map(med => med.name);
          
          // Create a search history record with properly typed results
          // Convert InteractionResult to a JSON-compatible format for storage
          const searchData = {
            user_id: user.id,
            search_query: medicationNames.join(', '),
            // Properly convert to Json type using a double cast through 'unknown'
            search_results: parsedResult as unknown as Json
          };
          
          console.log('Recording search history with data:', searchData);
          
          const { data: historyData, error: historyError } = await supabase
            .from('search_history')
            .insert(searchData)
            .select();
          
          if (historyError) {
            console.error('Error recording search history:', historyError);
          } else {
            console.log('Search history recorded successfully:', historyData);
          }
        } catch (error) {
          console.error('Error recording search history:', error);
          // Don't fail the main operation if history recording fails
        }
      } else {
        console.log('Search history not recorded - user not premium or not logged in:', 
          { userId: user?.id, isUserPremiumPassed: isUserPremium }); // Log the passed value
      }
      
      setResult(parsedResult);
    } catch (error) {
      console.error('Error checking interactions:', error);
      setApiKeyError(true);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
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

  return {
    result,
    loading,
    apiKeyError,
    checkInteractions,
    setResult
  };
};
