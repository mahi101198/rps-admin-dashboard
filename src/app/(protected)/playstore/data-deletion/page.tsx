import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Mail, AlertCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion Request - RPS Stationery',
  description: 'Request deletion of your personal data from RPS Stationery',
};

export default function DataDeletionPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://yourdomain.com/playstore/data-deletion';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/playstore">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">🗑️ Data Deletion Request</h1>
          <p className="text-sm text-muted-foreground mt-1">Request deletion of your personal data</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Copy URL for Play Store
            <Button variant="outline" size="sm" className="ml-auto">
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-muted p-2 rounded text-sm block">
            {currentUrl}
          </code>
        </CardContent>
      </Card>

      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Important Information</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Deleting your data will permanently remove your account and all associated information. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Request Data Deletion
          </CardTitle>
          <CardDescription>
            If you wish to delete your personal data from RPS Stationery, please follow the instructions below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">📱 Option 1: Delete from App (Recommended)</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Open the RPS Stationery app on your device</li>
              <li>Go to <strong>Profile</strong> or <strong>Settings</strong></li>
              <li>Tap on <strong>"Account Settings"</strong></li>
              <li>Select <strong>"Delete My Account"</strong></li>
              <li>Confirm your decision by following the on-screen prompts</li>
            </ol>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">✉️ Option 2: Email Request</h3>
            <p className="mb-4">Send an email to our support team with the following information:</p>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Email Address:</p>
                  <a href="mailto:support@rpsstationery.com" className="text-blue-600 hover:underline">
                    support@rpsstationery.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-medium">Include in your email:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li>Subject: "Data Deletion Request"</li>
                <li>Your registered email address</li>
                <li>Your registered phone number</li>
                <li>Reason for deletion (optional)</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">⏱️ Processing Time</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Your data deletion request will be processed within:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li><strong>In-app deletion:</strong> Immediate (account deactivated instantly)</li>
              <li><strong>Email request:</strong> Within 7-14 business days</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">🔍 What Data Will Be Deleted?</h3>
            <p className="text-sm mb-2">The following information will be permanently deleted:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>Your account information (name, email, phone number)</li>
              <li>Profile data and preferences</li>
              <li>Saved delivery addresses</li>
              <li>Order history and transaction records</li>
              <li>Wishlist and cart items</li>
              <li>Reviews and ratings you've provided</li>
              <li>Any other personal information associated with your account</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">📝 Data Retention</h3>
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <CardContent className="pt-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium mb-2">Note: Some data may be retained for legal compliance:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Transaction records required for accounting and tax purposes (up to 7 years as per Indian law)</li>
                    <li>Data necessary to resolve disputes or enforce agreements</li>
                    <li>Anonymized data for analytics (cannot be linked back to you)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">❓ Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Q: Can I recover my account after deletion?</p>
                <p className="text-sm text-muted-foreground">A: No, account deletion is permanent and cannot be reversed. You would need to create a new account.</p>
              </div>
              <div>
                <p className="font-medium">Q: Will my pending orders be affected?</p>
                <p className="text-sm text-muted-foreground">A: Please wait until all orders are delivered or cancelled before deleting your account. Contact support if you have active orders.</p>
              </div>
              <div>
                <p className="font-medium">Q: What happens to my wallet balance?</p>
                <p className="text-sm text-muted-foreground">A: Any remaining wallet balance will be forfeited upon account deletion. Please use or request a refund before deletion.</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-3">📞 Need Help?</h3>
            <p className="text-sm mb-2">If you have questions about data deletion, contact us:</p>
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Email:</strong> support@rpsstationery.com</p>
              <p><strong>Address:</strong> RPS Stationery, Jaipur, Rajasthan, India</p>
              <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">⚠️ Before You Delete</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
            <li>Download your order history if you need it for future reference</li>
            <li>Ensure all pending orders are completed</li>
            <li>Use any remaining wallet balance or request a refund</li>
            <li>Unsubscribe from marketing emails if you prefer (instead of full deletion)</li>
            <li>Consider deactivating your account temporarily instead of permanent deletion</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
