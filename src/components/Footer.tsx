
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Mail } from 'lucide-react';
import Advertisement from './Advertisement';
import { supabase } from '@/integrations/supabase/client';
import { useAppearance } from '@/hooks/useAppearance';

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
  const { settings, loading } = useAppearance();
  
  if (loading) {
    return <footer className="bg-white border-t mt-auto py-6 px-6" dir={dir}></footer>;
  }
  
  return (
    <>
      {/* Secondary Advertisement Area */}
      <SecondaryAdvertisement />
      
      <footer 
        className="border-t mt-auto py-6 px-6" 
        dir={dir}
        style={{ 
          backgroundColor: settings.footer_color,
          fontFamily: settings.font_family 
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Login Link (right in RTL, left in LTR) */}
            <div className="order-3 md:order-1 mt-4 md:mt-0">
              <Link 
                to="/login" 
                className="text-xs hover:text-primary transition-colors"
                style={{ color: settings.text_color }}
              >
                {t('login')}
              </Link>
            </div>
            
            {/* Copyright (center) */}
            <div className="order-1 md:order-2 mb-4 md:mb-0">
              <p className="text-sm" style={{ color: settings.text_color }}>
                &copy; {new Date().getFullYear()} {t('footerCopyright')}
              </p>
            </div>
            
            {/* Contact Us (left in RTL, right in LTR) */}
            <div className="order-2 md:order-3 mb-4 md:mb-0">
              <Link 
                to="/contact" 
                className="flex items-center gap-2 hover:underline transition-colors"
                style={{ color: settings.primary_color }}
              >
                <Mail className="h-4 w-4" />
                <span>{t('contactUs')}</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
