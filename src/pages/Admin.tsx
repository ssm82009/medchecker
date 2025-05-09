
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from '@/types';

interface AdminUser extends User {
  is_active: boolean;
}

const Admin = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*');

      if (search) {
        query = query.ilike('email', `%${search}%`);
      }

      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('error'),
        description: t('failedToFetchUsers'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActiveStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', parseInt(userId, 10));
      
      if (error) throw error;
      
      toast({
        title: t('success'),
        description: isActive ? t('userActivated') : t('userDeactivated'),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingUser'),
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter ? user.role === roleFilter : true)
  );

  if (loading) {
    return <div className="flex justify-center items-center min-h-[40vh]">{t('loading')}...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{t('adminDashboard')}</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{t('filterUsers')}</CardTitle>
          <CardDescription>{t('searchAndFilterUsers')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">{t('search')}</Label>
              <Input
                type="text"
                id="search"
                placeholder={t('searchByEmail')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchUsers();
                }}
              />
            </div>
            <div>
              <Label htmlFor="role">{t('filterByRole')}</Label>
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value);
                fetchUsers();
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allRoles')}</SelectItem>
                  <SelectItem value="user">{t('user')}</SelectItem>
                  <SelectItem value="admin">{t('admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableCaption>{t('userManagement')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t('id')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('active')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{t(user.role)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleActiveStatus(user.id.toString(), !user.is_active)}
                >
                  {user.is_active ? t('deactivate') : t('activate')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>{t('totalUsers')}: {users.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default Admin;
