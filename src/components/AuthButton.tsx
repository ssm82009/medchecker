
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Settings } from 'lucide-react';

const AuthButton = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('logoutSuccess'),
        description: t('comeBackSoon'),
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('logoutError'),
        description: t('tryAgainLater'),
        variant: 'destructive',
      });
    }
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline-block">{user.email?.split('@')[0]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button asChild variant="outline" className="gap-2">
      <Link to="/auth">
        <LogIn className="h-4 w-4" />
        <span>{t('login')}</span>
      </Link>
    </Button>
  );
};

export default AuthButton;
