
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UserIdErrorProps {
  language: string;
}

const UserIdError: React.FC<UserIdErrorProps> = ({ language }) => {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            {language === 'ar' ? 'معرف المستخدم غير متوفر' : 'User ID not available'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserIdError;
