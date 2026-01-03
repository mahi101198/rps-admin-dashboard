'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { 
  updateUserRoleAction,
  updateUserWalletAction,
  deleteUserAction
} from '@/actions/user-actions';
import { User } from '@/lib/types/all-schemas';
import { UserForm } from './user-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UserActionsProps {
  uid: string;
  role: string;
  firstName: string;
  lastName: string;
  onDataChange?: () => void;
}

export function UserActions({ uid, role, firstName, lastName, onDataChange }: UserActionsProps) {
  const router = useRouter();
  const [showViewForm, setShowViewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleSuccess = () => {
    setShowEditForm(false);
    setShowViewForm(false);
    // Use router.refresh() to update data without full page reload
    router.refresh();
    // Notify parent component to refresh data
    onDataChange?.();
  };

  const handleRoleUpdate = async (newRole: string) => {
    try {
      const result = await updateUserRoleAction(uid, newRole as any);
      if (result.success) {
        toast.success(result.message);
        handleSuccess();
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      toast.error('Failed to update user role');
      return { success: false, message: 'Failed to update user role' };
    }
  };

  const handleWalletUpdate = async (amount: number, operation: 'add' | 'subtract' | 'set') => {
    try {
      const result = await updateUserWalletAction(uid, amount, operation);
      if (result.success) {
        toast.success(result.message);
        handleSuccess();
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      toast.error('Failed to update wallet balance');
      return { success: false, message: 'Failed to update wallet balance' };
    }
  };

  const handleDeleteUser = async () => {
    try {
      const result = await deleteUserAction(uid);
      if (result.success) {
        toast.success(result.message);
        handleSuccess();
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      toast.error('Failed to disable user account');
      return { success: false, message: 'Failed to disable user account' };
    }
  };

  return (
    <>
      <div className="flex gap-1 flex-wrap">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowViewForm(true)}
        >
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowEditForm(true)}
        >
          Edit
        </Button>
        {role === 'customer' && (
          <ActionButton
            action={async () => handleRoleUpdate('admin')}
            confirmMessage="Are you sure you want to make this user an admin?"
            variant="secondary"
            size="sm"
            loadingText="Updating..."
          >
            Make Admin
          </ActionButton>
        )}
        {role === 'admin' && (
          <ActionButton
            action={async () => handleRoleUpdate('customer')}
            confirmMessage="Are you sure you want to remove admin privileges from this user?"
            variant="outline"
            size="sm"
            loadingText="Updating..."
          >
            Remove Admin
          </ActionButton>
        )}
        <ActionButton
          action={async () => handleWalletUpdate(100, 'add')}
          confirmMessage="Are you sure you want to add ₹100 to this user's wallet?"
          variant="outline"
          size="sm"
          loadingText="Adding..."
        >
          +₹100
        </ActionButton>
        <ActionButton
          action={async () => handleDeleteUser()}
          confirmMessage={`Are you sure you want to disable ${firstName} ${lastName}'s account? This will prevent them from logging in.`}
          variant="destructive"
          size="sm"
          loadingText="Disabling..."
        >
          Disable
        </ActionButton>
      </div>

      {/* View Form (read-only) */}
      <UserForm 
        isOpen={showViewForm}
        onClose={() => setShowViewForm(false)}
        userId={uid}
      />

      {/* Edit Form */}
      <UserForm 
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        userId={uid}
        onSuccess={handleSuccess}
      />
    </>
  );
}