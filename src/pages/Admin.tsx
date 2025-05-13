
import React, { useState, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

const adminSections = [
  { key: 'ai', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { key: 'logo', label: 'إعدادات الشعار', icon: ImageIcon },
  { key: 'ad', label: 'الإعلانات', icon: BadgeDollarSign },
  { key: 'plans', label: 'الخطط', icon: Layers },
  { key: 'users', label: 'إدارة الأعضاء', icon: Users },
  { key: 'transactions', label: 'إدارة المعاملات', icon: History },
  { key: 'paypal', label: 'بوابة الدفع بايبال', icon: CreditCard },
];

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState('ai');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading) {
        console.log('Admin Page - Checking admin status');
        
        if (!user) {
          console.log('Admin Page - No user found, redirecting to login');
          toast({
            title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
            description: language === 'ar' 
              ? 'يجب تسجيل الدخول للوصول إلى لوحة المشرف' 
              : 'You must be logged in to access the admin panel',
            variant: 'destructive'
          });
          navigate('/login');
          return;
        }
        
        console.log("Admin Page - Current user:", user);
        console.log("Admin Page - User role:", user.role);
        
        // التحقق من صلاحيات المشرف
        let isAdminUser = user.role === 'admin';
        
        console.log("Admin Page - Is admin:", isAdminUser);
        
        if (!isAdminUser) {
          console.log('Admin Page - User is not an admin, redirecting');
          
          toast({
            title: language === 'ar' ? 'غير مصرح' : 'Unauthorized',
            description: language === 'ar' 
              ? 'ليس لديك صلاحية الوصول لهذه الصفحة' 
              : 'You do not have permission to access this page',
            variant: 'destructive'
          });
          
          navigate('/');
          return;
        }
        
        setCheckingPermissions(false);
      }
    };
    
    checkAdminStatus();
  }, [user, loading, navigate, language]);

  if (loading || checkingPermissions) {
    return <div className="flex h-screen items-center justify-center">
      {language === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Verifying permissions...'}
    </div>;
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r shadow-lg flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xl font-bold mb-6 text-primary">لوحة المشرف</h2>
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

export default Admin;
