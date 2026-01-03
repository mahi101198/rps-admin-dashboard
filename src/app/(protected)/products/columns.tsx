import Image from 'next/image';
import { Product } from '@/lib/types/all-schemas';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { SmartImage } from '@/components/smart-image';
import { AddToHomeSection } from '@/components/products/add-to-home-section';

const sortHeader = (column: any, label: string) => {
  const sorted = column.getIsSorted();

  const handleSort = () => {
    if (sorted === false) {
      column.toggleSorting(false);
    } else if (sorted === 'asc') {
      column.toggleSorting(true);
    } else {
      column.clearSorting();
    }
  };

  return (
    <button className="inline-flex items-center gap-1 cursor-pointer text-xs" onClick={handleSort}>
      {label}
      {sorted === 'asc' && <ChevronUp className="size-2" />}
      {sorted === 'desc' && <ChevronDown className="size-2" />}
      {!sorted && <ChevronsUpDown className="size-2" />}
    </button>
  );
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => sortHeader(column, 'Product Name'),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-2 min-w-[150px]">
          <SmartImage src={product.image || '/logo.png'} alt={product.name} className="w-10" />
          <div className="space-y-0.5 overflow-hidden">
            <div className="font-medium truncate text-xs">{product.name}</div>
            <div className="text-xs text-gray-500">Stock: {product.stock}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'mrp',
    header: ({ column }) => sortHeader(column, 'MRP'),
    cell: ({ row }) => {
      const mrp = parseFloat(row.getValue('mrp') || '0');
      return <div className="font-medium text-xs">₹{mrp.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => sortHeader(column, 'Selling Price'),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return <div className="font-medium text-xs">₹{price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'discount',
    header: ({ column }) => sortHeader(column, 'Discount'),
    cell: ({ row }) => {
      const discount = parseFloat(row.getValue('discount') || '0');
      return <div className="font-medium text-xs">{discount}%</div>;
    },
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => sortHeader(column, 'Category'),
    cell: ({ row }) => {
      const categoryId = row.getValue('categoryId') as string;
      return <div className="truncate max-w-[80px] text-xs">{categoryId}</div>;
    },
  },
  {
    accessorKey: 'subcategoryId',
    header: ({ column }) => sortHeader(column, 'Sub Category'),
    cell: ({ row }) => {
      const subcategoryId = row.getValue('subcategoryId') as string;
      return <div className="truncate max-w-[80px] text-xs">{subcategoryId}</div>;
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => sortHeader(column, 'Stock'),
    cell: ({ row }) => {
      const stock = parseInt(row.getValue('stock'));
      return <div className="font-medium text-xs">{stock}</div>;
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => sortHeader(column, 'Status'),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-1">
          <span
            className={`px-1 py-0.5 rounded-full text-[0.6rem] font-semibold ${
              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex gap-1">
          <div onClick={(e) => e.stopPropagation()}>
            <AddToHomeSection product={product} />
          </div>
        </div>
      );
    },
  },
];