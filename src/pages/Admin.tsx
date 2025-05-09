import React, { useState, useEffect, useCallback } from 'react';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridActionsCellItem,
  GridRowParams,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Edit, Delete, KeyRound, CheckCircle, Cancel } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PayPalSettings } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const Admin = () => {
  const { t, language } = useTranslation();
  const { user, updateUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
  const [logoText, setLogoText] = useState('');

  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings | null>(null);

  const [isPaypalEditMode, setIsPaypalEditMode] = useState(false);

  const [isLogoTextEditMode, setIsLogoTextEditMode] = useState(false);

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const [isMaintenanceEditMode, setIsMaintenanceEditMode] = useState(false);

  const [isMaintenanceMessageEditMode, setIsMaintenanceMessageEditMode] = useState(false);

  const [isMaintenanceModeEnabled, setIsMaintenanceModeEnabled] = useState(false);

  const [isMaintenanceMessageEnabled, setIsMaintenanceMessageEnabled] = useState(false);

  const [maintenanceSettings, setMaintenanceSettings] = useState<{ enabled: boolean; message: string } | null>(null);

  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null);

  const [isPlanCodeEditMode, setIsPlanCodeEditMode] = useState(false);

  const [selectedUserForPlanCode, setSelectedUserForPlanCode] = useState<User | null>(null);

  const [isUserPlanCodeEditModalOpen, setIsUserPlanCodeEditModalOpen] = useState(false);

  const [isUserActive, setIsUserActive] = useState(true);

  const [isUserActiveEditMode, setIsUserActiveEditMode] = useState(false);

  const [selectedUserForActiveStatus, setSelectedUserForActiveStatus] = useState<User | null>(null);

  const [isUserActiveEditModalOpen, setIsUserActiveEditModalOpen] = useState(false);

  const [isUserActiveStatusEditMode, setIsUserActiveStatusEditMode] = useState(false);

  const [isUserVerified, setIsUserVerified] = useState(true);

  const [isUserVerifiedEditMode, setIsUserVerifiedEditMode] = useState(false);

  const [selectedUserForVerifiedStatus, setSelectedUserForVerifiedStatus] = useState<User | null>(null);

  const [isUserVerifiedEditModalOpen, setIsUserVerifiedEditModalOpen] = useState(false);

  const [isUserVerifiedStatusEditMode, setIsUserVerifiedStatusEditMode] = useState(false);

  const [isUserBanned, setIsUserBanned] = useState(false);

  const [isUserBannedEditMode, setIsUserBannedEditMode] = useState(false);

  const [selectedUserForBannedStatus, setSelectedUserForBannedStatus] = useState<User | null>(null);

  const [isUserBannedEditModalOpen, setIsUserBannedEditModalOpen] = useState(false);

  const [isUserBannedStatusEditMode, setIsUserBannedStatusEditMode] = useState(false);

  const [isUserSuspended, setIsUserSuspended] = useState(false);

  const [isUserSuspendedEditMode, setIsUserSuspendedEditMode] = useState(false);

  const [selectedUserForSuspendedStatus, setSelectedUserForSuspendedStatus] = useState<User | null>(null);

  const [isUserSuspendedEditModalOpen, setIsUserSuspendedEditModalOpen] = useState(false);

  const [isUserSuspendedStatusEditMode, setIsUserSuspendedStatusEditMode] = useState(false);

  const [isUserLocked, setIsUserLocked] = useState(false);

  const [isUserLockedEditMode, setIsUserLockedEditMode] = useState(false);

  const [selectedUserForLockedStatus, setSelectedUserForLockedStatus] = useState<User | null>(null);

  const [isUserLockedEditModalOpen, setIsUserLockedEditModalOpen] = useState(false);

  const [isUserLockedStatusEditMode, setIsUserLockedStatusEditMode] = useState(false);

  const [isUserRestricted, setIsUserRestricted] = useState(false);

  const [isUserRestrictedEditMode, setIsUserRestrictedEditMode] = useState(false);

  const [selectedUserForRestrictedStatus, setSelectedUserForRestrictedStatus] = useState<User | null>(null);

  const [isUserRestrictedEditModalOpen, setIsUserRestrictedEditModalOpen] = useState(false);

  const [isUserRestrictedStatusEditMode, setIsUserRestrictedStatusEditMode] = useState(false);

  const [isUserFlagged, setIsUserFlagged] = useState(false);

  const [isUserFlaggedEditMode, setIsUserFlaggedEditMode] = useState(false);

  const [selectedUserForFlaggedStatus, setSelectedUserForFlaggedStatus] = useState<User | null>(null);

  const [isUserFlaggedEditModalOpen, setIsUserFlaggedEditModalOpen] = useState(false);

  const [isUserFlaggedStatusEditMode, setIsUserFlaggedStatusEditMode] = useState(false);

  const [isUserAudited, setIsUserAudited] = useState(false);

  const [isUserAuditedEditMode, setIsUserAuditedEditMode] = useState(false);

  const [selectedUserForAuditedStatus, setSelectedUserForAuditedStatus] = useState<User | null>(null);

  const [isUserAuditedEditModalOpen, setIsUserAuditedEditModalOpen] = useState(false);

  const [isUserAuditedStatusEditMode, setIsUserAuditedStatusEditMode] = useState(false);

  const [isUserReviewed, setIsUserReviewed] = useState(false);

  const [isUserReviewedEditMode, setIsUserReviewedEditMode] = useState(false);

  const [selectedUserForReviewedStatus, setSelectedUserForReviewedStatus] = useState<User | null>(null);

  const [isUserReviewedEditModalOpen, setIsUserReviewedEditModalOpen] = useState(false);

  const [isUserReviewedStatusEditMode, setIsUserReviewedStatusEditMode] = useState(false);

  const [isUserApproved, setIsUserApproved] = useState(false);

  const [isUserApprovedEditMode, setIsUserApprovedEditMode] = useState(false);

  const [selectedUserForApprovedStatus, setSelectedUserForApprovedStatus] = useState<User | null>(null);

  const [isUserApprovedEditModalOpen, setIsUserApprovedEditModalOpen] = useState(false);

  const [isUserApprovedStatusEditMode, setIsUserApprovedStatusEditMode] = useState(false);

  const [isUserDeclined, setIsUserDeclined] = useState(false);

  const [isUserDeclinedEditMode, setIsUserDeclinedEditMode] = useState(false);

  const [selectedUserForDeclinedStatus, setSelectedUserForDeclinedStatus] = useState<User | null>(null);

  const [isUserDeclinedEditModalOpen, setIsUserDeclinedEditModalOpen] = useState(false);

  const [isUserDeclinedStatusEditMode, setIsUserDeclinedStatusEditMode] = useState(false);

  const [isUserExpired, setIsUserExpired] = useState(false);

  const [isUserExpiredEditMode, setIsUserExpiredEditMode] = useState(false);

  const [selectedUserForExpiredStatus, setSelectedUserForExpiredStatus] = useState<User | null>(null);

  const [isUserExpiredEditModalOpen, setIsUserExpiredEditModalOpen] = useState(false);

  const [isUserExpiredStatusEditMode, setIsUserExpiredStatusEditMode] = useState(false);

  const [isUserArchived, setIsUserArchived] = useState(false);

  const [isUserArchivedEditMode, setIsUserArchivedEditMode] = useState(false);

  const [selectedUserForArchivedStatus, setSelectedUserForArchivedStatus] = useState<User | null>(null);

  const [isUserArchivedEditModalOpen, setIsUserArchivedEditModalOpen] = useState(false);

  const [isUserArchivedStatusEditMode, setIsUserArchivedStatusEditMode] = useState(false);

  const [isUserDeleted, setIsUserDeleted] = useState(false);

  const [isUserDeletedEditMode, setIsUserDeletedEditMode] = useState(false);

  const [selectedUserForDeletedStatus, setSelectedUserForDeletedStatus] = useState<User | null>(null);

  const [isUserDeletedEditModalOpen, setIsUserDeletedEditModalOpen] = useState(false);

  const [isUserDeletedStatusEditMode, setIsUserDeletedStatusEditMode] = useState(false);

  const [isUserRestored, setIsUserRestored] = useState(false);

  const [isUserRestoredEditMode, setIsUserRestoredEditMode] = useState(false);

  const [selectedUserForRestoredStatus, setSelectedUserForRestoredStatus] = useState<User | null>(null);

  const [isUserRestoredEditModalOpen, setIsUserRestoredEditModalOpen] = useState(false);

  const [isUserRestoredStatusEditMode, setIsUserRestoredStatusEditMode] = useState(false);

  const [isUserReactivated, setIsUserReactivated] = useState(false);

  const [isUserReactivatedEditMode, setIsUserReactivatedEditMode] = useState(false);

  const [selectedUserForReactivatedStatus, setSelectedUserForReactivatedStatus] = useState<User | null>(null);

  const [isUserReactivatedEditModalOpen, setIsUserReactivatedEditModalOpen] = useState(false);

  const [isUserReactivatedStatusEditMode, setIsUserReactivatedStatusEditMode] = useState(false);

  const [isUserDeactivated, setIsUserDeactivated] = useState(false);

  const [isUserDeactivatedEditMode, setIsUserDeactivatedEditMode] = useState(false);

  const [selectedUserForDeactivatedStatus, setSelectedUserForDeactivatedStatus] = useState<User | null>(null);

  const [isUserDeactivatedEditModalOpen, setIsUserDeactivatedEditModalOpen] = useState(false);

  const [isUserDeactivatedStatusEditMode, setIsUserDeactivatedStatusEditMode] = useState(false);

  const [isUserSuspendedUntil, setIsUserSuspendedUntil] = useState(false);

  const [isUserSuspendedUntilEditMode, setIsUserSuspendedUntilEditMode] = useState(false);

  const [selectedUserForSuspendedUntilStatus, setSelectedUserForSuspendedUntilStatus] = useState<User | null>(null);

  const [isUserSuspendedUntilEditModalOpen, setIsUserSuspendedUntilEditModalOpen] = useState(false);

  const [isUserSuspendedUntilStatusEditMode, setIsUserSuspendedUntilStatusEditMode] = useState(false);

  const [isUserLockedUntil, setIsUserLockedUntil] = useState(false);

  const [isUserLockedUntilEditMode, setIsUserLockedUntilEditMode] = useState(false);

  const [selectedUserForLockedUntilStatus, setSelectedUserForLockedUntilStatus] = useState<User | null>(null);

  const [isUserLockedUntilEditModalOpen, setIsUserLockedUntilEditModalOpen] = useState(false);

  const [isUserLockedUntilStatusEditMode, setIsUserLockedUntilStatusEditMode] = useState(false);

  const [isUserRestrictedUntil, setIsUserRestrictedUntil] = useState(false);

  const [isUserRestrictedUntilEditMode, setIsUserRestrictedUntilEditMode] = useState(false);

  const [selectedUserForRestrictedUntilStatus, setSelectedUserForRestrictedUntilStatus] = useState<User | null>(null);

  const [isUserRestrictedUntilEditModalOpen, setIsUserRestrictedUntilEditModalOpen] = useState(false);

  const [isUserRestrictedUntilStatusEditMode, setIsUserRestrictedUntilStatusEditMode] = useState(false);

  const [isUserFlaggedUntil, setIsUserFlaggedUntil] = useState(false);

  const [isUserFlaggedUntilEditMode, setIsUserFlaggedUntilEditMode] = useState(false);

  const [selectedUserForFlaggedUntilStatus, setSelectedUserForFlaggedUntilStatus] = useState<User | null>(null);

  const [isUserFlaggedUntilEditModalOpen, setIsUserFlaggedUntilEditModalOpen] = useState(false);

  const [isUserFlaggedUntilStatusEditMode, setIsUserFlaggedUntilStatusEditMode] = useState(false);

  const [isUserAuditedUntil, setIsUserAuditedUntil] = useState(false);

  const [isUserAuditedUntilEditMode, setIsUserAuditedUntilEditMode] = useState(false);

  const [selectedUserForAuditedUntilStatus, setSelectedUserForAuditedUntilStatus] = useState<User | null>(null);

  const [isUserAuditedUntilEditModalOpen, setIsUserAuditedUntilEditModalOpen] = useState(false);

  const [isUserAuditedUntilStatusEditMode, setIsUserAuditedUntilStatusEditMode] = useState(false);

  const [isUserReviewedUntil, setIsUserReviewedUntil] = useState(false);

  const [isUserReviewedUntilEditMode, setIsUserReviewedUntilEditMode] = useState(false);

  const [selectedUserForReviewedUntilStatus, setSelectedUserForReviewedUntilStatus] = useState<User | null>(null);

  const [isUserReviewedUntilEditModalOpen, setIsUserReviewedUntilEditModalOpen] = useState(false);

  const [isUserReviewedUntilStatusEditMode, setIsUserReviewedUntilStatusEditMode] = useState(false);

  const [isUserApprovedUntil, setIsUserApprovedUntil] = useState(false);

  const [isUserApprovedUntilEditMode, setIsUserApprovedUntilEditMode] = useState(false);

  const [selectedUserForApprovedUntilStatus, setSelectedUserForApprovedUntilStatus] = useState<User | null>(null);

  const [isUserApprovedUntilEditModalOpen, setIsUserApprovedUntilEditModalOpen] = useState(false);

  const [isUserApprovedUntilStatusEditMode, setIsUserApprovedUntilStatusEditMode] = useState(false);

  const [isUserDeclinedUntil, setIsUserDeclinedUntil] = useState(false);

  const [isUserDeclinedUntilEditMode, setIsUserDeclinedUntilEditMode] = useState(false);

  const [selectedUserForDeclinedUntilStatus, setSelectedUserForDeclinedUntilStatus] = useState<User | null>(null);

  const [isUserDeclinedUntilEditModalOpen, setIsUserDeclinedUntilEditModalOpen] = useState(false);

  const [isUserDeclinedUntilStatusEditMode, setIsUserDeclinedUntilStatusEditMode] = useState(false);

  const [isUserExpiredUntil, setIsUserExpiredUntil] = useState(false);

  const [isUserExpiredUntilEditMode, setIsUserExpiredUntilEditMode] = useState(false);

  const [selectedUserForExpiredUntilStatus, setSelectedUserForExpiredUntilStatus] = useState<User | null>(null);

  const [isUserExpiredUntilEditModalOpen, setIsUserExpiredUntilEditModalOpen] = useState(false);

  const [isUserExpiredUntilStatusEditMode, setIsUserExpiredUntilStatusEditMode] = useState(false);

  const [isUserArchivedUntil, setIsUserArchivedUntil] = useState(false);

  const [isUserArchivedUntilEditMode, setIsUserArchivedUntilEditMode] = useState(false);

  const [selectedUserForArchivedUntilStatus, setSelectedUserForArchivedUntilStatus] = useState<User | null>(null);

  const [isUserArchivedUntilEditModalOpen, setIsUserArchivedUntilEditModalOpen] = useState(false);

  const [isUserArchivedUntilStatusEditMode, setIsUserArchivedUntilStatusEditMode] = useState(false);

  const [isUserDeletedUntil, setIsUserDeletedUntil] = useState(false);

  const [isUserDeletedUntilEditMode, setIsUserDeletedUntilEditMode] = useState(false);

  const [selectedUserForDeletedUntilStatus, setSelectedUserForDeletedUntilStatus] = useState<User | null>(null);

  const [isUserDeletedUntilEditModalOpen, setIsUserDeletedUntilEditModalOpen] = useState(false);

  const [isUserDeletedUntilStatusEditMode, setIsUserDeletedUntilStatusEditMode] = useState(false);

  const [isUserRestoredUntil, setIsUserRestoredUntil] = useState(false);

  const [isUserRestoredUntilEditMode, setIsUserRestoredUntilEditMode] = useState(false);

  const [selectedUserForRestoredUntilStatus, setSelectedUserForRestoredUntilStatus] = useState<User | null>(null);

  const [isUserRestoredUntilEditModalOpen, setIsUserRestoredUntilEditModalOpen] = useState(false);

  const [isUserRestoredUntilStatusEditMode, setIsUserRestoredUntilStatusEditMode] = useState(false);

  const [isUserReactivatedUntil, setIsUserReactivatedUntil] = useState(false);

  const [isUserReactivatedUntilEditMode, setIsUserReactivatedUntilEditMode] = useState(false);

  const [selectedUserForReactivatedUntilStatus, setSelectedUserForReactivatedUntilStatus] = useState<User | null>(null);

  const [isUserReactivatedUntilEditModalOpen, setIsUserReactivatedUntilEditModalOpen] = useState(false);

  const [isUserReactivatedUntilStatusEditMode, setIsUserReactivatedUntilStatusEditMode] = useState(false);

  const [isUserDeactivatedUntil, setIsUserDeactivatedUntil] = useState(false);

  const [isUserDeactivatedUntilEditMode, setIsUserDeactivatedUntilEditMode] = useState(false);

  const [selectedUserForDeactivatedUntilStatus, setSelectedUserForDeactivatedUntilStatus] = useState<User | null>(null);

  const [isUserDeactivatedUntilEditModalOpen, setIsUserDeactivatedUntilEditModalOpen] = useState(false);

  const [isUserDeactivatedUntilStatusEditMode, setIsUserDeactivatedUntilStatusEditMode] = useState(false);

  const userUpdateMutation = useMutation(
    async ({ id, role }: { id: string; role: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as User;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast({
          title: t('userUpdated'),
          description: t('userRoleUpdatedSuccessfully'),
        });
      },
      onError: (error: any) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const userDeleteMutation = useMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast({
          title: t('userDeleted'),
          description: t('userDeletedSuccessfully'),
        });
      },
      onError: (error: any) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const resetPasswordMutation = useMutation(
    async ({ id, newPassword }: { id: string; newPassword?: string }) => {
      const { data, error } = await supabase.auth.admin.updateUserById(id, {
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast({
          title: t('passwordReset'),
          description: t('passwordResetSuccessfully'),
        });
      },
      onError: (error: any) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    }
  );

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
      return [];
    }

    return data as User[];
  }, [t, toast]);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, [fetchUsers]);

  const { isLoading: isUsersLoading } = useQuery(['users'], fetchUsers);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userUpdateMutation.mutateAsync({ id: userId, role: newRole });
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (selectedUserId) {
      try {
        await userDeleteMutation.mutateAsync(users[selectedUserId].id);
        setUsers(users.filter((_, index) => index !== selectedUserId));
      } catch (error: any) {
        console.error('Error deleting user:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  const handleEditClick = (params: GridRowParams) => {
    const userId = parseInt(params.row.id, 10);
    const userToEdit = users.find(user => user.id === params.row.id);
    if (userToEdit) {
      setEditedUser(userToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleResetPasswordClick = (params: GridRowParams) => {
    const userId = parseInt(params.row.id, 10);
    const userToEdit = users.find(user => user.id === params.row.id);
    if (userToEdit) {
      setEditedUser(userToEdit);
      setShowNewPasswordInput(true);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveUser = async () => {
    if (editedUser) {
      try {
        if (showNewPasswordInput && newPassword) {
          await resetPasswordMutation.mutateAsync({ id: editedUser.id, newPassword });
        }
        setIsEditModalOpen(false);
        setShowNewPasswordInput(false);
        setNewPassword('');
      } catch (error: any) {
        console.error('Error updating user:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setShowNewPasswordInput(false);
    setNewPassword('');
  };

  const fetchLogoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('type', 'logo_text')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching logo text:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else if (data?.value) {
        setLogoText(data.value as string);
      }
    } catch (error) {
      console.error('Error in fetchLogoSettings:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchLogoSettings();
  }, [t, toast]);

  const updateLogoText = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({ value: logoText })
        .eq('type', 'logo_text');

      if (error) {
        console.error('Error updating logo text:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('logoTextUpdated'),
          description: t('logoTextUpdatedSuccessfully'),
        });
      }
    } catch (error) {
      console.error('Error in updateLogoText:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLogoTextEditMode(false);
    }
  };

  const fetchPaypalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('paypal_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching PayPal settings:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setPaypalSettings(data as PayPalSettings);
      }
    } catch (error) {
      console.error('Error in fetchPaypalSettings:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchPaypalSettings();
  }, [t, toast]);

  const updatePaypalSettings = async (updatedSettings: PayPalSettings) => {
    try {
      const { data, error } = await supabase
        .from('paypal_settings')
        .update(updatedSettings)
        .eq('id', updatedSettings.id);

      if (error) {
        console.error('Error updating PayPal settings:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('paypalSettingsUpdated'),
          description: t('paypalSettingsUpdatedSuccessfully'),
        });
        setPaypalSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error in updatePaypalSettings:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsPaypalEditMode(false);
    }
  };

  const handlePaypalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaypalSettings((prevSettings: any) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const fetchMaintenanceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .in('type', ['maintenance_mode', 'maintenance_message'])
        .order('type', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance settings:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const maintenanceModeSetting = data?.find(item => item.type === 'maintenance_mode');
      const maintenanceMessageSetting = data?.find(item => item.type === 'maintenance_message');

      const enabled = maintenanceModeSetting?.value === true || maintenanceModeSetting?.value === 'true';
      const message = maintenanceMessageSetting?.value as string || '';

      setIsMaintenanceModeEnabled(enabled);
      setMaintenanceMessage(message);

      setMaintenanceSettings({
        enabled: enabled,
        message: message,
      });
    } catch (error) {
      console.error('Error in fetchMaintenanceSettings:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMaintenanceSettings();
  }, [t, toast]);

  const updateMaintenanceMode = async (enabled: boolean) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({ value: enabled })
        .eq('type', 'maintenance_mode');

      if (error) {
        console.error('Error updating maintenance mode:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('maintenanceModeUpdated'),
          description: t('maintenanceModeUpdatedSuccessfully'),
        });
        setIsMaintenanceModeEnabled(enabled);
        setMaintenanceSettings(prevSettings => ({
          ...prevSettings,
          enabled: enabled,
        }));
      }
    } catch (error) {
      console.error('Error in updateMaintenanceMode:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsMaintenanceModeEditMode(false);
    }
  };

  const updateMaintenanceMessage = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({ value: maintenanceMessage })
        .eq('type', 'maintenance_message');

      if (error) {
        console.error('Error updating maintenance message:', error);
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('maintenanceMessageUpdated'),
          description: t('maintenanceMessageUpdatedSuccessfully'),
        });
        setMaintenanceSettings(prevSettings => ({
          ...prevSettings,
          message: maintenanceMessage,
        }));
      }
    } catch (error) {
      console.error('Error in updateMaintenanceMessage:', error);
      toast({
        title: t('error'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsMaintenanceMessageEditMode(false);
    }
  };

  const handlePlanCodeChange = async () => {
    if (selectedUserForPlanCode && selectedPlanCode) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ plan_code: selectedPlanCode })
          .eq('id', selectedUserForPlanCode.id);

        if (error) {
          console.error('Error updating plan code:', error);
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('planCodeUpdated'),
            description: t('planCodeUpdatedSuccessfully'),
          });
          setUsers(prevUsers =>
            prevUsers.map(user =>
              user.id === selectedUserForPlanCode.id ? { ...user, plan_code: selectedPlanCode } : user
            )
          );
        }
      } catch (error) {
        console.error('Error in handlePlanCodeChange:', error);
        toast({
          title: t('error'),
          description: (error as Error).message,
          variant: 'destructive',
        });
      } finally {
        setIsUserPlanCodeEditModalOpen(false);
        setIsPlanCodeEditMode(false);
        setSelectedUserForPlanCode(null);
        setSelectedPlanCode(null);
      }
    }
  };

  const handleActiveStatus
