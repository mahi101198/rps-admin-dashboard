'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Plus,
  Package,
  Tag,
  ShoppingBag,
  DollarSign,
  TrendingDown,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Star } from 'lucide-react';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ProductActions } from './product-actions';

interface ProductsTableProps {
  products: ProductDetailsDocument[];
  loading: boolean;
  onEdit: (product: ProductDetailsDocument) => void;
  onCopy: (product: ProductDetailsDocument) => void;
  onDelete: (productId: string) => void;
  onViewDetails?: (product: ProductDetailsDocument) => void;
}

type SortColumn = 'title' | 'brand' | 'category' | 'price' | 'rating' | 'skus' | 'status' | 'availability' | null;
type SortDirection = 'asc' | 'desc' | null;

export function ProductsTable({ 
  products, 
  loading, 
  onEdit,
  onCopy, 
  onDelete, 
  onViewDetails 
}: ProductsTableProps) {
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return;

    setDeleteLoading(true);
    try {
      // Here you would call your delete action
      // await deleteProductAction(deleteProductId);
      toast.success('Product deleted successfully');
      onDelete(deleteProductId);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
      setDeleteProductId(null);
    }
  };

  // Sort the products
  const sortedProducts = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return products;
    }

    const sorted = [...products].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'brand':
          aValue = (a.brand || '').toLowerCase();
          bValue = (b.brand || '').toLowerCase();
          break;
        case 'category':
          aValue = (a.category || '').toLowerCase();
          bValue = (b.category || '').toLowerCase();
          break;
        case 'price':
          const aPrices = a.product_skus.map((s: any) => s.price);
          const bPrices = b.product_skus.map((s: any) => s.price);
          aValue = Math.min(...aPrices);
          bValue = Math.min(...bPrices);
          break;
        case 'rating':
          aValue = a.rating?.average || 0;
          bValue = b.rating?.average || 0;
          break;
        case 'skus':
          aValue = a.product_skus.length;
          bValue = b.product_skus.length;
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case 'availability':
          const availabilityOrder = { 'in_stock': 3, 'limited': 2, 'out_of_stock': 1 };
          aValue = availabilityOrder[a.overall_availability as keyof typeof availabilityOrder] || 0;
          bValue = availabilityOrder[b.overall_availability as keyof typeof availabilityOrder] || 0;
          break;
        default:
          return 0;
      }

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric comparisons
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }, [products, sortColumn, sortDirection]);

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction or reset
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort header component
  const SortHeader = ({ 
    column, 
    children 
  }: { 
    column: SortColumn; 
    children: React.ReactNode;
  }) => (
    <TableHead className="cursor-pointer hover:bg-blue-50 transition-colors border-b-2 border-gray-200 hover:border-blue-300">
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 font-semibold whitespace-nowrap w-full py-2"
      >
        {children}
        <div className="ml-1">
          {sortColumn === column && sortDirection === 'asc' && (
            <ArrowUp className="h-4 w-4 text-blue-600" />
          )}
          {sortColumn === column && sortDirection === 'desc' && (
            <ArrowDown className="h-4 w-4 text-blue-600" />
          )}
          {sortColumn !== column && (
            <span className="text-gray-300 text-sm">⇅</span>
          )}
        </div>
      </button>
    </TableHead>
  );

  // Get availability badge
  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'in_stock':
        return <Badge className="bg-green-500 hover:bg-green-500">In Stock</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-500 hover:bg-yellow-500">Limited</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500 hover:bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge>{availability}</Badge>;
    }
  };

  // Get category badge
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      stationery: 'bg-blue-500 hover:bg-blue-500',
      cleaning: 'bg-green-500 hover:bg-green-500',
      electronics: 'bg-purple-500 hover:bg-purple-500',
      household: 'bg-orange-500 hover:bg-orange-500',
      kitchen: 'bg-red-500 hover:bg-red-500',
      lowcost: 'bg-gray-500 hover:bg-gray-500',
    };
    return <Badge className={colors[category] || 'bg-gray-500 hover:bg-gray-500'}>{category}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner className="h-8 w-8" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No products</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      

      {/* Sort Controls */}
      
      <div className="rounded-md border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader column="title">Product</SortHeader>
              <SortHeader column="brand">Brand</SortHeader>
              <SortHeader column="category">Category</SortHeader>
              <SortHeader column="skus">SKUs</SortHeader>
              <SortHeader column="price">Price Range</SortHeader>
              <SortHeader column="rating">Rating</SortHeader>
              <SortHeader column="status">Status</SortHeader>
              <SortHeader column="availability">Availability</SortHeader>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => {
            const skus = product.product_skus;
            const prices = skus.map((s: any) => s.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            return (
              <TableRow key={product.product_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {product.media?.main_image?.url ? (
                      <img
                        src={product.media.main_image.url}
                        alt={product.media.main_image.alt_text || product.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.subtitle}</div>
                      <div className="flex items-center gap-1 mt-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{typeof product.rating?.average === 'number' ? product.rating.average : 0}</span>
                        <span className="text-muted-foreground">({typeof product.rating?.count === 'number' ? product.rating.count : 0})</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {product.brand}
                  </div>
                </TableCell>
                <TableCell>
                  {getCategoryBadge(product.category)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    {skus.length} variants
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {minPrice === maxPrice ? (
                      <span>₹{minPrice}</span>
                    ) : (
                      <span>₹{minPrice} - ₹{maxPrice}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{typeof product.rating?.average === 'number' ? product.rating.average.toFixed(1) : '0'}</span>
                    <span className="text-muted-foreground text-xs">({typeof product.rating?.count === 'number' ? product.rating.count : '0'})</span>
                  </div>
                </TableCell>
                <TableCell>
                  {product.is_active ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {getAvailabilityBadge(product.overall_availability)}
                </TableCell>
                <TableCell className="text-right">
                  <ProductActions 
                    product={product} 
                    onEdit={onEdit}
                    onCopy={onCopy}
                    onDelete={onDelete} 
                    onViewDetails={onViewDetails} 
                  />
                </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
