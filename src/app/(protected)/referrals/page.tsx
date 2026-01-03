'use client';

import { useState, useEffect } from 'react';
import { Referral, ReferralStatus } from '@/lib/types/all-schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Helper function to safely convert createdAt to a Date object
function getCreatedAtDate(createdAt: any): Date {
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
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof createdAt === 'number') {
    return new Date(createdAt);
  }
  
  // Fallback
  return new Date();
}

// Client-side function to get referrals
async function getReferralsAction(): Promise<Referral[]> {
  try {
    // This would typically be a server action
    // For now, we'll simulate it with a fetch call to an API endpoint
    const response = await fetch('/api/referrals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch referrals');
    }
    
    const rawData = await response.json();
    
    // Convert createdAt and completedAt fields to Date objects
    return rawData.map((referral: any) => ({
      ...referral,
      createdAt: getCreatedAtDate(referral.createdAt),
      completedAt: referral.completedAt ? getCreatedAtDate(referral.completedAt) : null
    }));
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
}

function getStatusBadgeVariant(status: ReferralStatus) {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getReferralStats(referrals: Referral[]) {
  return {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    completed: referrals.filter(r => r.status === 'completed').length,
    totalRewardsPaid: referrals
      .filter(r => r.status === 'completed')
      .reduce((sum, referral) => sum + referral.rewardAmount, 0),
    pendingRewards: referrals
      .filter(r => r.status === 'pending')
      .reduce((sum, referral) => sum + referral.rewardAmount, 0),
    avgRewardAmount: referrals.length > 0 ? 
      referrals.reduce((sum, r) => sum + r.rewardAmount, 0) / referrals.length : 0,
    successRate: referrals.length > 0 ? 
      ((referrals.filter(r => r.status === 'completed').length / referrals.length) * 100) : 0
  };
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralDetails, setReferralDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setLoading(true);
        const referralsData = await getReferralsAction();
        setReferrals(referralsData);
        
        // In a real implementation, we would fetch referral details from the API
        // For now, we'll just use the basic referral data
        setReferralDetails(referralsData.map(referral => ({
          ...referral,
          referrerInfo: null,
          referredInfo: null
        })));
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referrals');
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🤝 Referrals Management</h1>
            <p className="text-muted-foreground">Track referral program and reward distribution</p>
          </div>
          <Button disabled>
            📊 Export Report
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🤝 Referrals Management</h1>
            <p className="text-muted-foreground">Track referral program and reward distribution</p>
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-semibold text-destructive">Error Loading Data</h3>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const stats = getReferralStats(referrals);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🤝 Referrals Management</h1>
          <p className="text-muted-foreground">Track referral program and reward distribution</p>
        </div>
        <Button>
          📊 Export Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <span className="text-2xl">🤝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All referral activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Paid</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRewardsPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📊 Referral Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Pending</Badge>
                  <span>{stats.pending} referrals</span>
                </div>
                <div className="font-semibold">₹{stats.pendingRewards.toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Completed</Badge>
                  <span>{stats.completed} referrals</span>
                </div>
                <div className="font-semibold">₹{stats.totalRewardsPaid.toLocaleString()}</div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span>Average Reward:</span>
                  <span className="font-semibold">₹{stats.avgRewardAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🏆 Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 All Referrals</CardTitle>
          <CardDescription>Manage your referral program</CardDescription>
        </CardHeader>
        <CardContent>
          {referralDetails.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">No Referrals Found</h3>
              <p className="text-muted-foreground mb-4">
                No referral activities have been recorded yet
              </p>
              <Button>📢 Promote Referrals</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {referralDetails.map((referral) => (
                <div key={referral.referralId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center">
                      <span className="text-xl">🤝</span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {referral.referrerInfo 
                          ? `${referral.referrerInfo.firstName} ${referral.referrerInfo.lastName}` 
                          : referral.referrerId.substring(0, 8)}
                        <span className="mx-2">→</span>
                        {referral.referredInfo 
                          ? `${referral.referredInfo.firstName} ${referral.referredInfo.lastName}` 
                          : referral.referredUserId.substring(0, 8)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Referral ID: {referral.referralId.substring(0, 8)} • 
                        Created: {getCreatedAtDate(referral.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">₹{referral.rewardAmount}</div>
                      <div className="text-sm text-muted-foreground">
                        {referral.status === 'completed' ? 'Paid' : 'Pending'}
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(referral.status)}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}