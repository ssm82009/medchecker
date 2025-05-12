
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { useTranslation } from '@/hooks/useTranslation'; 
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation(); 
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading) {
        console.log('Dashboard - Checking admin status, loading complete');
        
        if (!user) {
          console.log('Dashboard - No user found, redirecting to login');
          navigate('/login');
          return;
        }
        
        console.log("Dashboard - Current user:", user);
        console.log("Dashboard - User role:", user.role);
        
        // Explicitly compare the role to 'admin' string to ensure type safety
        const isAdminUser = user.role === 'admin';
        console.log("Dashboard - Is admin?", isAdminUser);
        
        if (!isAdminUser) {
          console.log('Dashboard - User is not an admin, redirecting');
          
          toast({
            title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
            description: language === 'ar' 
              ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
              : 'You do not have permission to access this page',
            variant: 'destructive'
          });
          
          navigate('/');
          return;
        } else {
          console.log('Dashboard - User is admin, access granted');
        }
        
        setCheckingPermissions(false);
      }
    };
    
    checkAdminStatus();
  }, [user, loading, navigate, language]);

  if (loading || checkingPermissions) {
    return <div className="text-center py-20">
      {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
    </div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
      </h1>
      <p>
        {language === 'ar' 
          ? `مرحباً بك في لوحة التحكم الخاصة بالمسؤولين (${user?.email})` 
          : `Welcome to the admin dashboard (${user?.email})`
        }
      </p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
        <p className="text-green-800">
          {language === 'ar' 
            ? 'تم تسجيل دخولك بنجاح كمشرف!' 
            : 'You have successfully logged in as an admin!'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
