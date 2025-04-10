
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="space-y-6">
        <h1 className="text-6xl font-bold text-primary">{t('language') === 'ar' ? '٤٠٤' : '404'}</h1>
        <h2 className="text-2xl font-semibold">{t('pageNotFound')}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t('pageNotFoundDesc')}
        </p>
        <Button asChild className="mt-4">
          <Link to="/">{t('returnHome')}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
