'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  XCircle
} from 'lucide-react';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { AddProductToHomeSection } from './add-product-to-home-section';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  getAllSkuProductsAction,
  deleteSkuProductAction,
  updateSkuProductAction
} from '@/actions/product-details-actions';
import { ProductView } from './product-view';

interface ProductActionsProps {
  product: ProductDetailsDocument;
  onEdit: (product: ProductDetailsDocument) => void;
  onDelete: (productId: string) => void;
  onViewDetails?: (product: ProductDetailsDocument) => void;
}

export function ProductActions({ 
  product, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: ProductActionsProps) {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const result = await deleteSkuProductAction(product.product_id);
      
      if (result.success) {
        toast.success('Product deleted successfully');
        onDelete(product.product_id);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get the first SKU for pricing information
  const firstSku = product.product_skus[0];

  const [viewOpen, setViewOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else {
      setViewOpen(true);
    }
  };

  return (
    <>
      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
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
              onClick={handleDelete} 
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {onViewDetails ? (
            <DropdownMenuItem onClick={handleViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          ) : (
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="w-[80vw] min-w-[80vw] h-[80vh] max-w-none sm:max-w-none overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Product Details</DialogTitle>
                  <DialogDescription>Detailed view of product and SKU analytics</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <ProductView product={product} />
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <DropdownMenuItem onClick={() => onEdit(product)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          
          <AddProductToHomeSection product={product}>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Home Section
            </DropdownMenuItem>
          </AddProductToHomeSection>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setDeleteConfirmationOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}