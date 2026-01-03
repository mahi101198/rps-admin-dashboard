'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types/all-schemas';

interface UserManagementProps {
  onRefresh?: () => void;
}

export function UserManagement({ onRefresh }: UserManagementProps) {
  const handleCreateUser = () => {
    // For now, just show an informational toast
    alert('User creation is handled through Firebase Authentication registration. Users will appear here once they sign up through the app.');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleCreateUser}>
        + Add User
      </Button>
    </div>
  );
}