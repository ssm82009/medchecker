
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pill, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const { t, dir, language } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');

  // Get translations for menu items based on current language
  const getMenuLabel = (key: string): string => {
    if (language === 'ar') {
      switch (key) {
        case 'appTitle': return 'الرئيسية';
        case 'about': return 'حول البرنامج';
        case 'termsOfUse': return 'شروط الاستخدام';
        case 'privacyPolicy': return 'سياسة الخصوصية';
        case 'copyright': return 'حقوق النشر';
        case 'contactUs': return 'اتصل بنا';
        case 'dashboard': return 'لوحة التحكم';
        case 'logout': return 'تسجيل الخروج';
        default: return t(key as any);
      }
    }
    return t(key as any);
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav 
        className="navbar flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mb-6 shadow-md mx-0 mt-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" 
        dir={dir}
      >
        {/* Logo */}
        <div className={`navbar-brand text-xl font-bold text-white flex items-center gap-2 ${language === 'ar' ? 'order-last' : 'order-first'}`}>
          <Link to="/" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-white" />
            <span>{logoText}</span>
          </Link>
        </div>

        {/* Menu Button and Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={language === 'ar' ? 'right' : 'left'}>
            <div className="flex flex-col gap-4 mt-6">
              {/* Language Switcher */}
              <div className="mb-4">
                <LanguageSwitcher />
              </div>
              
              {/* Page Links */}
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/">{getMenuLabel('appTitle')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/about">{getMenuLabel('about')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/terms">{getMenuLabel('termsOfUse')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/privacy">{getMenuLabel('privacyPolicy')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/copyright">{getMenuLabel('copyright')}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link to="/contact">{getMenuLabel('contactUs')}</Link>
              </Button>
              
              {/* Admin and Logout Buttons */}
              {user && (
                <>
                  {user.role === 'admin' && (
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/dashboard">{getMenuLabel('dashboard')}</Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout} className="w-full justify-start">
                    {getMenuLabel('logout')}
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Navbar;
