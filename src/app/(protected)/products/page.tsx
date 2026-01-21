'use client';

import { useEffect, useRef, useState } from 'react';
import { getProductsAction } from '@/actions/product-actions';
import { getCategoriesAction, getSubCategoriesAction } from '@/actions/category-actions';
import { ProductsTableWrapper } from './products-table-wrapper'; // Updated import
import { ProductForm, ProductFormRef } from './product-form';
import { Product, ProductWithDetails, Category, SubCategory } from '@/lib/types/all-schemas';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const productFormRef = useRef<ProductFormRef>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedSubCategories] = await Promise.all([
          getProductsAction(),
          getCategoriesAction(),
          getSubCategoriesAction()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setSubCategories(fetchedSubCategories);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // When a product is selected, open the dialog
    if (selectedProduct && productFormRef.current) {
      productFormRef.current.openDialog();
    }
  }, [selectedProduct]);

  const handleEditProduct = (product: ProductWithDetails) => {
    setSelectedProduct(product);
  };

  const handleEditFormClose = () => {
    setSelectedProduct(null);
  };

  // Add this function to handle data changes
  const handleDataChange = () => {
    // Re-fetch the products data
    const fetchProducts = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedSubCategories] = await Promise.all([
          getProductsAction(),
          getCategoriesAction(),
          getSubCategoriesAction()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setSubCategories(fetchedSubCategories);
      } catch (error) {
        toast.error('Failed to refresh products');
      }
    };

    fetchProducts();
  };

  if (loading) {
    return <div className="py-10 px-2">Loading...</div>;
  }

  return (
    <div className="py-10 px-2 w-full">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <ProductForm mode="create" onDataChange={handleDataChange} /> {/* Pass onDataChange prop */}
      </div>
      
      <ProductsTableWrapper 
        data={products} 
        categories={categories}
        subCategories={subCategories}
        onEditProduct={handleEditProduct} 
      /> {/* Pass categories and subcategories */}
      
      {/* Edit Product Form */}
      {selectedProduct && (
        <ProductForm 
          ref={productFormRef}
          product={selectedProduct} 
          mode="edit" 
          onClose={handleEditFormClose}
          onDataChange={handleDataChange} // Pass onDataChange prop
        />
      )}
    </div>
  );
}