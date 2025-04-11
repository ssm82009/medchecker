
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Mail } from 'lucide-react';
import Advertisement from './Advertisement';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Secondary Advertisement Area */}
      <SecondaryAdvertisement />
      
      <footer className="bg-white border-t mt-auto py-6 sm:py-8 px-4 sm:px-6" dir={dir}>
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-5 sm:gap-4">
            {/* Login Link (right in RTL, left in LTR) */}
            <div className="order-3 sm:order-1 w-full sm:w-auto text-center sm:text-start">
              <Link 
                to="/login" 
                className="text-sm text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
              >
                {t('login')}
              </Link>
            </div>
            
            {/* Copyright (center) */}
            <div className="order-1 sm:order-2 w-full text-center mb-4 sm:mb-0">
              <p className="text-gray-800 text-sm">
                جميع الحقوق محفوظة © لـ تطبيق دواء آمن
              </p>
            </div>
            
            {/* Contact Us (left in RTL, right in LTR) */}
            <div className="order-2 sm:order-3 w-full sm:w-auto text-center sm:text-end mb-4 sm:mb-0">
              <a 
                href="https://t.me/icodexteam" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center sm:justify-start gap-2 text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-gray-100"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">{t('contactUs')}</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
