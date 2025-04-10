
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, CreditCard, Users, TicketIcon } from "lucide-react";
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("ai-settings");

  // Mock data for users
  const users = [
    { id: 1, name: "محمد أحمد", email: "mohammed@example.com", status: "active", plan: "premium" },
    { id: 2, name: "سارة خالد", email: "sarah@example.com", status: "active", plan: "free" },
    { id: 3, name: "John Smith", email: "john@example.com", status: "inactive", plan: "premium" },
  ];

  // Mock data for support tickets
  const tickets = [
    { id: 1, user: "محمد أحمد", subject: "مشكلة في الدفع", status: "open", date: "2025-04-09" },
    { id: 2, user: "سارة خالد", subject: "استفسار حول التفاعلات", status: "closed", date: "2025-04-05" },
    { id: 3, user: "John Smith", subject: "Account access issue", status: "pending", date: "2025-04-08" },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('adminPanel')}</h1>
        <LanguageSwitcher />
      </div>

      <Tabs
        defaultValue="ai-settings"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="ai-settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>{t('aiSettings')}</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>{t('subscriptions')}</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{t('users')}</span>
          </TabsTrigger>
          <TabsTrigger value="support-tickets" className="flex items-center gap-2">
            <TicketIcon className="h-4 w-4" />
            <span>{t('supportTickets')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-settings">
          <Card>
            <CardHeader>
              <CardTitle>{t('aiSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-model">{t('aiModel')}</Label>
                  <Input id="ai-model" defaultValue="gpt-4o-mini" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">{t('apiKey')}</Label>
                  <Input id="api-key" type="password" defaultValue="sk-••••••••••••••••••••••" />
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch id="enable-ai" defaultChecked />
                  <Label htmlFor="enable-ai">{t('enableAI')}</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-tokens">{t('maxTokens')}</Label>
                  <Input id="max-tokens" type="number" defaultValue="1000" />
                </div>
              </div>

              <Button className="mt-4">{t('saveSettings')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptionManagement')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-price">{t('monthlyPrice')}</Label>
                  <Input id="monthly-price" type="number" defaultValue="9" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearly-price">{t('yearlyPrice')}</Label>
                  <Input id="yearly-price" type="number" defaultValue="90" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">{t('paypalClientId')}</Label>
                  <Input id="paypal-client-id" />
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch id="enable-payments" defaultChecked />
                  <Label htmlFor="enable-payments">{t('enablePayments')}</Label>
                </div>
              </div>

              <Button className="mt-4">{t('saveSettings')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('id')}</TableHead>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('plan')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? t('active') : t('inactive')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.plan === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.plan === 'premium' ? t('premium') : t('free')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button variant="outline" size="sm">{t('edit')}</Button>
                          <Button variant="destructive" size="sm">{t('delete')}</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support-tickets">
          <Card>
            <CardHeader>
              <CardTitle>{t('supportTickets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('id')}</TableHead>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('subject')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.user}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 
                          ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status === 'open' ? t('open') : 
                           ticket.status === 'pending' ? t('pending') : 
                           t('closed')}
                        </span>
                      </TableCell>
                      <TableCell>{ticket.date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Button variant="outline" size="sm">{t('view')}</Button>
                          <Button variant="outline" size="sm">{t('reply')}</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
