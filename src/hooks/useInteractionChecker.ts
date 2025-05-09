
import { useEffect } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from './useTranslation';

interface InteractionConfig {
  enabled: boolean;
  interval: number;
  url: string;
}

export const useInteractionChecker = (config: InteractionConfig) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!config.enabled) {
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
            variant: 'warning',
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
  }, [config.enabled, config.interval, config.url, toast, t]);
};
