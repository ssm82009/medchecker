import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pill, Menu, CreditCard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Moon, Sun } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import useTheme from '@/hooks/useTheme';

const Navbar: React.FC = () => {
  const { t, dir, language } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const [open, setOpen] = React.useState(false);
  const handleLinkClick = () => {
    setOpen(false);
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50 w-full">
      <nav className="navbar flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mb-6 shadow-md mx-0 mt-0" dir={dir}>
        {/* Logo */}
        <div className={`navbar-brand text-xl font-bold flex items-center gap-2 ${language === 'ar' ? 'order-last' : 'order-first'}`}>
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2">
            <Pill className="h-6 w-6" />
            <span>{logoText}</span>
          </Link>
        </div>

        {/* Menu and Dark Mode Toggle */}
        <div className={`flex items-center gap-2 ${language === 'ar' ? 'order-first' : 'order-last'}`}>
          {/* Dark Mode Toggle */}          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-white/10 text-white hover:text-white"
          >
            {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </Button>

          {/* Menu Button */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
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
                  <Link to="/" onClick={handleLinkClick}>{t('appTitle' as any)}</Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/subscribe" onClick={handleLinkClick} className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'الاشتراك' : 'Subscribe'}
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/terms" onClick={handleLinkClick}>{t('termsOfUse' as any)}</Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/privacy" onClick={handleLinkClick}>{t('privacyPolicy' as any)}</Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/copyright" onClick={handleLinkClick}>{t('copyright' as any)}</Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/contact" onClick={handleLinkClick}>{t('contactUs' as any)}</Link>
                </Button>
                
                {/* Admin and Logout Buttons */}
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link to="/dashboard" onClick={handleLinkClick}>{t('dashboard' as any)}</Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link to="/my-account" onClick={handleLinkClick}>
                        {language === 'ar' ? 'حسابي' : 'My Account'}
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleLinkClick();
                        logout();
                      }} 
                      className="w-full justify-start"
                    >
                      {t('logout' as any)}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/login" onClick={handleLinkClick}>
                      {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
