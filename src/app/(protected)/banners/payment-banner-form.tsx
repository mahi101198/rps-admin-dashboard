'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { BannerImageUpload } from '@/components/form/banner-image-upload';
import { toast } from 'sonner';

interface PaymentBannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: any;
  onSuccess?: () => void;
}

export function PaymentBannerForm({ isOpen, onClose, banner, onSuccess }: PaymentBannerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    imageUrl: banner?.imageUrl || '',
    linkTo: banner?.linkTo || '',
    rank: banner?.rank || 1,
    isActive: banner?.isActive ?? true,
    view_change_time: banner?.view_change_time || 5,
  });
  
  const bannerImageUploadRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createPaymentBannerAction, updatePaymentBannerAction, uploadPaymentBannerImageAction } = await import('@/actions/payment-banner-actions');

      let paymentPageBannerId = banner?.paymentPageBannerId;
      
      if (!banner) {
        const createData = {
          title: formData.title,
          imageUrl: '',
          linkTo: formData.linkTo,
          rank: formData.rank,
          isActive: formData.isActive,
          view_change_time: formData.view_change_time,
        };
        
        const result = await createPaymentBannerAction(createData);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        paymentPageBannerId = result.paymentPageBannerId;
      }

      // Handle image upload
      const fileInput = document.getElementById('banner-image-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      let imageUrl = formData.imageUrl;
      
      if (file) {
        const uploadResult = await uploadPaymentBannerImageAction(file, paymentPageBannerId!);
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
        } else {
          toast.error(uploadResult.message || 'Failed to upload image');
          if (!banner) {
            try {
              await import('@/actions/payment-banner-actions').then(module => 
                module.deletePaymentBannerAction(paymentPageBannerId!)
              );
            } catch (deleteError) {
              console.error('Failed to cleanup banner:', deleteError);
            }
          }
          return;
        }
      }

      const data = {
        title: formData.title,
        imageUrl: imageUrl,
        linkTo: formData.linkTo,
        rank: formData.rank,
        isActive: formData.isActive,
        view_change_time: formData.view_change_time,
      };

      let result;
      if (banner) {
        result = await updatePaymentBannerAction(banner.paymentPageBannerId, data);
      } else {
        result = await updatePaymentBannerAction(paymentPageBannerId!, data);
      }

      if (result.success) {
        toast.success(result.message);
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Payment banner form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={banner ? 'Edit Payment Banner' : 'Create Payment Banner'}
      description={banner ? 'Update payment screen banner details' : 'Add a new banner for payment method selection screen'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Special Payment Offer"
            required
          />
        </div>

        <div>
          <BannerImageUpload
            label="Banner Image *"
            value={formData.imageUrl}
            onChange={(value) => setFormData(prev => ({ ...prev, imageUrl: value }))}
            placeholder="https://example.com/banner.jpg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rank">Rank (Priority)</Label>
            <Input
              id="rank"
              type="number"
              min="0"
              value={formData.rank}
              onChange={(e) => setFormData(prev => ({ ...prev, rank: parseInt(e.target.value) }))}
              placeholder="1-10"
            />
          </div>

          <div>
            <Label htmlFor="view_change_time">Auto-rotate Time (seconds)</Label>
            <Input
              id="view_change_time"
              type="number"
              min="1"
              value={formData.view_change_time}
              onChange={(e) => setFormData(prev => ({ ...prev, view_change_time: parseInt(e.target.value) }))}
              placeholder="5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="linkTo">Link/URL</Label>
          <Input
            id="linkTo"
            type="url"
            value={formData.linkTo}
            onChange={(e) => setFormData(prev => ({ ...prev, linkTo: e.target.value }))}
            placeholder="https://example.com/offer"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="active" className="cursor-pointer">
            {formData.isActive ? '✅ Active' : '⏸️ Inactive'}
          </Label>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '⟳ Saving...' : banner ? '💾 Update' : '✨ Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
