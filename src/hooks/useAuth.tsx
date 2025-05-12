
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

// Define the User interface here instead of importing it
export interface User {
  id: string;
  email: string;
  role: string;
  plan_code?: string;
  is_active?: boolean;
  auth_uid?: string;
}

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for user when page loads
  useEffect(() => {
    // Initialize auth state from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser) {
          // Ensure user has a valid ID property and it's a string
          if (!parsedUser.id) {
            console.warn('Stored user missing ID, cannot proceed with invalid user data', parsedUser);
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // Always ensure ID is stored as a string
            parsedUser.id = String(parsedUser.id);
            console.log('User loaded from storage with ID:', parsedUser.id, 'Type:', typeof parsedUser.id);
            setUser(parsedUser);
          }
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Use Supabase Auth to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Authentication error:', error.message);
        throw new Error(error.message || 'Invalid email or password');
      }
      
      if (!data.user) {
        throw new Error('No user returned from authentication');
      }
      
      // Get user directly from users table using email instead of auth_uid
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, auth_uid, email, role, plan_code')
        .eq('email', email)
        .maybeSingle();
      
      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw new Error('Error retrieving user profile');
      }
      
      if (!userProfile) {
        console.error('User profile not found for email:', email);
        throw new Error('User profile not found');
      }
      
      // Create user data from profile, handling possible missing fields
      const userData: User = {
        id: String(userProfile.id),
        email: userProfile.email,
        role: userProfile.role || 'user',
        plan_code: userProfile.plan_code || 'visitor',
        is_active: true, // Default to true as is_active column doesn't exist
        auth_uid: userProfile.auth_uid || data.user.id,
      };
      
      console.log('User successfully logged in:', userData);
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    supabase.auth.signOut(); // Also sign out from Supabase
  };

  const refreshUser = async () => {
    if (!user || !user.id) {
      console.warn('Cannot refresh user: no user data available.');
      return;
    }
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, auth_uid, email, role, plan_code') // Remove is_active as it doesn't exist
        .eq('id', user.id) // Remove toString() to fix type error
        .single();

      if (fetchError) {
        console.error('Error refreshing user data:', fetchError);
        setError('Failed to refresh user data.');
        return;
      }

      if (data) {
        const updatedUserData: User = {
          id: String(data.id),
          email: data.email,
          role: data.role,
          plan_code: data.plan_code || 'visitor',
          is_active: true, // Default to true as is_active doesn't exist
          auth_uid: data.auth_uid || user.auth_uid, // Preserve auth_uid if not returned or use existing
        };
        setUser(updatedUserData);
        console.log('User data refreshed:', updatedUserData);
      } else {
        console.warn('No data returned when refreshing user.');
        // Optionally handle this case, e.g., by logging the user out if their record is gone
      }
    } catch (err) {
      console.error('Critical error during user refresh:', err);
      setError(err instanceof Error ? err.message : 'User refresh failed critically');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    console.log("Checking admin permissions for user:", user);
    return user?.role === 'admin';
  };

  return { user, login, logout, loading, error, isAdmin, refreshUser };
};
