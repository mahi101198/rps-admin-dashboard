'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Modal } from '@/components/ui/modal';
import { BannerImageUpload } from '@/components/form/banner-image-upload';
import { toast } from 'sonner';

interface BannerFormProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: any; // Accept any banner type for flexibility
  onSuccess?: () => void;
}

export function BannerForm({ isOpen, onClose, banner, onSuccess }: BannerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    imageUrl: banner?.imageUrl || '',
    linkTo: banner?.linkTo || '',
    rank: banner?.rank || 1,
    isActive: banner?.isActive ?? true,
  });
  
  const bannerImageUploadRef = useRef<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Import the actions dynamically to avoid server-side issues
      const { createBannerAction, updateBannerAction, uploadBannerImageAction } = await import('@/actions/banner-actions');

      let bannerId = banner?.bannerId;
      
      // If we're creating a new banner, create it first to get the bannerId
      if (!banner) {
        const createData = {
          title: formData.title,
          imageUrl: '', // Will be updated after upload
          linkTo: formData.linkTo,
          rank: formData.rank,
          isActive: formData.isActive,
        };
        
        const result = await createBannerAction(createData);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        bannerId = result.bannerId;
      }

      // Handle image upload if a file was selected
      const fileInput = document.getElementById('banner-image-upload') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      
      let imageUrl = formData.imageUrl;
      
      if (file) {
        // Upload the file and get the URL
        const uploadResult = await uploadBannerImageAction(file, bannerId!);
        if (uploadResult.success && uploadResult.imageUrl) {
          imageUrl = uploadResult.imageUrl;
        } else {
          toast.error(uploadResult.message || 'Failed to upload image');
          // If we just created a banner and the image upload failed, we might want to delete the banner
          if (!banner) {
            // Try to delete the newly created banner
            try {
              await import('@/actions/banner-actions').then(module => 
                module.deleteBannerAction(bannerId!)
              );
            } catch (deleteError) {
              console.error('Failed to cleanup banner after image upload failure:', deleteError);
            }
          }
          return;
        }
      }

      // Update the banner with all data including the image URL
      const data = {
        title: formData.title,
        imageUrl: imageUrl,
        linkTo: formData.linkTo,
        rank: formData.rank,
        isActive: formData.isActive,
      };

      let result;
      if (banner) {
        result = await updateBannerAction(banner.bannerId, data);
      } else {
        result = await updateBannerAction(bannerId!, data);
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
      console.error('Banner form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={banner ? 'Edit Banner' : 'Create New Banner'}
      description={banner ? 'Update banner details' : 'Add a new promotional banner'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" style={{ maxHeight: '100%' }}>
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Banner Title"
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

        <div>
          <Label htmlFor="linkTo">Link URL *</Label>
          <Input
            id="linkTo"
            type="url"
            value={formData.linkTo}
            onChange={(e) => setFormData(prev => ({ ...prev, linkTo: e.target.value }))}
            placeholder="https://example.com/product"
            required
          />
        </div>

        <div>
          <Label htmlFor="rank">Display Rank</Label>
          <Input
            id="rank"
            type="number"
            min="1"
            value={formData.rank}
            onChange={(e) => setFormData(prev => ({ ...prev, rank: parseInt(e.target.value) || 1 }))}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (banner ? 'Updating...' : 'Creating...') : (banner ? 'Update Banner' : 'Create Banner')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}