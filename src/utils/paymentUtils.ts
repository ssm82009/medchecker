
import { supabase } from '@/integrations/supabase/client';
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
    // Check session reliably
    const sessionCheck = await checkAndGetSession(language);
    if (!sessionCheck.success) {
      throw new Error(sessionCheck.message);
    }
    
    const activeSession = sessionCheck.session;
    
    // Store transaction in the database - using the RLS policy which will check auth.uid()
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
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
          session_uid: activeSession?.user?.id,
          user_email: details.email || details.payer?.email_address // Store email in metadata for easier lookup
        }
      });

    if (transactionError) {
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }

    console.log("Transaction recorded successfully");
    
    // After recording transaction, immediately update user plan in database
    await updateUserPlan(userId, planCode);
    
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
  console.log("Attempting to update user plan. Passed userId (should be auth_uid):", userId, "Target planCode:", planCode);

  try {
    const sessionCheck = await checkAndGetSession();
    if (!sessionCheck.success || !sessionCheck.session?.user?.id) {
      console.error("UpdateUserPlan: No active session or session user ID. Message:", sessionCheck.message);
      throw new Error(sessionCheck.message || "Active session required to update plan.");
    }

    const authenticatedAuthUid = sessionCheck.session.user.id;
    console.log("UpdateUserPlan: Authenticated auth_uid from current session:", authenticatedAuthUid);

    // Check if the passed userId matches the authenticated auth_uid
    if (userId !== authenticatedAuthUid) {
      console.warn(`UpdateUserPlan: Passed userId ('${userId}') does not match authenticated session auth_uid ('${authenticatedAuthUid}'). Proceeding with session auth_uid.`);
    }

    // Calculate expiry date based on plan code
    const now = new Date();
    let expiryDate = new Date(now);
    
    if (planCode === 'pro12' || planCode === 'annual') {
      // For annual plans, add 1 year
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (planCode === 'pro') {
      // For monthly plans, add 1 month
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      // For other plans like free plan, add 30 days (or whatever makes sense)
      expiryDate.setDate(expiryDate.getDate() + 30);
    }
    
    console.log(`Plan expiry date set to ${expiryDate.toISOString()} for plan ${planCode}`);

    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, plan_code')
      .eq('auth_uid', authenticatedAuthUid)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("UpdateUserPlan: Error checking if user exists:", checkError);
      throw checkError;
    }
    
    // Get email from session
    const userEmail = sessionCheck.session.user.email;
    
    if (existingUser) {
      console.log("UpdateUserPlan: User found, updating plan:", existingUser);
      // User exists, update plan
      const { error } = await supabase
        .from('users')
        .update({ 
          plan_code: planCode,
          plan_expiry_date: expiryDate.toISOString()
        })
        .eq('auth_uid', authenticatedAuthUid);
      
      if (error) {
        console.error("UpdateUserPlan: Error updating plan:", error);
        throw error;
      }
      
      console.log("UpdateUserPlan: Plan updated successfully");
    } else {
      console.log("UpdateUserPlan: User not found, creating new user with plan");
      // User doesn't exist, create new user with plan
      const { error } = await supabase
        .from('users')
        .insert({
          auth_uid: authenticatedAuthUid,
          email: userEmail,
          password: 'oauth-user', // Placeholder for OAuth users
          plan_code: planCode,
          plan_expiry_date: expiryDate.toISOString()
        });
      
      if (error) {
        console.error("UpdateUserPlan: Error creating user with plan:", error);
        throw error;
      }
      
      console.log("UpdateUserPlan: User created with plan successfully");
    }

    return true;
  } catch (error) {
    console.error("UpdateUserPlan: Critical error during plan update for passed userId", userId, ":", error);
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
 * Improved function to check for active session
 */
export const checkAndGetSession = async (language: string = 'en') => {
  try {
    // Try to get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // Check for error
    if (sessionError) {
      console.error("Session error in checkAndGetSession:", sessionError);
      return {
        success: false,
        message: language === 'ar' 
          ? 'خطأ في جلسة المستخدم، يرجى تسجيل الدخول مرة أخرى' 
          : 'Session error, please login again',
        session: null
      };
    }
    
    // Check if session exists
    if (sessionData.session) {
      console.log("Active session found:", sessionData.session.user.id);
      return {
        success: true,
        session: sessionData.session,
        message: ''
      };
    }
    
    // Try to refresh session
    console.log("No active session found, attempting to refresh...");
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    // Check if session refresh was successful
    if (!refreshError && refreshData.session) {
      console.log("Session refreshed successfully:", refreshData.session.user.id);
      return {
        success: true,
        session: refreshData.session,
        message: ''
      };
    }
    
    // Session refresh failed
    if (refreshError) {
      console.error("Session refresh failed:", refreshError);
    } else {
      console.error("Session refresh returned no session");
    }

    // One final check for session
    const { data: finalCheck } = await supabase.auth.getSession();
    if (finalCheck.session) {
      console.log("Session found after final check:", finalCheck.session.user.id);
      return {
        success: true,
        session: finalCheck.session,
        message: ''
      };
    }
    
    // No active session
    return {
      success: false,
      message: language === 'ar' 
        ? 'لا توجد جلسة نشطة للمستخدم، يرجى تسجيل الدخول' 
        : 'No active user session, please login',
      session: null
    };
  } catch (error) {
    console.error("Exception in checkAndGetSession:", error);
    return {
      success: false,
      message: language === 'ar' 
        ? 'حدث خطأ غير متوقع أثناء التحقق من الجلسة' 
        : 'Unexpected error checking session',
      session: null
    };
  }
};

/**
 * Helper function for backward compatibility with older code
 */
export const verifyActiveSession = async (): Promise<boolean> => {
  const result = await checkAndGetSession();
  return result.success;
};
