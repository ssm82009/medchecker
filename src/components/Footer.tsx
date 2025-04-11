
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { t, dir } = useTranslation();
  
  return (
    <footer className="bg-white border-t mt-auto py-6 px-6" dir={dir}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {t('footerCopyright')}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Link 
              to="/contact" 
              className="flex items-center gap-2 text-primary hover:underline transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{t('contactUs')}</span>
            </Link>
            
            <Link 
              to="/login" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              {t('login')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
