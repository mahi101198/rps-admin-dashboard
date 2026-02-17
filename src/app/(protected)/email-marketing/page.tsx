'use client';

import React, { useState } from 'react';
import TemplateManager from './components/template-manager';
import EmailComposer from './components/email-composer';
import BulkEmailSender from './components/bulk-email-sender';
import CampaignAnalytics from './components/campaign-analytics';
import BannerManager from './components/banner-manager';
import InvoiceTesting from './components/invoice-testing';
import { Mail, Settings, BarChart3, Image as ImageIcon, Send, FileText } from 'lucide-react';

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState('composer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-white rounded-lg p-3">
                <Mail className="w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Email Marketing Hub</h1>
              <p className="text-sm text-gray-600 mt-1">Design, manage, and send professional email campaigns</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Active Templates"
            value="12"
            icon="📧"
            trend="+2 this week"
          />
          <StatCard
            label="Campaigns Sent"
            value="48"
            icon="✓"
            trend="+8 this month"
          />
          <StatCard
            label="Avg. Open Rate"
            value="32.5%"
            icon="👁️"
            trend="+2.3% vs last"
          />
          <StatCard
            label="Engagement"
            value="18.2%"
            icon="🔗"
            trend="+1.5% vs last"
          />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tab Buttons */}
        <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 grid grid-cols-6 gap-0 overflow-x-auto">
          {[
            { id: 'composer', label: 'Compose', icon: Mail },
            { id: 'templates', label: 'Templates', icon: Settings },
            { id: 'banners', label: 'Banners', icon: ImageIcon },
            { id: 'bulk', label: 'Bulk Send', icon: Send },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'invoice', label: 'Invoice Test', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-4 flex items-center justify-center gap-2 border-r border-gray-200 transition-all last:border-r-0 ${
                activeTab === id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'composer' && <EmailComposer />}
          {activeTab === 'templates' && <TemplateManager />}
          {activeTab === 'banners' && <BannerManager />}
          {activeTab === 'bulk' && <BulkEmailSender />}
          {activeTab === 'analytics' && <CampaignAnalytics />}
          {activeTab === 'invoice' && <InvoiceTesting />}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: string;
  trend: string;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-green-600 mt-2">{trend}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
