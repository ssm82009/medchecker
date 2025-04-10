
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  User, CreditCard, History, TicketIcon, 
  Calendar, AlertCircle
} from "lucide-react";
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("profile");

  // Mock data for check history
  const checkHistory = [
    { 
      id: 1, 
      date: "2025-04-09", 
      medications: ["Aspirin", "Lisinopril", "Metformin"], 
      result: "potential_interaction" 
    },
    { 
      id: 2, 
      date: "2025-04-05", 
      medications: ["Paracetamol", "Ibuprofen"], 
      result: "no_interaction" 
    },
    { 
      id: 3, 
      date: "2025-04-01", 
      medications: ["Warfarin", "Aspirin", "Clopidogrel"], 
      result: "severe_interaction" 
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
        <LanguageSwitcher />
      </div>

      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{t('profile')}</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>{t('subscription')}</span>
          </TabsTrigger>
          <TabsTrigger value="check-history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>{t('checkHistory')}</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4" />
            <span>{t('support')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('profileInformation')}</CardTitle>
              <CardDescription>{t('updateProfileDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name">{t('name')}</label>
                  <Input id="name" defaultValue="محمد أحمد" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email">{t('email')}</label>
                  <Input id="email" type="email" defaultValue="mohammed@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password">{t('password')}</label>
                  <Input id="password" type="password" defaultValue="••••••••" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="language">{t('preferredLanguage')}</label>
                  <select 
                    id="language" 
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <Button className="mt-4">{t('saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{t('premium')}</h3>
                  <p className="mb-4 text-white/80">{t('activeUntil')}: 2026-04-10</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">$9 <span className="text-sm font-normal">/ {t('month')}</span></span>
                    <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      {t('managePlan')}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    {t('paymentHistory')}
                  </h3>
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span>2025-04-10</span>
                      <span className="font-medium">${t('language') === 'ar' ? '٩' : '9'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span>2025-03-10</span>
                      <span className="font-medium">${t('language') === 'ar' ? '٩' : '9'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>2025-02-10</span>
                      <span className="font-medium">${t('language') === 'ar' ? '٩' : '9'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="destructive">{t('cancelSubscription')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check-history">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkHistory')}</CardTitle>
              <CardDescription>{t('checkHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('medications')}</TableHead>
                    <TableHead>{t('result')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkHistory.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>{check.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {check.medications.map((med, idx) => (
                            <span 
                              key={idx} 
                              className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs"
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          check.result === 'no_interaction' ? 'bg-green-100 text-green-800' : 
                          check.result === 'potential_interaction' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {check.result === 'no_interaction' ? t('noInteraction') : 
                           check.result === 'potential_interaction' ? t('potentialInteraction') : 
                           t('severeInteraction')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">{t('viewDetails')}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>{t('submitSupportTicket')}</CardTitle>
              <CardDescription>{t('supportTicketDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="subject">{t('subject')}</label>
                  <Input id="subject" placeholder={t('ticketSubjectPlaceholder')} />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message">{t('message')}</label>
                  <Textarea 
                    id="message" 
                    placeholder={t('ticketMessagePlaceholder')}
                    rows={6}
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start gap-3 text-blue-800 dark:text-blue-200">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <p className="text-sm">{t('supportResponseTime')}</p>
                </div>
                
                <Button className="w-full">{t('submitTicket')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
