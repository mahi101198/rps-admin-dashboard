'use client';

import { useState, useEffect } from 'react';
import { UserWithDetails as User } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './user-actions-client';
import { UserManagement } from './user-management';
import { UsersTableWrapper } from './users-table-wrapper';
import { getUsersAction } from '@/actions/user-actions';
import { Loader2 } from 'lucide-react';

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'default';
    case 'delivery_agent':
      return 'secondary';
    case 'customer':
    default:
      return 'outline';
  }
}

function getUserStats(users: User[]) {
  return {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    admins: users.filter(u => u.role === 'admin').length,
    deliveryAgents: users.filter(u => u.role === 'delivery_agent').length,
    totalWalletBalance: users.reduce((sum, user) => sum + (user.walletBalance || 0), 0),
    usersWithReferrals: users.filter(u => u.referredBy).length
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await getUsersAction();
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return <UsersTableWrapper users={users} />;
}