'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types/product';
import { SubCategoryForm } from './subcategory-form';
import { CategoryForm } from './category-form';
import { CategoryActions } from './category-actions';

// Simplified category management component for the new schema
export function SimpleCategoryManagement({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    window.location.reload();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline">
          📊 Category Analytics
        </Button>
        <Button onClick={() => setShowForm(true)}>
          ➕ Add Category
        </Button>
      </div>
      
      <CategoryForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// Category actions component
export function SimpleCategoryActions({ category }: { category: Category }) {
  return (
    <CategoryActions 
      category={category}
      variant="compact"
    />
  );
}

// Subcategory management component
export function SubCategoryManagement({ categories }: { categories: Category[] }) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    window.location.reload();
  };

  return (
    <>
      <Button onClick={() => setShowForm(true)}>
        ➕ Add Subcategory
      </Button>
      
      <SubCategoryForm 
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
        categories={categories}
      />
    </>
  );
}