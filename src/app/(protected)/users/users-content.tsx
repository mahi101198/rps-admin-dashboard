'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserActions } from './user-actions-client';
import { UserManagement } from './user-management';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface User {
  userId: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  referralCode: string;
  referredBy: string | null;
  walletBalance: number;
  addresses: any[];
  createdAt: Date | { _seconds: number } | string | null;
  updatedAt: Date;
}

// Helper function to safely convert createdAt to a Date object
function getCreatedAtDate(createdAt: User['createdAt']): Date | null {
  if (!createdAt) return null;
  
  // If it's already a Date object
  if (createdAt instanceof Date) {
    return createdAt;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof createdAt === 'object' && '_seconds' in createdAt) {
    return new Date(createdAt._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof createdAt === 'string') {
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // If it's a number (timestamp)
  if (typeof createdAt === 'number') {
    return new Date(createdAt);
  }
  
  return null;
}

async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

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

interface UsersContentProps {
  initialUsers?: User[];
  onDataChange?: () => void;
}

export function UsersContent({ initialUsers, onDataChange }: UsersContentProps) {
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [loading, setLoading] = useState(!initialUsers);

  useEffect(() => {
    // If we don't have initial users, fetch them
    if (!initialUsers) {
      const loadUsers = async () => {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setLoading(false);
      };

      loadUsers();
    }
  }, [initialUsers]);

  // If we have initial users, set them immediately
  useEffect(() => {
    if (initialUsers) {
      setUsers(initialUsers);
      setLoading(false);
    }
  }, [initialUsers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = getUserStats(users);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">👥 Users Management</h1>
          <p className="text-muted-foreground">Manage customers, admins, and delivery agents</p>
        </div>
        <UserManagement />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <span className="text-2xl">🛍️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Regular customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalWalletBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total wallet funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Customer</Badge>
              <span className="text-sm">{stats.customers} users</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Admin</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>📋 User Directory</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Contact</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Referral</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">{user.userId.substring(0, 8)}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{user.email}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {user.referredBy ? (
                          <Badge variant="secondary">Referred</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {(() => {
                          const createdAtDate = getCreatedAtDate(user.createdAt);
                          return createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A';
                        })()}
                      </td>
                      <td className="p-3">
                        <UserActions 
                          uid={user.userId} 
                          role={user.role || 'customer'} 
                          firstName={user.name.split(' ')[0] || user.name || ''} 
                          lastName={user.name.split(' ').slice(1).join(' ') || ''} 
                          onDataChange={onDataChange}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}