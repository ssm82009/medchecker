
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  // Record the transaction in the database
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      user_id: String(userId), // Ensure user_id is stored as string
      amount: price, // Now properly converted to a number
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
};

/**
 * Updates user plan in the database
 */
export const updateUserPlan = async (userId: string, planCode: string) => {
  console.log("Updating user plan for user:", userId, "to plan:", planCode);
  
  // Convert user ID to number since users table uses numeric IDs
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

  console.log("User plan updated successfully to:", planCode);
  return true;
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
