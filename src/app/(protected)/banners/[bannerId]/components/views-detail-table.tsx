'use client';

import { useState, useMemo } from 'react';
import { ViewSummary, ViewRecord } from '@/actions/banner-analytics-detailed-actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface ViewsDetailTableProps {
  data: ViewSummary[];
  views: ViewRecord[];
}

export default function ViewsDetailTable({ data, views }: ViewsDetailTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'email' | 'views' | 'duration'>('views');
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
        case 'views':
          aVal = a.viewCount;
          bVal = b.viewCount;
          break;
        case 'duration':
          aVal = a.totalDurationSeconds;
          bVal = b.totalDurationSeconds;
          break;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }

      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [data, searchTerm, sortField, sortDir]);

  const getUserViews = (userId: string) => {
    return views.filter((v) => v.userId === userId);
  };

  const handleSort = (field: 'email' | 'views' | 'duration') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: 'email' | 'views' | 'duration' }) => {
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

      {/* Views Summary Table */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
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
                  onClick={() => handleSort('views')}
                  className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  View Count
                  <SortIcon field="views" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">First Viewed</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Last Viewed</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                <button
                  onClick={() => handleSort('duration')}
                  className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                >
                  Duration (sec)
                  <SortIcon field="duration" />
                </button>
              </th>
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
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full px-3 py-1 font-semibold text-xs">
                      {summary.viewCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {summary.firstViewed.toLocaleDateString()} {summary.firstViewed.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {summary.lastViewed.toLocaleDateString()} {summary.lastViewed.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{summary.totalDurationSeconds}s</td>
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

                {/* Expanded view details */}
                {expandedUser === summary.userId && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-900 mb-4">View History - {summary.userEmail}</h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getUserViews(summary.userId).map((view) => (
                            <Card key={view.viewId} className="p-4 bg-white border-blue-100">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <p className="text-slate-500 font-semibold">Viewed At</p>
                                  <p className="text-slate-900">{view.viewedAt.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Location</p>
                                  <p className="text-slate-900">
                                    {view.city}, {view.country}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Duration</p>
                                  <p className="text-slate-900">{view.view_duration_seconds}s</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">IP Address</p>
                                  <p className="text-slate-900 font-mono text-xs">{view.ipAddress}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Source</p>
                                  <p className="text-slate-900">{view.source}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-semibold">Device</p>
                                  <p className="text-slate-900 text-xs">{view.userAgent.substring(0, 30)}...</p>
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

      <p className="text-xs text-slate-500 text-right">Showing {filteredData.length} viewers</p>
    </div>
  );
}
