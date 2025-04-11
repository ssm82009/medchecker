
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
    <nav className="navbar flex items-center px-6 py-4 mb-6 bg-white shadow-sm rounded-lg mx-4 mt-4" dir={dir}>
      {/* نزيل justify-between ليتم عرض العناصر بشكل مناسب في RTL */}
      
      <div className="navbar-brand text-xl font-bold text-primary">
        <Link to="/">{logoText}</Link>
      </div>
      
      <div className={`flex items-center gap-4 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
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
    </nav>
  );
};

export default Navbar;
