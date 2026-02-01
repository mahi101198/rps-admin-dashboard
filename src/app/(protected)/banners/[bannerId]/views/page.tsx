'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getBannerViewsDetailAction, BannerAnalyticsResponse } from '@/actions/banner-analytics-detailed-actions';

export default function BannerViewsDashboard() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.bannerId as string;

  const [data, setData] = useState<BannerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'email' | 'views'>('views');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!bannerId) {
      setError('Banner ID is missing');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getBannerViewsDetailAction(bannerId);
        setData(result);
        if (!result.success) {
          setError(result.error || 'Failed to load views');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bannerId]);

  const filteredAndSorted = (() => {
    // Group views by userId
    const groupedByUser = new Map<string, { userId: string; userEmail: string; viewCount: number; locations: Set<string> }>();
    
    data?.views?.forEach((view) => {
      const key = view.userId;
      if (!groupedByUser.has(key)) {
        groupedByUser.set(key, {
          userId: view.userId,
          userEmail: view.userEmail,
          viewCount: 0,
          locations: new Set<string>(),
        });
      }
      const user = groupedByUser.get(key)!;
      user.viewCount += 1;
      user.locations.add(`${view.city}, ${view.country}`);
    });

    // Convert to array and filter/sort
    let result = Array.from(groupedByUser.values()).map(user => ({
      ...user,
      locations: Array.from(user.locations),
    }));

    // Filter by search term
    result = result.filter((item) =>
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    result.sort((a, b) => {
      let compareVal = 0;

      if (sortField === 'email') {
        compareVal = a.userEmail.localeCompare(b.userEmail);
      } else if (sortField === 'views') {
        compareVal = a.viewCount - b.viewCount;
      }

      return sortDir === 'asc' ? compareVal : -compareVal;
    });

    return result;
  })() || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
          </div>
          <div className="h-96 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Views</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 font-semibold">
                Error: {error || data?.error || 'Failed to load views'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Views</h1>
              <p className="text-slate-600 text-sm mt-1">{data?.bannerTitle || 'Banner Details'}</p>
            </div>
          </div>
        </div>

        {/* Views Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>View Details</CardTitle>
            <CardDescription>
              Total Views: <span className="font-bold text-slate-900">{data?.views?.length || 0}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search by email or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Table */}
            {filteredAndSorted.length > 0 ? (
              <div className="rounded-lg border border-slate-200 overflow-hidden bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">User ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Location(s)</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => {
                            if (sortField === 'views') {
                              setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('views');
                              setSortDir('desc');
                            }
                          }}
                          className="hover:text-slate-900"
                        >
                          No. of Views {sortField === 'views' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAndSorted.map((record, idx) => (
                      <tr key={`${record.userId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600 text-xs font-mono">{record.userId}</td>
                        <td className="px-4 py-3 text-slate-900 font-medium text-xs">{record.userEmail}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {record.locations.map((loc, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                                {loc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                            {record.viewCount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No views data available</p>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Showing {filteredAndSorted.length} of {(() => {
                const groupedByUser = new Map<string, boolean>();
                data?.views?.forEach((view) => {
                  groupedByUser.set(view.userId, true);
                });
                return groupedByUser.size;
              })()} unique users
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
