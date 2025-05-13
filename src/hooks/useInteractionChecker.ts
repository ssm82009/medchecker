
import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Medication, PatientInfo, InteractionResult } from '@/types/medication';
import { useAuth } from './useAuth';
import { AISettingsType } from '@/types/medication';

// Hook to check medication interactions
export const useInteractionChecker = () => {
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<AISettingsType | null>(null);
  const { user } = useAuth();

  // الحصول على إعدادات الذكاء الاصطناعي عند تحميل المكون
  useEffect(() => {
    const getAISettings = async () => {
      try {
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
          
          console.log('AI model to use:', model);
          
          if (apiKey) {
            setAiSettings({ apiKey, model });
            setApiKeyError(false);
          } else {
            setApiKeyError(true);
            console.error('No API Key found in settings');
          }
        } else {
          setApiKeyError(true);
          console.error('Invalid AI settings format');
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
        const mockResult: InteractionResult = {
          hasInteractions: medications.length > 2,
          interactions: medications.length > 2 ? [
            "تفاعل محتمل بين الدواء الأول والدواء الثاني",
            "قد يقلل الدواء الثالث من فعالية الدواء الأول"
          ] : [],
          alternatives: medications.length > 2 ? [
            "قد يكون الدواء الرابع بديلاً أفضل عن الدواء الثاني",
            "الدواء الخامس يمكن أن يكون بديلاً أكثر أماناً عن الدواء الثالث"
          ] : [],
          ageWarnings: patientInfo.age && parseInt(patientInfo.age) > 65 ? [
            "يجب استخدام جرعة مخفضة من هذه الأدوية للمرضى المسنين",
            "راقب الآثار الجانبية بشكل متكرر أكثر في المرضى المسنين"
          ] : []
        };
        
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
        const mockResult: InteractionResult = {
          hasInteractions: medications.length > 2,
          interactions: medications.length > 2 ? [
            "تفاعل محتمل بين الدواء الأول والدواء الثاني",
            "قد يقلل الدواء الثالث من فعالية الدواء الأول"
          ] : [],
          alternatives: medications.length > 2 ? [
            "قد يكون الدواء الرابع بديلاً أفضل عن الدواء الثاني",
            "الدواء الخامس يمكن أن يكون بديلاً أكثر أماناً عن الدواء الثالث"
          ] : [],
          ageWarnings: patientInfo.age && parseInt(patientInfo.age) > 65 ? [
            "يجب استخدام جرعة مخفضة من هذه الأدوية للمرضى المسنين",
            "راقب الآثار الجانبية بشكل متكرر أكثر في المرضى المسنين"
          ] : []
        };
        
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

  // Save search history to Supabase
  const saveSearchHistory = async (userId: string, query: string, interactionResult: any) => {
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
  };

  return {
    result,
    loading,
    apiKeyError,
    checkInteractions,
    saveSearchHistory
  };
};
