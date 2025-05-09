
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from './useTranslation';
import { Medication, PatientInfo, InteractionResult } from '@/types/medication';

interface InteractionConfig {
  enabled: boolean;
  interval: number;
  url: string;
}

export const useInteractionChecker = (config?: InteractionConfig) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);

  useEffect(() => {
    if (!config || !config.enabled) {
      return;
    }

    const checkInteraction = async () => {
      try {
        const response = await fetch(config.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data !== 'object' || !('status' in data)) {
          toast({
            title: t('error'),
            description: t('invalidResponseFormat'),
            variant: 'destructive',
          });
          return;
        }

        if (data.status === 'error') {
          toast({
            title: t('error'),
            description: data.message || t('errorOccurred'),
            variant: 'destructive',
          });
        } else if (data.status === 'warning') {
          toast({
            title: t('warning'),
            description: data.message || t('warningOccurred'),
            variant: 'default',
          });
        } else if (data.status === 'info') {
          toast({
            title: t('info'),
            description: data.message || t('informationUpdate'),
          });
        }
      } catch (error: any) {
        console.error('Interaction check failed:', error);
        toast({
          title: t('error'),
          description: error.message || t('failedToCheckInteraction'),
          variant: 'destructive',
        });
      }
    };

    const intervalId = setInterval(checkInteraction, config.interval);

    // Initial check
    checkInteraction();

    return () => clearInterval(intervalId);
  }, [config?.enabled, config?.interval, config?.url, toast, t]);

  const checkInteractions = async (medications: Medication[], patientInfo: PatientInfo) => {
    setLoading(true);
    try {
      // Here would be the actual API call to check interactions
      // For now, we'll simulate this with a timeout
      
      // Example check for API key error
      const hasApiKey = false; // Simulate no API key available
      setApiKeyError(!hasApiKey);
      
      // Mock result
      setTimeout(() => {
        const mockResult: InteractionResult = {
          hasInteractions: medications.length > 2,
          interactions: medications.length > 2 ? ['Potential interaction between medications'] : [],
          alternatives: medications.length > 2 ? ['Alternative medication suggestions'] : [],
          ageWarnings: patientInfo.age ? ['Age-specific warning for these medications'] : [],
        };
        
        setResult(mockResult);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to check interactions:', error);
      setLoading(false);
      toast({
        title: t('error'),
        description: t('failedToCheckInteraction'),
        variant: 'destructive',
      });
    }
  };

  return { result, loading, apiKeyError, checkInteractions };
};
