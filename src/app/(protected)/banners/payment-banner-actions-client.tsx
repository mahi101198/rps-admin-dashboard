'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PaymentBannerForm } from './payment-banner-form';
import { toast } from 'sonner';

interface PaymentBannerActionsProps {
  banner: any;
  onSuccess: () => void;
}

export function PaymentBannerActions({ banner, onSuccess }: PaymentBannerActionsProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this payment banner?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { deletePaymentBannerAction } = await import('@/actions/payment-banner-actions');
      const result = await deletePaymentBannerAction(banner.paymentPageBannerId);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete payment banner');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const { togglePaymentBannerStatusAction } = await import('@/actions/payment-banner-actions');
      const result = await togglePaymentBannerStatusAction(banner.paymentPageBannerId, !banner.isActive);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to toggle banner status');
      console.error(error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            ⋮ More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditForm(true)}>
            ✏️ Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
            {banner.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
            🗑️ Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentBannerForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        banner={banner}
        onSuccess={() => {
          setShowEditForm(false);
          onSuccess();
        }}
      />
    </>
  );
}
