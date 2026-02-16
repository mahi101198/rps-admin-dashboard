'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { updateAppSettingsAction } from '@/actions/settings-actions';
import { useFormStatus } from 'react-dom';
import { AppSettings } from '@/lib/types/all-schemas';
import { useEffect } from 'react';
import { toast } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '💾 Saving...' : '💾 Save Changes'}
    </Button>
  );
}

export function SettingsForm({ appSettings, onSettingsUpdate }: { appSettings: any; onSettingsUpdate?: () => void }) {
  return (
    <form action={async (formData: FormData) => {
      try {
        // Convert FormData to object
        const data: any = {};
        formData.forEach((value, key) => {
          if (key === 'isReferralActive') {
            data[key] = value === 'on';
          } else if (key === 'availablePincodes') {
            data[key] = (value as string).split(',').map(p => p.trim()).filter(p => p.length > 0);
          } else if (['deliveryFee', 'freeDeliveryAbove', 'referrerRewardValue', 'refereeRewardValue', 'minOrderAmount', 'minWithdrawalAmount'].includes(key)) {
            data[key] = parseFloat(value as string) || 0;
          } else {
            data[key] = value;
          }
        });
        
        // Add the settings ID
        data.id = appSettings.id;
        
        // Send POST request to update settings
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update settings');
        }
        
        toast.success('Settings updated successfully!');
        // Call the callback to refresh the settings in the parent component
        if (onSettingsUpdate) {
          onSettingsUpdate();
        }
      } catch (error) {
        toast.error('Failed to update settings. Please try again.');
        console.error('Error updating settings:', error);
      }
    }}>
      {/* Settings Configuration */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* General App Settings */}
        <Card>
          <CardHeader>
            <CardTitle>📱 App Configuration</CardTitle>
            <CardDescription>Basic application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                name="appName"
                type="text"
                defaultValue={appSettings.appName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appVersion">App Version</Label>
              <Input
                id="appVersion"
                name="appVersion"
                type="text"
                defaultValue={appSettings.appVersion}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                type="text"
                defaultValue={appSettings.currency}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                name="currencySymbol"
                type="text"
                defaultValue={appSettings.currencySymbol}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>🚚 Delivery & Pricing</CardTitle>
            <CardDescription>Configure delivery fees and thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Standard Delivery Fee</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="deliveryFee"
                  name="deliveryFee"
                  type="number"
                  min="0"
                  step="10"
                  defaultValue={appSettings.deliveryFee}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="freeDeliveryAbove">Free Delivery Above</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="freeDeliveryAbove"
                  name="freeDeliveryAbove"
                  type="number"
                  min="0"
                  step="50"
                  defaultValue={appSettings.freeDeliveryAbove}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support Settings */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Contact & Support</CardTitle>
            <CardDescription>Configure support contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                name="supportPhone"
                type="tel"
                defaultValue={appSettings.supportPhone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                name="supportEmail"
                type="email"
                defaultValue={appSettings.supportEmail}
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral Settings */}
        <Card>
          <CardHeader>
            <CardTitle>🤝 Referral Program</CardTitle>
            <CardDescription>Configure referral bonuses and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="isReferralActive">Referral Program</Label>
                <p className="text-xs text-muted-foreground">
                  Enable or disable referral program
                </p>
              </div>
              <Switch
                id="isReferralActive"
                name="isReferralActive"
                defaultChecked={appSettings.isReferralActive}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referrerRewardValue">Referrer Reward Value</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="referrerRewardValue"
                  name="referrerRewardValue"
                  type="number"
                  min="0"
                  step="10"
                  defaultValue={appSettings.referrerRewardValue}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refereeRewardValue">Referee Reward Value</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="refereeRewardValue"
                  name="refereeRewardValue"
                  type="number"
                  min="0"
                  step="10"
                  defaultValue={appSettings.refereeRewardValue}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="minOrderAmount"
                  name="minOrderAmount"
                  type="number"
                  min="0"
                  step="10"
                  defaultValue={appSettings.minOrderAmount}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minWithdrawalAmount">Minimum Withdrawal Amount</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="minWithdrawalAmount"
                  name="minWithdrawalAmount"
                  type="number"
                  min="0"
                  step="10"
                  defaultValue={appSettings.minWithdrawalAmount}
                  className="flex-1"
                />
                <Badge variant="outline">{appSettings.currencySymbol}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Serviceability Settings */}
        <Card>
          <CardHeader>
            <CardTitle>📍 Serviceability</CardTitle>
            <CardDescription>Configure delivery serviceability settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availablePincodes">Available Pincodes</Label>
              <Textarea
                id="availablePincodes"
                name="availablePincodes"
                placeholder="Enter pincodes separated by commas (e.g., 110001, 110002, 110003)"
                defaultValue={appSettings.availablePincodes.join(', ')}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Enter pincodes separated by commas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Download Settings */}
        <Card>
          <CardHeader>
            <CardTitle>📲 App Download</CardTitle>
            <CardDescription>Configure app download link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appDownloadLink">App Download Link</Label>
              <Input
                id="appDownloadLink"
                name="appDownloadLink"
                type="url"
                placeholder="https://example.com/download-app"
                defaultValue={appSettings.appDownloadLink || ''}
              />
              <p className="text-xs text-muted-foreground">
                Full URL to download the mobile application
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Gateway Settings */}
        <Card>
          <CardHeader>
            <CardTitle>💳 Payment Gateway</CardTitle>
            <CardDescription>Configure payment processing settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
              <Input
                id="razorpayKeyId"
                name="razorpayKeyId"
                type="text"
                defaultValue={appSettings.razorpayKeyId || ''}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Summary */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Settings Summary</CardTitle>
            <CardDescription>Overview of current configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">App Information</h4>
              <div className="text-sm space-y-1">
                <div>• App: {appSettings.appName} v{appSettings.appVersion}</div>
                <div>• Currency: {appSettings.currency} ({appSettings.currencySymbol})</div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Delivery & Pricing</h4>
              <div className="text-sm space-y-1">
                <div>• Standard fee: {appSettings.currencySymbol}{appSettings.deliveryFee}</div>
                <div>• Free above: {appSettings.currencySymbol}{appSettings.freeDeliveryAbove}</div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Referral Program</h4>
              <div className="text-sm space-y-1">
                <div>• Program: {appSettings.isReferralActive ? 'Enabled' : 'Disabled'}</div>
                <div>• Referrer Bonus: {appSettings.currencySymbol}{appSettings.referrerRewardValue}</div>
                <div>• Referee Bonus: {appSettings.currencySymbol}{appSettings.refereeRewardValue}</div>
                <div>• Min Withdrawal: {appSettings.currencySymbol}{appSettings.minWithdrawalAmount}</div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Serviceability</h4>
              <div className="text-sm space-y-1">
                <div>• Available Pincodes: {appSettings.availablePincodes.length}</div>
                <div>• App Download Link: {appSettings.appDownloadLink ? 'Configured' : 'Not set'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline">
          🔄 Reset to Defaults
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}