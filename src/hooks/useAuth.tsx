
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
        // Ensure user has an ID property
        if (parsedUser && !parsedUser.id && parsedUser.email) {
          console.warn('Stored user missing ID, attempting to fix', parsedUser);
          // Try to set a temporary ID based on email if needed
          parsedUser.id = String(Date.now());
        }
        setUser(parsedUser);
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
      // Query to find user with matching email and password
      const { data, error } = await supabase
        .from('users')
        .select('id, auth_uid, email, role, password, plan_code')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error('Error in login query:', error);
        throw new Error('Error verifying credentials');
      }
      
      if (!data) {
        throw new Error('Invalid email or password');
      }
      
      // Save user data to localStorage
      const userData: User = {
        id: String(data.id), // Convert ID to string to match User interface
        email: data.email,
        role: data.role,
        plan_code: data.plan_code || 'visitor',
        is_active: true, // Set default value since column doesn't exist yet
        auth_uid: data.auth_uid || null,
      };
      
      console.log("Successfully logged in:", userData);
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
  };

  const isAdmin = () => {
    console.log("Checking admin permissions for user:", user);
    return user?.role === 'admin';
  };

  return { user, login, logout, loading, error, isAdmin };
};
