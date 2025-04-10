
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import AuthButton from './AuthButton';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <header className="w-full py-4 px-6 bg-background border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-primary">
          {t('appTitle')}
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            {t('home')}
          </Link>
          {user && (
            <Link to="/profile" className="text-foreground hover:text-primary transition-colors">
              {t('profile')}
            </Link>
          )}
          {user && user.email?.endsWith('@admin.com') && (
            <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
              {t('adminPanel')}
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <AuthButton />
      </div>
    </header>
  );
};

export default Header;
