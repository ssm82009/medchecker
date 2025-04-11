
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Mail } from 'lucide-react';
import Advertisement from './Advertisement';
import { supabase } from '@/integrations/supabase/client';

const SecondaryAdvertisement: React.FC = () => {
  const [htmlContent, setHtmlContent] = React.useState<string>('');

  React.useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('type', 'secondary_advertisement')
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching secondary advertisement:', error);
          return;
        }
        
        if (data?.value && typeof data.value === 'object' && 'html' in data.value) {
          setHtmlContent((data.value as any).html as string);
        }
      } catch (error) {
        console.error('Error in secondary advertisement component:', error);
      }
    };
    
    fetchAdvertisement();
  }, []);

  if (!htmlContent) return null;
  
  return (
    <div 
      className="mb-6 w-full overflow-hidden" 
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

const Footer: React.FC = () => {
  const { t, dir } = useTranslation();
  
  return (
    <>
      {/* Secondary Advertisement Area */}
      <SecondaryAdvertisement />
      
      <footer className="bg-white border-t mt-auto py-6 px-6" dir={dir}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Login Link (right in RTL, left in LTR) */}
            <div className="order-3 md:order-1 mt-4 md:mt-0">
              <Link 
                to="/login" 
                className="text-xs text-gray-700 hover:text-primary transition-colors"
              >
                {t('login')}
              </Link>
            </div>
            
            {/* Copyright (center) */}
            <div className="order-1 md:order-2 mb-4 md:mb-0">
              <p className="text-gray-800 text-sm">
                &copy; {new Date().getFullYear()} دواء آمن - {t('footerCopyright')}
              </p>
            </div>
            
            {/* Contact Us (left in RTL, right in LTR) */}
            <div className="order-2 md:order-3 mb-4 md:mb-0">
              <a 
                href="https://t.me/icodexteam" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{t('contactUs')}</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
