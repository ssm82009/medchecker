
import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Medication, PatientInfo, InteractionResult } from '@/types/medication';
import { useAuth } from './useAuth';
import { AISettingsType } from '@/types/medication';
import { MOCK_INTERACTIONS, MOCK_INTERACTIONS_EN } from '@/data/mockInteractions';
import { useTranslation } from './useTranslation';

// Hook to check medication interactions
export const useInteractionChecker = () => {
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<AISettingsType | null>(null);
  const { user } = useAuth();
  const { language } = useTranslation();

  // الحصول على إعدادات الذكاء الاصطناعي عند تحميل المكون
  useEffect(() => {
    const getAISettings = async () => {
      try {
        console.log('Fetching AI settings from database...');
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'ai_settings')
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching AI settings:', error);
          setApiKeyError(true);
          return;
        }
        
        if (data?.value && typeof data.value === 'object') {
          const settings = data.value as Record<string, Json>;
          const apiKey = settings.apiKey as string;
          const model = settings.model as string || 'gpt-4o-mini';
          
          console.log('AI model found in database:', model);
          
          if (apiKey) {
            console.log('API key found in database');
            setAiSettings({ apiKey, model });
            setApiKeyError(false);
          } else {
            console.error('No API Key found in settings');
            setApiKeyError(true);
          }
        } else {
          console.error('Invalid AI settings format or no settings found');
          setApiKeyError(true);
        }
      } catch (error) {
        console.error('Error in getAISettings:', error);
        setApiKeyError(true);
      }
    };
    
    getAISettings();
  }, []);

  // Function to check for medication interactions using OpenAI
  const checkInteractions = async (medications: Medication[], patientInfo: PatientInfo) => {
    setLoading(true);
    
    try {
      // التحقق من وجود مفتاح API للذكاء الاصطناعي
      if (!aiSettings?.apiKey) {
        console.error('No OpenAI API key available');
        setApiKeyError(true);
        
        // استخدام بيانات وهمية للعرض التوضيحي
        const mockKey = medications.map(m => m.name.toLowerCase()).join('+');
        const mockResult = getMockResult(mockKey, medications.length, patientInfo);
        
        setResult(mockResult);
        
        // حفظ سجل البحث إذا كان المستخدم قد سجل دخوله
        if (user) {
          await saveSearchHistory(user.id, 
            medications.map(m => m.name).join(', '), 
            mockResult);
        }
        
        setLoading(false);
        return;
      }
      
      // تجهيز البيانات للإرسال إلى OpenAI
      const medicationNames = medications
        .filter(med => med.name.trim() !== '')
        .map(med => med.name);
      
      if (medicationNames.length < 2) {
        setApiKeyError(false);
        setResult({
          hasInteractions: false,
          interactions: [],
          alternatives: [],
          ageWarnings: []
        });
        setLoading(false);
        return;
      }
      
      // تجهيز النص للإرسال إلى OpenAI
      const prompt = `
      أنت خبير صيدلاني متخصص في تفاعلات الأدوية. 
      قم بتحليل التفاعلات المحتملة بين الأدوية التالية:
      ${medicationNames.join(', ')}
      
      معلومات المريض:
      العمر: ${patientInfo.age || 'غير محدد'}
      الوزن: ${patientInfo.weight || 'غير محدد'} كج
      الحساسية: ${patientInfo.allergies || 'لا يوجد'}
      الحالة الصحية: ${patientInfo.healthCondition || 'غير محددة'}
      
      أريد النتائج بالتنسيق التالي:
      1. هل توجد تفاعلات (نعم/لا)
      2. قائمة التفاعلات المحتملة (إن وجدت)
      3. البدائل الممكنة (إن وجدت)
      4. تحذيرات مرتبطة بالعمر (إن وجدت)
      
      أجب بصيغة JSON فقط بالشكل التالي:
      {
        "hasInteractions": boolean,
        "interactions": string[],
        "alternatives": string[],
        "ageWarnings": string[]
      }
      `;
      
      try {
        console.log('Sending request to OpenAI with model:', aiSettings.model);
        
        // محاولة الاتصال بـ OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiSettings.apiKey}`
          },
          body: JSON.stringify({
            model: aiSettings.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API Error:', errorData);
          throw new Error(`OpenAI API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        const resultText = data.choices[0].message.content;
        
        // استخراج JSON من النص
        const jsonStartIndex = resultText.indexOf('{');
        const jsonEndIndex = resultText.lastIndexOf('}') + 1;
        const jsonText = resultText.substring(jsonStartIndex, jsonEndIndex);
        
        // تحويل النص إلى كائن JSON
        const aiResult: InteractionResult = JSON.parse(jsonText);
        
        console.log('AI result:', aiResult);
        
        // ضبط النتيجة والخطأ
        setResult(aiResult);
        setApiKeyError(false);
        
        // حفظ سجل البحث إذا كان المستخدم قد سجل دخوله
        if (user) {
          await saveSearchHistory(user.id, medicationNames.join(', '), aiResult);
        }
      } catch (error) {
        console.error('Error with OpenAI API:', error);
        setApiKeyError(true);
        
        // استخدام بيانات وهمية في حالة الخطأ
        const mockKey = medications.map(m => m.name.toLowerCase()).join('+');
        const mockResult = getMockResult(mockKey, medications.length, patientInfo);
        
        setResult(mockResult);
        
        // حفظ سجل البحث في حالة الخطأ أيضًا
        if (user) {
          await saveSearchHistory(user.id, 
            medications.map(m => m.name).join(', '), 
            mockResult);
        }
      }
      
    } catch (error) {
      console.error("Error checking interactions:", error);
      setApiKeyError(true);
      
      // إعداد نتيجة احتياطية في حالة الخطأ
      setResult({
        hasInteractions: false,
        interactions: [],
        alternatives: [],
        ageWarnings: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to get mock results based on medication names or count
  const getMockResult = (mockKey: string, medicationsCount: number, patientInfo: PatientInfo): InteractionResult => {
    const mockDb = language === 'ar' ? MOCK_INTERACTIONS : MOCK_INTERACTIONS_EN;
    
    // Try to match by key first
    if (mockDb[mockKey]) {
      return mockDb[mockKey];
    }
    
    // If no exact match, return a result based on medication count
    return {
      hasInteractions: medicationsCount > 2,
      interactions: medicationsCount > 2 ? [
        language === 'ar' ? 
          "تفاعل محتمل بين الدواء الأول والدواء الثاني" : 
          "Potential interaction between first and second medication",
        language === 'ar' ? 
          "قد يقلل الدواء الثالث من فعالية الدواء الأول" : 
          "Third medication may reduce efficacy of first medication"
      ] : [],
      alternatives: medicationsCount > 2 ? [
        language === 'ar' ? 
          "قد يكون الدواء الرابع بديلاً أفضل عن الدواء الثاني" : 
          "Fourth medication may be a better alternative to the second medication",
        language === 'ar' ? 
          "الدواء الخامس يمكن أن يكون بديلاً أكثر أماناً عن الدواء الثالث" : 
          "Fifth medication can be a safer alternative to the third medication"
      ] : [],
      ageWarnings: patientInfo.age && parseInt(patientInfo.age) > 65 ? [
        language === 'ar' ? 
          "يجب استخدام جرعة مخفضة من هذه الأدوية للمرضى المسنين" : 
          "Reduced dosage of these medications should be used for elderly patients",
        language === 'ar' ? 
          "راقب الآثار الجانبية بشكل متكرر أكثر في المرضى المسنين" : 
          "Monitor side effects more frequently in elderly patients"
      ] : []
    };
  };

  // Save search history to Supabase
  const saveSearchHistory = async (userId: string, query: string, interactionResult: any) => {
    try {
      // Use double type assertion through unknown to avoid type issues
      const parsedResult = interactionResult;
      const searchRecord = {
        user_id: userId,
        search_query: query,
        search_results: parsedResult as unknown as Json
      };

      // Insert the record into search_history table
      const { error: insertError } = await supabase
        .from('search_history')
        .insert(searchRecord);
      
      if (insertError) {
        console.error("Error saving search history:", insertError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in saveSearchHistory:", error);
      return false;
    }
  };

  return {
    result,
    loading,
    apiKeyError,
    checkInteractions,
    saveSearchHistory
  };
};
