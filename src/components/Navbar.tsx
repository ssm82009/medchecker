
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Globe, Pill, HeartPulse, Stethoscope, Leaf } from 'lucide-react';
import { useAppearance } from '@/hooks/useAppearance';

// مكون أيقونة الشعار
const LogoIcon = ({ iconName }: { iconName: string }) => {
  switch (iconName) {
    case 'pill':
      return <Pill className="h-5 w-5" />;
    case 'heart-pulse':
      return <HeartPulse className="h-5 w-5" />;
    case 'stethoscope':
      return <Stethoscope className="h-5 w-5" />;
    case 'leaf':
      return <Leaf className="h-5 w-5" />;
    default:
      return <Pill className="h-5 w-5" />;
  }
};

const Navbar: React.FC = () => {
  const { t, dir, language, toggleLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { settings, loading } = useAppearance();
  
  const handleLanguageChange = () => {
    toggleLanguage();
    
    // Show notification for language change
    toast({
      title: language === 'en' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
      description: language === 'en' ? 'تم تطبيق التغييرات بنجاح' : 'Changes applied successfully',
      duration: 3000,
    });
  };
  
  if (loading) {
    return (
      <nav className="navbar flex justify-between items-center px-6 py-4 mb-6 bg-white shadow-sm rounded-lg mx-4 mt-4" dir={dir}>
        <div className="navbar-brand text-xl font-bold text-primary">
          <span>دواء آمن</span>
        </div>
        <div></div>
      </nav>
    );
  }
  
  return (
    <nav 
      className="navbar flex items-center px-6 py-4 mb-6 shadow-sm rounded-lg mx-4 mt-4"
      dir={dir}
      style={{ 
        backgroundColor: settings.navbar_color,
        fontFamily: settings.font_family,
        justifyContent: dir === 'rtl' ? 'space-between' : 'space-between'
      }}
    >
      {dir === 'rtl' ? (
        <>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
            
            {user && (
              <>
                <Button variant="ghost" onClick={logout} className="hover:bg-primary/10">
                  {t('logout')}
                </Button>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="hover:bg-primary/10">
                    <Link to="/dashboard">{t('dashboard')}</Link>
                  </Button>
                )}
              </>
            )}
          </div>
          
          <div className="navbar-brand text-xl font-bold flex items-center gap-2" style={{ color: settings.primary_color }}>
            <LogoIcon iconName={settings.logo_icon} />
            <Link to="/">{settings.logo_text}</Link>
          </div>
        </>
      ) : (
        <>
          <div className="navbar-brand text-xl font-bold flex items-center gap-2" style={{ color: settings.primary_color }}>
            <LogoIcon iconName={settings.logo_icon} />
            <Link to="/">{settings.logo_text}</Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                {user.role === 'admin' && (
                  <Button variant="ghost" asChild className="hover:bg-primary/10">
                    <Link to="/dashboard">{t('dashboard')}</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={logout} className="hover:bg-primary/10">
                  {t('logout')}
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLanguageChange} 
              className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
