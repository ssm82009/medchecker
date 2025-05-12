
import { Json } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';

// تعريف hook لفحص التفاعلات الدوائية
export const useInteractionChecker = () => {
  // هنا يمكن تعريف وظائف التحقق من التفاعلات

  // عند التخزين في تاريخ البحث، نحتاج إلى تحويل النوع بأمان
  const saveSearchHistory = async (userId: string, query: string, interactionResult: any) => {
    // نستخدم تحويل مزدوج من خلال unknown لتجنب خطأ التحويل
    const parsedResult = interactionResult;
    const searchRecord = {
      user_id: userId,
      search_query: query,
      search_results: parsedResult as unknown as Json
    };

    // ثم نقوم بإدراج السجل في جدول search_history
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
    saveSearchHistory
    // يمكن إضافة وظائف أخرى هنا
  };
};
