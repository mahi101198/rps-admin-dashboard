'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BannerManagement } from './banner-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getBannersAction, getBannerStatsAction } from '@/actions/banner-actions';
import { useAuth } from '@/contexts/auth-context';
import { useBannerTracking } from '@/hooks/use-banner-tracking';


// Client component wrapper for BannerActions to avoid prop serialization issues
function BannerActionsWrapper({ banner, onSuccess }: { banner: any; onSuccess: () => void }) {
  const [BannerActionsComponent, setBannerActionsComponent] = useState<any>(null);

  useEffect(() => {
    // Dynamically import the BannerActions component to avoid server-side issues
    import('./banner-actions-client').then((module) => {
      setBannerActionsComponent(() => module.BannerActions);
    });
  }, []);

  if (!BannerActionsComponent) {
    return <div className="w-24 h-8 bg-muted rounded" />;
  }

  return <BannerActionsComponent banner={banner} onSuccess={onSuccess} />;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const fetchedBanners = await getBannersAction();
      setBanners(fetchedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const stats = {
    total: banners.length,
    active: banners.filter((banner) => banner.isActive).length,
    inactive: banners.filter((banner) => !banner.isActive).length,
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🖼️ Banners Management</h1>
            <p className="text-muted-foreground">Manage promotional banners and campaigns</p>
          </div>
          <BannerManagement onRefresh={fetchBanners} />
        </div>
        <div className="text-center py-8">
          <p>Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🖼️ Banners Management</h1>
          <p className="text-muted-foreground">Manage promotional banners and campaigns</p>
          {banners.length === 0 && (
            <p className="text-yellow-600 mt-2">No banners found in the database</p>
          )}
        </div>
        <BannerManagement onRefresh={fetchBanners} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <span className="text-2xl">🖼️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All banner campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Live banners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Banners</CardTitle>
            <span className="text-2xl">⏸️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Paused banners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <span className="text-2xl">🔥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {banners.filter(banner => (banner.rank || 0) >= 8).length}
            </div>
            <p className="text-xs text-muted-foreground">Priority 8+</p>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>Banner List</CardTitle>
          <CardDescription>Manage your promotional banners and view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length > 0 ? (
            <div className="space-y-4">
              {banners.map((banner) => (
                <BannerListItem 
                  key={banner.bannerId} 
                  banner={banner} 
                  onSuccess={fetchBanners}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="font-semibold mb-2">No Banners Found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first promotional banner to start advertising
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Banner List Item Component with Analytics
function BannerListItem({ banner, onSuccess }: { banner: any; onSuccess: () => void }) {
  const router = useRouter();
  const [BannerActionsComponent, setBannerActionsComponent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { user } = useAuth();
  const { trackView } = useBannerTracking();

  useEffect(() => {
    import('./banner-actions-client').then((module) => {
      setBannerActionsComponent(() => module.BannerActions);
    });
  }, []);

  const loadStats = async () => {
    if (!showStats) {
      setStatsLoading(true);
      try {
        const result = await getBannerStatsAction(banner.bannerId);
        if (result && result.success && result.stats) {
          setStats({
            totalViews: result.stats.totalViews || 0,
            totalClicks: result.stats.totalClicks || 0,
            ctr: result.stats.ctr || 0,
          });
        }
      } catch (error) {
        console.error('Error loading banner stats:', error);
      } finally {
        setStatsLoading(false);
      }
      setShowStats(true);
    } else {
      setShowStats(false);
    }
  };

  const handleBannerClick = async () => {
    if (user && banner.bannerId) {
      await trackView(banner.bannerId, user.uid);
    }
  };

  if (!BannerActionsComponent) {
    return <div className="w-full h-24 bg-muted rounded" />;
  }

  return (
    <>
      <div 
        key={banner.bannerId} 
        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition"
        onMouseEnter={handleBannerClick}
      >
        <div className="relative w-32 h-20 rounded overflow-hidden bg-muted flex items-center justify-center">
          {banner.imageUrl ? (
            <Image
              src={banner.imageUrl}
              alt={banner.title || 'Banner'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={banner.isActive ? "default" : "secondary"}>
              {banner.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              Rank {banner.rank || 0}
            </Badge>
            <Badge variant="outline" className="text-xs">
              ⏱️ {banner.view_change_time || 5}s
            </Badge>
          </div>
          <p className="font-medium">{banner.title}</p>
          {banner.linkTo && (
            <p className="text-sm text-muted-foreground">
              URL: {banner.linkTo}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/banners/${banner.bannerId}`)}
            className="text-xs"
          >
            📊 Analytics
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/banners/${banner.bannerId}/views`)}
            className="text-xs"
          >
            📺 Views
          </Button>
          <Button
            size="sm"
            variant={showStats ? "default" : "outline"}
            onClick={loadStats}
            disabled={statsLoading}
          >
            {statsLoading ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <>
                {showStats ? '📊 Hide' : '📈 Stats'}
              </>
            )}
          </Button>
          <BannerActionsComponent
            banner={{
              bannerId: banner.bannerId,
              title: banner.title,
              imageUrl: banner.imageUrl,
              linkTo: banner.linkTo,
              rank: banner.rank,
              isActive: banner.isActive,
              view_change_time: banner.view_change_time
            }}
            onSuccess={onSuccess}
          />
        </div>
      </div>

      {/* Stats Display */}
      {showStats && stats && (
        <div className="ml-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded p-3 border border-blue-100">
              <p className="text-xs text-gray-600 font-semibold">TOTAL VIEWS</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
              <p className="text-xs text-gray-500 mt-1">👁️ View count</p>
            </div>
            <div className="bg-white rounded p-3 border border-purple-100">
              <p className="text-xs text-gray-600 font-semibold">TOTAL CLICKS</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalClicks}</p>
              <p className="text-xs text-gray-500 mt-1">🔗 Click count</p>
            </div>
            <div className="bg-white rounded p-3 border border-green-100">
              <p className="text-xs text-gray-600 font-semibold">CLICK-THROUGH RATE</p>
              <p className="text-2xl font-bold text-green-600">{stats.ctr.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">📈 CTR metric</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      )}
    </>
  );
}