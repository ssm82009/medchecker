
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
    let isMounted = true;
    
    const checkPermissions = async () => {
      try {
        if (!loading) {
          if (!user) {
            navigate('/login');
            return;
          }

          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('auth_uid', user.id)
            .single();

          const actualRole = userData?.role || user.role;
          
          if (actualRole !== 'admin') {
            toast({
              title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
              description: language === 'ar' 
                ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
                : 'You do not have permission to access this page',
              variant: 'destructive'
            });
            navigate('/my-account');
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        if (isMounted) {
          setCheckingPermissions(false);
        }
      }
    };

    setCheckingPermissions(true);
    checkPermissions();

    return () => {
      isMounted = false;
    };
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
