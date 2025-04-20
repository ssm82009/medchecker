
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
  const [open, setOpen] = React.useState(false);

  const handleNavigate = () => {
    setOpen(false);
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
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/">{t('appTitle' as any)}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/about">{t('about' as any)}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/terms">{t('termsOfUse' as any)}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/privacy">{t('privacyPolicy' as any)}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/copyright">{t('copyright' as any)}</Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                <Link to="/contact">{t('contactUs' as any)}</Link>
              </Button>
              
              {/* Admin and Logout Buttons */}
              {user && (
                <>
                  {user.role === 'admin' && (
                    <Button variant="outline" asChild className="w-full justify-start" onClick={handleNavigate}>
                      <Link to="/dashboard">{t('dashboard' as any)}</Link>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      logout();
                      handleNavigate();
                    }} 
                    className="w-full justify-start"
                  >
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

