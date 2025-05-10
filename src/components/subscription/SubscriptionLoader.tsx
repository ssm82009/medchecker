
import React from 'react';

interface SubscriptionLoaderProps {
  language: string;
}

const SubscriptionLoader: React.FC<SubscriptionLoaderProps> = ({ language }) => (
  <div className="flex justify-center items-center min-h-[40vh]">
    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
  </div>
);

export default SubscriptionLoader;
