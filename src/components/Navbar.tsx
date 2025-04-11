
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Globe, Pill, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const { t, dir, language, toggleLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const handleLanguageChange = () => {
    toggleLanguage();
    
    // Show notification for language change
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
        className="navbar flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mb-6 bg-gradient-to-r from-purple-600 to-purple-600 shadow-md mx-0 mt-0" 
        dir={dir}
      >
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className={`flex items-center gap-3 ${language === 'ar' ? 'order-first' : 'order-last'}`}>
            {user && (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="hover:bg-white/10 text-white">
                    <Link to="/dashboard">{t('dashboard')}</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={logout} className="hover:bg-white/10 text-white">
                  {t('logout')}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
          </div>
        )}
        
        {/* Logo - Always on the right side for Arabic, left side for English */}
        <div className={`navbar-brand text-xl font-bold text-white flex items-center gap-2 ${language === 'ar' ? 'order-last' : 'order-first'}`}>
          <Link to="/" className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-white" />
            <span>{logoText}</span>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <div className="flex items-center">
            <Button 
              variant="ghost"
              onClick={toggleMobileMenu}
              className="p-1 text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        )}
      </nav>
      
      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-gradient-to-r from-purple-600 to-purple-600 px-4 py-3 shadow-lg" dir={dir}>
          <div className="flex flex-col gap-3">
            {user && (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="w-full justify-start hover:bg-white/10 text-white">
                    <Link to="/dashboard">{t('dashboard')}</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={logout} className="w-full justify-start hover:bg-white/10 text-white">
                  {t('logout')}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-purple-500 hover:from-purple-600 hover:to-purple-600 text-white border-none shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
