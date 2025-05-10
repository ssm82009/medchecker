
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginPromptProps {
  language: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ language }) => {
  return (
    <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 shadow-sm my-4 text-center">
      <h3 className="text-xl font-medium text-amber-800 mb-2">
        {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
      </h3>
      
      <p className="text-amber-700 mb-4">
        {language === 'ar' 
          ? 'يرجى تسجيل الدخول أو إنشاء حساب جديد للاشتراك في الخدمة'
          : 'Please login or create an account to subscribe to the service'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button className="flex items-center gap-2" asChild>
          <Link to="/login" state={{ returnUrl: '/subscribe' }}>
            <LogIn className="h-4 w-4" />
            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Link>
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <Link to="/signup">
            <UserPlus className="h-4 w-4" />
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LoginPrompt;
