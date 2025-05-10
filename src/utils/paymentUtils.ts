
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

/**
 * Records payment transaction in the database
 */
export const recordTransaction = async (
  userId: string, 
  price: number, 
  currency: string, 
  paymentType: 'one_time' | 'recurring', 
  planCode: string, 
  details: any,
  language: string
) => {
  console.log("Recording transaction for user:", userId);
  
  try {
    // Get current session to verify
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error when recording transaction:", sessionError);
      throw new Error(language === 'ar' 
        ? 'حدث خطأ في جلسة المستخدم. يرجى تسجيل الدخول مرة أخرى.' 
        : 'Session error occurred. Please login again.');
    }
    
    if (!sessionData.session) {
      console.error("No active session found when recording transaction");
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error("Failed to refresh session:", refreshError);
        throw new Error(language === 'ar' 
          ? 'لا توجد جلسة نشطة للمستخدم. يرجى تسجيل الدخول مرة أخرى.' 
          : 'No active user session. Please login again.');
      }
      
      console.log("Session refreshed successfully for user:", refreshData.session.user.id);
    } else {
      console.log("Found active session for user:", sessionData.session.user.id);
    }
    
    // One more session check to ensure we have a valid session before proceeding
    const { data: finalSessionCheck } = await supabase.auth.getSession();
    if (!finalSessionCheck.session) {
      console.error("Session still not found after refresh attempt");
      throw new Error(language === 'ar' 
        ? 'لا يمكن تأكيد جلسة المستخدم. يرجى تسجيل الخروج وإعادة تسجيل الدخول.' 
        : 'Unable to verify user session. Please logout and login again.');
    }
    
    // Store transaction in the database - using the RLS policy which will check auth.uid()
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, // Use user_id as string
        amount: price,
        currency: currency || 'USD',
        status: 'completed',
        payment_type: paymentType,
        payment_provider: 'paypal',
        provider_transaction_id: details.id || uuidv4(), // Ensure we always have an ID
        plan_code: planCode,
        metadata: {
          payer: details.payer,
          payment_details: details,
          session_id: finalSessionCheck.session.id // Store session ID for debugging
        }
      });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }

    console.log("Transaction recorded successfully");
    return true;
  } catch (error) {
    console.error("Error recording transaction:", error);
    throw error;
  }
};

/**
 * Updates user plan in the database
 */
export const updateUserPlan = async (userId: string, planCode: string) => {
  console.log("Updating user plan for user:", userId, "to plan:", planCode);
  
  try {
    // Check for a valid Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error when updating user plan:", sessionError);
      throw new Error("Session error occurred when updating user plan");
    }
    
    if (!sessionData.session) {
      console.error("No active session when updating user plan");
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        throw new Error("No active Supabase session when updating user plan");
      }
      
      console.log("Session refreshed when updating user plan");
    }
    
    // Try to update by auth_uid first (most reliable way)
    let { error: updateByAuthError, data: updateByAuthData } = await supabase
      .from('users')
      .update({ 
        plan_code: planCode 
      })
      .eq('auth_uid', userId)
      .select();

    if (updateByAuthError || (updateByAuthData && updateByAuthData.length === 0)) {
      console.log("Couldn't update by auth_uid, trying by numeric ID...");
      
      // Try by numeric ID if auth_uid didn't work
      if (/^\d+$/.test(userId)) {
        const { error: updateByIdError } = await supabase
          .from('users')
          .update({ 
            plan_code: planCode 
          })
          .eq('id', Number(userId));

        if (updateByIdError) {
          console.error("User update by ID error:", updateByIdError);
          throw updateByIdError;
        }
      } else {
        console.error("Couldn't update user plan: no matching user found");
        throw new Error("No matching user found for plan update");
      }
    }

    console.log("User plan updated successfully to:", planCode);
    return true;
  } catch (error) {
    console.error("Error updating user plan:", error);
    throw error;
  }
};

/**
 * Safely converts price to number
 */
export const safeParsePrice = (price: any): number => {
  if (typeof price === 'string') {
    return parseFloat(price);
  } else {
    return Number(price);
  }
};

/**
 * Validates price is a valid number
 */
export const validatePrice = (price: number): boolean => {
  if (isNaN(price)) {
    throw new Error('Invalid price value');
  }
  return true;
};

/**
 * Verifies Supabase session is active
 */
export const verifyActiveSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Session verification error:", error);
      return false;
    }
    
    if (!data.session) {
      console.log("No active session found in verification");
      
      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        console.error("Session refresh failed:", refreshError);
        return false;
      }
      
      console.log("Session refreshed successfully");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in verifyActiveSession:", error);
    return false;
  }
};
