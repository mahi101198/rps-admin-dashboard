'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  Plus,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllSkuProductsAction
} from '@/actions/product-details-actions';
import { 
  ProductDetailsDocument
} from '@/lib/types/product-details-sku';
import { ProductForm } from './product-form';
import { ProductsTable } from './products-table';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDetailsDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetailsDocument | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load all products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getAllSkuProductsAction();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    return (
      (product.title || '').toLowerCase().includes(term) ||
      (product.name || '').toLowerCase().includes(term) ||
      (product.brand || '').toLowerCase().includes(term) ||
      (product.category || '').toLowerCase().includes(term) ||
      (product.sub_category || '').toLowerCase().includes(term)
    );
  });

  // Handle form submit success
  const handleFormSubmitSuccess = () => {
    loadProducts();
    setEditingProduct(null);
    setShowForm(false);
    toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
  };

  // Handle edit product
  const handleEditProduct = (product: ProductDetailsDocument) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.product_id !== productId));
    toast.success('Product deleted successfully');
  };

  // Handle view details
  const handleViewDetails = (product: ProductDetailsDocument) => {
    console.log('Viewing product details:', product);
    toast.info('Product details would be shown in a modal');
  };

  // Reset form
  const resetForm = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Products Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog with detailed information
          </p>
        </div>
        <Button onClick={() => {
          setEditingProduct(null);
          setShowForm(true);
        }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </CardTitle>
            <CardDescription>
              {editingProduct 
                ? 'Update the product information below'
                : 'Fill in the product details to create a new product'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm 
              product={editingProduct || undefined}
              onSubmitSuccess={handleFormSubmitSuccess}
              onCancel={resetForm}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Products</CardTitle>
              <CardDescription>
                Filter products by name, brand, category, or other details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog ({filteredProducts.length})</CardTitle>
              <CardDescription>
                Browse and manage your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable 
                products={filteredProducts}
                loading={loading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
              <CardDescription>
                Overview of your product catalog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {products.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Products
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {products.reduce((sum, product) => sum + product.product_skus.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total SKUs
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {products.reduce((sum, product) => 
                      sum + product.product_skus.filter(sku => sku.availability === 'in_stock').length, 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    In Stock Items
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}