
import React, { useState } from 'react';
import { Settings, UserCog, Layers, Users, Image as ImageIcon, BadgeDollarSign, CreditCard, History } from 'lucide-react';
import AISettings from '@/components/admin/AISettings';
import LogoSettings from '@/components/admin/LogoSettings';
import AdvertisementSettings from '@/components/admin/AdvertisementSettings';
import PlansManager from '@/components/admin/PlansManager';
import UsersManager from '@/components/admin/UsersManager';
import PaypalSettings from '@/components/admin/PaypalSettings';
import TransactionsManager from '@/components/admin/TransactionsManager';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const adminSections = [
  { key: 'ai', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { key: 'logo', label: 'إعدادات الشعار', icon: ImageIcon },
  { key: 'ad', label: 'الإعلانات', icon: BadgeDollarSign },
  { key: 'plans', label: 'الخطط', icon: Layers },
  { key: 'users', label: 'إدارة الأعضاء', icon: Users },
  { key: 'transactions', label: 'إدارة المعاملات', icon: History },
  { key: 'paypal', label: 'بوابة الدفع بايبال', icon: CreditCard },
];

const SiteSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('ai');
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

          if (error) {
            console.error('Error fetching user role:', error);
            toast({
              title: language === 'ar' ? 'خطأ في التحقق' : 'Verification Error',
              description: error.message,
              variant: 'destructive'
            });
            navigate('/');
            return;
          }

          if (userData.role !== 'admin') {
            toast({
              title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
              description: language === 'ar' 
                ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
                : 'You do not have permission to access this page',
              variant: 'destructive'
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
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
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r shadow-lg flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xl font-bold mb-6 text-primary">إعدادات الموقع</h2>
        {adminSections.map(section => (
          <button
            key={section.key}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-base font-medium mb-1 hover:bg-primary/10 ${activeSection === section.key ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700'}`}
            onClick={() => setActiveSection(section.key)}
          >
            <section.icon className="w-5 h-5" />
            {section.label}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'ai' && <AISettings />}
        {activeSection === 'logo' && <LogoSettings />}
        {activeSection === 'ad' && <AdvertisementSettings />}
        {activeSection === 'plans' && <PlansManager />}
        {activeSection === 'users' && <UsersManager />}
        {activeSection === 'transactions' && <TransactionsManager />}
        {activeSection === 'paypal' && <PaypalSettings />}
      </main>
    </div>
  );
};

export default SiteSettings;
