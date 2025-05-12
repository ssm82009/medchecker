
import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Medication, PatientInfo, InteractionResult } from '@/types/medication';
import { useAuth } from './useAuth';

// Hook to check medication interactions
export const useInteractionChecker = () => {
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  const { user } = useAuth();

  // Function to check for medication interactions
  const checkInteractions = async (medications: Medication[], patientInfo: PatientInfo) => {
    setLoading(true);
    
    try {
      // This would typically make an API call to a drug interaction service
      // For now, we'll use a mock response for demonstration
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response with interactions
      const mockResult: InteractionResult = {
        hasInteractions: medications.length > 2,
        interactions: medications.length > 2 ? [
          "Potential interaction between medication A and medication B",
          "Medication C may reduce the effectiveness of Medication A"
        ] : [],
        alternatives: medications.length > 2 ? [
          "Consider alternative medication D instead of medication B",
          "Medication E could be a safer alternative to Medication C"
        ] : [],
        ageWarnings: patientInfo.age && parseInt(patientInfo.age) > 65 ? [
          "Elderly patients should use reduced dosage of these medications",
          "Monitor for side effects more frequently in elderly patients"
        ] : []
      };
      
      setResult(mockResult);
      setApiKeyError(true); // Set to true to indicate we're using mock data
      
      // If user is logged in, save the search history
      if (user) {
        await saveSearchHistory(user.id, 
          medications.map(m => m.name).join(', '), 
          mockResult);
      }
      
    } catch (error) {
      console.error("Error checking interactions:", error);
      setApiKeyError(true);
      
      // Set a fallback result on error
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
