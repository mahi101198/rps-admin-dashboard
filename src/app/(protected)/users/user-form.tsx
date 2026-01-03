'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { User } from '@/lib/types/all-schemas';
import { updateUserAction } from '@/actions/user-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  userId?: string;
  onSuccess?: () => void;
}

// Helper function to format phone number for Firebase Auth
function formatPhoneNumberForAuth(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's already in E.164 format (starts with + and has 10-15 digits)
  if (phone.startsWith('+') && digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return phone;
  }
  
  // If it's just digits and looks like an Indian number (10 digits)
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // If it's 11 digits and starts with 0, remove the 0 and add country code
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `+91${digitsOnly.substring(1)}`;
  }
  
  // Return as is if we can't format it properly
  return phone;
}

export function UserForm({ isOpen, onClose, user, userId, onSuccess }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(user || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    walletBalance: 0
  });

  // Fetch user data if userId is provided
  useEffect(() => {
    if (isOpen && userId && !user) {
      const fetchUser = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch user data');
          const fetchedUserData = await response.json();
          setUserData(fetchedUserData);
          
          setFormData({
            name: fetchedUserData.name || '',
            email: fetchedUserData.email || '',
            phone: fetchedUserData.phone || '',
            role: fetchedUserData.role || 'customer',
            walletBalance: fetchedUserData.walletBalance || 0
          });
        } catch (error) {
          toast.error('Failed to load user data');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [isOpen, userId, user]);

  // Reset form when modal opens with a different user
  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: (user as any).role || 'customer',
        walletBalance: (user as any).walletBalance || 0
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUserId = userId || userData?.userId;
    
    if (!currentUserId) {
      toast.error('Cannot create new users from this form. Use Firebase Auth registration.');
      return;
    }
    
    setLoading(true);

    try {
      // Format phone number for Firebase Auth if it's provided
      let formattedPhone = formData.phone;
      if (formData.phone) {
        formattedPhone = formatPhoneNumberForAuth(formData.phone);
      }
      
      const result = await updateUserAction(currentUserId, {
        name: formData.name,
        phone: formattedPhone,
        role: formData.role as any,
        walletBalance: formData.walletBalance
      });

      if (result.success) {
        toast.success(result.message);
        // Use router.refresh() to update data without full page reload
        router.refresh();
        // Notify parent component to refresh data (like products page does)
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching user data
  if (loading && !userData && !user) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading User Data"
        size="lg"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Modal>
    );
  }

  const currentUser = user || userData;
  const hasUserData = Boolean(currentUser || userId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={hasUserData ? 'Edit User' : 'User Information'}
      description={hasUserData ? 'Update user details and settings' : 'View user information'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            placeholder="Email cannot be changed"
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be modified from dashboard
          </p>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g., +919876543210 or 9876543210"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter phone number in international format (e.g., +919876543210)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">User Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="delivery_agent">Delivery Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="walletBalance">Wallet Balance (₹)</Label>
            <Input
              id="walletBalance"
              type="number"
              value={formData.walletBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, walletBalance: Number(e.target.value) }))}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !hasUserData}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}