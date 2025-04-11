
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
          {/* Login Link (right in RTL, left in LTR) */}
          <div className="order-3 md:order-1 mt-4 md:mt-0">
            <Link 
              to="/login" 
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              {t('login')}
            </Link>
          </div>
          
          {/* Copyright (center) */}
          <div className="order-1 md:order-2 mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} {t('footerCopyright')}
            </p>
          </div>
          
          {/* Contact Us (left in RTL, right in LTR) */}
          <div className="order-2 md:order-3 mb-4 md:mb-0">
            <Link 
              to="/contact" 
              className="flex items-center gap-2 text-primary hover:underline transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>{t('contactUs')}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
