
import { usePaypalSettingsFetch } from './usePaypalSettingsFetch';
import { usePlansFetch } from './usePlansFetch';

export const usePaymentData = () => {
  // Use the smaller, focused hooks
  const { paypalSettings, paypalReady, loading: paypalLoading } = usePaypalSettingsFetch();
  const { plans, loading: plansLoading } = usePlansFetch();

  // Combine the loading states
  const loading = paypalLoading || plansLoading;

  return {
    paypalSettings,
    plans,
    loading,
    paypalReady
  };
};
