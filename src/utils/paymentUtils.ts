
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
    // Check if userId is a valid UUID or try to convert it
    let validUserId = userId;
    
    // If userId is a numeric string and not a valid UUID, generate a new UUID
    if (/^\d+$/.test(userId)) {
      console.log("UserId appears to be numeric, not a valid UUID format. Using a generated UUID");
      // Store the original ID in metadata
      const metadata = {
        original_user_id: userId,
        payer: details.payer,
        payment_details: details
      };
      
      // Record the transaction in the database with the numeric ID as a reference
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          // Don't specify user_id if it's not a valid UUID
          amount: price,
          currency: currency || 'USD',
          status: 'completed',
          payment_type: paymentType,
          payment_provider: 'paypal',
          provider_transaction_id: details.id,
          plan_code: planCode,
          metadata: metadata
        });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        throw transactionError;
      }
    } else {
      // If userId looks like a valid UUID, use it directly
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: validUserId,
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
    // If the userId is numeric (not UUID), we need to find the user by numeric ID
    if (/^\d+$/.test(userId)) {
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
    } else {
      // If userId appears to be UUID format, update by auth_uid
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
