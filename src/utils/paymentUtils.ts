
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
  // userId هنا هو effectiveUserId من useSubscription, والذي يجب أن يكون auth_uid
  console.log("Attempting to update user plan. Passed userId (should be auth_uid):", userId, "Target planCode:", planCode);

  try {
    const sessionCheck = await checkAndGetSession(); // لا نمرر اللغة هنا، ستستخدم الافتراضية أو الإنجليزية
    if (!sessionCheck.success || !sessionCheck.session?.user?.id) {
      console.error("UpdateUserPlan: No active session or session user ID. Message:", sessionCheck.message);
      throw new Error(sessionCheck.message || "Active session required to update plan.");
    }

    const authenticatedAuthUid = sessionCheck.session.user.id;
    console.log("UpdateUserPlan: Authenticated auth_uid from current session:", authenticatedAuthUid);

    // التحقق مما إذا كان userId الممرر يطابق auth_uid من الجلسة
    if (userId !== authenticatedAuthUid) {
      console.warn(`UpdateUserPlan: Passed userId ('${userId}') does not match authenticated session auth_uid ('${authenticatedAuthUid}'). Proceeding with session auth_uid.`);
    }

    // نستخدم authenticatedAuthUid مباشرة للتحديث لضمان تحديث المستخدم الصحيح
    const { data, error } = await supabase
      .from('users')
      .update({ plan_code: planCode })
      .eq('auth_uid', authenticatedAuthUid) // استخدام auth_uid من الجلسة المصادق عليها
      .select(); // .select() قد يتأثر بـ RLS

    if (error) {
      console.error("UpdateUserPlan: Supabase error during plan update for auth_uid", authenticatedAuthUid, ":", error);
      throw error;
    }

    // قد لا يتم إرجاع بيانات إذا كانت RLS تمنع القراءة بعد التحديث، أو إذا لم يتم العثور على الصف (وهو أمر غير مرجح إذا كان auth_uid صحيحًا)
    if (!data || data.length === 0) {
      console.warn("UpdateUserPlan: No user record returned after update for auth_uid:", authenticatedAuthUid, ". This could be due to RLS policies or if the user record with this auth_uid doesn't exist. Assuming update was successful if no error was thrown.");
      // لا نعتبر هذا خطأ فادحًا بالضرورة، لكنه يستدعي التحقق من RLS وسياسات Supabase
    }

    console.log("User plan update process completed for auth_uid:", authenticatedAuthUid, "to plan:", planCode, ". Returned data (if any):", data);
    // تحديث حالة المستخدم في useAuth إذا أمكن، أو الاعتماد على إعادة جلب البيانات في MyAccount
    // قد تحتاج إلى طريقة لتحديث بيانات المستخدم محليًا بعد تغيير الخطة بنجاح
    return true;
  } catch (error) {
    console.error("UpdateUserPlan: Critical error during plan update for passed userId", userId, "(using session auth_uid '", sessionCheck?.session?.user?.id ,"'):", error);
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
 * تقوم بإجراء محاولات للحصول على الجلسة بدون إعادة توجيه المستخدم
 */
export const checkAndGetSession = async (language: string = 'en') => {
  try {
    // محاولة جلب الجلسة الحالية
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
    
    // محاولة تحديث الجلسة
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

    // محاولة أخيرة للتحقق من الجلسة
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
