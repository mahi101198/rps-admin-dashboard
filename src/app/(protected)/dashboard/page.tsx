'use client';

import { DashboardContent } from './dashboard-content';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-3xl font-bold">🚀 Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to RPS Stationery Admin Panel</p>
      </div>
      <DashboardContent />
    </div>
  );
}