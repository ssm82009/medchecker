
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
    // Make sure the session is active
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No active session found when recording transaction");
      throw new Error(language === 'ar' 
        ? 'لا توجد جلسة نشطة للمستخدم. يرجى تسجيل الدخول مرة أخرى.' 
        : 'No active user session. Please login again.');
    }
    
    // Store transaction in the database
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId, // Use user_id as string
        amount: price,
        currency: currency || 'USD',
        status: 'completed',
        payment_type: paymentType,
        payment_provider: 'paypal',
        provider_transaction_id: details.id,
        plan_code: planCode,
        metadata: {
          payer: details.payer,
          payment_details: details
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
    // إذا كان معرف المستخدم رقميًا، فنحتاج إلى البحث عن المستخدم بواسطة المعرف الرقمي
    if (/^\d+$/.test(userId)) {
      // تحويل معرف المستخدم إلى رقم لأن جدول المستخدمين يستخدم معرفات رقمية
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          plan_code: planCode 
        })
        .eq('id', Number(userId));

      if (updateError) {
        console.error("User update error:", updateError);
        throw updateError;
      }
    } else {
      // إذا كان معرف المستخدم يبدو كتنسيق UUID، قم بالتحديث بواسطة auth_uid
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          plan_code: planCode 
        })
        .eq('auth_uid', userId);

      if (updateError) {
        console.error("User update error:", updateError);
        throw updateError;
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
