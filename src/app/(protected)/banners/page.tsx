'use client';

import { useState, useEffect } from 'react';
import { BannerManagement } from './banner-management';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getBannersAction } from '@/actions/banner-actions';

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
          <CardDescription>Manage your promotional banners</CardDescription>
        </CardHeader>
        <CardContent>
          {banners.length > 0 ? (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.bannerId} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
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
                  <div className="flex-shrink-0">
                    <BannerActionsWrapper
                      banner={{
                        bannerId: banner.bannerId,
                        title: banner.title,
                        imageUrl: banner.imageUrl,
                        linkTo: banner.linkTo,
                        rank: banner.rank,
                        isActive: banner.isActive,
                        view_change_time: banner.view_change_time
                      }}
                      onSuccess={fetchBanners}
                    />
                  </div>
                </div>
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