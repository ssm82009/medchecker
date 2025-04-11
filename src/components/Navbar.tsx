
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const { t, dir, language, toggleLanguage } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  const { toast } = useToast();
  
  const handleLanguageChange = () => {
    toggleLanguage();
    
    // Show notification for language change
    toast({
      title: language === 'en' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English',
      description: language === 'en' ? 'تم تطبيق التغييرات بنجاح' : 'Changes applied successfully',
      duration: 3000,
    });
  };
  
  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mb-6 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 shadow-md mx-0 mt-0" dir={dir}>
      {/* Added justify-between to create space between the logo and navigation links */}
      
      <div className="navbar-brand text-xl font-bold text-white">
        <Link to="/">{logoText}</Link>
      </div>
      
      <div className="flex items-center gap-4">
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
          className="flex items-center gap-2 border-white/30 hover:bg-white/10 text-white"
        >
          <Globe className="h-4 w-4" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
