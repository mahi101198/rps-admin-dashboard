'use client';

import { useRouter } from 'next/navigation';
import { ProductsTable } from './products-table';
import { Product, ProductWithDetails, Category, SubCategory } from '@/lib/types/all-schemas';

interface ProductsTableWrapperProps {
  data: Product[];
  categories: Category[];
  subCategories: SubCategory[];
  onEditProduct?: (product: ProductWithDetails) => void;
}

export function ProductsTableWrapper({ data, categories, subCategories, onEditProduct }: ProductsTableWrapperProps) {
  const router = useRouter();

  const handleDataChange = () => {
    // Use router.refresh() to re-fetch the data without a full page reload
    router.refresh();
  };

  return (
    <ProductsTable 
      data={data} 
      categories={categories}
      subCategories={subCategories}
      onEditProduct={onEditProduct} 
      onDataChange={handleDataChange} 
    />
  );
}