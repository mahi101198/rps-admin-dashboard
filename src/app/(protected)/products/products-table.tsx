'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product, ProductWithDetails } from '@/lib/types/all-schemas';
import { columns } from './columns';
import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { getProductAction as getProductWithDetailsAction } from '@/actions/product-actions';
import { toast } from 'sonner';

interface ProductsTableProps {
  data: Product[];
  onEditProduct?: (product: ProductWithDetails) => void;
  onDataChange?: () => void; // Add this prop
}

export function ProductsTable({ data, onEditProduct, onDataChange }: ProductsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isLoadingProduct, setIsLoadingProduct] = React.useState(false);
  
  const isMobile = useIsMobile();

  const handleRowClick = async (product: Product) => {
    // Prevent loading if we're already loading or if a dialog is open
    if (isLoadingProduct) return;
    
    setIsLoadingProduct(true);
    try {
      const productWithDetails = await getProductWithDetailsAction(product.productId);
      
      if (productWithDetails) {
        // If there's an onEditProduct callback, call it with the product details
        if (onEditProduct) {
          onEditProduct(productWithDetails);
        }
      } else {
        toast.error('Failed to load product details');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Input
          startIcon={Search}
          placeholder="Find products..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-xs"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table className="min-w-full">
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="px-2 py-2 text-xs">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    isLoadingProduct ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={(e) => {
                    // Only trigger row click if not clicking on interactive elements
                    const target = e.target as HTMLElement;
                    // Check if we're clicking on a dialog or dialog trigger
                    const isDialogElement = target.closest('[role="dialog"]') || target.closest('[data-state="open"]');
                    const isDialogTrigger = target.closest('[data-haspopup="dialog"]');
                    
                    if (!isLoadingProduct && !isDialogElement && !isDialogTrigger && 
                        !target.closest('button') && !target.closest('input')) {
                      handleRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 py-2 h-16 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 flex-wrap gap-2">
        <div className="text-muted-foreground hidden flex-1 text-sm md:flex">
          {table.getFilteredRowModel().rows.length} product
          {table.getFilteredRowModel().rows.length > 1 ? 's' : ''}
        </div>
        <div className="flex w-full items-center gap-4 md:w-fit md:gap-8">
          <div className="hidden items-center gap-2 md:flex">
            <Label htmlFor="rows-per-page" className="text-xs font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-16" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-xs font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}