'use client';

import { BannerAnalyticsResponse } from '@/actions/banner-analytics-detailed-actions';
import { Card } from '@/components/ui/card';
import { Eye, MousePointerClick, Users, TrendingUp } from 'lucide-react';

interface StatsSummaryCardsProps {
  data: BannerAnalyticsResponse;
}

export default function StatsSummaryCards({ data }: StatsSummaryCardsProps) {
  const stats = [
    {
      label: 'Total Views',
      value: data.totalViews,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Total Clicks',
      value: data.totalClicks,
      icon: MousePointerClick,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Unique Viewers',
      value: data.uniqueViewers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      label: 'CTR %',
      value: data.totalViews > 0 ? ((data.totalClicks / data.totalViews) * 100).toFixed(2) : '0.00',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`border ${stat.borderColor} ${stat.bgColor}`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} opacity-20`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
