import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, Shield, Eye, Star, Users, Database, Building, CreditCard, Heart, Trash2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Play Store Policies',
  description: 'Android app policies and documentation for Play Store submission',
};

const policies = [
  {
    title: 'Privacy Policy',
    description: 'User data collection and privacy practices',
    icon: Shield,
    href: '/playstore/privacy-policy',
    color: 'bg-blue-500',
  },
  {
    title: 'Data Deletion',
    description: 'Request deletion of your personal data',
    icon: Trash2,
    href: '/playstore/data-deletion',
    color: 'bg-red-500',
  },
  {
    title: 'App Access',
    description: 'Device permissions and features required',
    icon: Eye,
    href: '/playstore/app-access',
    color: 'bg-green-500',
  },
  {
    title: 'Ads Policy',
    description: 'Advertising practices and disclosures',
    icon: FileText,
    href: '/playstore/ads',
    color: 'bg-yellow-500',
  },
  {
    title: 'Content Rating',
    description: 'Age-appropriate content guidelines',
    icon: Star,
    href: '/playstore/content-rating',
    color: 'bg-purple-500',
  },
  {
    title: 'Target Audience',
    description: 'Intended user demographics',
    icon: Users,
    href: '/playstore/target-audience',
    color: 'bg-pink-500',
  },
  {
    title: 'Data Safety',
    description: 'Data collection, sharing, and security',
    icon: Database,
    href: '/playstore/data-safety',
    color: 'bg-indigo-500',
  },
  {
    title: 'Government Apps',
    description: 'Government compliance and regulations',
    icon: Building,
    href: '/playstore/government-apps',
    color: 'bg-gray-500',
  },
  {
    title: 'Financial Features',
    description: 'Payment processing and financial data',
    icon: CreditCard,
    href: '/playstore/financial-features',
    color: 'bg-emerald-500',
  },
  {
    title: 'Health Policy',
    description: 'Health-related features and data',
    icon: Heart,
    href: '/playstore/health',
    color: 'bg-red-500',
  },
];

export default function PlayStorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📱 Play Store Policies</h1>
        <p className="text-muted-foreground mt-2">
          Android app policies and documentation for Google Play Store submission
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((policy) => {
          const Icon = policy.icon;
          return (
            <Link key={policy.href} href={policy.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`${policy.color} p-2 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{policy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view full policy →
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>ℹ️ About RPS Stationery</CardTitle>
          <CardDescription>
            RPS Stationery is an e-commerce Android application for purchasing stationery items and cleaning materials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Stationery items (pens, pencils, notebooks, art supplies, etc.)</li>
            <li>Cleaning materials and supplies</li>
            <li>Easy ordering and secure payment</li>
            <li>Fast delivery across India</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
