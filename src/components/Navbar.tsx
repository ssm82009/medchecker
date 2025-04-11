
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const Navbar: React.FC = () => {
  const { t, dir } = useTranslation();
  const { user, logout } = useAuth();
  const [logoText] = useLocalStorage<string>('logoText', 'دواء آمن');
  
  return (
    <nav className="navbar flex justify-between items-center px-6 py-3 mb-6" dir={dir}>
      <div className="navbar-brand text-xl">
        <Link to="/">{logoText}</Link>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.role === 'admin' && (
              <Button variant="ghost" asChild>
                <Link to="/dashboard">{t('dashboard')}</Link>
              </Button>
            )}
            <Button variant="ghost" onClick={logout}>
              {t('logout')}
            </Button>
          </>
        ) : (
          <Button variant="ghost" asChild>
            <Link to="/login">{t('login')}</Link>
          </Button>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  );
};

export default Navbar;
