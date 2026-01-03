'use client';

import { useRouter } from 'next/navigation';
import { UsersContent } from './users-content';

export function UsersTableWrapper({ users }: { users: any[] }) {
  const router = useRouter();

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  return (
    <UsersContent initialUsers={users} onDataChange={handleDataChange} />
  );
}