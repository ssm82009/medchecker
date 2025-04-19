
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Globe, Info, FileText, Lock, Copyright, PhoneCall, Menu } from 'lucide-react';

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
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white hover:bg-blue-600 rounded-full shadow-lg h-12 w-12 flex items-center justify-center"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{t('languageSwitch')}</SheetTitle>
          <div className="flex items-center justify-between p-4">
            <Button onClick={toggleLanguage} className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </Button>
          </div>
        </SheetHeader>
        <div className="p-4 space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <Link key={label} to={path} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Icon className="mr-2 h-4 w-4" />
                {t(label as any)}
              </Button>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HiddenMenu;
