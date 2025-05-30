
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, UserCog, Layers, Users, Image as ImageIcon, BadgeDollarSign, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { language } = useTranslation();

  // The admin check is now done in the ProtectedRoute component in App.tsx
  // This component will only render if the user is an admin
  
  const dashboardCards = [
    { 
      title: language === 'ar' ? 'إعدادات الموقع' : 'Site Settings', 
      description: language === 'ar' ? 'تعديل إعدادات الموقع، الشعار، الاعلانات وغيرها' : 'Modify site settings, logo, ads, and more',
      icon: Settings,
      link: '/site-settings',
      color: 'bg-blue-50'
    },
    { 
      title: language === 'ar' ? 'إدارة الأعضاء' : 'User Management', 
      description: language === 'ar' ? 'إدارة الأعضاء، تعديل الصلاحيات وإدارة المشتركين' : 'Manage users, edit permissions and manage subscribers',
      icon: Users,
      link: '/site-settings?section=users',
      color: 'bg-green-50'
    },
    { 
      title: language === 'ar' ? 'إدارة الخطط' : 'Plan Management', 
      description: language === 'ar' ? 'إدارة خطط الاشتراك، الأسعار والميزات' : 'Manage subscription plans, prices and features',
      icon: Layers,
      link: '/site-settings?section=plans',
      color: 'bg-purple-50'
    },
    { 
      title: language === 'ar' ? 'إدارة المعاملات' : 'Transaction Management', 
      description: language === 'ar' ? 'مراقبة المعاملات المالية وإدارة المدفوعات' : 'Monitor financial transactions and manage payments',
      icon: CreditCard,
      link: '/site-settings?section=transactions',
      color: 'bg-yellow-50'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
        </h1>
        <p className="text-gray-600">
          {language === 'ar' 
            ? 'مرحباً بك في لوحة التحكم الخاصة بالمسؤولين. هنا يمكنك إدارة إعدادات الموقع والمستخدمين.' 
            : 'Welcome to the admin dashboard. Here you can manage site settings and users.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className={`${card.color} border shadow-md hover:shadow-lg transition-shadow`}>
            <CardHeader className="pb-2">
              <card.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-700">{card.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={card.link}>
                  {language === 'ar' ? 'الذهاب' : 'Go'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
