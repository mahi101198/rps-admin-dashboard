'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BannerForm } from './banner-form';

interface BannerManagementProps {
  onRefresh?: () => void;
}

export function BannerManagement({ onRefresh }: BannerManagementProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    // Use the onRefresh callback to update data without full page reload
    onRefresh?.();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setShowForm(true)}>
          ➕ Add Banner
        </Button>
      </div>

      <BannerForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}