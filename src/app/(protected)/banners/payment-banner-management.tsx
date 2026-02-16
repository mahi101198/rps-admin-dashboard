'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentBannerForm } from './payment-banner-form';

interface PaymentBannerManagementProps {
  onRefresh?: () => void;
}

export function PaymentBannerManagement({ onRefresh }: PaymentBannerManagementProps) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setShowForm(true)}>
          ➕ Add Payment Banner
        </Button>
      </div>

      <PaymentBannerForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
