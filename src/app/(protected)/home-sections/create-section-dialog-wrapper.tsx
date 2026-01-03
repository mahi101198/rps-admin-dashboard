'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateSectionDialog } from './create-section-dialog';

export function CreateSectionDialogWrapper() {
  const router = useRouter();
  const [key, setKey] = useState(0);

  const handleSectionCreated = () => {
    // Instead of full page reload, we can refresh the router
    // This will re-fetch the data without a full page reload
    router.refresh();
    // Update key to force re-render if needed
    setKey(prev => prev + 1);
  };

  return <CreateSectionDialog key={key} onSectionCreated={handleSectionCreated} />;
}