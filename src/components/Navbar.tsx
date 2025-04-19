
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Globe, Pill, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Navbar: React.FC = () => {
  const { t, dir, language, toggleLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { icon: Globe, label: 'about', path: '/about' },
    { icon: Globe, label: 'termsOfUse', path: '/terms' },
    { icon: Globe, label: 'privacyPolicy', path: '/privacy' },
    { icon: Globe, label: 'copyright', path: '/copyright' },
    { icon: Globe, label: 'contactUs', path: '/contact' }
  ];
  
  const handleLanguageChange = () => {
    toggleLanguage();
    toast({
      title: language === 'en' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
      description: language === 'en' ? 'تم تطبيق التغييرات بنجاح' : 'Changes applied successfully',
      duration: 3000,
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
            <SheetHeader>
              <SheetTitle>{t('languageSwitch' as any)}</SheetTitle>
              <div className="flex items-center justify-between p-4">
                <Button onClick={handleLanguageChange} className="w-full">
                  <Globe className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'العربية' : 'English'}
                </Button>
              </div>
            </SheetHeader>
            <div className="p-4 space-y-2">
              {menuItems.map(({ icon: Icon, label, path }) => (
                <Link key={label} to={path} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Icon className="mr-2 h-4 w-4" />
                    {t(label as any)}
                  </Button>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'order-first' : 'order-last'}`}>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="hover:bg-white/10 text-white text-sm h-8 px-2">
                    <Link to="/dashboard">{t('dashboard' as any)}</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={logout} className="hover:bg-white/10 text-white text-sm h-8 px-2">
                  {t('logout' as any)}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg text-xs px-2 py-1 h-8"
              size="sm"
            >
              <Globe className="h-3 w-3" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
          </div>
        )}
      </nav>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="navbar px-4 py-3 shadow-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" dir={dir}>
          <div className="flex flex-col gap-3">
            {user && (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="w-full justify-start hover:bg-white/10 text-white text-sm">
                    <Link to="/dashboard">{t('dashboard' as any)}</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={logout} className="w-full justify-start hover:bg-white/10 text-white text-sm">
                  {t('logout' as any)}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center justify-center gap-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg text-xs px-2 py-1 h-8"
              size="sm"
            >
              <Globe className="h-3 w-3" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
