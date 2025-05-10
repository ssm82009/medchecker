
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UserIdErrorProps {
  language: string;
}

const UserIdError: React.FC<UserIdErrorProps> = ({ language }) => {
  const { user } = useAuth();
  
  // Show more detailed debugging information
  console.error("UserIdError component rendered. User object:", user);
  
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            {language === 'ar' ? 'معرف المستخدم غير متوفر' : 'User ID not available'}
          </span>
        </div>
        <div className="mt-2 text-sm text-amber-600">
          {language === 'ar' 
            ? 'يرجى تسجيل الخروج وإعادة تسجيل الدخول مرة أخرى.'
            : 'Please logout and login again to fix this issue.'}
        </div>
      </div>
    </div>
  );
};

export default UserIdError;
