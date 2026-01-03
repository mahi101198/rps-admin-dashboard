'use client';

import { useRouter } from 'next/navigation';
import { OrdersTable } from './orders-table';
import { Order } from '@/lib/types/all-schemas';

export function OrdersTableWrapper({ data }: { data: Order[] }) {
  const router = useRouter();

  console.log('[OrdersTableWrapper] Received data:', data);
  console.log('[OrdersTableWrapper] Data count:', data?.length || 0);

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">No orders found</p>
        <p className="text-sm mt-2">Orders will appear here once customers place them.</p>
      </div>
    );
  }

  return (
    <OrdersTable data={data} onDataChange={handleDataChange} />
  );
}