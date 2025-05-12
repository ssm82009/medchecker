
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { useTranslation } from '@/hooks/useTranslation'; 
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation(); 
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading) {
        // Only check permissions once loading is complete
        if (!user) {
          // If no user is logged in, redirect to login page
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }
        
        try {
          // Double-check the user's role directly from the database
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('auth_uid', user.id)
            .single();
          
          console.log('Database user role check:', userData);
          
          // Check user role from database or fallback to user object
          const actualRole = userData?.role || user.role;
          
          if (actualRole !== 'admin') {
            // If user is not an admin, show message and redirect
            console.log('User is not an admin, redirecting', user);
            console.log('Role in user object:', user.role);
            console.log('Role from database:', actualRole);
            
            toast({
              title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
              description: language === 'ar' 
                ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
                : 'You do not have permission to access this page',
              variant: 'destructive'
            });
            navigate('/my-account');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
        
        // Permission checking is complete
        setCheckingPermissions(false);
      }
    };
    
    checkAdminStatus();
  }, [user, loading, navigate, language]);

  // Show loading state while checking permissions
  if (loading || checkingPermissions) {
    return <div className="text-center py-20">
      {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
    </div>;
  }

  // Only render dashboard content if user is an admin
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
      </h1>
      <p>
        {language === 'ar' 
          ? 'مرحباً بك في لوحة التحكم الخاصة بالمسؤولين.' 
          : 'Welcome to the admin dashboard.'
        }
      </p>
    </div>
  );
};

export default Dashboard;
