'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RefreshCw,
  Package,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Boxes,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { deleteSkuProductAction, getAllSkuProductsAction } from '@/actions/product-details-actions';
import { ProductDetailsDocument } from '@/lib/types/product-details-sku';
import { ProductForm } from '../products/product-form';

export default function ProductDataIngestionPage() {
  const [products, setProducts] = useState<ProductDetailsDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDetailsDocument | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductDetailsDocument | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const products = await getAllSkuProductsAction();
      setProducts(products);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return;
    setDeleteLoading(true);
    try {
      const result = await deleteSkuProductAction(deleteProductId);
      if (result.success) {
        toast.success('Product deleted successfully');
        setProducts(prev => prev.filter(product => product.product_id !== deleteProductId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    } finally {
      setDeleteLoading(false);
      setDeleteProductId(null);
    }
  };

  const getAvailabilityBadge = (availability: string | undefined) => {
    switch (availability) {
      case 'in_stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-500">Limited</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge>{availability}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    return isActive ? (
      <Badge variant="default">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const summary = useMemo(() => {
    const totalSkus = products.reduce((sum, product) => sum + product.product_skus.length, 0);
    const inStockSkus = products.reduce(
      (sum, product) => sum + product.product_skus.filter(sku => sku.availability === 'in_stock').length,
      0
    );
    const totalStock = products.reduce(
      (sum, product) => sum + product.product_skus.reduce((skuSum, sku) => skuSum + (sku.available_quantity || 0), 0),
      0
    );
    return { totalSkus, inStockSkus, totalStock };
  }, [products]);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            SKU Master Data
          </h1>
          <p className="text-muted-foreground mt-1">
            All products from product_details with SKU analytics and full CRUD
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadProducts} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[80vw] min-w-[80vw] h-[80vh] max-w-none sm:max-w-none overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>Upload a new product to product_details</DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto">
                <ProductForm
                  onSubmitSuccess={() => {
                    setCreateOpen(false);
                    loadProducts();
                  }}
                  onCancel={() => setCreateOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catalog Analytics</CardTitle>
          <CardDescription>Quick snapshot of SKU health and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                Products
              </div>
              <div className="text-2xl font-bold text-primary">{products.length}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Boxes className="h-4 w-4" />
                Total SKUs
              </div>
              <div className="text-2xl font-bold text-primary">{summary.totalSkus}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                In Stock SKUs
              </div>
              <div className="text-2xl font-bold text-primary">{summary.inStockSkus}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Total Stock Units
              </div>
              <div className="text-2xl font-bold text-primary">{summary.totalStock}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            Product name, title, SKU count, availability, and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
              <p className="text-sm">Create a product to get started</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>SKUs</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Total Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => {
                    const prices = product.product_skus.map(sku => sku.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const totalStock = product.product_skus.reduce(
                      (sum, sku) => sum + (sku.available_quantity || 0),
                      0
                    );
                    return (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.title}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.product_skus.length}</Badge>
                        </TableCell>
                        <TableCell>{getAvailabilityBadge(product.overall_availability)}</TableCell>
                        <TableCell>
                          {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
                        </TableCell>
                        <TableCell>{totalStock}</TableCell>
                        <TableCell>{getStatusBadge(product.is_active)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setViewProduct(product)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteProductId(product.product_id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="w-[80vw] min-w-[80vw] h-[80vh] max-w-none sm:max-w-none overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details and SKUs</DialogDescription>
          </DialogHeader>
          {editProduct && (
            <div className="flex-1 overflow-y-auto">
              <ProductForm
                product={editProduct}
                onSubmitSuccess={() => {
                  setEditProduct(null);
                  loadProducts();
                }}
                onCancel={() => setEditProduct(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
        <DialogContent className="w-[80vw] min-w-[80vw] h-[80vh] max-w-none sm:max-w-none overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>Detailed view of product and SKU analytics</DialogDescription>
          </DialogHeader>
          {viewProduct && (
            <div className="flex-1 overflow-y-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{viewProduct.name}</CardTitle>
                  <CardDescription>{viewProduct.title}</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Brand</div>
                    <div className="font-medium">{viewProduct.brand}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Category</div>
                    <div className="font-medium">{viewProduct.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sub Category</div>
                    <div className="font-medium">{viewProduct.sub_category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">SKUs</div>
                    <div className="font-medium">{viewProduct.product_skus.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Availability</div>
                    <div>{getAvailabilityBadge(viewProduct.overall_availability)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{getStatusBadge(viewProduct.is_active)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SKUs</CardTitle>
                  <CardDescription>Variant level pricing and inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU ID</TableHead>
                          <TableHead>Attributes</TableHead>
                          <TableHead>MRP</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Availability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewProduct.product_skus.map(sku => (
                          <TableRow key={sku.sku_id}>
                            <TableCell className="font-mono text-sm">{sku.sku_id}</TableCell>
                            <TableCell>
                              {Object.entries(sku.attributes || {}).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-semibold">{key}:</span> {value}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>₹{sku.mrp}</TableCell>
                            <TableCell>₹{sku.price}</TableCell>
                            <TableCell>{sku.available_quantity}</TableCell>
                            <TableCell>{getAvailabilityBadge(sku.availability)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
