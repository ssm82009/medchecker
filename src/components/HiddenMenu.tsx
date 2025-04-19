
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Drawer, 
  DrawerTrigger, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Globe, Info, FileText, Lock, Copyright, PhoneCall } from 'lucide-react';

const HiddenMenu: React.FC = () => {
  const { t, language, toggleLanguage } = useTranslation();

  const menuItems = [
    { icon: Info, label: 'about', path: '/about' },
    { icon: FileText, label: 'termsOfUse', path: '/terms' },
    { icon: Lock, label: 'privacyPolicy', path: '/privacy' },
    { icon: Copyright, label: 'copyright', path: '/copyright' },
    { icon: PhoneCall, label: 'contactUs', path: '/contact' }
  ];

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white hover:bg-blue-600"
        >
          <Info className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('languageSwitch')}</DrawerTitle>
          <div className="flex items-center justify-between p-4">
            <Button onClick={toggleLanguage} className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <Link key={label} to={path} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Icon className="mr-2 h-4 w-4" />
                {t(label)}
              </Button>
            </Link>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default HiddenMenu;
