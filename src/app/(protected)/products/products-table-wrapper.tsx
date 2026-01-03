'use client';

import { useRouter } from 'next/navigation';
import { ProductsTable } from './products-table';
import { Product, ProductWithDetails } from '@/lib/types/product';

export function ProductsTableWrapper({ data, onEditProduct }: { data: Product[]; onEditProduct?: (product: ProductWithDetails) => void }) {
  const router = useRouter();

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  return (
    <ProductsTable data={data} onEditProduct={onEditProduct} onDataChange={handleDataChange} />
  );
}