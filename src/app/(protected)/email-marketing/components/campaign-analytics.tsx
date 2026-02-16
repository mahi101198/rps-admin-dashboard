'use client';

import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Mail, Eye, MousePointerClick, DollarSign } from 'lucide-react';

const campaignData = [
  {
    name: 'Flash Sale',
    sent: 5000,
    opened: 1250,
    clicked: 450,
    converted: 120,
    revenue: 15000,
  },
  {
    name: 'New Product',
    sent: 4200,
    opened: 840,
    clicked: 290,
    converted: 75,
    revenue: 8500,
  },
  {
    name: 'Weekly Deal',
    sent: 3500,
    opened: 700,
    clicked: 200,
    converted: 45,
    revenue: 5200,
  },
  {
    name: 'Seasonal',
    sent: 6000,
    opened: 1500,
    clicked: 600,
    converted: 180,
    revenue: 22000,
  },
];

const performanceTrend = [
  { date: 'Jan 1', openRate: 18, clickRate: 7, conversionRate: 2.5 },
  { date: 'Jan 8', openRate: 20, clickRate: 8, conversionRate: 2.8 },
  { date: 'Jan 15', openRate: 19, clickRate: 7.5, conversionRate: 2.6 },
  { date: 'Jan 22', openRate: 22, clickRate: 9, conversionRate: 3.0 },
  { date: 'Jan 29', openRate: 24, clickRate: 10, conversionRate: 3.2 },
];

const deviceBreakdown = [
  { name: 'Desktop', value: 45, color: '#3b82f6' },
  { name: 'Mobile', value: 40, color: '#8b5cf6' },
  { name: 'Tablet', value: 15, color: '#ec4899' },
];

export default function CampaignAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [dateRange, setDateRange] = useState('30');

  // Calculate totals
  const totals = campaignData.reduce(
    (acc, campaign) => ({
      sent: acc.sent + campaign.sent,
      opened: acc.opened + campaign.opened,
      clicked: acc.clicked + campaign.clicked,
      converted: acc.converted + campaign.converted,
      revenue: acc.revenue + campaign.revenue,
    }),
    { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 }
  );

  const rates = {
    openRate: ((totals.opened / totals.sent) * 100).toFixed(1),
    clickRate: ((totals.clicked / totals.opened) * 100).toFixed(1),
    conversionRate: ((totals.converted / totals.clicked) * 100).toFixed(1),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          <p className="text-gray-600 text-sm mt-1">Detailed performance metrics for your email campaigns</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          icon={Mail}
          label="Total Sent"
          value={totals.sent.toLocaleString()}
          trend="+12.5%"
          color="blue"
        />
        <KPICard
          icon={Eye}
          label="Open Rate"
          value={`${rates.openRate}%`}
          trend="+2.3%"
          color="purple"
        />
        <KPICard
          icon={MousePointerClick}
          label="Click Rate"
          value={`${rates.clickRate}%`}
          trend="+1.8%"
          color="green"
        />
        <KPICard
          icon={TrendingUp}
          label="Conversion"
          value={`${rates.conversionRate}%`}
          trend="+0.5%"
          color="orange"
        />
        <KPICard
          icon={DollarSign}
          label="Revenue"
          value={`$${(totals.revenue / 1000).toFixed(1)}K`}
          trend="+15.3%"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Bar dataKey="opened" fill="#3b82f6" name="Opened" />
              <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
              <Bar dataKey="converted" fill="#10b981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="openRate"
                stroke="#3b82f6"
                name="Open Rate %"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="clickRate"
                stroke="#8b5cf6"
                name="Click Rate %"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="conversionRate"
                stroke="#10b981"
                name="Conversion Rate %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device Breakdown & Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {deviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {deviceBreakdown.map((device) => (
              <div key={device.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm text-gray-700">{device.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{device.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Campaigns by Revenue</h3>
          <div className="space-y-3">
            {campaignData
              .sort((a, b) => b.revenue - a.revenue)
              .map((campaign, index) => (
                <div key={campaign.name} className="pb-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{campaign.name}</p>
                        <p className="text-xs text-gray-500">
                          {campaign.sent.toLocaleString()} sent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">
                        ${campaign.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((campaign.revenue / totals.revenue) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full"
                      style={{
                        width: `${(campaign.revenue / Math.max(...campaignData.map((c) => c.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Campaign Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Detailed Campaign Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Campaign</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Sent</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Opens</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Conversions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaignData.map((campaign) => {
                const roi = (campaign.revenue / (campaign.sent * 0.5)).toFixed(1);
                return (
                  <tr key={campaign.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {campaign.sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {campaign.opened} ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {campaign.clicked} ({((campaign.clicked / campaign.opened) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 text-right">
                      {campaign.converted} ({((campaign.converted / campaign.clicked) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      ${campaign.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
                      <span className="text-green-600">{roi}x</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-green-600 font-medium">{trend} from last period</p>
    </div>
  );
}
