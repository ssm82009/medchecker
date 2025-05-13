
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 
import { useTranslation } from '@/hooks/useTranslation'; 
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Users, Layers, BadgeDollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation(); 
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [loadingSettings, setLoadingSettings] = useState(true);

  // التحقق من الصلاحيات وتحميل الإعدادات
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
        console.log("Dashboard - User auth data:", user);
        
        // التحقق من صلاحية المشرف
        let isAdminUser = false;
        
        // أولاً تحقق مما إذا كان الدور معيناً على 'admin'
        if (user.role === 'admin') {
          console.log("Dashboard - User has admin role set directly");
          isAdminUser = true;
        } 
        
        console.log("Dashboard - Final admin status:", isAdminUser);
        
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
          // تحميل إعدادات الموقع
          try {
            setLoadingSettings(true);
            
            // تحميل إعدادات الذكاء الاصطناعي
            const { data: aiSettings } = await supabase
              .from('settings')
              .select('value')
              .eq('type', 'ai_settings')
              .maybeSingle();
              
            // تحميل إعدادات الشعار
            const { data: logoSettings } = await supabase
              .from('settings')
              .select('value')
              .eq('type', 'logo')
              .maybeSingle();
              
            // تحميل إعدادات الإعلانات
            const { data: adSettings } = await supabase
              .from('settings')
              .select('value')
              .eq('type', 'advertisement')
              .maybeSingle();
              
            // تجميع الإعدادات
            setSiteSettings({
              ai: aiSettings?.value || { model: 'غير محدد', apiKeySet: false },
              logo: logoSettings?.value || 'دواء آمن',
              ad: adSettings?.value || 'لا يوجد إعلان محدد'
            });
            
            setLoadingSettings(false);
          } catch (error) {
            console.error('Error loading settings:', error);
            setLoadingSettings(false);
          }
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

  // عرض عنصر تحميل أثناء تحميل الإعدادات
  if (loadingSettings) {
    return <div className="text-center py-20">
      {language === 'ar' ? 'جاري تحميل إعدادات الموقع...' : 'Loading site settings...'}
    </div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' 
            ? `مرحباً بك في لوحة التحكم الخاصة بالمسؤولين (${user?.email})` 
            : `Welcome to the admin dashboard (${user?.email})`
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ملخص إعدادات الذكاء الاصطناعي */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              {language === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{language === 'ar' ? 'النموذج المستخدم:' : 'Model:'}</span>
                <span>{siteSettings.ai.model || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{language === 'ar' ? 'مفتاح API:' : 'API Key:'}</span>
                <span>{siteSettings.ai.apiKey ? (language === 'ar' ? 'تم التعيين' : 'Set') : (language === 'ar' ? 'غير معين' : 'Not set')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* ملخص إعدادات الشعار */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BadgeDollarSign className="w-5 h-5 mr-2" />
              {language === 'ar' ? 'إعدادات الشعار والإعلانات' : 'Logo & Ads Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{language === 'ar' ? 'نص الشعار:' : 'Logo Text:'}</span>
                <span>{typeof siteSettings.logo === 'string' ? siteSettings.logo : '—'}</span>
              </div>
              <div>
                <span className="font-medium">{language === 'ar' ? 'الإعلانات:' : 'Advertisements:'}</span>
                <span className="ml-2">{siteSettings.ad ? (language === 'ar' ? 'تم التعيين' : 'Set') : (language === 'ar' ? 'غير معينة' : 'Not set')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* روابط الإعدادات وصفحات المشرف */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {language === 'ar' ? 'إدارة الموقع' : 'Site Management'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
            <Link to="/admin">
              <Settings className="h-8 w-8 mb-2" />
              <span>{language === 'ar' ? 'لوحة المشرف' : 'Admin Panel'}</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
            <Link to="/admin?section=users">
              <Users className="h-8 w-8 mb-2" />
              <span>{language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-24 flex flex-col justify-center">
            <Link to="/admin?section=plans">
              <Layers className="h-8 w-8 mb-2" />
              <span>{language === 'ar' ? 'إدارة الخطط' : 'Manage Plans'}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
