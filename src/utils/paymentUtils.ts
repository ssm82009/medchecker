
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
    // التحقق من الجلسة بطريقة موثوقة
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
          session_uid: activeSession?.user?.id
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
    // التحقق من الجلسة بطريقة موثوقة
    const sessionCheck = await checkAndGetSession();
    if (!sessionCheck.success) {
      throw new Error(sessionCheck.message);
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
 * وظيفة محسنة للتحقق من وجود جلسة نشطة
 * تقوم بإجراء ثلاث محاولات للحصول على الجلسة
 */
export const checkAndGetSession = async (language: string = 'en') => {
  try {
    // المحاولة الأولى - جلب الجلسة الحالية
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // التحقق من وجود خطأ
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
    
    // التحقق من وجود جلسة
    if (sessionData.session) {
      console.log("Active session found:", sessionData.session.user.id);
      return {
        success: true,
        session: sessionData.session,
        message: ''
      };
    }
    
    // المحاولة الثانية - تحديث الجلسة
    console.log("No active session found, attempting to refresh...");
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    // التحقق من نجاح تحديث الجلسة
    if (!refreshError && refreshData.session) {
      console.log("Session refreshed successfully:", refreshData.session.user.id);
      return {
        success: true,
        session: refreshData.session,
        message: ''
      };
    }
    
    // فشل تحديث الجلسة
    if (refreshError) {
      console.error("Session refresh failed:", refreshError);
    } else {
      console.error("Session refresh returned no session");
    }

    // المحاولة الأخيرة - التحقق مرة أخرى من الجلسة
    const { data: finalCheck } = await supabase.auth.getSession();
    if (finalCheck.session) {
      console.log("Session found after final check:", finalCheck.session.user.id);
      return {
        success: true,
        session: finalCheck.session,
        message: ''
      };
    }
    
    // لا توجد جلسة نشطة
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
 * وظيفة مساعدة لاستدعاء الوظيفة القديمة للتوافق مع الكود القديم
 * ستعمل كجسر بين الكود القديم والجديد
 */
export const verifyActiveSession = async (): Promise<boolean> => {
  const result = await checkAndGetSession();
  return result.success;
};
