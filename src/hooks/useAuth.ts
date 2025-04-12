
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for user on page load
  useEffect(() => {
    // Initialize auth state from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Query to find the user with matching email and password
      const { data, error } = await supabase
        .from('users')
        .select('email, role, password')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      
      if (error) {
        console.error('Login query error:', error);
        throw new Error('Error checking credentials');
      }
      
      if (!data) {
        throw new Error('Invalid email or password');
      }
      
      // Save user data in localStorage
      const userData: User = {
        email: data.email,
        role: data.role
      };
      
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
    return user?.role === 'admin';
  };

  return { user, login, logout, loading, error, isAdmin };
};
