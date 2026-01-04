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
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground mb-4">
          Orders will appear here once customers place them.
        </p>
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg inline-block">
          <p className="font-medium mb-2">💡 Developer Note:</p>
          <p>Make sure your Firestore has an 'orders' collection with documents.</p>
          <p className="mt-1">Check the console logs for any errors.</p>
        </div>
      </div>
    );
  }

  return (
    <OrdersTable data={data} onDataChange={handleDataChange} />
  );
}