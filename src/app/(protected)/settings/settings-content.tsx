'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsForm } from './settings-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AppSettings {
  id: string;
  appName: string;
  appVersion: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: number;
  freeDeliveryAbove: number;
  supportPhone: string;
  supportEmail: string;
  isReferralActive: boolean;
  referrerRewardValue: number;
  refereeRewardValue: number;
  minOrderAmount: number;
  minWithdrawalAmount: number;
  razorpayKeyId: string;
  availablePincodes: string[];
  appDownloadLink?: string;
  lastUpdated?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

async function fetchSettings(): Promise<AppSettings | null> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Helper function to safely convert timestamps to Date objects
function parseDate(dateValue: any): Date {
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a Firestore timestamp object with _seconds
  if (typeof dateValue === 'object' && '_seconds' in dateValue) {
    return new Date(dateValue._seconds * 1000);
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Fallback
  return new Date();
}

export function SettingsContent() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    setLoading(true);
    const data = await fetchSettings();
    setSettings(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Add a refresh function that can be called after updates
  const refreshSettings = useCallback(async () => {
    const data = await fetchSettings();
    setSettings(data);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚙️</div>
        <h3 className="font-semibold mb-2">Settings Unavailable</h3>
        <p className="text-muted-foreground">Unable to load application settings</p>
      </div>
    );
  }

  // Parse dates for proper formatting
  const parsedUpdatedAt = parseDate(settings.updatedAt);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Settings Management</h1>
          <p className="text-muted-foreground">Configure application settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            🔄 Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Settings Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Fee</CardTitle>
            <span className="text-2xl">🚚</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings.deliveryFee)}</div>
            <p className="text-xs text-muted-foreground">Standard shipping</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Delivery</CardTitle>
            <span className="text-2xl">🆓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings.freeDeliveryAbove)}</div>
            <p className="text-xs text-muted-foreground">Minimum order amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrer Bonus</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings.referrerRewardValue)}</div>
            <p className="text-xs text-muted-foreground">For successful referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referee Bonus</CardTitle>
            <span className="text-2xl">🎁</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(settings.refereeRewardValue)}</div>
            <p className="text-xs text-muted-foreground">For new customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{parsedUpdatedAt.toLocaleDateString()}</div>
            <p className="text-xs text-muted-foreground">Settings modified</p>
          </CardContent>
        </Card>
      </div>

      <SettingsForm 
        appSettings={{
          ...settings,
          createdAt: parseDate(settings.createdAt),
          updatedAt: parseDate(settings.updatedAt),
          lastUpdated: settings.lastUpdated ? parseDate(settings.lastUpdated) : undefined
        }} 
        onSettingsUpdate={refreshSettings}
      />
    </div>
  );
}