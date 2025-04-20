
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setOpen(false); // Close the sheet when navigating
    navigate(path);
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
        <Sheet open={open} onOpenChange={setOpen}>
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
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/")}>
                {t('appTitle' as any)}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/about")}>
                {t('about' as any)}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/terms")}>
                {t('termsOfUse' as any)}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/privacy")}>
                {t('privacyPolicy' as any)}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/copyright")}>
                {t('copyright' as any)}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/contact")}>
                {t('contactUs' as any)}
              </Button>
              
              {/* Admin and Logout Buttons */}
              {user && (
                <>
                  {user.role === 'admin' && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigate("/dashboard")}>
                      {t('dashboard' as any)}
                    </Button>
                  )}
                  <Button variant="outline" onClick={logout} className="w-full justify-start">
                    {t('logout' as any)}
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
