'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { Button } from '@/components/ui/button';
import { toggleBannerStatusAction, deleteBannerAction } from '@/actions/banner-actions';
import { BannerForm } from './banner-form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Use a minimal banner type for client components
type BannerClient = {
  bannerId: string;
  title: string;
  imageUrl: string;
  linkTo: string;
  rank: number;
  isActive: boolean;
};

interface BannerActionsProps {
  banner: BannerClient;
  onSuccess?: () => void;
}

export function BannerActions({ banner, onSuccess }: BannerActionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the banner "${banner.title}"?`)) {
      setLoading(true);
      try {
        await deleteBannerAction(banner.bannerId);
        toast.success('Banner deleted successfully');
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('Failed to delete banner');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await toggleBannerStatusAction(banner.bannerId, !banner.isActive);
      toast.success(`Banner ${banner.isActive ? 'disabled' : 'enabled'} successfully`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const handlePreview = () => {
    if (banner.linkTo) {
      window.open(banner.linkTo, '_blank');
    } else {
      setShowPreview(true);
    }
  };

  const handleEditSuccess = () => {
    setShowForm(false);
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <div className="flex gap-1">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowForm(true)}
        >
          Edit
        </Button>
        <ActionButton
          action={async () => {
            return await toggleBannerStatusAction(banner.bannerId, !banner.isActive);
          }}
          confirmMessage={`Are you sure you want to ${banner.isActive ? 'disable' : 'enable'} this banner?`}
          variant="outline" 
          size="sm"
          loadingText={banner.isActive ? 'Disabling...' : 'Enabling...'}
        >
          {banner.isActive ? 'Disable' : 'Enable'}
        </ActionButton>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreview}
        >
          Preview
        </Button>
        <Button
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </Button>
      </div>

      <BannerForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        banner={banner}
        onSuccess={handleEditSuccess}
      />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPreview(false)} />
          <div className="relative bg-white rounded-lg p-4 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Banner Preview</h3>
            <img src={banner.imageUrl} alt="Banner preview" className="w-full h-auto rounded" />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowPreview(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}