
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from './useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { Medication, PatientInfo, InteractionResult } from '@/types/medication';

interface AISettingsType {
  apiKey: string;
  model: string;
}

export const useInteractionChecker = () => {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiSettings, setApiSettings] = useState<AISettingsType>({ apiKey: '', model: 'gpt-4o-mini' });
  const [apiKeyError, setApiKeyError] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);

  const fetchAISettings = useCallback(async () => {
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
      
      if (data?.value) {
        const value = data.value as Record<string, Json>;
        if (typeof value === 'object' && !Array.isArray(value)) {
          setApiSettings({
            apiKey: String(value.apiKey || ''),
            model: String(value.model || 'gpt-4o-mini')
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchAISettings:', error);
    }
  }, []);

  const checkInteraction = useCallback(async (medications: string[], patientInfo: PatientInfo) => {
    setLoading(true);
    try {
      await fetchAISettings();
      
      if (!apiSettings.apiKey) {
        setApiKeyError(true);
        throw new Error('API key is not configured');
      }

      const medicationNames = medications.map(med => med.toLowerCase());
      
      const patientContext = [
        patientInfo.age ? `${t('age')}: ${patientInfo.age}` : '',
        patientInfo.weight ? `${t('weight')}: ${patientInfo.weight} kg` : '',
        patientInfo.allergies ? `${t('allergies')}: ${patientInfo.allergies}` : '',
        patientInfo.healthCondition ? `${t('healthCondition')}: ${patientInfo.healthCondition}` : ''
      ].filter(Boolean).join(', ');

      const prompt = language === 'ar'
        ? `حلّل التفاعلات بين الأدوية التالية: ${medicationNames.join(', ')}${patientContext ? `. معلومات المريض: ${patientContext}` : ''}, مع توضيح أي تشابه أو تكرار في المواد الفعالة قد يؤدي إلى جرعة زائدة، تأكد بدقة من أن كل عنصر مدخل هو دواء معروف أو مادة دوائية حقيقية فقط، تجاهل أو ارفض معالجة أي محتوى ساخر أو غذائي أو غير طبي مثل "برجر" أو "سلطة" أو أسماء ليست ضمن الأدوية المعترف بها، ثم قدم النتائج بلغة واضحة تتضمن مستوى الخطورة، بدائل آمنة إن وُجدت، الأسماء التجارية لكل دواء، وروابط أو مراجع طبية موثوقة مثل Mayo Clinic أو WebMD لدعم المعلومات. الرجاء الرد بتنسيق JSON بالهيكل التالي: { "hasInteractions": boolean, "interactions": ["شرح تفصيلي لكل تفاعل باللغة العربية"], "alternatives": ["بدائل مقترحة مع الأسماء التجارية لكل دواء مشكل باللغة العربية"], "ageWarnings": ["تحذيرات متعلقة بالعمر إن وجدت"] }. إذا لم تكن هناك تفاعلات، قم بإرجاع { "hasInteractions": false }.`
        : `Analyze the interactions between the following drugs: ${medicationNames.join(', ')}${patientContext ? `. Patient information: ${patientContext}` : ''}, highlight any overlapping or repeated active ingredients that may risk overdose, strictly ensure that each input is a recognized drug or pharmaceutical substance only, reject or ignore any humorous, non-medical, or food-related terms such as "burger" or "salad", and then return a clear summary including risk level, safer alternatives if applicable, brand names, and trusted medical references such as Mayo Clinic or WebMD. Please respond in JSON format with the following structure: { "hasInteractions": boolean, "interactions": ["detailed explanation of each interaction"], "alternatives": ["suggested alternatives with brand names for each problematic medication"], "ageWarnings": ["age-related warnings if any"] }. If there are no interactions, return { "hasInteractions": false }.`;

      const systemMessage = language === 'ar'
        ? 'أنت مساعد صحي مفيد متخصص في تفاعلات الأدوية. يرجى تقديم الإجابات باللغة العربية وتضمين الأسماء التجارية للأدوية البديلة وتحذيرات متعلقة بالعمر.'
        : 'You are a helpful healthcare assistant specializing in medication interactions. Include brand names for alternatives and age-related warnings.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`
        },
        body: JSON.stringify({
          model: apiSettings.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check interactions');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast({
        title: t('error'),
        description: t('contentFetchError'),
        variant: 'destructive',
        duration: 5000,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiSettings, fetchAISettings, t, language, toast]);

  const checkInteractions = async (medications: Medication[], patientInfo: PatientInfo) => {
    setLoading(true);
    try {
      const medicationNames = medications.filter(med => med.name.trim() !== '').map(med => med.name);
      const response = await checkInteraction(medicationNames, patientInfo);
      
      if (response) {
        try {
          const parsedResult = JSON.parse(response);
          setResult(parsedResult);
          return parsedResult;
        } catch (error) {
          console.error('Error parsing JSON from API:', error);
          setApiKeyError(true);
          toast({
            title: t('error'),
            description: t('invalidResponseFormat'),
            variant: 'destructive',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error in checkInteractions:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    checkInteraction,
    checkInteractions,
    apiKeyError,
    result,
    loading
  };
};
