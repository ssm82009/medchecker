import { useEffect, useState, useContext, createContext, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Define User type that's referenced in other components
export interface User {
  id: string;
  email: string;
  role: string;
  auth_uid: string;
  plan_code?: string;
  plan_expiry_date?: string;
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  userProfile: any;
  userPlan: any;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  getSession: () => Promise<any>;
  checkAuthStatus: () => Promise<boolean>;
  isPremium: () => boolean;
  isAdmin: () => boolean; // Added isAdmin method
  login: (email: string, password: string) => Promise<boolean>; // Added login method
  error: string | null; // Add error field
  refreshUser: () => Promise<void>; // Add refreshUser method
  fetchLatestPlan: () => Promise<void>; // New method to fetch latest plan
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [planRefreshInProgress, setPlanRefreshInProgress] = useState(false);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Function to calculate expiry date based on plan type
  const calculateExpiryDate = (planCode: string): string => {
    const now = new Date();
    if (planCode === 'pro12' || planCode === 'annual') {
      // Add 1 year for annual plans
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    } else {
      // Add 1 month for monthly plans
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (isMountedRef.current) {
        setSession(session);
        
        if (session?.user) {
          console.log("Setting user from session:", session.user);
          console.log("User metadata:", session.user.user_metadata);
          
          // Important: Get the correct role from the database tables, not just metadata
          // This is where we need to fix the role extraction
          let userRole = 'user'; // Default role
          
          if (session.user.app_metadata && session.user.app_metadata.role) {
            userRole = session.user.app_metadata.role;
            console.log("Found role in app_metadata:", userRole);
          } else if (session.user.user_metadata && session.user.user_metadata.role) {
            userRole = session.user.user_metadata.role;
            console.log("Found role in user_metadata:", userRole);
          }
          
          // When using app_metadata.provider='email' that might indicate an admin user
          if (session.user.app_metadata && 
              session.user.app_metadata.provider === 'email' && 
              session.user.role === 'authenticated') {
            console.log("User has email provider, checking if admin in database");
            
            // Try to get the user's role from the users table
            try {
              const { data: userData, error } = await supabase
                .from('users')
                .select('role')
                .eq('auth_uid', session.user.id)
                .maybeSingle();
                
              if (!error && userData && userData.role) {
                userRole = userData.role;
                console.log("Retrieved role from users table:", userRole);
              }
            } catch (err) {
              console.error("Error fetching user role from database:", err);
            }
          }
          
          console.log("Final resolved user role:", userRole);
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: userRole,
            auth_uid: session.user.id
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMountedRef.current) {
        setSession(session);
        
        if (session?.user) {
          console.log("Auth change - Setting user:", session.user);
          console.log("Auth change - User metadata:", session.user.user_metadata);
          console.log("Auth change - App metadata:", session.user.app_metadata);
          
          // Similar role determination as above for consistency
          let userRole = 'user'; // Default role
          
          if (session.user.app_metadata && session.user.app_metadata.role) {
            userRole = session.user.app_metadata.role;
            console.log("Auth change - Found role in app_metadata:", userRole);
          } else if (session.user.user_metadata && session.user.user_metadata.role) {
            userRole = session.user.user_metadata.role;
            console.log("Auth change - Found role in user_metadata:", userRole);
          }
          
          // When using app_metadata.provider='email' that might indicate an admin user
          if (session.user.app_metadata && 
              session.user.app_metadata.provider === 'email' && 
              session.user.role === 'authenticated') {
            console.log("Auth change - User has email provider, checking if admin in database");
            
            // Try to get the user's role from the users table
            try {
              const { data: userData, error } = await supabase
                .from('users')
                .select('role')
                .eq('auth_uid', session.user.id)
                .maybeSingle();
                
              if (!error && userData && userData.role) {
                userRole = userData.role;
                console.log("Auth change - Retrieved role from users table:", userRole);
              }
            } catch (err) {
              console.error("Auth change - Error fetching user role from database:", err);
            }
          }
          
          console.log("Auth change - Final resolved user role:", userRole);
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: userRole,
            auth_uid: session.user.id
          });
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add a function to fetch latest plan from transactions
  const fetchLatestPlan = useCallback(async () => {
    if (!user?.id || !isMountedRef.current || planRefreshInProgress) return;
    
    try {
      console.log("Fetching latest plan for user:", user.id);
      setPlanRefreshInProgress(true);
      
      // First try to get the user's plan from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan_code, auth_uid, plan_expiry_date')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      // If we found plan data in the users table, update user and fetch plan details
      if (!userError && userData && userData.plan_code && isMountedRef.current) {
        console.log("Found plan in users table:", userData.plan_code);
        
        // Check if we already have an expiry date
        let expiryDate = userData.plan_expiry_date;
        
        // If no expiry date, calculate it based on plan type
        if (!expiryDate) {
          expiryDate = calculateExpiryDate(userData.plan_code);
          
          // Update the users table with the expiry date
          const { error: updateError } = await supabase
            .from('users')
            .update({ plan_expiry_date: expiryDate })
            .eq('auth_uid', user.id);
          
          if (updateError) {
            console.error("Error updating expiry date:", updateError);
          }
        }
        
        // Update user object with plan_code and expiry_date
        if (isMountedRef.current) {
          setUser(prevUser => {
            // Only update if the plan code has changed to prevent infinite loops
            if (prevUser && (prevUser.plan_code !== userData.plan_code || !prevUser.plan_expiry_date)) {
              return { 
                ...prevUser, 
                plan_code: userData.plan_code,
                plan_expiry_date: expiryDate
              };
            }
            return prevUser;
          });
        }
        
        // Fetch plan details only if userPlan is not set or different from current plan code
        if (!userPlan || userPlan.code !== userData.plan_code) {
          const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('code', userData.plan_code)
            .maybeSingle();
          
          if (!planError && planData && isMountedRef.current) {
            setUserPlan(planData);
            console.log("Set user plan from users table:", planData);
            return;
          }
        } else {
          // Plan already set correctly, just return
          return;
        }
      }
      
      // If we didn't find or couldn't set plan from users table, check transactions
      if (isMountedRef.current) {
        console.log("Checking latest plan from transactions...");
        
        // Get the latest completed transaction
        const { data: txnData, error: txnError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (txnError) {
          console.error("Error fetching transactions:", txnError);
          return;
        }
        
        // If no transactions found by ID, try looking by email in metadata
        if (!txnData || txnData.length === 0) {
          console.log("No transactions found by ID, checking metadata...");
          
          const { data: metadataTransactions, error: metadataError } = await supabase
            .from('transactions')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!metadataError && metadataTransactions && isMountedRef.current) {
            // Filter transactions by user email in metadata using safe access
            const userTransactions = metadataTransactions.filter(tx => {
              // Safely check if metadata exists and has user_email or payer.email_address property
              if (tx.metadata && typeof tx.metadata === 'object') {
                // Check if user_email exists in metadata
                const metadataObj = tx.metadata as Record<string, any>;
                
                // Check for direct user_email property
                if (typeof metadataObj.user_email === 'string' && metadataObj.user_email === user.email) {
                  return true;
                }
                
                // Check for payer.email_address property
                if (metadataObj.payer && typeof metadataObj.payer === 'object' && 
                    typeof metadataObj.payer.email_address === 'string' && 
                    metadataObj.payer.email_address === user.email) {
                  return true;
                }
              }
              return false;
            });
            
            if (userTransactions.length > 0 && isMountedRef.current) {
              console.log("Found transactions in metadata:", userTransactions[0]);
              
              // Get plan code from latest transaction and update user
              const latestPlanCode = userTransactions[0].plan_code;
              
              // Check if plan code is different from current plan code to prevent loops
              if (!user.plan_code || user.plan_code !== latestPlanCode) {
                // Calculate expiry date based on plan type
                const expiryDate = calculateExpiryDate(latestPlanCode);
                
                // Update user record with plan code and expiry date
                await updateUserPlanCode(latestPlanCode, expiryDate);
                
                // Fetch plan details
                const { data: planData, error: planError } = await supabase
                  .from('plans')
                  .select('*')
                  .eq('code', latestPlanCode)
                  .maybeSingle();
                
                if (!planError && planData && isMountedRef.current) {
                  setUserPlan(planData);
                  console.log("Set user plan from transaction metadata:", planData);
                }
              }
            }
          }
          return;
        }
        
        // Get plan code from latest transaction and update user
        const latestTransaction = txnData[0];
        const latestPlanCode = latestTransaction.plan_code;
        
        // Only update if plan code is different
        if (!user.plan_code || user.plan_code !== latestPlanCode) {
          console.log("Latest transaction found with plan:", latestPlanCode);
          
          // Calculate expiry date based on plan type
          const expiryDate = calculateExpiryDate(latestPlanCode);
          
          // Update user record with plan code and expiry date
          await updateUserPlanCode(latestPlanCode, expiryDate);
          
          // Fetch plan details
          const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('*')
            .eq('code', latestPlanCode)
            .maybeSingle();
          
          if (!planError && planData && isMountedRef.current) {
            setUserPlan(planData);
            console.log("Set user plan from transactions:", planData);
          }
        }
      }
    } catch (error) {
      console.error("Error in fetchLatestPlan:", error);
    } finally {
      if (isMountedRef.current) {
        setPlanRefreshInProgress(false);
      }
    }
  }, [user, planRefreshInProgress]);
  
  // Helper function to update user's plan code and expiry date
  const updateUserPlanCode = async (planCode: string, expiryDate: string) => {
    if (!user?.id || !planCode) return;
    
    try {
      // Check if user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, plan_code, plan_expiry_date')
        .eq('auth_uid', user.id)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking user:", checkError);
        return;
      }
      
      if (existingUser) {
        // Update existing record if plan_code is different
        if (existingUser.plan_code !== planCode || !existingUser.plan_expiry_date) {
          console.log("Updating user plan_code from", existingUser.plan_code, "to", planCode);
          console.log("Setting expiry date to:", expiryDate);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              plan_code: planCode,
              plan_expiry_date: expiryDate
            })
            .eq('auth_uid', user.id);
          
          if (updateError) {
            console.error("Error updating user plan:", updateError);
          } else {
            console.log("User plan_code and expiry_date updated successfully");
            // Update local user state
            setUser(prevUser => prevUser ? { 
              ...prevUser, 
              plan_code: planCode,
              plan_expiry_date: expiryDate
            } : null);
          }
        }
      } else {
        // Insert new user record if it doesn't exist
        console.log("Creating new user record with plan_code:", planCode);
        console.log("Setting expiry date to:", expiryDate);
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({ 
            auth_uid: user.id, 
            email: user.email, 
            plan_code: planCode,
            plan_expiry_date: expiryDate,
            password: 'oauth-user' // placeholder for OAuth users
          });
        
        if (insertError) {
          console.error("Error inserting user plan:", insertError);
        } else {
          console.log("User record created with plan_code and expiry_date");
          // Update local user state
          setUser(prevUser => prevUser ? { 
            ...prevUser, 
            plan_code: planCode,
            plan_expiry_date: expiryDate
          } : null);
        }
      }
    } catch (error) {
      console.error("Error in updateUserPlanCode:", error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Prevent useEffect from running more than once by using a ref to track if it's already run
  const planEffectRun = useRef(false);
  
  // This effect runs when user profile changes to fetch the plan
  useEffect(() => {
    if (user?.id && !planEffectRun.current && !planRefreshInProgress) {
      planEffectRun.current = true;
      fetchLatestPlan();
    } else if (!user) {
      setUserPlan(null);
      planEffectRun.current = false;
    }
  }, [user, fetchLatestPlan, planRefreshInProgress]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserPlan(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Alias for signOut for consistency with component usage
  const logout = async () => {
    await signOut();
  };

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log("Error getting session", error);
    }
    return data;
  }

  const checkAuthStatus = async (): Promise<boolean> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
    return !!session?.user;
  };

  const isPremium = () => {
    if (!userPlan) return false;
    const planCodeString = userPlan.code || '';
    
    return planCodeString.includes('premium') || planCodeString.includes('pro');
  };

  // Improved isAdmin function to check for actual role values from the database
  const isAdmin = () => {
    if (!user) {
      console.log("isAdmin check: No user found");
      return false;
    }
    
    console.log("isAdmin checking admin status for user:", user.email);
    console.log("isAdmin user role is:", user.role);
    console.log("isAdmin full user object:", user);
    
    // Direct check if the role is 'admin'
    const adminStatus = user.role === 'admin';
    console.log("isAdmin result:", adminStatus);
    
    return adminStatus;
  };

  // Add login method that's being used in Login.tsx
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        return false;
      }

      return !!data.user;
    } catch (err) {
      console.error("Login exception:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return false;
    }
  };

  // Add refreshUser method that's being used in useSubscription.tsx
  const refreshUser = async (): Promise<void> => {
    try {
      // Refresh the session
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      
      if (refreshedSession?.user) {
        // Update user state
        setSession(refreshedSession);
        setUser({
          id: refreshedSession.user.id,
          email: refreshedSession.user.email || '',
          role: refreshedSession.user.user_metadata?.role || 'user',
          auth_uid: refreshedSession.user.id
        });
        
        // Re-fetch user profile and plan
        await fetchLatestPlan();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      userProfile, 
      userPlan, 
      signOut, 
      logout,
      getSession, 
      checkAuthStatus, 
      isPremium,
      isAdmin,
      login,
      error,
      refreshUser,
      fetchLatestPlan
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
