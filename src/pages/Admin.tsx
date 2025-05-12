
import React, { useState } from 'react';
import { Settings, UserCog, Layers, Users, Image as ImageIcon, BadgeDollarSign, CreditCard, History } from 'lucide-react';
import AISettings from '@/components/admin/AISettings';
import LogoSettings from '@/components/admin/LogoSettings';
import AdvertisementSettings from '@/components/admin/AdvertisementSettings';
import PlansManager from '@/components/admin/PlansManager';
import UsersManager from '@/components/admin/UsersManager';
import PaypalSettings from '@/components/admin/PaypalSettings';
import TransactionsManager from '@/components/admin/TransactionsManager';

const adminSections = [
  { key: 'ai', label: 'إعدادات الذكاء الاصطناعي', icon: Settings },
  { key: 'logo', label: 'إعدادات الشعار', icon: ImageIcon },
  { key: 'ad', label: 'الإعلانات', icon: BadgeDollarSign },
  { key: 'plans', label: 'الخطط', icon: Layers },
  { key: 'users', label: 'إدارة الأعضاء', icon: Users },
  { key: 'transactions', label: 'إدارة المعاملات', icon: History },
  { key: 'paypal', label: 'بوابة الدفع بايبال', icon: CreditCard },
];

const Admin: React.FC = () => {
  const [activeSection, setActiveSection] = useState('ai');
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white/90 border-r shadow-lg flex flex-col py-8 px-4 gap-2">
        <h2 className="text-xl font-bold mb-6 text-primary">لوحة المشرف</h2>
        {adminSections.map(section => (
          <button
            key={section.key}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-base font-medium mb-1 hover:bg-primary/10 ${activeSection === section.key ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700'}`}
            onClick={() => setActiveSection(section.key)}
          >
            <section.icon className="w-5 h-5" />
            {section.label}
          </button>
        ))}
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeSection === 'ai' && <AISettings />}
        {activeSection === 'logo' && <LogoSettings />}
        {activeSection === 'ad' && <AdvertisementSettings />}
        {activeSection === 'plans' && <PlansManager />}
        {activeSection === 'users' && <UsersManager />}
        {activeSection === 'transactions' && <TransactionsManager />}
        {activeSection === 'paypal' && <PaypalSettings />}
      </main>
    </div>
  );
};

export default Admin;
