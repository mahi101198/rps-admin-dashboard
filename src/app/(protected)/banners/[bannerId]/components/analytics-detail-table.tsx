'use client';

import { useState, useMemo } from 'react';
import { AnalyticsSummary, AnalyticsRecord } from '@/actions/banner-analytics-detailed-actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface AnalyticsDetailTableProps {
  data: AnalyticsSummary[];
  analytics: AnalyticsRecord[];
}

export default function AnalyticsDetailTable({ data, analytics }: AnalyticsDetailTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'email' | 'clicks' | 'first'>('clicks');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let aVal: number | string = '';
      let bVal: number | string = '';

      switch (sortField) {
        case 'email':
          aVal = a.userEmail;
          bVal = b.userEmail;
          break;
        case 'clicks':
          aVal = a.clickCount;
          bVal = b.clickCount;
          break;
        case 'first':
          aVal = a.firstClicked.getTime();
          bVal = b.firstClicked.getTime();
          break;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }

      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [data, searchTerm, sortField, sortDir]);

  const getUserClicks = (userId: string) => {
    return analytics.filter((a) => a.userId === userId);
  };

  const handleSort = (field: 'email' | 'clicks' | 'first') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: 'email' | 'clicks' | 'first' }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by email or user ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Analytics Summary Table */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  User Email
                  <SortIcon field="email" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                <button
                  onClick={() => handleSort('clicks')}
                  className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  Click Count
                  <SortIcon field="clicks" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                <button
                  onClick={() => handleSort('first')}
                  className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  First Clicked
                  <SortIcon field="first" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Last Clicked</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Click URLs</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Locations</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Devices</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.map((summary) => (
              <div key={summary.userId}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{summary.userEmail}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center justify-center bg-green-100 text-green-700 rounded-full px-3 py-1 font-semibold text-xs">
                      {summary.clickCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {summary.firstClicked.toLocaleDateString()} {summary.firstClicked.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {summary.lastClicked.toLocaleDateString()} {summary.lastClicked.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {summary.clickUrls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1 max-w-xs truncate"
                          title={url}
                        >
                          {url.substring(0, 15)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {summary.locations.map((loc, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {summary.devices.map((device, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded truncate">
                          {device.substring(0, 20)}...
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedUser(expandedUser === summary.userId ? null : summary.userId)}
                      className="text-xs"
                    >
                      {expandedUser === summary.userId ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </td>
                </tr>

                {/* Expanded click details */}
                {expandedUser === summary.userId && (
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 mb-4">Click History - {summary.userEmail}</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getUserClicks(summary.userId).map((click) => (
                            <Card key={click.analyticsId} className="p-4 bg-white border-green-100">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-500 font-semibold">Clicked At</p>
                                  <p className="text-slate-900">{click.clickedAt.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Click URL</p>
                                  <a
                                    href={click.clickUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all flex items-center gap-1"
                                  >
                                    {click.clickUrl.substring(0, 40)}...
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  </a>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Click Type</p>
                                  <p className="text-slate-900 capitalize">{click.clickType}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Location</p>
                                  <p className="text-slate-900">
                                    {click.city}, {click.country}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">IP Address</p>
                                  <p className="text-slate-900 font-mono text-xs">{click.ipAddress}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Source</p>
                                  <p className="text-slate-900">{click.source}</p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </div>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No results found</p>
        </div>
      )}

      <p className="text-xs text-slate-500 text-right">Showing {filteredData.length} users with clicks</p>
    </div>
  );
}
