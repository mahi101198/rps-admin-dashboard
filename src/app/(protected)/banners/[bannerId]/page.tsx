'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getBannerAnalyticsAllAction, BannerAnalyticsResponse } from '@/actions/banner-analytics-detailed-actions';

export default function BannerAnalyticsDashboard() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.bannerId as string;

  const [data, setData] = useState<BannerAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'email' | 'date'>('date');
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
        const result = await getBannerAnalyticsAllAction(bannerId);
        setData(result);
        if (!result.success) {
          setError(result.error || 'Failed to load analytics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bannerId]);

  const filteredAndSorted = data?.analytics
    ?.filter((item) =>
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clickUrl.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let compareVal = 0;

      if (sortField === 'email') {
        compareVal = a.userEmail.localeCompare(b.userEmail);
      } else if (sortField === 'date') {
        compareVal = a.clickedAt.getTime() - b.clickedAt.getTime();
      }

      return sortDir === 'asc' ? compareVal : -compareVal;
    }) || [];

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
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600 font-semibold">
                Error: {error || data?.error || 'Failed to load analytics'}
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
              <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              <p className="text-slate-600 text-sm mt-1">{data?.bannerTitle || 'Banner Details'}</p>
            </div>
          </div>
        </div>

        {/* Analytics Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardTitle>Click Details</CardTitle>
            <CardDescription>
              Total Clicks: <span className="font-bold text-slate-900">{data?.analytics?.length || 0}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search by email or click URL..."
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
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">User Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Click URL</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">
                        <button
                          onClick={() => {
                            if (sortField === 'date') {
                              setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortField('date');
                              setSortDir('desc');
                            }
                          }}
                          className="hover:text-slate-900"
                        >
                          Clicked At {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Location</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Device</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">IP Address</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-600">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAndSorted.map((record) => (
                      <tr key={record.analyticsId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-900 font-medium text-xs">{record.userEmail}</td>
                        <td className="px-4 py-3">
                          <a
                            href={record.clickUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-xs break-all max-w-xs"
                          >
                            {record.clickUrl.substring(0, 30)}...
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {record.clickedAt.toLocaleDateString()} {record.clickedAt.toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {record.city}, {record.country}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded capitalize">
                            {record.clickType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">
                          {record.userAgent.substring(0, 25)}...
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs font-mono">{record.ipAddress}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{record.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No analytics data available</p>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Showing {filteredAndSorted.length} of {data?.analytics?.length || 0} clicks
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
