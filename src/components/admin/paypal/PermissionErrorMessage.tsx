
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PermissionErrorMessage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="mb-8 max-w-xl mx-auto">
      <CardHeader><CardTitle>إعدادات بوابة الدفع بايبال</CardTitle></CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
          <h3 className="text-lg font-bold text-red-700 mb-2">خطأ في الصلاحيات</h3>
          <p className="text-red-600">يجب أن تكون مسجلًا كمشرف للوصول إلى هذه الإعدادات.</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => navigate('/login')}
          >
            إعادة تسجيل الدخول
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionErrorMessage;
